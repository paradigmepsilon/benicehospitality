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
    SELECT id, hotel_url, hotel_name, contact_email, contact_name, contact_role,
           audit_id, draft_subject, draft_body, scheduled_send_at, approved_at, sent_at,
           bounced_at, complained_at, replied_at, unsubscribed_at, status, failure_reason
    FROM outreach_targets
    WHERE campaign_id = ${id}
    ORDER BY scheduled_send_at ASC NULLS LAST, id ASC
  `;

  const health = await getCampaignHealth(id);

  return NextResponse.json({ campaign, targets, health });
}
