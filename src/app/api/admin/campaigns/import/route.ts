import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";
import { outreachBatchPayloadSchema } from "@/lib/validation/outreach";
import { createAudit, buildAuditUrl } from "@/lib/audit/token";
import { logAuditEvent } from "@/lib/audit/events";
import { validateDraft } from "@/lib/outreach/quality";
import { distributeSendTimes } from "@/lib/outreach/scheduling";
import { buildUnsubscribeUrl } from "@/lib/outreach/unsubscribe";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth) return auth;
  const session = await getSession();
  const adminId = session?.sub || "unknown";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = outreachBatchPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const payload = parsed.data;

  // Reject duplicate batch_id
  const existing = await sql`SELECT id FROM outreach_campaigns WHERE batch_id = ${payload.batch_id} LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Batch already imported", campaign_id: existing[0].id },
      { status: 409 }
    );
  }

  // Compute send times for the full batch, ignoring quality_failed/unsubscribed
  // for slot count (we'll skip-mark those after creation).
  const eligibleTargets = payload.targets.filter((t) => !t.quality_failed);

  // Pre-load unsubscribe list to avoid scheduling sends to opt-outs
  const unsubRows = await sql`SELECT email FROM unsubscribes`;
  const unsubSet = new Set((unsubRows as Array<{ email: string }>).map((r) => r.email.toLowerCase()));

  // Targets that pass quality + are not on the unsub list become the schedulable set
  const schedulable = eligibleTargets.filter(
    (t) => !unsubSet.has(t.contact_email.toLowerCase())
  );
  const sendTimes = distributeSendTimes(schedulable.length, payload.send_schedule);

  // Create the campaign row first
  const campaignRows = await sql`
    INSERT INTO outreach_campaigns (
      name, batch_id, status, send_schedule, total_targets, scheduled_count, created_by_admin_id
    )
    VALUES (
      ${payload.campaign_name},
      ${payload.batch_id},
      'scheduled',
      ${JSON.stringify(payload.send_schedule)}::jsonb,
      ${payload.targets.length},
      ${schedulable.length},
      ${adminId}
    )
    RETURNING id
  `;
  const campaignId = campaignRows[0].id as number;

  let scheduledCount = 0;
  let qualityRejectedCount = 0;
  let unsubSkippedCount = 0;
  const validationErrors: Array<{ email: string; reason: string }> = [];

  let scheduleIndex = 0;
  for (const target of payload.targets) {
    const emailLower = target.contact_email.toLowerCase();

    // Marker for unsubscribed
    if (unsubSet.has(emailLower)) {
      await sql`
        INSERT INTO outreach_targets (
          campaign_id, hotel_url, hotel_name, contact_name, contact_email, contact_role,
          draft_subject, draft_body, status, failure_reason
        )
        VALUES (
          ${campaignId}, ${target.hotel_url}, ${target.audit_data.hotel.name},
          ${target.contact_name || null}, ${target.contact_email}, ${target.contact_role || null},
          ${target.draft_subject}, ${target.draft_body}, 'unsubscribed', 'on_unsubscribe_list'
        )
      `;
      unsubSkippedCount += 1;
      continue;
    }

    // Marker for quality_failed (from skill side)
    if (target.quality_failed) {
      await sql`
        INSERT INTO outreach_targets (
          campaign_id, hotel_url, hotel_name, contact_name, contact_email, contact_role,
          draft_subject, draft_body, status, failure_reason
        )
        VALUES (
          ${campaignId}, ${target.hotel_url}, ${target.audit_data.hotel.name},
          ${target.contact_name || null}, ${target.contact_email}, ${target.contact_role || null},
          ${target.draft_subject}, ${target.draft_body}, 'quality_rejected', 'skill_marked_quality_failed'
        )
      `;
      qualityRejectedCount += 1;
      continue;
    }

    // Run our own quality gate on the draft as it stands
    const validation = validateDraft({
      hotel_name: target.audit_data.hotel.name,
      draft_subject: target.draft_subject,
      draft_body: target.draft_body,
    });
    if (!validation.valid) {
      await sql`
        INSERT INTO outreach_targets (
          campaign_id, hotel_url, hotel_name, contact_name, contact_email, contact_role,
          draft_subject, draft_body, status, failure_reason
        )
        VALUES (
          ${campaignId}, ${target.hotel_url}, ${target.audit_data.hotel.name},
          ${target.contact_name || null}, ${target.contact_email}, ${target.contact_role || null},
          ${target.draft_subject}, ${target.draft_body}, 'quality_rejected', ${validation.reason || "unknown"}
        )
      `;
      qualityRejectedCount += 1;
      validationErrors.push({ email: target.contact_email, reason: validation.reason || "unknown" });
      continue;
    }

    // Mint the audit. Token is generated server-side; substitute into draft.
    const { id: auditId, token } = await createAudit(target.audit_data);
    const auditUrl = buildAuditUrl(token);
    const unsubscribeUrl = buildUnsubscribeUrl(emailLower);

    const finalBody = target.draft_body
      .replace(/\{\{AUDIT_URL\}\}/g, auditUrl)
      .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);

    await logAuditEvent({
      auditId,
      eventType: "audit_created",
      metadata: {
        hotel_slug: target.audit_data.hotel.slug,
        overall_score: target.audit_data.overall.score,
        source: "outreach_batch",
        campaign_id: campaignId,
      },
    });

    const scheduledFor = sendTimes[scheduleIndex];
    scheduleIndex += 1;

    await sql`
      INSERT INTO outreach_targets (
        campaign_id, hotel_url, hotel_name, contact_name, contact_email, contact_role,
        audit_id, draft_subject, draft_body, scheduled_send_at, status
      )
      VALUES (
        ${campaignId}, ${target.hotel_url}, ${target.audit_data.hotel.name},
        ${target.contact_name || null}, ${target.contact_email}, ${target.contact_role || null},
        ${auditId}, ${target.draft_subject}, ${finalBody}, ${scheduledFor}, 'scheduled'
      )
    `;
    scheduledCount += 1;
  }

  // Update campaign counters now that we know the actual scheduled count
  await sql`
    UPDATE outreach_campaigns
    SET scheduled_count = ${scheduledCount}, status = 'scheduled', updated_at = NOW()
    WHERE id = ${campaignId}
  `;

  return NextResponse.json(
    {
      campaign_id: campaignId,
      imported_count: payload.targets.length,
      scheduled_count: scheduledCount,
      quality_rejected: qualityRejectedCount,
      skipped_unsubscribed: unsubSkippedCount,
      validation_errors: validationErrors,
    },
    { status: 201 }
  );
}
