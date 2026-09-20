import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import { getEngagement, logEvent } from "@/lib/partnership/engagements";
import {
  PARTNERSHIP_PRODUCT_TAG,
  PARTNERSHIP_THANKS_PATH,
  PAYABLE_ITEMS,
  lineItemFor,
  isPayableItem,
} from "@/lib/partnership/payments";

// Stripe SDK needs Node APIs, not the Edge runtime.
export const runtime = "nodejs";

/**
 * POST /api/admin/partnership/[id]/checkout  { item: "s1" }
 *
 * Admin-only. Creates a hosted Stripe Checkout Session for one engagement and
 * returns its URL for the admin to paste into the proposal email. There is no
 * public route to this on purpose: the engagement is sold on a call and the
 * agreement is signed before anyone is asked to pay.
 *
 * The session carries metadata.product = PARTNERSHIP_PRODUCT_TAG plus the
 * engagement id, so the shared webhook records the payment on this client.
 *
 * Env:
 *   STRIPE_SECRET_KEY                 BNHG secret key (LIVE in production)
 *   PARTNERSHIP_S1_STRIPE_PRICE_ID    optional pre-made price; without it the
 *                                     approved amount is sent inline
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { item?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!isPayableItem(body.item)) {
    return NextResponse.json({ error: "Unknown item" }, { status: 400 });
  }
  const item = body.item;

  const engagement = await getEngagement(id);
  if (!engagement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error("[partnership/checkout] Stripe not configured:", err);
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }

  const metadata = {
    product: PARTNERSHIP_PRODUCT_TAG,
    engagement_id: String(id),
    item,
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItemFor(item)],
      customer_creation: "always",
      ...(engagement.email ? { customer_email: engagement.email } : {}),
      metadata,
      // Mirrored onto the PaymentIntent so a refund or dispute in the Stripe
      // dashboard shows which client this was without opening the session.
      payment_intent_data: { metadata },
      success_url: `${getBaseUrl()}${PARTNERSHIP_THANKS_PATH}`,
      cancel_url: `${getBaseUrl()}${PARTNERSHIP_THANKS_PATH}?cancelled=1`,
    });
    if (!session.url) throw new Error("Stripe returned a session with no URL");

    const actor = await getSession();
    await logEvent(id, "money", `Payment link created · Section ${PAYABLE_ITEMS[item].section}`, actor?.name || actor?.email || null);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[partnership/checkout] session create failed:", err);
    return NextResponse.json({ error: "Stripe couldn't create the link. Try again in a moment." }, { status: 500 });
  }
}
