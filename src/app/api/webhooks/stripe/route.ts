import { NextResponse } from "next/server";
import { Resend } from "resend";
import type Stripe from "stripe";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import {
  getPurchaseBySessionId,
  markPurchaseSucceeded,
  markPurchaseFailed,
  getTierById,
} from "@/lib/course-catalog";
import { grantEnrollment } from "@/lib/lms";
import { sql } from "@/lib/db";
import {
  HOSTS_EDGE_PRODUCT_TAG,
  getHostsEdgeDownloadUrl,
  getHostsEdgeFromAddress,
  hostsEdgeDeliveryEmail,
  recordHostsEdgeBuyer,
} from "@/lib/hosts-edge";
import {
  CLAIM_PROOF_PRODUCT_TAG,
  claimProofDeliveryEmail,
  claimProofDownloadLink,
  claimProofPortalLink,
  getClaimProofFromAddress,
  isClaimProofTier,
  recordClaimProofContact,
} from "@/lib/claim-proof";
import { makeClaimProofToken } from "@/lib/claim-proof-download";
import { provisionWorkspaceForPurchase } from "@/lib/claim-proof-workspace";
import { getPostHogClient } from "@/lib/posthog-server";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

// Stripe sends raw body for signature verification. Next.js App Router gives
// us request.text() which preserves the raw bytes.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks/stripe] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      rawBody,
      signature,
      secret,
    );
  } catch (err) {
    console.error("[webhooks/stripe] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          // Route by product. Digital products (e.g. The Host's Edge) are
          // anonymous, no-enrollment buys — fulfill them their own way and stop
          // BEFORE the course-enrollment path. Everything untagged is a course.
          if (session.metadata?.product === HOSTS_EDGE_PRODUCT_TAG) {
            await fulfillHostsEdge(session);
          } else if (session.metadata?.product === CLAIM_PROOF_PRODUCT_TAG) {
            await fulfillClaimProof(session);
          } else {
            await fulfillCheckout(session);
          }
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markPurchaseFailed(session.id);
        break;
      }
      case "charge.refunded": {
        // Marks mirrored Claim Proof purchases refunded for Unified Ops
        // reporting. Charges from other products simply won't match a row.
        // NOTE: charge.refunded must be enabled on the Stripe webhook
        // endpoint config for this to fire.
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null;
        if (pi) {
          try {
            await sql`
              UPDATE claimproof_purchases
              SET status = 'refunded', refunded_at = NOW()
              WHERE stripe_payment_intent = ${pi} AND status <> 'refunded'
            `;
          } catch (err) {
            console.error(
              `[webhooks/stripe] refund mark failed for ${pi}:`,
              err,
            );
          }
        }
        break;
      }
      // Other event types are intentionally ignored — Stripe is chatty.
    }
  } catch (err) {
    console.error("[webhooks/stripe] handler error:", err);
    // Return 200 anyway? No — return 500 so Stripe retries on transient
    // errors. Idempotency is handled inside fulfillCheckout.
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Fulfill a Host's Edge (digital product) purchase: email the buyer their
 * download link via Resend and log the buyer. NO course enrollment, NO account.
 * Both side-effects are best-effort and isolated — a failure logs but does not
 * throw, so one broken side-effect can't 500 the webhook and trigger endless
 * Stripe retries. (Stripe's own receipt is the payment record of truth.)
 */
async function fulfillHostsEdge(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const email =
    session.customer_details?.email || session.customer_email || null;
  const name = session.customer_details?.name || undefined;

  if (!email) {
    console.error(
      `[webhooks/stripe] Host's Edge session ${session.id} has no email — cannot deliver`,
    );
    return;
  }

  // Deliver the download by email (best-effort).
  try {
    const { subject, html } = hostsEdgeDeliveryEmail({
      name,
      downloadUrl: getHostsEdgeDownloadUrl(),
    });
    const result = await getResend().emails.send({
      from: getHostsEdgeFromAddress(),
      to: email,
      subject,
      html,
    });
    if (result.error) {
      console.error(
        `[webhooks/stripe] Host's Edge delivery email to ${email} failed:`,
        `${result.error.name}: ${result.error.message}`,
      );
    } else {
      console.log(
        `[webhooks/stripe] Host's Edge delivered to ${email} (session ${session.id})`,
      );
    }
  } catch (err) {
    console.error(
      `[webhooks/stripe] Host's Edge delivery email threw for ${email}:`,
      err,
    );
  }

  // Log the buyer ("own the list", best-effort local mirror).
  try {
    await recordHostsEdgeBuyer({
      email,
      name,
      sessionId: session.id,
      purchasedAt: new Date(
        (session.created ?? Math.floor(Date.now() / 1000)) * 1000,
      ).toISOString(),
    });
  } catch (err) {
    console.error(
      `[webhooks/stripe] Host's Edge buyer log threw for ${email}:`,
      err,
    );
  }

  try {
    const posthog = getPostHogClient();
    const amountTotal = session.amount_total ?? 0;
    posthog.capture({
      distinctId: email,
      event: "hosts_edge_purchased",
      properties: {
        stripe_session_id: session.id,
        amount_cents: amountTotal,
        currency: session.currency ?? "usd",
      },
    });
    await posthog.flush();
  } catch (err) {
    console.error(`[webhooks/stripe] PostHog capture for Host's Edge threw:`, err);
  }
}

/**
 * Fulfill a Claim Proof purchase (any tier): email the tier's download link
 * via Resend and record the buyer on the owned list (newsletter_subscribers,
 * durable in Neon — unlike Host's Edge's local jsonl mirror). Side-effects are
 * best-effort and isolated, same contract as fulfillHostsEdge.
 */
async function fulfillClaimProof(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const email =
    session.customer_details?.email || session.customer_email || null;
  const name = session.customer_details?.name || undefined;
  const tierRaw = session.metadata?.tier;
  const tier = isClaimProofTier(tierRaw) ? tierRaw : "core";

  if (!email) {
    console.error(
      `[webhooks/stripe] Claim Proof session ${session.id} has no email — cannot deliver`,
    );
    return;
  }
  if (!isClaimProofTier(tierRaw)) {
    // Deliver Core rather than nothing, but make the misconfig loud.
    console.error(
      `[webhooks/stripe] Claim Proof session ${session.id} has invalid tier "${tierRaw}" — defaulting to core`,
    );
  }

  try {
    // Token-gated link to our download endpoint (mints short-lived signed URLs
    // from the private blob store). The email link itself never expires.
    // Third arg embeds the session id so portal logins can be attributed to
    // this purchase (claimproof_purchases stamping). Older links still work.
    const token = makeClaimProofToken(tier, undefined, session.id);
    const downloadUrl = claimProofDownloadLink(getBaseUrl(), tier, token);
    const { subject, html } = claimProofDeliveryEmail({
      name,
      tier,
      downloadUrl,
      // Same token doubles as the Claim Command Center magic link.
      portalUrl: claimProofPortalLink(getBaseUrl(), token),
      videoUrl:
        tier === "fleet"
          ? process.env.CLAIM_PROOF_FLEET_VIDEO_URL || undefined
          : undefined,
    });
    const result = await getResend().emails.send({
      from: getClaimProofFromAddress(),
      to: email,
      subject,
      html,
    });
    if (result.error) {
      console.error(
        `[webhooks/stripe] Claim Proof delivery email to ${email} failed:`,
        `${result.error.name}: ${result.error.message}`,
      );
    } else {
      console.log(
        `[webhooks/stripe] Claim Proof (${tier}) delivered to ${email} (session ${session.id})`,
      );
    }
  } catch (err) {
    console.error(
      `[webhooks/stripe] Claim Proof delivery email threw for ${email}:`,
      err,
    );
  }

  try {
    await recordClaimProofContact(email, `claimproof-${tier}`);
  } catch (err) {
    console.error(
      `[webhooks/stripe] Claim Proof contact log threw for ${email}:`,
      err,
    );
  }

  // Mirror the purchase into the BNHG DB for Unified Ops reporting (revenue,
  // customers, ROAS). Stripe stays the ledger of record. Own try/catch — a
  // mirror failure must never block fulfillment; the backfill script
  // (scripts/backfill-claimproof-purchases.ts) heals any gaps.
  try {
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    await sql`
      INSERT INTO claimproof_purchases
        (stripe_session_id, stripe_payment_intent, email, tier, amount_cents,
         currency, amount_discount_cents, purchased_at)
      VALUES
        (${session.id}, ${paymentIntent}, ${email.toLowerCase().trim()}, ${tier},
         ${session.amount_total ?? 0}, ${session.currency ?? "usd"},
         ${session.total_details?.amount_discount ?? 0},
         ${new Date(session.created * 1000).toISOString()})
      ON CONFLICT (stripe_session_id) DO NOTHING
    `;
  } catch (err) {
    console.error(
      `[webhooks/stripe] Claim Proof purchase mirror failed for ${session.id}:`,
      err,
    );
  }

  // Phase 2: provision a Command Center workspace for this purchase so the
  // buyer's tracked claims sync across devices under their account. Own
  // try/catch — a DB hiccup here must never block the delivery email above.
  try {
    await provisionWorkspaceForPurchase({
      email,
      tier,
      stripeSessionId: session.id,
    });
  } catch (err) {
    console.error(
      `[webhooks/stripe] Claim Proof workspace provisioning threw for ${email}:`,
      err,
    );
  }

  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: "claimproof_purchased",
      properties: {
        tier,
        stripe_session_id: session.id,
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
      },
    });
    await posthog.flush();
  } catch (err) {
    console.error(`[webhooks/stripe] PostHog capture for Claim Proof threw:`, err);
  }
}

