/**
 * Before You Buy the Car: the free Car Rental Riches ebook (lead magnet).
 *
 * "12 Things Nobody Tells You Before You Rent Out Your First Vehicle", by
 * Alex Henry. Twelve short chapters drawn from The Inside Lane (the paid book,
 * src/lib/crr-blueprint.ts). It is the second primary magnet next to the
 * Vehicle Profitability Calculator: the calculator owns the Turo-shaped
 * search intent, this owns "how to start a car rental business".
 *
 * Rails (all shared with the rest of the app):
 *   - Capture:  src/app/api/crr-free-ebook/request  (email -> newsletter_subscribers
 *               source "crr-free-ebook", then a Resend delivery email)
 *   - Download: src/app/api/crr-free-ebook/download (HMAC token -> short-lived
 *               signed URL into the PRIVATE Vercel Blob store)
 *   - Page:     src/app/(marketing)/books/before-you-buy-the-car
 *
 * Why gate a free file: the emailed link is the thing people forward, and a
 * raw blob URL in a forwarded email is a permanent public URL. The token is
 * long-lived (a year) so the link keeps working; the signed URL it produces
 * expires in minutes. Same contract as ClaimProof's free guide.
 *
 * Nothing here charges anyone. There is no Stripe object for this product.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getBaseUrl } from "@/lib/stripe";

export const CRR_FREE_EBOOK = {
  /** Output basename from scripts/build-crr-book.ts (CRR_BOOK_SLUG). */
  slug: "before-you-buy-the-car",
  name: "Before You Buy the Car",
  subtitle: "12 Things Nobody Tells You Before You Rent Out Your First Vehicle",
  author: "Alex Henry",
  /** Public landing route. /before-you-buy-the-car redirects here. */
  path: "/books/before-you-buy-the-car",
  coverImage: "/images/crr_free_ebook_cover.webp",
  /** newsletter_subscribers.source for leads captured by this magnet. */
  source: "crr-free-ebook",
  /** Chapter titles, in reading order, as printed in the book. */
  chapters: [
    "The number that brought you here is gross",
    "Your biggest cost never sends a bill",
    "Most of what you've watched describes a platform that no longer exists",
    "Your personal auto policy wants no part of this",
    "The line you'll delete from the budget is the one that saves you",
    "The cheaper car is often the more expensive one",
    "The same car is three different businesses",
    "Claims are won in your driveway, not in the review queue",
    "Cars get stolen by bookings, not by broken windows",
    "The marketplace is a channel, not a business",
    "There is a floor, and you don't rent direct until it's built",
    "Write your quit criteria before you own anything",
  ],
} as const;

// The opt-in form's option lists live in crr-free-ebook-options.ts (no
// server imports) so the client component can use them; re-exported here
// for server callers.
export {
  CARS_TODAY_OPTIONS,
  isCarsToday,
  type CarsToday,
} from "@/lib/crr-free-ebook-options";

/** The two formats the reader receives. */
export const CRR_FREE_EBOOK_FORMATS = ["pdf", "epub"] as const;
export type CrrFreeEbookFormat = (typeof CRR_FREE_EBOOK_FORMATS)[number];

export function isCrrFreeEbookFormat(v: unknown): v is CrrFreeEbookFormat {
  return v === "pdf" || v === "epub";
}

// --- Lead log ---------------------------------------------------------------

/**
 * Record the lead in newsletter_subscribers with this magnet's source tag,
 * so the owned list survives Vercel's ephemeral filesystem. Best-effort: a
 * failure logs and returns false, never throws, so it can't block delivery.
 */
export async function recordCrrFreeEbookLead(email: string): Promise<boolean> {
  try {
    await sql`
      INSERT INTO newsletter_subscribers (email, source)
      VALUES (${email.toLowerCase().trim()}, ${CRR_FREE_EBOOK.source})
      ON CONFLICT (email) DO NOTHING
    `;
    return true;
  } catch (err) {
    console.error(`[crr-free-ebook] failed to log lead ${email}:`, err);
    return false;
  }
}

// --- Private blob pathnames -------------------------------------------------

function envOrThrow(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`[crr-free-ebook] ${key} is not set`);
  return v;
}

function pathnameFor(format: CrrFreeEbookFormat): string {
  return format === "pdf"
    ? envOrThrow("CRR_FREE_EBOOK_BLOB_KEY_PDF")
    : envOrThrow("CRR_FREE_EBOOK_BLOB_KEY_EPUB");
}

