/**
 * Room Rental Riches: The Blueprint — Della's book, sold at $32 (list $47).
 *
 * Rides the app's shared payment rails, like The Host's Edge and Claim Proof:
 *   - Stripe:   src/lib/stripe.ts (getStripe / getBaseUrl)
 *   - Checkout: src/app/api/blueprint/checkout
 *   - Webhook:  src/app/api/webhooks/stripe (metadata-tagged branch)
 *   - Download: src/app/api/blueprint/download
 *   - Email:    Resend (same client as the rest of the app)
 *
 * Two things make this different from The Host's Edge:
 *
 *   1. DELIVERY IS GATED. The files live in the PRIVATE Vercel Blob store, so
 *      the raw URLs are not publicly fetchable. The emailed link points at our
 *      own /api/blueprint/download, which verifies an HMAC token and then mints
 *      a short-lived signed Blob URL. Same shape as src/lib/claim-proof-download.ts.
 *      (The Host's Edge uses a plain static URL — fine for a $27 tripwire, not
 *      what we want for the book.)
 *
 *   2. BUYING PROVISIONS AN ACCOUNT. The purchase email becomes a Nice Host
 *      Network account so the buyer lands in the free resource library and the
 *      BNHG dashboard without signing up separately. That account row in
 *      Postgres is also the durable buyer record — deliberately NOT the local
 *      JSON file The Host's Edge appends to, which is ephemeral on Vercel.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getBaseUrl } from "@/lib/stripe";

/**
 * Stripe Checkout metadata tag marking a session as a Blueprint purchase. The
 * shared webhook keys off this to fulfill the book way (gated download + account)
 * rather than granting a course enrollment. Keep in sync with the checkout route
 * and the webhook branch — changing it silently breaks delivery.
 */
export const BLUEPRINT_PRODUCT_TAG = "room-rental-riches-blueprint";

/** Display + pricing constants. The strike-through price is the researched
 *  list price from the monetization plan; $32 is what we actually charge. */
export const BLUEPRINT = {
  productTag: BLUEPRINT_PRODUCT_TAG,
  name: "Room Rental Riches: The Blueprint",
  subtitle:
    "How to turn the home you already have into a cash-generating co-living business.",
  author: "Della Henry",
  priceUsd: 32,
  priceListUsd: 47,
  /** Public route the book lives at. */
  path: "/books/room-rental-riches-blueprint",
  coverImage: "/images/rrr_blueprint_cover.webp",
} as const;

/** The two formats a buyer receives. */
export const BLUEPRINT_FORMATS = ["pdf", "epub"] as const;
export type BlueprintFormat = (typeof BLUEPRINT_FORMATS)[number];

export function isBlueprintFormat(v: unknown): v is BlueprintFormat {
  return v === "pdf" || v === "epub";
}

/**
 * The BNHG Stripe Price for the book ($32 one-time). Set in .env.local as
 * BLUEPRINT_STRIPE_PRICE_ID (price_...). Returns null when unset so the
 * checkout route fails cleanly instead of throwing at import time.
 */
export function getBlueprintPriceId(): string | null {
  return process.env.BLUEPRINT_STRIPE_PRICE_ID || null;
}

// --- Private blob pathnames -------------------------------------------------

function envOrThrow(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`[blueprint] ${key} is not set`);
  return v;
}

function pathnameFor(format: BlueprintFormat): string {
  return format === "pdf"
    ? envOrThrow("BLUEPRINT_BLOB_KEY_PDF")
    : envOrThrow("BLUEPRINT_BLOB_KEY_EPUB");
}

function getSecret(): string {
  const s = process.env.BLUEPRINT_DOWNLOAD_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "[blueprint] BLUEPRINT_DOWNLOAD_SECRET is missing or too short (need 16+ chars)",
    );
  }
  return s;
}

// --- Token (HMAC of "format.expiryMs") --------------------------------------

/** A year. The emailed link has to still work when a buyer opens it weeks
 *  later; the real secrecy is that the blob is private and only reachable via
 *  a per-click signed URL that expires in minutes. */