async function fulfillCheckout(session: Stripe.Checkout.Session): Promise<void> {
  // Idempotency: skip if we've already marked this purchase succeeded. The
  // /account/courses/[slug]?session_id= success page also reconciles, so this
  // webhook may arrive after the user already triggered the same fulfillment.
  const purchase = await getPurchaseBySessionId(session.id);
  if (!purchase) {
    console.warn(
      `[webhooks/stripe] no purchase row for session ${session.id} — skipping`,
    );
    return;
  }
  if (purchase.status === "succeeded") return;

  const tier = await getTierById(purchase.courseTierId);
  if (!tier) {
    console.error(
      `[webhooks/stripe] tier ${purchase.courseTierId} missing for purchase ${purchase.id}`,
    );
    return;
  }

  await grantEnrollment({
    userId: purchase.userId,
    courseId: purchase.courseId,
    tier: tier.tier,
    grantedByUserId: null,
    notes: `Stripe checkout session ${session.id}`,
  });

  await markPurchaseSucceeded(
    session.id,
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null,
  );

  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: String(purchase.userId),
      event: "course_enrollment_granted",
      properties: {
        course_id: purchase.courseId,
        tier_id: purchase.courseTierId,
        tier_name: tier.name,
        tier_slug: tier.tier,
        amount_cents: purchase.amountCents,
        currency: purchase.currency,
        stripe_session_id: session.id,
      },
    });
    await posthog.flush();
  } catch (err) {
    console.error("[webhooks/stripe] PostHog capture for enrollment threw:", err);
  }

  // Send a receipt-style confirmation. We keep this best-effort: a failed
  // email must not roll back the enrollment that already succeeded.
  try {
    const userRows = (await sql`
      SELECT email, name FROM users WHERE id = ${purchase.userId} LIMIT 1
    `) as Array<{ email: string; name: string }>;
    const user = userRows[0];
    const courseRows = (await sql`
      SELECT slug, title FROM courses WHERE id = ${purchase.courseId} LIMIT 1
    `) as Array<{ slug: string; title: string }>;
    const course = courseRows[0];
    if (user && course) {
      const baseUrl = getBaseUrl();
      const courseUrl = `${baseUrl}/account/courses/${course.slug}`;
      const amount = (purchase.amountCents / 100).toFixed(2);
      await getResend().emails.send({
        from:
          process.env.BNHG_AUTH_FROM ||
          process.env.AUDIT_FROM_EMAIL ||
          "BNHG <onboarding@resend.dev>",
        to: user.email,
        subject: `You're enrolled in ${course.title}`,
        html: confirmationEmail({
          name: user.name,
          courseTitle: course.title,
          tierName: tier.name,
          amount,
          currency: purchase.currency.toUpperCase(),
          courseUrl,
        }),
      });
    }
  } catch (err) {
    console.error("[webhooks/stripe] confirmation email failed:", err);
  }
}

