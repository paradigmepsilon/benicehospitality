import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/admin/daily-approval
 * Returns today's pending approval batches (one per campaign that has scheduled
 * targets for today). If `date=YYYY-MM-DD` query is supplied, returns that day.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const date = dateParam || new Date().toISOString().slice(0, 10);

  const batches = await sql`
    SELECT b.id, b.send_date, b.campaign_id, b.target_count,
           b.approved_at, b.expired_at, b.notification_sent_at,
           c.name AS campaign_name, c.status AS campaign_status
    FROM daily_approval_batches b
    LEFT JOIN outreach_campaigns c ON c.id = b.campaign_id
    WHERE b.send_date = ${date}
    ORDER BY b.id ASC
  `;

  // For each batch, fetch the targets that fall in today's slot
  const result: Array<Record<string, unknown>> = [];
  for (const batch of batches) {
    const targets = await sql`
      SELECT id, hotel_name, contact_email, contact_name, draft_subject, draft_body,
             scheduled_send_at, approved_at, status, audit_id
      FROM outreach_targets
      WHERE campaign_id = ${batch.campaign_id}
        AND scheduled_send_at >= ${date}::date
        AND scheduled_send_at < (${date}::date + INTERVAL '1 day')
        AND sent_at IS NULL
        AND status IN ('scheduled', 'approved')
      ORDER BY scheduled_send_at ASC
    `;
    result.push({ ...batch, targets });
  }

  return NextResponse.json({ date, batches: result });
}
