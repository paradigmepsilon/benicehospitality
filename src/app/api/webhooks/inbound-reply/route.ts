import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { inboundReplyPayloadSchema } from "@/lib/validation/outreach";
import { internalReplyAlertEmail } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Inbound reply webhook. Configure your inbound mail parser (Resend Inbound
 * or a separate parser like Postmark inbound) to forward replies here.
 *
 * Auth: simple shared-secret header `X-Inbound-Secret` matching
 * RESEND_WEBHOOK_SECRET (we reuse it for inbound parsing too).
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const provided = request.headers.get("x-inbound-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = inboundReplyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const sender = parsed.data.from.toLowerCase().trim();
  const subject = parsed.data.subject || "(no subject)";
  const preview = (parsed.data.text || parsed.data.html || "").slice(0, 600);

  // Find the most recent SENT outreach target with this sender's email
  const targetRows = (await sql`
    SELECT t.id, t.campaign_id, t.hotel_name
    FROM outreach_targets t
    WHERE t.contact_email = ${sender} AND t.sent_at IS NOT NULL
    ORDER BY t.sent_at DESC
    LIMIT 1
  `) as unknown as Array<{ id: number; campaign_id: number; hotel_name: string | null }>;

  if (targetRows.length === 0) {
    // Reply from someone we never emailed via outreach. Still notify Alex —
    // could be a forward, or someone replying to a transactional email.
    try {
      await resend.emails.send({
        from: process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL || "admin@benicehospitality.com",
        subject: `Reply received from unknown sender: ${sender}`,
        html: `<p>${sender} replied with subject: <strong>${subject}</strong></p><pre>${preview}</pre>`,
      });
    } catch (err) {
      console.error("[webhooks/inbound-reply] passthrough notification failed:", err);
    }
    return NextResponse.json({ ok: true, matched: false });
  }

  const target = targetRows[0];

  await sql`
    UPDATE outreach_targets
    SET replied_at = NOW(), status = 'replied', updated_at = NOW()
    WHERE id = ${target.id}
  `;

  // Cancel pending nurture sequences for this email (audit-side)
  await sql`
    UPDATE nurture_queue nq
    SET cancelled_at = NOW(), cancellation_reason = 'replied_to_outreach'
    FROM audit_views av
    WHERE av.id = nq.audit_view_id AND av.email = ${sender}
      AND nq.sent_at IS NULL AND nq.cancelled_at IS NULL
  `;

  try {
    await resend.emails.send({
      from: process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "admin@benicehospitality.com",
      replyTo: sender,
      subject: `Reply from ${target.hotel_name || sender}: ${subject}`,
      html: internalReplyAlertEmail({
        targetEmail: sender,
        hotelName: target.hotel_name || "(no hotel name)",
        subject,
        replyPreview: preview,
        campaignId: target.campaign_id,
      }),
    });
  } catch (err) {
    console.error("[webhooks/inbound-reply] alert email failed:", err);
  }

  return NextResponse.json({ ok: true, matched: true, target_id: target.id });
}
