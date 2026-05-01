import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const rows =
    status && status !== "all"
      ? await sql`
          SELECT c.*,
            (SELECT COUNT(*)::int FROM outreach_targets t WHERE t.campaign_id = c.id AND t.sent_at IS NOT NULL) AS sent_count_real,
            (SELECT COUNT(*)::int FROM outreach_targets t WHERE t.campaign_id = c.id AND t.bounced_at IS NOT NULL) AS bounced_count,
            (SELECT COUNT(*)::int FROM outreach_targets t WHERE t.campaign_id = c.id AND t.replied_at IS NOT NULL) AS replied_count
          FROM outreach_campaigns c
          WHERE c.status = ${status}
          ORDER BY c.created_at DESC
        `
      : await sql`
          SELECT c.*,
            (SELECT COUNT(*)::int FROM outreach_targets t WHERE t.campaign_id = c.id AND t.sent_at IS NOT NULL) AS sent_count_real,
            (SELECT COUNT(*)::int FROM outreach_targets t WHERE t.campaign_id = c.id AND t.bounced_at IS NOT NULL) AS bounced_count,
            (SELECT COUNT(*)::int FROM outreach_targets t WHERE t.campaign_id = c.id AND t.replied_at IS NOT NULL) AS replied_count
          FROM outreach_campaigns c
          ORDER BY c.created_at DESC
        `;

  return NextResponse.json({ campaigns: rows });
}
