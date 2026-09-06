import { NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import { CRR } from "@/lib/car-rental-riches";
import {
  OPERATOR_BUNDLE_PRODUCT_TAG,
  getOperatorBundlePriceId,
} from "@/lib/operator-bundle";

export const runtime = "nodejs";

/**
 * POST /api/operator-bundle/checkout
 *
 * Anonymous hosted Stripe Checkout for the Sharing Economy Operator Bundle
 * (RRR + CRR self-paced, $497). Same contract as the CRR founding presale
 * route; the webhook branch (fulfillOperatorBundle) provisions the account
 * and grants both enrollments.
 *
 * Env: OPERATOR_BUNDLE_STRIPE_PRICE_ID (price_...). Unset means 503 and the
 * bundle band is not rendered anywhere.
 */
export async function POST() {
  const priceId = getOperatorBundlePriceId();
  if (!priceId) {
    return NextResponse.json(
      { error: "The bundle isn't open yet." },
      { status: 503 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error("[operator-bundle/checkout] Stripe not configured:", err);
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
      customer_creation: "always",
      allow_promotion_codes: true,
      metadata: { product: OPERATOR_BUNDLE_PRODUCT_TAG },
      payment_intent_data: {
        metadata: { product: OPERATOR_BUNDLE_PRODUCT_TAG },
      },
      success_url: `${base}${CRR.path}?purchase=bundle-success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${CRR.path}?purchase=cancelled`,
    });
    if (!session.url) throw new Error("Stripe returned a session with no URL");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[operator-bundle/checkout] session create failed:", err);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again in a moment." },
      { status: 500 },
    );
  }
}
