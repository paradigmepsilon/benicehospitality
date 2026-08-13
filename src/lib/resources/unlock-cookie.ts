import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Front-door gate cookie, now READ-ONLY and on a timer.
//
// This used to be issued by /api/resources/[slug]/unlock when a visitor traded
// their name + email for the free tools. That endpoint is gone: the tools are
// account-gated now. Nothing writes this cookie any more.
//
// What survives is the read path, which grandfathers visitors who unlocked
// before the cutover — getResourceAccess() maps a valid cookie to the
// "grandfathered" mode, which renders the tool plus a create-an-account
// banner. TTL_DAYS below is 90, so the last cookie ever issued expires 90 days
// after the cutover deploy. On or after that date this entire module, the
// `grandfathered` branch in ResourceGate, and the GrandfatherBanner component
// can be deleted outright.
//
// makeUnlockCookieValue() and unlockCookieOptions() are kept only so the
// format stays self-documenting alongside the verifier. They have no callers.

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
