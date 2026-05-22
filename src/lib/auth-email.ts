import { Resend } from "resend";

// Lazy-construct so importing this module doesn't crash at build/SSR time
// when RESEND_API_KEY isn't set. Constructor only runs when an actual send
// is attempted.
let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) {
    cachedResend = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedResend;
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BNHG_BASE_URL ||
    "https://benicehospitality.com"
  );
}

function getFrom(): string {
  // Production should set BNHG_AUTH_FROM to a verified Resend domain address.
  // The onboarding@resend.dev sender works for testing without domain verification
  // but is rate-limited and looks unbranded; do not use it in production.
  return process.env.BNHG_AUTH_FROM || "BNHG <onboarding@resend.dev>";
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  rawToken: string;
}): Promise<void> {
  const { to, name, rawToken } = opts;
  const url = `${getBaseUrl()}/login/reset/${encodeURIComponent(rawToken)}`;
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";

  await getResend().emails.send({
    from: getFrom(),
    to,
    subject: "Reset your BNHG password",
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;color:#2C3E50;max-width:560px;margin:0 auto;padding:24px;">
        <p style="font-size:14px;letter-spacing:0.2em;text-transform:uppercase;color:#1A4D4F;margin:0 0 16px;">Be Nice Hospitality Group</p>
        <h1 style="font-size:22px;color:#1A4D4F;margin:0 0 16px;">Reset your password</h1>
        <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">${greeting}</p>
        <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">
          We got a request to reset the password for your BNHG community account.
          Click the button below to set a new one. The link expires in 30 minutes.
        </p>
        <p style="margin:28px 0;">
          <a href="${url}" style="background:#B08D57;color:#1a1a1a;padding:14px 24px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
            Reset password
          </a>
        </p>
        <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0 0 12px;">
          If the button doesn't work, paste this URL into your browser:
        </p>
        <p style="font-size:13px;line-height:1.4;color:#4B5563;word-break:break-all;margin:0 0 24px;">
          ${url}
        </p>
        <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0;" />
        <p style="font-size:12px;line-height:1.55;color:#4B5563;margin:0;">
          Didn't request this? You can safely ignore this email — your password
          stays the same. If this keeps happening, reply to this message and
          we'll help you secure the account.
        </p>
      </div>
    `,
    text: `${greeting}

Reset your BNHG password by visiting this link (expires in 30 minutes):
${url}

Didn't request this? You can ignore this email — your password stays the same.`,
  });
}
