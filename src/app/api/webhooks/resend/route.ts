import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { logOutreachEvent, type OutreachEventType } from "@/lib/outreach/events";

/**
 * Resend uses Svix-format webhook signatures. The signature header carries
 * one or more `v1,<base64-hmac>` entries. We compute HMAC-SHA256 over
 * `${svix_id}.${svix_timestamp}.${rawBody}` using the webhook secret (the
 * portion after `whsec_` if present) and constant-time-compare.
 *
 * https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
 */
function verifySignature(
  rawBody: string,
  svixId: string | null,
  svixTimestamp: string | null,
  svixSignature: string | null,
  secret: string
): boolean {
  if (!svixId || !svixTimestamp || !svixSignature) return false;
  const secretBytes = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret);
  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");

  // The header is `v1,<sig> v1,<sig2> ...`. Compare against any `v1,...`.
  for (const part of svixSignature.split(" ")) {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) continue;
    if (sig.length !== expected.length) continue;
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return true;
  }
  return false;
}

interface ResendEvent {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    bounce?: { message?: string };
    click?: { link?: string };
  };
}

const RESEND_TYPE_TO_EVENT: Record<string, OutreachEventType> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delivery_delayed",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks/resend] RESEND_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!verifySignature(rawBody, svixId, svixTimestamp, svixSignature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messageId = event.data?.email_id;
  if (!messageId) {
    return NextResponse.json({ ok: true, ignored: "no_email_id" });
  }

  // Find the target by Resend message id
  const targetRows = (await sql`
    SELECT id, contact_email FROM outreach_targets WHERE resend_message_id = ${messageId} LIMIT 1
  `) as unknown as Array<{ id: number; contact_email: string }>;

  if (targetRows.length === 0) {
    // Could be a non-cold send (audit_ready, nurture, etc.) — that's fine
    return NextResponse.json({ ok: true, ignored: "not_outreach" });
  }
  const target = targetRows[0];

  // Status-field updates for the events that drive auto-pause + unsubscribe logic.
  // These mirror outreach_targets columns the rest of the system reads.
  switch (event.type) {
    case "email.bounced": {
      const reason = event.data?.bounce?.message || "bounced";
      await sql`
        UPDATE outreach_targets
        SET bounced_at = NOW(), status = 'bounced', failure_reason = ${reason}, updated_at = NOW()
        WHERE id = ${target.id}
      `;
      break;
    }
    case "email.complained": {
      await sql`
        UPDATE outreach_targets
        SET complained_at = NOW(), status = 'complained', updated_at = NOW()
        WHERE id = ${target.id}
      `;
      await sql`
        INSERT INTO unsubscribes (email, source, reason)
        VALUES (${target.contact_email.toLowerCase()}, 'complaint', 'spam_complaint')
        ON CONFLICT (email) DO NOTHING
      `;
      break;
    }
    default:
      break;
  }

  // Always log every recognized event type to the immutable event stream.
  // svixId acts as the dedup key — replays of the same webhook are idempotent.
  const eventType = RESEND_TYPE_TO_EVENT[event.type];
  if (eventType) {
    await logOutreachEvent({
      targetId: target.id,
      eventType,
      occurredAt: event.created_at ?? null,
      resendEventId: svixId,
      metadata: {
        resend_type: event.type,
        bounce_reason: event.data?.bounce?.message,
        click_link: event.data?.click?.link,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
