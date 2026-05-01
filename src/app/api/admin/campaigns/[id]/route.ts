import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getCampaignHealth } from "@/lib/outreach/health";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const { id: idRaw } = await params;
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const campaignRows = await sql`SELECT * FROM outreach_campaigns WHERE id = ${id} LIMIT 1`;
  if (campaignRows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const campaign = campaignRows[0];

  const targets = await sql`
    SELECT
      ot.id, ot.hotel_url, ot.hotel_name, ot.contact_email, ot.contact_name, ot.contact_role,
      ot.audit_id, ot.draft_subject, ot.draft_body, ot.scheduled_send_at, ot.approved_at, ot.sent_at,
      ot.bounced_at, ot.complained_at, ot.replied_at, ot.unsubscribed_at, ot.status, ot.failure_reason,
      ot.pipeline_contact_id, a.token AS audit_token, a.is_stub AS audit_is_stub,
      (a.custom_html IS NOT NULL AND TRIM(a.custom_html) <> '') AS audit_has_html,
      le.last_event_type, le.last_event_at, COALESCE(le.event_count, 0)::int AS event_count
    FROM outreach_targets ot
    LEFT JOIN audits a ON a.id = ot.audit_id
    LEFT JOIN LATERAL (
      SELECT
        (SELECT event_type FROM outreach_events e WHERE e.target_id = ot.id ORDER BY occurred_at DESC LIMIT 1) AS last_event_type,
        (SELECT occurred_at FROM outreach_events e WHERE e.target_id = ot.id ORDER BY occurred_at DESC LIMIT 1) AS last_event_at,
        (SELECT COUNT(*) FROM outreach_events e WHERE e.target_id = ot.id) AS event_count
    ) le ON TRUE
    WHERE ot.campaign_id = ${id}
    ORDER BY ot.scheduled_send_at ASC NULLS LAST, ot.id ASC
  `;

  const health = await getCampaignHealth(id);

  return NextResponse.json({ campaign, targets, health });
}
