import { buildUnsubscribeUrl } from "@/lib/outreach/unsubscribe";

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

function bodyToHtml(plainBody: string): string {
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

export interface RenderInput {
  body: string;
  to: string;
  auditUrl?: string | null;
}

function substitutePlaceholders(body: string, auditUrl: string | null | undefined, unsubscribeUrl: string): string {
  let out = body.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);
  if (auditUrl) {
    out = out.replace(/\{\{AUDIT_URL\}\}/g, auditUrl);
  }
  return out;
}

export interface RenderedEmail {
  subjectPlaceholdersResolved: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
}

/**
 * Build the exact HTML and plain-text bodies the Resend send call uses.
 * Mirrors `sendColdEmail` in `cold-send.ts` so the preview matches the wire.
 *
 * Pass `auditUrl` to substitute `{{AUDIT_URL}}` (preview path); for the actual
 * send, the campaign import / process-sends code substitutes the audit URL
 * before calling `sendColdEmail`, so this helper accepts a body that may or
 * may not still have the placeholder.
 */
export function renderEmail({ body, to, auditUrl }: RenderInput): RenderedEmail {
  const unsubscribeUrl = buildUnsubscribeUrl(to);
  const substituted = substitutePlaceholders(body, auditUrl, unsubscribeUrl);
  const html = bodyToHtml(substituted) + HTML_FOOTER(unsubscribeUrl);
  const text = substituted + PLAIN_TEXT_FOOTER(unsubscribeUrl);
  return {
    subjectPlaceholdersResolved: "",
    html,
    text,
    unsubscribeUrl,
  };
}
