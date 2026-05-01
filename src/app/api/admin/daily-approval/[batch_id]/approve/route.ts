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

  // Refuse approval if any target in this batch is missing operator-pasted
  // audit HTML. The {{AUDIT_URL}} link must resolve to a real audit landing
  // page; sending without one is worse than not sending at all. Same rule
  // the per-target approve endpoint enforces.
  const blockers = await sql`
    SELECT COUNT(*)::int AS c
    FROM outreach_targets ot
    LEFT JOIN audits a ON a.id = ot.audit_id
    WHERE ot.campaign_id = ${batch.campaign_id}
      AND ot.scheduled_send_at >= ${batch.send_date}::date
      AND ot.scheduled_send_at < (${batch.send_date}::date + INTERVAL '1 day')
      AND ot.sent_at IS NULL
      AND ot.status = 'scheduled'
      AND (ot.audit_id IS NULL OR a.custom_html IS NULL OR TRIM(a.custom_html) = '')
  `;
  if (blockers[0].c > 0) {
    return NextResponse.json(
      {
        error: "audit_html_required",
        message: `${blockers[0].c} target(s) in this batch are missing audit HTML. Paste the Tier 0 audit HTML on each target before approving.`,
      },
      { status: 409 },
    );
  }

  // Approve all scheduled targets for this campaign that fall on send_date
  const result = await sql`
    UPDATE outreach_targets
    SET approved_at = NOW(), approved_by_admin_id = ${adminId}, status = 'approved', updated_at = NOW()
    WHERE campaign_id = ${batch.campaign_id}
      AND scheduled_send_at >= ${batch.send_date}::date
      AND scheduled_send_at < (${batch.send_date}::date + INTERVAL '1 day')
      AND sent_at IS NULL
      AND status = 'scheduled'
    RETURNING id
  `;

  await sql`
    UPDATE daily_approval_batches
    SET approved_at = NOW(), approved_by_admin_id = ${adminId}
    WHERE id = ${batchId}
  `;

  return NextResponse.json({ approved_count: result.length });
}
