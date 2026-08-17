import { NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import {
  CRR,
  CRR_FOUNDING_PRODUCT_TAG,
  getCrrPresalePriceId,
} from "@/lib/car-rental-riches";

// Stripe SDK needs Node APIs, not the Edge runtime.
export const runtime = "nodejs";

/**
 * POST /api/car-rental-riches/checkout
 *
 * ANONYMOUS hosted Stripe Checkout for the Car Rental Riches Founding Member
 * presale ($197). Same frictionless shape as the Blueprint checkout —
 * deliberately unlike /api/checkout/course, which requires a member session.
 * The webhook branch (fulfillCrrPresale) provisions the account from the
 * Stripe email and grants the self-paced enrollment, so the buyer ends up a
 * real LMS student without a login wall in front of the money.
 *
 * Env:
 *   STRIPE_SECRET_KEY                      BNHG secret key (src/lib/stripe.ts)
 *   CAR_RENTAL_RICHES_PRESALE_PRICE_ID     founding Price (price_...)
 *   NEXT_PUBLIC_BASE_URL                   redirect base (getBaseUrl())
 */
export async function POST() {
  const priceId = getCrrPresalePriceId();
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Founding checkout isn't open yet. Set CAR_RENTAL_RICHES_PRESALE_PRICE_ID in .env.local (BNHG account).",
      },
      { status: 503 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error("[car-rental-riches/checkout] Stripe not configured:", err);
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
      // the session the webhook reads — the email is the account identity.
      customer_creation: "always",
      allow_promotion_codes: true,
      metadata: { product: CRR_FOUNDING_PRODUCT_TAG },
      // Mirrored onto the PaymentIntent so dashboard refund/dispute views show
      // what was bought without opening the session.
      payment_intent_data: {
        metadata: { product: CRR_FOUNDING_PRODUCT_TAG },
      },
      success_url: `${base}${CRR.path}?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${CRR.path}?purchase=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe returned a session with no URL");
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[car-rental-riches/checkout] session create failed:", err);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again in a moment." },
      { status: 500 },
    );
  }
}
