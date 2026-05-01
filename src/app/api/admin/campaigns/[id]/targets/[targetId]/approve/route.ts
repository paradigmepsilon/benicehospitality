import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";
import { logOutreachEvent } from "@/lib/outreach/events";
import { validateDraft } from "@/lib/outreach/quality";

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

  const rows = await sql`
    SELECT ot.id, ot.status, ot.approved_at, ot.sent_at, ot.hotel_name,
           ot.draft_subject, ot.draft_body, a.is_stub, a.custom_html, ot.audit_id
    FROM outreach_targets ot
    LEFT JOIN audits a ON a.id = ot.audit_id
    WHERE ot.id = ${tId} AND ot.campaign_id = ${campaignId}
    LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }
  const t = rows[0];
  if (t.sent_at) {
    return NextResponse.json({ error: "Already sent" }, { status: 409 });
  }
  if (t.approved_at) {
    return NextResponse.json({ ok: true, already_approved: true });
  }

  // Audit-HTML gate — every approved target must have a real audit landing page
  // pasted in. Sending an email with a {{AUDIT_URL}} that resolves to the
  // structured stub renderer is worse than not sending. No `force` override:
  // if an operator wants to skip the audit, they should not be using this
  // outreach motion. Replaced the old stub-audit check (which only blocked
  // is_stub rows) with this stricter check on custom_html.
  if (!t.audit_id || !t.custom_html || (t.custom_html as string).trim() === "") {
    return NextResponse.json(
      {
        error: "audit_html_required",
        message: "This prospect has no audit HTML yet. Paste the Tier 0 audit HTML on the target's Audit HTML panel before approving.",
      },
      { status: 409 },
    );
  }

  // Quality gate — refuse to approve a draft that the send pipeline would
  // reject. Surface the reason so the admin can edit before retrying.
  const v = validateDraft({
    hotel_name: t.hotel_name,
    draft_subject: t.draft_subject || "",
    draft_body: t.draft_body || "",
  });
  if (!v.valid) {
    return NextResponse.json(
      { error: "quality_gate_failed", reason: v.reason },
      { status: 422 },
    );
  }

  const updated = await sql`
    UPDATE outreach_targets
    SET status = 'approved', approved_at = NOW(), approved_by_admin_id = ${adminId}, updated_at = NOW()
    WHERE id = ${tId}
    RETURNING *
  `;

  await logOutreachEvent({
    targetId: tId,
    eventType: "approved",
    metadata: { admin_id: adminId },
  });

  return NextResponse.json({ target: updated[0] });
}
