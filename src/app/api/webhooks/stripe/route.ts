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
          await fulfillCheckout(session);
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markPurchaseFailed(session.id);
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
