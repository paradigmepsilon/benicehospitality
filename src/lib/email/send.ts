import { Resend } from "resend";
import {
  auditReadyEmail,
  nurtureDay3Email,
  nurtureDay7Email,
  nurtureDay14Email,
  type AuditEmailPayload,
  type NurtureDay7Payload,
} from "@/lib/email-templates";

export type AuditEmailKind = "audit_ready" | "nurture_day_3" | "nurture_day_7" | "nurture_day_14";

interface BaseSendArgs {
  to: string;
}

interface AuditReadySendArgs extends BaseSendArgs {
  kind: "audit_ready";
  payload: AuditEmailPayload;
}

interface NurtureDay3SendArgs extends BaseSendArgs {
  kind: "nurture_day_3";
  payload: AuditEmailPayload;
}

interface NurtureDay7SendArgs extends BaseSendArgs {
  kind: "nurture_day_7";
  payload: NurtureDay7Payload;
}

interface NurtureDay14SendArgs extends BaseSendArgs {
  kind: "nurture_day_14";
  payload: AuditEmailPayload;
}

export type AuditEmailSendArgs =
  | AuditReadySendArgs
  | NurtureDay3SendArgs
  | NurtureDay7SendArgs
  | NurtureDay14SendArgs;

export interface AuditEmailSendResult {
  ok: boolean;
  messageId: string | null;
  error?: string;
}

let cachedClient: Resend | null = null;
function getResend(): Resend {
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}

export function getAuditFromAddress(): string {
  return process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>";
}

function renderEmail(args: AuditEmailSendArgs): { subject: string; html: string } {
  switch (args.kind) {
    case "audit_ready":
      return {
        subject: `Your Tier 0 audit for ${args.payload.hotelName} is ready`,
        html: auditReadyEmail(args.payload),
      };
    case "nurture_day_3":
      return {
        subject: `Quick question about your ${args.payload.hotelName} audit`,
        html: nurtureDay3Email(args.payload),
      };
    case "nurture_day_7":
      return {
        subject: `${args.payload.hotelName}'s lowest score: ${args.payload.lowestDimensionLabel}`,
        html: nurtureDay7Email(args.payload),
      };
    case "nurture_day_14":
      return {
        subject: `Last note on your ${args.payload.hotelName} audit`,
        html: nurtureDay14Email(args.payload),
      };
  }
}

export async function sendAuditEmail(args: AuditEmailSendArgs): Promise<AuditEmailSendResult> {
  const { subject, html } = renderEmail(args);
  try {
    const result = await getResend().emails.send({
      from: getAuditFromAddress(),
      to: args.to,
      subject,
      html,
    });
    // Resend's SDK does not throw on 4xx/5xx; it returns { data, error }.
    // Surface that error path here so callers don't silently treat failures as success.
    if (result.error) {
      const msg = `${result.error.name}: ${result.error.message}`;
      console.error(`[email/send] kind=${args.kind} to=${args.to} resend error:`, msg);
      return { ok: false, messageId: null, error: msg };
    }
    return { ok: true, messageId: result.data?.id ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[email/send] kind=${args.kind} to=${args.to} threw:`, msg);
    return { ok: false, messageId: null, error: msg };
  }
}
