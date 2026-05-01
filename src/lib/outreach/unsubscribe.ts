import crypto from "crypto";

function getSecret(): string {
  const s = process.env.UNSUBSCRIBE_HMAC_SECRET;
  if (!s) throw new Error("UNSUBSCRIBE_HMAC_SECRET is not set");
  return s;
}

/**
 * Generate an HMAC-SHA256 token over the email so unsubscribe links
 * can be verified without a session.
 */
export function generateUnsubscribeToken(email: string): string {
  const normalized = email.toLowerCase().trim();
  const h = crypto.createHmac("sha256", getSecret());
  h.update(normalized);
  return h.digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const expected = generateUnsubscribeToken(email);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(token, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(email: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://benicehospitality.com").replace(/\/$/, "");
  const token = generateUnsubscribeToken(email);
  const params = new URLSearchParams({ email, token });
  return `${base}/api/unsubscribe?${params.toString()}`;
}
