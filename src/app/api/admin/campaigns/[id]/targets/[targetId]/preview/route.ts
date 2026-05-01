import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { renderEmail } from "@/lib/outreach/render";
import { buildAuditUrl } from "@/lib/audit/token";
import { getColdSenderFrom, getColdSenderReplyTo } from "@/lib/outreach/cold-send";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; targetId: string }> },
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const { id, targetId } = await params;
  const campaignId = parseInt(id, 10);
  const tId = parseInt(targetId, 10);
  if (!Number.isFinite(campaignId) || !Number.isFinite(tId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const rows = await sql`
    SELECT ot.id, ot.contact_email, ot.draft_subject, ot.draft_body,
           a.token AS audit_token, a.public_slug AS audit_public_slug
    FROM outreach_targets ot
    LEFT JOIN audits a ON a.id = ot.audit_id
    WHERE ot.id = ${tId} AND ot.campaign_id = ${campaignId}
    LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }
  const t = rows[0];

  // Prefer public_slug (human-readable), fall back to token for older audits.
  const slugOrToken = (t.audit_public_slug as string | null) || (t.audit_token as string | null);
  const auditUrl = slugOrToken ? buildAuditUrl(slugOrToken) : null;
  const rendered = renderEmail({
    body: t.draft_body || "",
    to: t.contact_email as string,
    auditUrl,
  });

  return NextResponse.json({
    subject: t.draft_subject || "",
    to: t.contact_email,
    from: getColdSenderFrom(),
    replyTo: getColdSenderReplyTo(),
    audit_url: auditUrl,
    unsubscribe_url: rendered.unsubscribeUrl,
    html: rendered.html,
    text: rendered.text,
  });
}
