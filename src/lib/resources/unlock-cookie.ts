import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Front-door gate cookie. Once a visitor gives their name + email to open any
// free resource tool, this signed cookie lets every free tool render without
// re-asking. It carries the captured email + an issued-at timestamp, HMAC'd so
// it cannot be forged. Low-stakes (it only gates free lead magnets), but signed
// so a random string can't wave the gate open.

export const RESOURCE_UNLOCK_COOKIE = "bnhg_resource_unlock";
const TTL_DAYS = 90;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

function secret(): string {
  return (
    process.env.RESOURCE_UNLOCK_SECRET ||
    process.env.SESSION_SECRET ||
    "bnhg-resource-unlock-dev-secret"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/**
 * Build the cookie value for a freshly captured email. Format:
 *   base64url(JSON{ e, t }) + "." + hmac
 */
export function makeUnlockCookieValue(email: string): string {
  const payload = JSON.stringify({ e: email.toLowerCase().trim(), t: Date.now() });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export const unlockCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(TTL_MS / 1000),
};

/** Verify a raw cookie value. Returns the captured email, or null if invalid/expired. */
export function verifyUnlockCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  const encoded = value.slice(0, dot);
  const providedSig = value.slice(dot + 1);
  const expectedSig = sign(encoded);
  // Constant-time compare; guard against length mismatch which throws.
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { e, t } = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (typeof e !== "string" || typeof t !== "number") return null;
    if (Date.now() - t > TTL_MS) return null;
    return e;
  } catch {
    return null;
  }
}

/** Server-component helper: is the current visitor already unlocked? */
export async function hasResourceUnlock(): Promise<boolean> {
  const store = await cookies();
  return verifyUnlockCookieValue(store.get(RESOURCE_UNLOCK_COOKIE)?.value) !== null;
}
