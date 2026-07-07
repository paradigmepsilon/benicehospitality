/**
 * The Host's Edge — Guest Message System.
 *
 * A faceless, anonymous-checkout digital product ($27) sold at
 * benicehospitality.com/thehostsedge. It rides the app's SHARED payment rails:
 *   - Stripe:  src/lib/stripe.ts (getStripe / getBaseUrl)
 *   - Webhook: src/app/api/webhooks/stripe/route.ts (metadata-tagged branch)
 *   - Email:   Resend (same client the rest of the app uses)
 *
 * This module holds the product's constants + the buyer log, so the route
 * handlers stay thin. There is NO course, NO enrollment, NO login for this
 * product — the buyer pays anonymously and receives a download link by email.
 *
 * Billing / merchant of record is honestly BNHG. The brand is faceless in
 * MARKETING only ("operators who run 40+ units"); the payment rail is BNHG.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Stripe Checkout metadata tag that marks a session as a Host's Edge purchase.
 * The shared webhook keys off this to fulfill the digital-product way (email
 * the download) instead of granting a course enrollment. Keep in sync with the
 * checkout route and the webhook branch — changing it silently breaks delivery.
 */
export const HOSTS_EDGE_PRODUCT_TAG = "hosts-edge-guest-message-system";

/** Display + pricing constants. Price ID comes from env (BNHG account). */
export const HOSTS_EDGE = {
  productTag: HOSTS_EDGE_PRODUCT_TAG,
  name: "The Host's Edge Guest Message System",
  priceUsd: 27,
  /** Public route the product lives at. */
  path: "/thehostsedge",
} as const;

/**
 * The BNHG Stripe Price for this product ($27 one-time). Set in .env.local as
 * HOSTS_EDGE_STRIPE_PRICE_ID (price_...). Returns null when unset so the
 * checkout route can fail cleanly instead of throwing at import time.
 */
export function getHostsEdgePriceId(): string | null {
  return process.env.HOSTS_EDGE_STRIPE_PRICE_ID || null;
}

/**
 * The real product asset the buyer receives (hosted PDF download link). Set in
 * .env.local as HOSTS_EDGE_DOWNLOAD_URL. Until set, delivery falls back to a
 * clearly-broken placeholder so a misconfig is obvious in the email, not silent.
 */
export function getHostsEdgeDownloadUrl(): string {
  return (
    process.env.HOSTS_EDGE_DOWNLOAD_URL ||
    "https://benicehospitality.com/thehostsedge#download-not-configured"
  );
}

/**
 * The From address for the delivery email. Reuses the app's existing Resend
 * sender env (BNHG_AUTH_FROM / AUDIT_FROM_EMAIL) so we don't add a new email
 * identity. Faceless display name for the product voice.
 */
export function getHostsEdgeFromAddress(): string {
  const addr =
    process.env.BNHG_AUTH_FROM ||
    process.env.AUDIT_FROM_EMAIL ||
    "onboarding@resend.dev";
  // If the env value already includes a display name ("Name <addr>"), respect
  // it; otherwise wrap the bare address in the faceless product name.
  return addr.includes("<") ? addr : `The Host's Edge <${addr}>`;
}

// --- Buyer log ("own the list", best-effort local mirror) -------------------

export interface HostsEdgeBuyer {
  email: string;
  name?: string;
  sessionId?: string;
  /** ISO timestamp. */
  purchasedAt: string;
}

// Written to /data/buyers.jsonl (git-ignored via .gitignore: /data/ + *.jsonl).
// NOTE: Vercel's filesystem is ephemeral — this does NOT persist in prod. The
// durable buyer record is Stripe (every purchase carries the email). At go-live,
// swap this for a Neon row insert or an ESP add-contact call if a persistent
// owned list is required.
const DATA_DIR = path.join(process.cwd(), "data");
const BUYERS_FILE = path.join(DATA_DIR, "buyers.jsonl");

/**
 * Append one buyer to the local log. Best-effort: a write failure logs and
 * returns false, never throws, so a disk hiccup can't block delivery or the
 * webhook 200.
 */
export async function recordHostsEdgeBuyer(
  buyer: HostsEdgeBuyer,
): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(BUYERS_FILE, JSON.stringify(buyer) + "\n", "utf8");
    return true;
  } catch (err) {
    console.error(`[hosts-edge] failed to log buyer ${buyer.email}:`, err);
    return false;
  }
}

/**
 * The buyer-facing delivery email (faceless "we operators" voice, no personal
 * name, no BNHG branding in the body — billing footer is handled by Stripe's
 * receipt). Returns { subject, html }. Kept here beside the product so the copy
 * and the product live together.
 */
export function hostsEdgeDeliveryEmail(args: {
  name?: string;
  downloadUrl: string;
}): { subject: string; html: string } {
  const first = args.name?.trim().split(/\s+/)[0];
  const hi = first ? `Hi ${first},` : "Hi,";
  const subject = "Your Guest Message System is here";

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#2C3E50;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1A4D4F;margin:0 0 16px;">The Host's Edge</p>
      <h1 style="font-size:22px;color:#1A4D4F;margin:0 0 16px;line-height:1.3;">Your Guest Message System is ready.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">${hi}</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">
        Thanks for grabbing the Guest Message System. Here is your download.
      </p>
      <p style="margin:24px 0;">
        <a href="${args.downloadUrl}" style="background:#B08D57;color:#1a1a1a;padding:14px 24px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Open your templates
        </a>
      </p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">
        Inside you get six messages, in order, ready to fill in and paste into
        your tool. Start with the check-in message. It is the one that ends the
        late-night "how do I get in?" texts. Fill the brackets, adapt with the AI
        prompts if you want, and you are running it the same day.
      </p>
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0;" />
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0;">
        Trouble opening it? Just reply to this email and we will sort it. You
        have a 14-day money-back guarantee either way.
      </p>
    </div>
  `;

  return { subject, html };
}
