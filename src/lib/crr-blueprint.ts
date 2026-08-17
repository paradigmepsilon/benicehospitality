/**
 * The Car Rental Riches Blueprint: Alex's book, sold at $32.
 *
 * Mirror of src/lib/blueprint.ts (Room Rental Riches: The Blueprint), riding
 * the same shared payment rails:
 *   - Stripe:   src/lib/stripe.ts (getStripe / getBaseUrl)
 *   - Checkout: src/app/api/crr-blueprint/checkout
 *   - Webhook:  src/app/api/webhooks/stripe (metadata-tagged branch)
 *   - Download: src/app/api/crr-blueprint/download
 *   - Email:    Resend (same client as the rest of the app)
 *
 * Same two properties that make the Blueprint pattern different from The
 * Host's Edge:
 *
 *   1. DELIVERY IS GATED. The files live in the PRIVATE Vercel Blob store, so
 *      the raw URLs are not publicly fetchable. The emailed link points at our
 *      own /api/crr-blueprint/download, which verifies an HMAC token and then
 *      mints a short-lived signed Blob URL.
 *
 *   2. BUYING PROVISIONS AN ACCOUNT. The purchase email becomes a Nice Host
 *      Network account. That helper is shared: provisionBuyerAccount lives in
 *      src/lib/blueprint.ts and is deliberately NOT duplicated here (the CRR
 *      presale webhook branch already reuses it the same way).
 *
 * This is the BOOK, not the $197 founding presale: that product lives in
 * src/lib/car-rental-riches.ts with its own tag and rails.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { getBaseUrl } from "@/lib/stripe";

/**
 * Stripe Checkout metadata tag marking a session as a Car Rental Riches
 * Blueprint purchase. The shared webhook keys off this to fulfill the book way
 * (gated download + account) rather than granting a course enrollment. Keep in
 * sync with the checkout route and the webhook branch: changing it silently
 * breaks delivery.
 */
export const CRR_BLUEPRINT_PRODUCT_TAG = "car-rental-riches-blueprint";

/** Display + pricing constants. $32 is the site price; no researched list
 *  price exists for this book, so there is no strike-through. */
export const CRR_BLUEPRINT = {
  productTag: CRR_BLUEPRINT_PRODUCT_TAG,
  name: "The Car Rental Riches Blueprint",
  subtitle:
    "Start a profitable Turo business in the 2026 earnings-plan era.",
  author: "Alex Henry",
  priceUsd: 32,
  /** Public route the book lives at. */
  path: "/books/car-rental-riches-blueprint",
  /** Cover asset is not produced yet; the sales page falls back to a
   *  typographic cover until this file lands in public/images. */
  coverImage: "/images/crr_blueprint_cover.webp",
} as const;

/** The two formats a buyer receives. */
export const CRR_BLUEPRINT_FORMATS = ["pdf", "epub"] as const;
export type CrrBlueprintFormat = (typeof CRR_BLUEPRINT_FORMATS)[number];

export function isCrrBlueprintFormat(v: unknown): v is CrrBlueprintFormat {
  return v === "pdf" || v === "epub";
}

/**
 * The BNHG Stripe Price for the book ($32 one-time). Set in .env.local as
 * CRR_BLUEPRINT_STRIPE_PRICE_ID (price_...). Returns null when unset so the
 * checkout route fails cleanly instead of throwing at import time.
 */
export function getCrrBlueprintPriceId(): string | null {
  return process.env.CRR_BLUEPRINT_STRIPE_PRICE_ID || null;
}

// --- Private blob pathnames -------------------------------------------------

function envOrThrow(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`[crr-blueprint] ${key} is not set`);
  return v;
}

function pathnameFor(format: CrrBlueprintFormat): string {
  return format === "pdf"
    ? envOrThrow("CRR_BLUEPRINT_BLOB_KEY_PDF")
    : envOrThrow("CRR_BLUEPRINT_BLOB_KEY_EPUB");
}

function getSecret(): string {
  const s = process.env.CRR_BLUEPRINT_DOWNLOAD_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "[crr-blueprint] CRR_BLUEPRINT_DOWNLOAD_SECRET is missing or too short (need 16+ chars)",
    );
  }
  return s;
}

// --- Token (HMAC of "format.expiryMs") --------------------------------------

/** A year. The emailed link has to still work when a buyer opens it weeks
 *  later; the real secrecy is that the blob is private and only reachable via
 *  a per-click signed URL that expires in minutes. */
const DEFAULT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function makeCrrBlueprintToken(
  format: CrrBlueprintFormat,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const exp = Date.now() + ttlMs;
  const payload = `${format}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyCrrBlueprintToken(
  token: string,
  format: CrrBlueprintFormat,
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
export function crrBlueprintDownloadLink(
  format: CrrBlueprintFormat,
  token: string,
): string {
  return `${getBaseUrl()}/api/crr-blueprint/download?format=${format}&t=${encodeURIComponent(token)}`;
}

// --- Signed blob URLs (short-lived) -----------------------------------------

const SIGNED_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes, the actual secrecy

/**
 * Mint a short-lived signed GET URL for one format from the PRIVATE store.
 * Requires BLOB_READ_WRITE_TOKEN. Throws if the pathname env is unset.
 */
export async function signedCrrBlueprintUrlFor(
  format: CrrBlueprintFormat,
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("[crr-blueprint] BLOB_READ_WRITE_TOKEN is not set");

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

// --- Delivery email ---------------------------------------------------------

/** From address for the delivery email. Falls back to the shared BNHG sender.
 *  Alex signs this one. */
export function getCrrBlueprintFromAddress(): string {
  return (
    process.env.CRR_BLUEPRINT_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "Alex Henry <hello@benicehospitality.com>"
  );
}

/**
 * The buyer-facing delivery email. Alex's voice: operator to operator, direct,
 * warm, zero hype. Carries both formats and, for a brand-new account, the link
 * to set a password.
 *
 * `setPasswordUrl` is omitted for buyers who already had an account: they
 * already have a password, and sending them a reset link would read as a
 * security scare rather than a welcome.
 */
export function crrBlueprintDeliveryEmail(args: {
  name?: string;
  pdfUrl: string;
  epubUrl: string;
  setPasswordUrl?: string;
}): { subject: string; html: string } {
  const first = args.name?.trim().split(/\s+/)[0];
  const hi = first ? `Hi ${first},` : "Hi,";
  const subject = "Your copy of The Car Rental Riches Blueprint";

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
        Thanks for picking this up. Everything in these pages comes from running
        Be Nice Autos, our own rental fleet here in the Atlanta area, so treat it
        as a working reference you come back to, not something you read once and
        shelve.
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
        Start with Chapter 1 if you are still deciding whether this business
        fits your life. If you already have the car, go straight to Chapter 3
        and underwrite it before you list it.
      </p>
      ${accountBlock}
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0 0 10px;">
        Trouble with a download? Reply to this email and I will sort it. These
        links stay good, and each click generates a fresh, short-lived download.
      </p>
      <p style="font-size:12px;line-height:1.5;color:#807868;margin:0;">
        Educational content only, not legal, tax, financial, or insurance
        advice. Dollar figures in the book are illustrative, not a promise of
        what you will earn. The Car Rental Riches Blueprint is an independent
        educational product, not affiliated with Turo Inc.
      </p>
    </div>
  `;

  return { subject, html };
}
