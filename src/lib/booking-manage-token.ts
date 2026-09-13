import crypto from "crypto";
import { getPublicSiteUrl } from "@/lib/site-url";

// Same shape as src/lib/outreach/unsubscribe.ts, scoped to a specific booking
// id + email so a guest can manage their own booking without an account.
function getSecret(): string {
  const s = process.env.UNSUBSCRIBE_HMAC_SECRET;
  if (!s) throw new Error("UNSUBSCRIBE_HMAC_SECRET is not set");
  return s;
}

export function generateBookingManageToken(bookingId: number, email: string): string {
  const normalized = email.toLowerCase().trim();
  const h = crypto.createHmac("sha256", getSecret());
  h.update(`booking:${bookingId}:${normalized}`);
  return h.digest("hex");
}

export function verifyBookingManageToken(bookingId: number, email: string, token: string): boolean {
  try {
    const expected = generateBookingManageToken(bookingId, email);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(token, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildBookingManageUrl(bookingId: number, email: string): string {
  const base = getPublicSiteUrl();
  const token = generateBookingManageToken(bookingId, email);
  const params = new URLSearchParams({ id: String(bookingId), email, token });
  return `${base}/book/manage?${params.toString()}`;
}
