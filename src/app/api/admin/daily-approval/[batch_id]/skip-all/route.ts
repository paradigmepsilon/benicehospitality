import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;
  const session = await getSession();
  const adminId = session?.sub || "unknown";

  const { batch_id: idRaw } = await params;
  const batchId = parseInt(idRaw, 10);
  if (!Number.isFinite(batchId)) {
    return NextResponse.json({ error: "Invalid batch_id" }, { status: 400 });
  }

  const batchRows = await sql`SELECT id, send_date, campaign_id FROM daily_approval_batches WHERE id = ${batchId} LIMIT 1`;
  if (batchRows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const batch = batchRows[0];

  const result = await sql`
    UPDATE outreach_targets
    SET status = 'cancelled', failure_reason = 'admin_skip_all', updated_at = NOW()
    WHERE campaign_id = ${batch.campaign_id}
      AND scheduled_send_at >= ${batch.send_date}::date
      AND scheduled_send_at < (${batch.send_date}::date + INTERVAL '1 day')
      AND sent_at IS NULL
      AND status IN ('scheduled', 'approved')
    RETURNING id
  `;

  await sql`
    UPDATE daily_approval_batches
    SET expired_at = NOW(), approved_by_admin_id = ${adminId}
    WHERE id = ${batchId}
  `;

  return NextResponse.json({ skipped_count: result.length });
}
