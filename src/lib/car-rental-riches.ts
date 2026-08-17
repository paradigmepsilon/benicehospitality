/**
 * Car Rental Riches — BNHG's Turo/fleet course, taught by Alex Henry (Be Nice
 * Autos). The fleet-lane sibling of Room Rental Riches.
 *
 * FOUNDING PRESALE rails (this file + the checkout route + webhook branch)
 * ride the anonymous digital-product pattern (see src/lib/blueprint.ts), then
 * grant a real course enrollment so buyers land in the LMS as lessons drip.
 *
 * DISPLAY PRICES here must be hand-synced with course_tiers.price_cents (the
 * commerce source of truth) — same contract as src/lib/room-rental-riches.ts.
 *
 * Strategy + curriculum source: /Users/alexhenry/Projects/Car Rental Riches/
 * (pricing_and_offer.md, course_master_plan.md).
 */

export const CRR_COURSE_SLUG = "car-rental-riches";

/**
 * Stripe Checkout metadata tag for a Founding Member presale purchase. The
 * shared webhook (src/app/api/webhooks/stripe) keys off this to provision an
 * account + grant the self-paced enrollment. Keep in sync with the checkout
 * route and webhook branch.
 */
export const CRR_FOUNDING_PRODUCT_TAG = "car-rental-riches-founding";

export const CRR = {
  slug: CRR_COURSE_SLUG,
  name: "Car Rental Riches",
  instructor: "Alex Henry",
  path: "/courses/car-rental-riches",
  /** Founding presale price. PENDING ALEX'S APPROVAL — also set in the
   *  course_tiers seed (scripts/migrate.ts) and the Stripe Price. */
  foundingPriceUsd: 197,
  /** Retail self-paced price at doors-open. */
  retailPriceUsd: 297,
  /**
   * What founding buyers are promised. Update the date once Alex sets it —
   * it appears in the welcome email and on the sales page. Keeping it a
   * placeholder string (not a Date) so an unset value reads honestly in copy.
   */
  doorsOpenPromise: "Modules 1-3 go live within 30 days of the founding launch",
} as const;

/**
 * The BNHG Stripe Price for the founding presale ($197 one-time). Set in
 * .env.local AND Vercel as CAR_RENTAL_RICHES_PRESALE_PRICE_ID (price_...).
 * Returns null when unset so the checkout route 503s cleanly instead of
 * throwing at import time.
 */
export function getCrrPresalePriceId(): string | null {
  return process.env.CAR_RENTAL_RICHES_PRESALE_PRICE_ID || null;
}

/** From address for the founding welcome email. Alex signs this one. */
export function getCrrFromAddress(): string {
  return (
    process.env.CRR_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "Alex Henry <hello@benicehospitality.com>"
  );
}

/**
 * Founding Member welcome email. Alex's voice: operator, direct, no hype.
 * Sent by the webhook after account provisioning + enrollment grant.
 */
export function crrFoundingWelcomeEmail(args: {
  name?: string;
  courseUrl: string;
  setPasswordUrl?: string;
}): { subject: string; html: string } {
  const first = args.name?.trim().split(/\s+/)[0];
  const hi = first ? `Hi ${first},` : "Hi,";
  const subject = "You're a Car Rental Riches Founding Member";

  const accountBlock = args.setPasswordUrl
    ? `
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B08D57;margin:0 0 10px;">Your account is ready</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">
        I set up your account on this email address. Pick a password and your
        course dashboard is waiting.
      </p>
      <p style="margin:20px 0;">
        <a href="${args.setPasswordUrl}" style="background:#1A4D4F;color:#ffffff;padding:13px 22px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Set your password
        </a>
      </p>
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0;">
        That link is good for 30 minutes. If it lapses, use &ldquo;Forgot
        password&rdquo; on the login page with this same address.
      </p>`
    : `
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:15px;line-height:1.55;margin:0;">
        You already have an account on this email, so nothing to set up. Log in
        and the course is on your dashboard.
      </p>`;

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#2C3E50;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B08D57;margin:0 0 16px;">Be Nice Hospitality Group</p>
      <h1 style="font-size:23px;color:#1A4D4F;margin:0 0 18px;line-height:1.3;">You're in. Founding Member, locked.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">${hi}</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">
        Thanks for backing this early. Here's the deal, plainly: ${CRR.doorsOpenPromise},
        and the rest of the course drips in weekly as each module clears my
        quality bar. You get lifetime access, every future update included, and
        I'll send you a short build update each week so you can watch it come
        together.
      </p>
      <p style="margin:28px 0;">
        <a href="${args.courseUrl}" style="background:#B08D57;color:#1a1a1a;padding:14px 24px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Open your course dashboard
        </a>
      </p>
      ${accountBlock}
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0 0 10px;">
        Thirty-day money-back guarantee, no conditions. Questions? Reply to this
        email and it comes to me.
      </p>
      <p style="font-size:12px;line-height:1.5;color:#807868;margin:0;">
        Educational content only, not financial, legal, tax, or insurance
        advice. Earnings figures discussed in the course are illustrative, not a
        promise of what you will earn. Car Rental Riches is an independent
        educational product, not affiliated with Turo Inc.
      </p>
    </div>
  `;

  return { subject, html };
}
