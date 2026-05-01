import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";
import { selectTopProspects } from "@/lib/outreach/prospect-selection";
import { createStubAudit } from "@/lib/audit/stub";
import { generateDraftsBatch, defaultDraftFor } from "@/lib/outreach/draft";
import { distributeSendTimes } from "@/lib/outreach/scheduling";
import { logAuditEvent } from "@/lib/audit/events";
import type { SendSchedule } from "@/lib/types/outreach";

export const runtime = "nodejs";
export const maxDuration = 60;

// Mon-Fri, 10am-2pm ET, 10/day. Start the day after creation so we never
// schedule a send for "right now" — there's always at least overnight to
// review and approve via the daily-approval flow.
function buildDefaultSchedule(): SendSchedule {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(tomorrow);
  return {
    daily_window: { start: "10:00", end: "14:00", timezone: "America/New_York" },
    daily_cap: 10,
    send_days: ["mon", "tue", "wed", "thu", "fri"],
    start_date: ymd,
  };
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth) return auth;
  const session = await getSession();
  const adminId = session?.sub || "unknown";

  let body: { limit?: number; campaign_name?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const limit = Math.max(1, Math.min(50, body.limit ?? 10));

  const prospects = await selectTopProspects(limit, { excludeAlreadyTargeted: true });
  if (prospects.length === 0) {
    return NextResponse.json(
      { error: "No prospects available at stage='prospect'. Import a CSV or move existing contacts back to 'Not Contacted' first." },
      { status: 400 },
    );
  }

  // 1. Generate AI drafts for everyone in parallel (with concurrency cap).
  const drafts = await generateDraftsBatch(prospects, 4);

  // 2. Create the campaign row.
  const schedule = buildDefaultSchedule();
  const campaignName = body.campaign_name?.trim() || `Prospect batch — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  const batchId = randomUUID();
  const sendTimes = distributeSendTimes(prospects.length, schedule);

  const campaignRows = await sql`
    INSERT INTO outreach_campaigns (
      name, batch_id, status, send_schedule, total_targets, scheduled_count, created_by_admin_id
    )
    VALUES (
      ${campaignName},
      ${batchId},
      'scheduled',
      ${JSON.stringify(schedule)}::jsonb,
      ${prospects.length},
      ${prospects.length},
      ${adminId}
    )
    RETURNING id
  `;
  const campaignId = campaignRows[0].id as number;

  // 3. For each prospect: stub audit, target row, activity log.
  const targetIds: number[] = [];
  const errors: Array<{ prospect_id: number; reason: string }> = [];
  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    const draftResult = drafts[i];
    const draft = draftResult.draft || defaultDraftFor(p);
    if (draftResult.error) {
      errors.push({ prospect_id: p.id, reason: `ai_draft_failed:${draftResult.error}` });
    }

    try {
      const stub = await createStubAudit({
        hotel_name: p.hotel_name || p.name || "Unknown property",
        hotel_url: p.website_url || `https://example.invalid/${p.id}`,
        hotel_location: p.hotel_location,
        room_count: p.room_count ? parseInt(p.room_count, 10) || null : null,
      });

      await logAuditEvent({
        auditId: stub.id,
        eventType: "audit_created",
        metadata: {
          source: "campaign_from_prospects",
          campaign_id: campaignId,
          pipeline_contact_id: p.id,
          is_stub: true,
        },
      });

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
          ${sendTimes[i]},
          'scheduled',
          ${p.id}
        )
        RETURNING id
      `;
      targetIds.push(insert[0].id as number);

      // Log a CRM activity so the prospect's timeline shows the campaign queue entry.
      await sql`
        INSERT INTO pipeline_activities (contact_id, type, title, description, metadata)
        VALUES (
          ${p.id},
          'note',
          'Queued in campaign',
          ${`Campaign #${campaignId} — ${campaignName}`},
          ${JSON.stringify({ campaign_id: campaignId, target_id: insert[0].id, ai_drafted: !draftResult.error })}
        )
      `;
    } catch (err) {
      errors.push({
        prospect_id: p.id,
        reason: err instanceof Error ? err.message : "unknown error",
      });
    }
  }

  return NextResponse.json({
    campaign_id: campaignId,
    batch_id: batchId,
    target_count: targetIds.length,
    drafted_count: drafts.filter((d) => d.draft).length,
    errors,
    next: `/admin/campaigns/${campaignId}`,
  });
}
