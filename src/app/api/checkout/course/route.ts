import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/community-auth";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import {
  getTierById,
  getStripeCustomerIdForUser,
  setStripeCustomerIdForUser,
  recordPendingPurchase,
} from "@/lib/course-catalog";
import { getActiveEnrollment, getCourseBySlug } from "@/lib/lms";
import { sql } from "@/lib/db";
import { getPostHogClient } from "@/lib/posthog-server";
import { personId } from "@/lib/posthog-identity";

const bodySchema = z.object({
  tierId: z.number().int().positive(),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  // Admins already have universal course access. Surface the rejection
  // explicitly rather than letting them double-buy.
  if (session.user.role === "admin") {
    return NextResponse.json(
      { error: "Admin accounts have free access to every course." },
      { status: 400 },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const body = await request.json();
    parsed = bodySchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const tier = await getTierById(parsed.tierId);
  if (!tier || !tier.isPublished) {
    return NextResponse.json({ error: "Tier not available." }, { status: 404 });
  }
  if (!tier.stripePriceId) {
    return NextResponse.json(
      {
        error:
          "This tier isn't connected to Stripe yet. Run scripts/sync-stripe-prices.ts to publish it.",
      },
      { status: 503 },
    );
  }

  // Look up the course slug for the success/cancel URLs.
  const courseRows = (await sql`
    SELECT slug FROM courses WHERE id = ${tier.courseId} LIMIT 1
  `) as Array<{ slug: string }>;
  if (courseRows.length === 0) {
    return NextResponse.json({ error: "Course missing." }, { status: 404 });
  }
  const courseSlug = courseRows[0].slug;

  // Reject double-buys. If the member already has an active enrollment, send
  // them to the course page instead of taking another payment.
  const existing = await getActiveEnrollment(session.user.id, tier.courseId);
  if (existing) {
    return NextResponse.json(
      { error: "You're already enrolled in this course." },
      { status: 409 },
    );
  }

  const stripe = getStripe();
  const baseUrl = getBaseUrl();

  // Reuse a stored Stripe customer if we have one, otherwise create + cache.
  let customerId = await getStripeCustomerIdForUser(session.user.id);
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name,
      metadata: { bnhg_user_id: String(session.user.id) },
    });
    customerId = customer.id;
    await setStripeCustomerIdForUser(session.user.id, customerId);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: tier.stripePriceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/account/courses/${courseSlug}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/account/courses/${courseSlug}`,
    metadata: {
      bnhg_user_id: String(session.user.id),
      bnhg_course_id: String(tier.courseId),
      bnhg_tier_id: String(tier.id),
    },
  });

  await recordPendingPurchase({
    userId: session.user.id,
    courseId: tier.courseId,
    courseTierId: tier.id,
    stripeSessionId: checkoutSession.id,
    amountCents: tier.priceCents,
    currency: tier.currency,
  });

  const posthog = getPostHogClient();
  posthog.capture({
    // Must match the distinctId used by course_enrollment_granted in the Stripe
    // webhook, or the checkout funnel silently compares two different
    // populations and every purchase looks like it came from nowhere.
    distinctId: personId(session.user.email),
    event: "course_checkout_started",
    properties: {
      course_id: tier.courseId,
      course_slug: courseSlug,
      tier_id: tier.id,
      tier_name: tier.name,
      amount_cents: tier.priceCents,
      currency: tier.currency,
    },
  });
  await posthog.flush();

  // Sanity guard — Stripe always returns a URL for non-embedded sessions, but
  // narrow the type for TS.
  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}
