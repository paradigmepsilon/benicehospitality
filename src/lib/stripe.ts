import Stripe from "stripe";
import { getPublicSiteUrl } from "@/lib/site-url";

// Lazy-init mirrors the Resend pattern used elsewhere in the codebase
// (src/lib/auth-email.ts, src/app/api/contact/route.ts, etc.) — the client
// constructor only runs when an actual call is attempted, so importing this
// module doesn't crash at build/SSR time when STRIPE_SECRET_KEY is unset.
let cachedStripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cachedStripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local before invoking checkout.",
      );
    }
    cachedStripe = new Stripe(key);
  }
  return cachedStripe;
}

/**
 * Base URL for Stripe redirects and emailed links.
 *
 * NEXT_PUBLIC_BASE_URL / BNHG_BASE_URL stay honored for existing deploys (and
 * production sets one of them to the canonical www origin, so this is not a
 * behavior change), but the fallback is now getPublicSiteUrl() rather than a
 * hardcoded host. The old literal was the bare apex, which 307-redirects since
 * www became primary — a fallback that is wrong the moment it is actually
 * used is worth removing even while the env var is masking it.
 */
export function getBaseUrl(): string {
  const legacy = (process.env.NEXT_PUBLIC_BASE_URL || process.env.BNHG_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  return legacy || getPublicSiteUrl();
}
