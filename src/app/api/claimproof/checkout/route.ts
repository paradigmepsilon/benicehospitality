import { NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import {
  CLAIM_PROOF,
  CLAIM_PROOF_PRODUCT_TAG,
  getClaimProofPriceId,
  isClaimProofTier,
} from "@/lib/claim-proof";
import { getPostHogClient } from "@/lib/posthog-server";

// Stripe SDK needs Node APIs, not the Edge runtime.
export const runtime = "nodejs";

/**
 * POST /api/claimproof/checkout  { tier: "core" | "pro" | "fleet" }
 *
 * Creates an ANONYMOUS hosted Stripe Checkout Session for the requested Claim
 * Proof tier and returns its URL. No login — frictionless digital-product buy,
 * same rails as The Host's Edge (api/thehostsedge/checkout).
 *
 * The session carries metadata.product = CLAIM_PROOF_PRODUCT_TAG and
 * metadata.tier so the shared webhook (api/webhooks/stripe) delivers the right
 * tier's download by email.
 *
 * Env:
 *   STRIPE_SECRET_KEY                    shared (src/lib/stripe.ts)
 *   CLAIM_PROOF_STRIPE_PRICE_ID_CORE     $47 price (price_...)
 *   CLAIM_PROOF_STRIPE_PRICE_ID_PRO      $97 price
 *   CLAIM_PROOF_STRIPE_PRICE_ID_FLEET    $197 price
 *   NEXT_PUBLIC_BASE_URL                 redirect base (getBaseUrl())
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { tier?: unknown };
  if (!isClaimProofTier(body.tier)) {
    return NextResponse.json(
      { error: "Unknown tier. Expected core, pro, or fleet." },
      { status: 400 },
    );
  }
  const tier = body.tier;

  const priceId = getClaimProofPriceId(tier);
  if (!priceId) {
    return NextResponse.json(
      {
        error: `Checkout isn't configured yet for the ${tier} tier. Set the Stripe price ID in .env.local.`,
      },
      { status: 503 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "Payments aren't configured. Set STRIPE_SECRET_KEY." },
      { status: 503 },
    );
  }

  const baseUrl = getBaseUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // Anonymous buyer — Stripe collects the email on the hosted page.
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      success_url: `${baseUrl}${CLAIM_PROOF.path}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${CLAIM_PROOF.path}`,
      metadata: {
        // Read by the shared webhook to route fulfillment. Do NOT rename
        // without updating src/app/api/webhooks/stripe/route.ts.
        product: CLAIM_PROOF_PRODUCT_TAG,
        tier,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: session.id,
        event: "claimproof_checkout_started",
        properties: { tier },
      });
      await posthog.flush();
    } catch (phErr) {
      console.error("[claimproof/checkout] PostHog capture failed:", phErr);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[claimproof/checkout] session creation failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