const DEFAULT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function makeBlueprintToken(
  format: BlueprintFormat,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const exp = Date.now() + ttlMs;
  const payload = `${format}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyBlueprintToken(
  token: string,
  format: BlueprintFormat,
): boolean {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  let payload: string;
  try {
    payload = Buffer.from(token.slice(0, dot), "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expected = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  if (!safeEqualHex(token.slice(dot + 1), expected)) return false;

  const [tokFormat, expStr] = payload.split(".");
  if (tokFormat !== format) return false;
  const exp = Number(expStr);
  return Number.isFinite(exp) && exp >= Date.now();
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/** The link that goes in the delivery email. */
export function blueprintDownloadLink(
  format: BlueprintFormat,
  token: string,
): string {
  return `${getBaseUrl()}/api/blueprint/download?format=${format}&t=${encodeURIComponent(token)}`;
}

// --- Signed blob URLs (short-lived) -----------------------------------------

const SIGNED_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes — the actual secrecy

/**
 * Mint a short-lived signed GET URL for one format from the PRIVATE store.
 * Requires BLOB_READ_WRITE_TOKEN. Throws if the pathname env is unset.
 */
export async function signedUrlFor(format: BlueprintFormat): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("[blueprint] BLOB_READ_WRITE_TOKEN is not set");

  const pathname = pathnameFor(format);
  const validUntil = Date.now() + SIGNED_URL_TTL_MS;
  const signed = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
    token,
  });
  const { presignedUrl } = await presignUrl(signed, {
    operation: "get",
    pathname,
    access: "private",
    validUntil,
  });
  return presignedUrl;
}

// --- Buyer account provisioning ---------------------------------------------

export interface ProvisionedBuyer {
  userId: number;
  email: string;
  /** False when the buyer already had an account — no duplicate is created and
   *  no set-password link should be sent, since they already have a password. */
  isNew: boolean;
}

/**
 * Give the buyer a Nice Host Network account so the free resource library and
 * the dashboard are ready when they land.
 *
 * Deliberately NOT findOrCreateOAuthUser(): that helper also writes a
 * user_oauth_accounts row, and a Stripe purchase is not an OAuth link — using
 * it would fabricate a provider association that never happened.
 *
 * Idempotent by email, so a repeat purchase or a webhook retry finds the
 * existing account instead of creating a second one.
 *
 * email_verified_at is set because the buyer receives their book at that
 * address and must open it to get the files — that round trip is the
 * verification.
 */
export async function provisionBuyerAccount(
  email: string,
  name?: string,
): Promise<ProvisionedBuyer> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("[blueprint] cannot provision without an email");

  const existing = (await sql`
    SELECT id, email FROM users WHERE lower(email) = ${normalized} LIMIT 1
  `) as { id: number; email: string }[];

  if (existing[0]) {
    return { userId: existing[0].id, email: existing[0].email, isNew: false };
  }

  // password_hash NULL — the buyer sets one from the emailed link. authenticate()
  // already treats a missing hash as "cannot log in with a password", so the
  // account is inert until they claim it.
  const inserted = (await sql`
    INSERT INTO users (email, name, role, password_hash, email_verified_at)
    VALUES (${normalized}, ${name ?? null}, 'user', NULL, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email
  `) as { id: number; email: string }[];

  if (inserted[0]) {
    return { userId: inserted[0].id, email: inserted[0].email, isNew: true };
  }

  // Lost a race with a concurrent webhook retry — re-read rather than fail.
  const raced = (await sql`
    SELECT id, email FROM users WHERE lower(email) = ${normalized} LIMIT 1
  `) as { id: number; email: string }[];
  if (!raced[0]) throw new Error("[blueprint] failed to provision buyer account");
  return { userId: raced[0].id, email: raced[0].email, isNew: false };
}

// --- Delivery email ---------------------------------------------------------

/** From address for the delivery email. Falls back to the shared BNHG sender. */
export function getBlueprintFromAddress(): string {
  return (
    process.env.BLUEPRINT_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "Della Henry <hello@benicehospitality.com>"
  );
}

/**
 * The buyer-facing delivery email. Della's voice — warm, direct, operator to
 * operator. Carries both formats and, for a brand-new account, the link to set
 * a password.
 *
 * `setPasswordUrl` is omitted for buyers who already had an account: they
 * already have a password, and sending them a reset link would read as a
 * security scare rather than a welcome.
 */
export function blueprintDeliveryEmail(args: {
  name?: string;
  pdfUrl: string;
  epubUrl: string;
  setPasswordUrl?: string;
}): { subject: string; html: string } {
  const first = args.name?.trim().split(/\s+/)[0];
  const hi = first ? `Hi ${first},` : "Hi,";
  const subject = "Your copy of Room Rental Riches: The Blueprint";

  // 30 minutes is the app-wide password-reset TTL (community-auth.ts). Say so
  // plainly and give the fallback, rather than letting it expire silently.
  const accountBlock = args.setPasswordUrl
    ? `
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B08D57;margin:0 0 10px;">Your account is ready</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">
        I set up your Nice Host Network account with this email address, so the
        free resource library and your dashboard are already waiting. Pick a
        password and you are in.
      </p>
      <p style="margin:20px 0;">
        <a href="${args.setPasswordUrl}" style="background:#1A4D4F;color:#ffffff;padding:13px 22px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Set your password
        </a>
      </p>
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0;">
        That link is good for 30 minutes. If it lapses, use &ldquo;Forgot
        password&rdquo; on the login page with this same address and you will get
        a fresh one.
      </p>`
    : `
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:15px;line-height:1.55;margin:0;">
        You already have a Nice Host Network account on this email, so nothing to
        set up. Log in and the resource library is right there.
      </p>`;

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#2C3E50;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B08D57;margin:0 0 16px;">Be Nice Hospitality Group</p>
      <h1 style="font-size:23px;color:#1A4D4F;margin:0 0 18px;line-height:1.3;">Your Blueprint is here.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">${hi}</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 22px;">
        Thank you for picking this up. Everything in here is the system we
        actually run across our own homes, so treat it as a working reference
        you come back to rather than something you read once and shelve.
      </p>
      <p style="margin:0 0 12px;">
        <a href="${args.pdfUrl}" style="background:#B08D57;color:#1a1a1a;padding:14px 24px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Download the PDF
        </a>
      </p>
      <p style="margin:0 0 22px;">
        <a href="${args.epubUrl}" style="color:#1A4D4F;font-size:14px;font-weight:600;text-decoration:underline;">
          Or grab the ePub for your e-reader
        </a>
      </p>
      <p style="font-size:14px;line-height:1.55;color:#4B5563;margin:0 0 4px;">
        Start with Module 1 if you have not picked a property yet. If you already
        have the house, skip to Module 2 and price it properly.
      </p>
      ${accountBlock}
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0 0 10px;">
        Trouble with a download? Reply to this email and I will sort it. These
        links stay good, and each click generates a fresh, short-lived download.
      </p>
      <p style="font-size:12px;line-height:1.5;color:#807868;margin:0;">
        Educational content only, not legal, tax, or financial advice. Dollar
        figures in the book are illustrative examples from our own operations,
        not a promise of what you will earn.
      </p>
    </div>
  `;

  return { subject, html };
}
