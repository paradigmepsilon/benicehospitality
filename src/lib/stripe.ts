import Stripe from "stripe";

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

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BNHG_BASE_URL ||
    "https://benicehospitality.com"
  );
}
