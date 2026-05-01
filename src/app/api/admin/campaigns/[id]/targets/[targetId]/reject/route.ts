import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";
import { logOutreachEvent } from "@/lib/outreach/events";
import { selectTopProspects } from "@/lib/outreach/prospect-selection";
import { createStubAudit } from "@/lib/audit/stub";
import { generateDraft, defaultDraftFor } from "@/lib/outreach/draft";
import { logAuditEvent } from "@/lib/audit/events";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; targetId: string }> },
) {
  const auth = await requireAuth(request);
  if (auth) return auth;
  const session = await getSession();
  const adminId = session?.sub || "unknown";

  const { id, targetId } = await params;
  const campaignId = parseInt(id, 10);
  const tId = parseInt(targetId, 10);
  if (!Number.isFinite(campaignId) || !Number.isFinite(tId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { reason?: string; replenish?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const reason = body.reason || "admin_rejected";
  const shouldReplenish = body.replenish !== false; // default true

  // Load the rejected target so we can copy scheduled_send_at to the
  // replacement and exclude its prospect from selection.
  const existing = await sql`
    SELECT id, campaign_id, scheduled_send_at, sent_at, approved_at, pipeline_contact_id, status
    FROM outreach_targets WHERE id = ${tId} AND campaign_id = ${campaignId} LIMIT 1
  `;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }
  const rejected = existing[0];
  if (rejected.sent_at) {
    return NextResponse.json({ error: "Already sent — cannot reject" }, { status: 409 });
  }

  // 1. Mark rejected (cancelled).
  await sql`
    UPDATE outreach_targets
    SET status = 'cancelled', failure_reason = ${reason}, updated_at = NOW()
    WHERE id = ${tId}
  `;
  await logOutreachEvent({
    targetId: tId,
    eventType: "rejected",
    metadata: { admin_id: adminId, reason },
  });

  if (!shouldReplenish) {
    return NextResponse.json({ rejected_id: tId, replacement: null, reason_no_replacement: "replenish_disabled" });
  }

  // 2. Pick the next prospect — never one already touched in any campaign,
  // never the prospect we just rejected.
  const excludeIds = rejected.pipeline_contact_id ? [rejected.pipeline_contact_id as number] : [];
  const next = await selectTopProspects(1, { excludeAlreadyTargeted: true, excludeIds });
  if (next.length === 0) {
    return NextResponse.json({
      rejected_id: tId,
      replacement: null,
      reason_no_replacement: "no_eligible_prospect",
    });
  }
  const p = next[0];

  // 3. Stub audit + AI draft (with deterministic fallback if the model fails).
  let stub;
  try {
    stub = await createStubAudit({
      hotel_name: p.hotel_name || p.name || "Unknown property",
      hotel_url: p.website_url || `https://example.invalid/${p.id}`,
      hotel_location: p.hotel_location,
      room_count: p.room_count ? parseInt(p.room_count, 10) || null : null,
    });
    await logAuditEvent({
      auditId: stub.id,
      eventType: "audit_created",
      metadata: {
        source: "campaign_reject_replenish",
        campaign_id: campaignId,
        replaces_target_id: tId,
        pipeline_contact_id: p.id,
        is_stub: true,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "stub_audit_failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }

  let draft;
  try {
    draft = await generateDraft(p);
  } catch {
    draft = defaultDraftFor(p);
  }

  // 4. Insert the replacement target inheriting the rejected slot.
  const insert = await sql`
    INSERT INTO outreach_targets (
      campaign_id, hotel_url, hotel_name, contact_name, contact_email, contact_role,
      audit_id, draft_subject, draft_body, scheduled_send_at, status,
      pipeline_contact_id
    )
    VALUES (
      ${campaignId},
      ${p.website_url || ""},
      ${p.hotel_name},
      ${p.name},
      ${p.email},
      ${p.owner_role},
      ${stub.id},
      ${draft.subject},
      ${draft.body},
      ${rejected.scheduled_send_at},
      'scheduled',
      ${p.id}
    )
    RETURNING *
  `;
  const replacement = insert[0];

  // 5. Log the replenishment on both sides for traceability.
  await logOutreachEvent({
    targetId: replacement.id,
    eventType: "replenished",
    metadata: { replaces_target_id: tId, pipeline_contact_id: p.id, admin_id: adminId },
  });
  await sql`
    INSERT INTO pipeline_activities (contact_id, type, title, description, metadata)
    VALUES (
      ${p.id},
      'note',
      'Queued in campaign (replenish)',
      ${`Campaign #${campaignId} — replaces target #${tId}`},
      ${JSON.stringify({ campaign_id: campaignId, target_id: replacement.id, replaces_target_id: tId })}
    )
  `;

  return NextResponse.json({ rejected_id: tId, replacement });
}
