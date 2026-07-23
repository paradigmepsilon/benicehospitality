import { NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import {
  BLUEPRINT,
  BLUEPRINT_PRODUCT_TAG,
  getBlueprintPriceId,
} from "@/lib/blueprint";

// Stripe SDK needs Node APIs, not the Edge runtime.
export const runtime = "nodejs";

/**
 * POST /api/blueprint/checkout
 *
 * Creates an ANONYMOUS hosted Stripe Checkout Session for Room Rental Riches:
 * The Blueprint ($32) and returns its URL. No login required — same frictionless
 * shape as The Host's Edge, deliberately unlike the course checkout
 * (src/app/api/checkout/course) which requires a member session.
 *
 * The session is tagged metadata.product = BLUEPRINT_PRODUCT_TAG so the shared
 * webhook (src/app/api/webhooks/stripe) fulfills it the book way: gated download
 * links by email, plus a Nice Host Network account provisioned on the buyer's
 * address.
 *
 * We must end up with an email — it is both the delivery address and the account
 * identity. Stripe Checkout always collects one for card payments, and
 * customer_creation ensures it lands on the session we read in the webhook.
 *
 * Env:
 *   STRIPE_SECRET_KEY           BNHG secret key (shared, from src/lib/stripe.ts)
 *   BLUEPRINT_STRIPE_PRICE_ID   BNHG price for the book (price_...)
 *   NEXT_PUBLIC_BASE_URL        base URL for redirects (shared, getBaseUrl())
 */
export async function POST() {
  const priceId = getBlueprintPriceId();
  if (!priceId) {
    // Fail cleanly (never echo secrets). Missing price = not configured yet.
    return NextResponse.json(
      {
        error:
          "Checkout isn't configured yet. Set BLUEPRINT_STRIPE_PRICE_ID in .env.local (BNHG account).",
      },
      { status: 503 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error("[blueprint/checkout] Stripe not configured:", err);
    return NextResponse.json(
      { error: "Payments aren't configured yet." },
      { status: 503 },
    );
  }

  const base = getBaseUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // Creates a Customer so customer_details.email is reliably populated on
      // the session the webhook reads.
      customer_creation: "always",
      allow_promotion_codes: true,
      metadata: { product: BLUEPRINT_PRODUCT_TAG },
      // Mirrored onto the PaymentIntent so a Stripe-dashboard refund/dispute
      // view shows what was bought without opening the session.
      payment_intent_data: {
        metadata: { product: BLUEPRINT_PRODUCT_TAG },
      },
      success_url: `${base}${BLUEPRINT.path}?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${BLUEPRINT.path}?purchase=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe returned a session with no URL");
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[blueprint/checkout] session create failed:", err);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again in a moment." },
      { status: 500 },
    );
  }
}
