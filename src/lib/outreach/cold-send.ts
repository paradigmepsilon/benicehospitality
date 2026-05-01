import { Resend } from "resend";
import { renderEmail } from "@/lib/outreach/render";

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
  const subject = args.subject.trim();

  // Render via the shared helper so the admin "Preview email" view matches the
  // wire byte-for-byte. {{AUDIT_URL}} is expected to be pre-substituted by the
  // caller (process-sends does this); {{UNSUBSCRIBE_URL}} is filled in here.
  const { html, text, unsubscribeUrl } = renderEmail({ body: args.body, to: args.to });

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