function confirmationEmail(p: {
  name: string;
  courseTitle: string;
  tierName: string;
  amount: string;
  currency: string;
  courseUrl: string;
}): string {
  const greeting = p.name ? `Hi ${p.name.split(" ")[0]},` : "Hi,";
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#2C3E50;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-size:14px;letter-spacing:0.2em;text-transform:uppercase;color:#1A4D4F;margin:0 0 16px;">Be Nice Hospitality Group</p>
      <h1 style="font-size:24px;color:#1A4D4F;margin:0 0 16px;">You're enrolled in ${p.courseTitle}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">${greeting}</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">
        Your <strong>${p.tierName}</strong> enrollment is active. You can start
        the first lesson right now from your dashboard.
      </p>
      <p style="margin:28px 0;">
        <a href="${p.courseUrl}" style="background:#B08D57;color:#1a1a1a;padding:14px 24px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Open the course
        </a>
      </p>
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0;" />
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0 0 8px;">
        <strong>Receipt:</strong> ${p.currency} $${p.amount} · ${p.tierName}
      </p>
      <p style="font-size:12px;line-height:1.55;color:#4B5563;margin:0;">
        Thirty-day money-back guarantee. Reply to this email if anything looks
        off and we'll sort it.
      </p>
    </div>
  `;
}
