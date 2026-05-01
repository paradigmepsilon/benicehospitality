import { Resend } from "resend";
import { buildUnsubscribeUrl } from "@/lib/outreach/unsubscribe";

let cached: Resend | null = null;
function getResend(): Resend {
  if (!cached) {
    // The same Resend account is used for transactional + cold sends. The
    // distinction is the `from` domain only. In production, COLD_SENDER_FROM
    // MUST be a separate verified domain to isolate sending reputation.
    cached = new Resend(process.env.RESEND_API_KEY);
  }
  return cached;
}

export function getColdSenderFrom(): string {
  return process.env.COLD_SENDER_FROM || process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>";
}

export function getColdSenderReplyTo(): string {
  return process.env.COLD_SENDER_REPLY_TO || process.env.ADMIN_EMAIL || "admin@benicehospitality.com";
}

const PLAIN_TEXT_FOOTER = (unsubscribeUrl: string) => `

---
Be Nice Hospitality Group
Hapeville, GA
admin@benicehospitality.com

If you'd rather not receive these, unsubscribe here: ${unsubscribeUrl}`;

const HTML_FOOTER = (unsubscribeUrl: string) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e8e4dd;padding-top:18px;">
  <tr><td style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#888;line-height:1.6;">
    <p style="margin:0 0 4px;color:#1a1a1a;font-weight:500;">Be Nice Hospitality Group</p>
    <p style="margin:0 0 4px;">Hapeville, GA · <a href="mailto:admin@benicehospitality.com" style="color:#888;">admin@benicehospitality.com</a></p>
    <p style="margin:8px 0 0;">If you'd rather not receive these, <a href="${unsubscribeUrl}" style="color:#888;text-decoration:underline;">unsubscribe here</a>.</p>
  </td></tr>
</table>`;

/**
 * Convert a plain-text or lightly-formatted draft body into an HTML email.
 * The draft body is what the skill produced; the website injects the
 * footer with a per-target unsubscribe token at send time.
 */
function bodyToHtml(plainBody: string): string {
  // Convert paragraph breaks (double newlines) to <p> tags; preserve single
  // newlines as <br>. Escape any HTML to keep the email plain.
  const escaped = plainBody
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const paragraphs = escaped.split(/\n{2,}/).map((p) => {
    const withBreaks = p.replace(/\n/g, "<br />");
    return `<p style="margin:0 0 14px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;">${withBreaks}</p>`;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><title>Be Nice Hospitality Group</title></head>
<body style="margin:0;padding:24px;background-color:#ffffff;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;">
    ${paragraphs.join("\n    ")}
  </div>
</body>
</html>`;
}

export interface ColdSendArgs {
  to: string;
  subject: string;
  body: string; // already-substituted draft body (AUDIT_URL replaced)
}

export interface ColdSendResult {
  ok: boolean;
  messageId: string | null;
  error?: string;
}

export async function sendColdEmail(args: ColdSendArgs): Promise<ColdSendResult> {
  const unsubscribeUrl = buildUnsubscribeUrl(args.to);
  const subject = args.subject.trim();

  // Substitute UNSUBSCRIBE_URL into the draft body if the skill placed the
  // placeholder there (used in plaintext-only flows). Otherwise we'll append
  // the footer.
  const plainBody = args.body
    .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);

  const html = bodyToHtml(plainBody) + HTML_FOOTER(unsubscribeUrl);
  const text = plainBody + PLAIN_TEXT_FOOTER(unsubscribeUrl);

  try {
    const result = await getResend().emails.send({
      from: getColdSenderFrom(),
      to: args.to,
      replyTo: getColdSenderReplyTo(),
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (result.error) {
      const msg = `${result.error.name}: ${result.error.message}`;
      console.error(`[cold-send] to=${args.to} resend error:`, msg);
      return { ok: false, messageId: null, error: msg };
    }
    return { ok: true, messageId: result.data?.id ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[cold-send] to=${args.to} threw:`, msg);
    return { ok: false, messageId: null, error: msg };
  }
}