/**
 * Signing secret. Its own env var, falling back to the paid book's secret so
 * a deployment that already runs The Inside Lane needs one fewer variable.
 * Rotating the paid secret then rotates both, which is the safe direction.
 */
function getSecret(): string {
  const s =
    process.env.CRR_FREE_EBOOK_DOWNLOAD_SECRET ||
    process.env.CRR_BLUEPRINT_DOWNLOAD_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "[crr-free-ebook] CRR_FREE_EBOOK_DOWNLOAD_SECRET (or CRR_BLUEPRINT_DOWNLOAD_SECRET) is missing or too short (need 16+ chars)",
    );
  }
  return s;
}

// --- Token (HMAC of "free-<format>.expiryMs") ---------------------------------

/** A year, so the emailed link still works when the reader opens it later.
 *  The real secrecy is the private blob plus the per-click signed URL. */
const DEFAULT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

/** Namespaced so a free-ebook token can never verify against the paid
 *  book's download route even when the two share a secret. */
function tokenItem(format: CrrFreeEbookFormat): string {
  return `free-${format}`;
}

export function makeCrrFreeEbookToken(
  format: CrrFreeEbookFormat,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const exp = Date.now() + ttlMs;
  const payload = `${tokenItem(format)}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyCrrFreeEbookToken(
  token: string,
  format: CrrFreeEbookFormat,
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

  const [tokItem, expStr] = payload.split(".");
  if (tokItem !== tokenItem(format)) return false;
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
export function crrFreeEbookDownloadLink(
  format: CrrFreeEbookFormat,
  token: string,
): string {
  return `${getBaseUrl()}/api/crr-free-ebook/download?format=${format}&t=${encodeURIComponent(token)}`;
}

// --- Signed blob URLs (short-lived) -----------------------------------------

const SIGNED_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes, the actual secrecy

export async function signedCrrFreeEbookUrlFor(
  format: CrrFreeEbookFormat,
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("[crr-free-ebook] BLOB_READ_WRITE_TOKEN is not set");

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

/** Alex signs this one; same sender chain as the paid book. */
export function getCrrFreeEbookFromAddress(): string {
  return (
    process.env.CRR_BLUEPRINT_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "Alex Henry <hello@benicehospitality.com>"
  );
}

/**
 * The delivery email. Operator to operator, no hype. Both formats, one
 * pointer to the calculator (the guide's own action steps send readers
 * there), and one soft line about the full book. The nurture sequence
 * carries the rest; this email's job is to deliver.
 */
export function crrFreeEbookDeliveryEmail(args: {
  pdfUrl: string;
  epubUrl: string;
}): { subject: string; html: string } {
  const subject = "Before You Buy the Car: your free guide";
  const base = getBaseUrl();

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#2C3E50;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B08D57;margin:0 0 16px;">Car Rental Riches &middot; Be Nice Hospitality Group</p>
      <h1 style="font-size:23px;color:#1A4D4F;margin:0 0 18px;line-height:1.3;">Here&rsquo;s the guide.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">
        Twelve things, twelve short chapters, one action each. It&rsquo;s the
        short version of what I learned running Be Nice Autos, our own rental
        fleet in the Atlanta area, and it&rsquo;s built to be read before you
        spend a dollar on a car.
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
        Start with chapter one. It takes four minutes and it changes how you
        read every earnings number you see from here on. When you get to
        chapter seven, run your own car through the free calculator at
        <a href="${base}/turo-calculator" style="color:#1A4D4F;font-weight:600;">benicehospitality.com/turo-calculator</a>
        three ways: marketplace, weekly, and direct.
      </p>
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:14px;line-height:1.55;color:#4B5563;margin:0 0 10px;">
        The long version is <em>The Inside Lane</em>, seventeen chapters on
        the whole business from one car to fifty. No pressure; the guide
        stands on its own. Reply to this email with any question and I&rsquo;ll
        answer it myself.
      </p>
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0 0 10px;">
        Trouble with a download? Reply here and I will sort it. These links
        stay good, and each click generates a fresh, short-lived download.
      </p>
      <p style="font-size:12px;line-height:1.5;color:#807868;margin:0;">
        Educational content only, not legal, tax, financial, or insurance
        advice. Dollar figures in the guide are illustrative, not a promise of
        what you will earn. Car Rental Riches is an independent educational
        product, not affiliated with Turo Inc. or any rental company named in
        it.
      </p>
    </div>
  `;

  return { subject, html };
}
