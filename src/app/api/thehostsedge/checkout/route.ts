import { NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import {
  HOSTS_EDGE,
  HOSTS_EDGE_PRODUCT_TAG,
  getHostsEdgePriceId,
} from "@/lib/hosts-edge";

// Stripe SDK needs Node APIs, not the Edge runtime.
export const runtime = "nodejs";

/**
 * POST /api/thehostsedge/checkout
 *
 * Creates an ANONYMOUS hosted Stripe Checkout Session for The Host's Edge
 * Guest Message System ($27) and returns its URL. No login required — this is a
 * frictionless digital-product buy, deliberately unlike the course checkout
 * (src/app/api/checkout/course) which requires a member session.
 *
 * The session is tagged with metadata.product = HOSTS_EDGE_PRODUCT_TAG so the
 * shared webhook (src/app/api/webhooks/stripe) fulfills it the digital-product
 * way (email the download) instead of granting a course enrollment.
 *
 * Env:
 *   STRIPE_SECRET_KEY          BNHG secret key (shared, from src/lib/stripe.ts)
 *   HOSTS_EDGE_STRIPE_PRICE_ID BNHG price for this product (price_...)
 *   NEXT_PUBLIC_BASE_URL       base URL for redirects (shared, getBaseUrl())
 */
export async function POST() {
  const priceId = getHostsEdgePriceId();
  if (!priceId) {
    // Fail cleanly (never echo secrets). Missing price = not configured yet.
    return NextResponse.json(
      {
        error:
          "Checkout isn't configured yet. Set HOSTS_EDGE_STRIPE_PRICE_ID in .env.local (BNHG account).",
      },
      { status: 503 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    // getStripe throws only when STRIPE_SECRET_KEY is unset.
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
      // Anonymous buyer — Stripe collects the email on the hosted page, which
      // the webhook reads to deliver the download.
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      success_url: `${baseUrl}${HOSTS_EDGE.path}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${HOSTS_EDGE.path}`,
      metadata: {
        // Read by the shared webhook to route fulfillment. Do NOT rename
        // without updating src/app/api/webhooks/stripe/route.ts.
        product: HOSTS_EDGE_PRODUCT_TAG,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Log server-side; return a generic message so Stripe internals never leak.
    console.error("[thehostsedge/checkout] session creation failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
