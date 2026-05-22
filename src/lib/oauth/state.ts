import { timingSafeEqual } from "crypto";
import { safeNext } from "@/lib/auth-redirect";

// The `state` value sent to the provider carries both a random nonce (verified
// against the bnhg_oauth_state cookie on callback) and the `next` redirect
// path. Stuffing `next` into state instead of a separate cookie makes the
// round-trip resilient to Safari ITP / embedded webviews that occasionally
// drop short-lived first-party cookies on cross-site redirects.

export interface OAuthState {
  nonce: string;
  next: string;
}

export function encodeState(state: OAuthState): string {
  const payload = JSON.stringify({
    n: state.nonce,
    x: safeNext(state.next),
  });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeState(raw: string | null | undefined): OAuthState | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { n?: unknown; x?: unknown };
    if (typeof parsed.n !== "string" || typeof parsed.x !== "string") {
      return null;
    }
    return { nonce: parsed.n, next: safeNext(parsed.x) };
  } catch {
    return null;
  }
}

export function nonceMatches(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
