/**
 * Claim Proof — private download signing.
 *
 * The product PDFs live in a PRIVATE Vercel Blob store, so their raw URLs are
 * not publicly fetchable. Delivery works in two layers:
 *
 *   1. Delivery/guide emails carry a stable, token-gated link to our own
 *      /api/claimproof/download endpoint (see claimProofDownloadLink()).
 *   2. That endpoint verifies the token here, then mints a SHORT-LIVED signed
 *      URL for the actual private blob and redirects the browser to it.
 *
 * So "anyone with the link" cannot open the file: the email link needs a valid
 * HMAC token to pass, and the signed Blob URL it produces expires in minutes.
 *
 * The token is a lightweight HMAC (no DB needed) binding the item kind to an
 * absolute expiry. We give it a long expiry (default 1 year) because the email
 * link must still work when a buyer opens it weeks later — the *real* secrecy
 * is that the underlying blob is private and only reachable via a per-click
 * signed URL. The token stops random people from hitting the endpoint and
 * pulling PDFs; it is not the buyer's receipt.
 *
 * Kinds: a paid tier ("core" | "pro" | "fleet") or "guide" (free lead magnet).
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import type { ClaimProofTier } from "@/lib/claim-proof";

export type ClaimProofItem = ClaimProofTier | "guide";

export function isClaimProofItem(v: unknown): v is ClaimProofItem {
  return v === "core" || v === "pro" || v === "fleet" || v === "guide";
}

/** Blob pathname(s) an item resolves to. Fleet serves Pro + the supplement. */
function pathnamesFor(item: ClaimProofItem): string[] {
  switch (item) {
    case "guide":
      return [envOrThrow("CLAIM_PROOF_GUIDE_KEY")];
    case "core":
      return [envOrThrow("CLAIM_PROOF_KEY_CORE")];
    case "pro":
      return [envOrThrow("CLAIM_PROOF_KEY_PRO")];
    case "fleet":
      return [
        envOrThrow("CLAIM_PROOF_KEY_PRO"),
        envOrThrow("CLAIM_PROOF_KEY_FLEET_SUPPLEMENT"),
      ];
  }
}

function envOrThrow(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`[claim-proof-download] ${key} is not set`);
  return v;
}

function getSecret(): string {
  const s = process.env.CLAIM_PROOF_DOWNLOAD_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "[claim-proof-download] CLAIM_PROOF_DOWNLOAD_SECRET is missing or too short",
    );
  }
  return s;
}

// --- Token (HMAC of "item.expiryMs") ----------------------------------------

const DEFAULT_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 year — email link longevity

/** Mint a token for an item. Include in the email link via claimProofDownloadLink.
 *  Optional sessionId (Stripe checkout session) rides in the signed payload so
 *  the portal can attribute logins to a specific purchase. Older two-part
 *  tokens verify unchanged — verifyClaimProofToken only reads the first two
 *  payload segments, and session ids never contain a dot. */
export function makeClaimProofToken(
  item: ClaimProofItem,
  ttlMs: number = DEFAULT_TTL_MS,
  sessionId?: string,
): string {
  const exp = nowMs() + ttlMs;
  const payload = sessionId ? `${item}.${exp}.${sessionId}` : `${item}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  // token = base64url(item.exp[.sid]).sig  — self-describing, no DB lookup
  const b64 = Buffer.from(payload).toString("base64url");
  return `${b64}.${sig}`;
}

/** Verify a token against an item. Returns true only if signature + expiry hold. */
export function verifyClaimProofToken(
  token: string,
  item: ClaimProofItem,
): boolean {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let payload: string;
  try {
    payload = Buffer.from(b64, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expected = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  if (!safeEqualHex(sig, expected)) return false;

  const [tokItem, expStr] = payload.split(".");
  if (tokItem !== item) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < nowMs()) return false;
  return true;
}

/**
 * Parse + verify a token WITHOUT knowing the item up front. Returns the item
 * the token was minted for, or null if the signature or expiry fails. Powers
 * the Claim Command Center portal login: the delivery-email token doubles as
 * the magic link, and this tells us which tier the visitor owns.
 */
export function readClaimProofToken(token: string): ClaimProofItem | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const b64 = token.slice(0, dot);

  let payload: string;
  try {
    payload = Buffer.from(b64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const [tokItem] = payload.split(".");
  if (!isClaimProofItem(tokItem)) return null;
  return verifyClaimProofToken(token, tokItem) ? tokItem : null;
}

/** Like readClaimProofToken, but also returns the Stripe session id when the
 *  token carries one (tokens minted since the purchase mirror shipped). Older
 *  emailed links yield sessionId: null. */
export function readClaimProofTokenDetails(
  token: string,
): { item: ClaimProofItem; sessionId: string | null } | null {
  const item = readClaimProofToken(token);
  if (!item) return null;
  const dot = token.lastIndexOf(".");
  let payload: string;
  try {
    payload = Buffer.from(token.slice(0, dot), "base64url").toString("utf8");
  } catch {
    return null;
  }
  const parts = payload.split(".");
  return { item, sessionId: parts.length >= 3 && parts[2] ? parts[2] : null };
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

// nowMs isolated so Date usage is in one place.
function nowMs(): number {
  return Date.now();
}

// --- Signed blob URLs (short-lived) -----------------------------------------

const SIGNED_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes — the actual secrecy

/**
 * Mint short-lived signed GET URLs for an item's blob(s) from the PRIVATE
 * store. Returns one URL per file (fleet returns two). Requires
 * BLOB_READ_WRITE_TOKEN. Throws if a pathname env is unset.
 */
export async function signedUrlsFor(item: ClaimProofItem): Promise<string[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("[claim-proof-download] BLOB_READ_WRITE_TOKEN is not set");
  }
  const validUntil = nowMs() + SIGNED_URL_TTL_MS;
  const pathnames = pathnamesFor(item);

  const urls: string[] = [];
  for (const pathname of pathnames) {
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
    urls.push(presignedUrl);
  }
  return urls;
}

/** The single primary file for an item (fleet → the Pro manual). */
export async function primarySignedUrl(item: ClaimProofItem): Promise<string> {
  const [first] = await signedUrlsFor(item);
  return first;
}
