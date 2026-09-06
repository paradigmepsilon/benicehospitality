/**
 * Shared HTML shell for nurture emails. Same visual language as the audit
 * emails in src/lib/email-templates.ts (cream ground, ink text, olive
 * button), plus the two things every nurture email must carry: a one-click
 * unsubscribe link and, when earnings come up, the disclaimer line.
 */

const SITE = "https://www.benicehospitality.com";
const LOGO_URL = `${SITE}/images/logo-horizontal.png`;

export const EARNINGS_DISCLAIMER =
  "Educational content only, not financial, legal, tax, or insurance advice. Earnings figures are illustrative, not a promise of results.";

export function primaryButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr><td align="center" style="border-radius:6px;background-color:#5b9a2f;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">${label}</a>
    </td></tr>
  </table>`;
}

export function textLink(href: string, label: string): string {
  return `<a href="${href}" target="_blank" style="color:#5b9a2f;text-decoration:none;font-weight:600;border-bottom:1px solid #5b9a2f33;">${label}</a>`;
}

export function p(html: string): string {
  return `<p style="margin:0 0 16px;">${html}</p>`;
}

export function callout(label: string, html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-left:3px solid #f5a623;background-color:#fafaf8;">
    <tr><td style="padding:14px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#3d3d3d;line-height:1.6;">
      <strong style="color:#1a1a1a;">${label}</strong> ${html}
    </td></tr>
  </table>`;
}

export function nurtureLayout(args: {
  preheader: string;
  bodyHtml: string;
  signoff: string;
  unsubscribeUrl: string;
  disclaimer?: boolean;
}): string {
  const disclaimer = args.disclaimer
    ? `<p style="margin:0 0 10px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;line-height:1.5;color:rgba(255,255,255,0.55);">${EARNINGS_DISCLAIMER}</p>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Be Nice Hospitality Group</title>
</head>
<body style="margin:0;padding:0;background-color:#e8e4dd;-webkit-font-smoothing:antialiased;">
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">${args.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e8e4dd;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td align="center" style="background-color:#1a1a1a;padding:28px 40px;">
          <img src="${LOGO_URL}" alt="Be Nice Hospitality Group" width="200" style="display:block;max-width:200px;height:auto;" />
        </td></tr>
        <tr><td style="background-color:#ffffff;padding:40px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#3d3d3d;line-height:1.6;">
          ${args.bodyHtml}
          <p style="margin:32px 0 0;color:#1a1a1a;font-weight:500;">${args.signoff}</p>
        </td></tr>
        <tr><td style="background-color:#1a1a1a;padding:24px 40px;text-align:center;">
          ${disclaimer}
          <p style="margin:0 0 8px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.55);">Be Nice Hospitality Group &middot; Hapeville, GA</p>
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);"><a href="${args.unsubscribeUrl}" style="color:rgba(255,255,255,0.55);text-decoration:underline;">Unsubscribe</a> from these emails in one click.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
