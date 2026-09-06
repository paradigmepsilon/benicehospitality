/**
 * Sharing Economy Operator Bundle: Room Rental Riches + Car Rental Riches,
 * both self-paced, one price. Approved by Alex (and Della for the RRR half)
 * on 2026-09-05 at $497.
 *
 * Rails mirror the CRR founding presale (src/lib/car-rental-riches.ts):
 * anonymous Stripe Checkout tagged with OPERATOR_BUNDLE_PRODUCT_TAG, then the
 * shared webhook provisions the account and grants BOTH self-paced
 * enrollments. Display and checkout are gated on the Stripe Price env var, so
 * nothing is visible until both courses are actually sellable.
 */

import { RRR_PRICES } from "@/lib/room-rental-riches";
import { CRR } from "@/lib/car-rental-riches";

export const OPERATOR_BUNDLE_PRODUCT_TAG = "sharing-economy-operator-bundle";

export const OPERATOR_BUNDLE = {
  productTag: OPERATOR_BUNDLE_PRODUCT_TAG,
  name: "Sharing Economy Operator Bundle",
  priceUsd: 497,
  /** What the two self-paced tiers cost bought separately, for the strike. */
  separateUsd: RRR_PRICES.selfPacedUsd + CRR.retailPriceUsd,
  courseSlugs: ["room-rental-riches", "car-rental-riches"] as const,
} as const;

/** Set in Vercel as OPERATOR_BUNDLE_STRIPE_PRICE_ID (price_...). */
export function getOperatorBundlePriceId(): string | null {
  return process.env.OPERATOR_BUNDLE_STRIPE_PRICE_ID || null;
}

export function isOperatorBundleOpen(): boolean {
  return !!getOperatorBundlePriceId();
}

export function getOperatorBundleFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Be Nice Hospitality Group <hello@benicehospitality.com>"
  );
}

/** Welcome email after a bundle purchase. Signed by both founders. */
export function operatorBundleWelcomeEmail(args: {
  name?: string;
  rrrUrl: string;
  crrUrl: string;
  setPasswordUrl?: string;
}): { subject: string; html: string } {
  const first = args.name?.trim().split(/\s+/)[0];
  const hi = first ? `Hi ${first},` : "Hi,";
  const subject = "Both courses are on your dashboard";

  const accountBlock = args.setPasswordUrl
    ? `
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B08D57;margin:0 0 10px;">Your account is ready</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">
        We set up your account on this email address. Pick a password and both
        courses are waiting on your dashboard.
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
        and both courses are on your dashboard.
      </p>`;

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#2C3E50;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#B08D57;margin:0 0 16px;">Be Nice Hospitality Group</p>
      <h1 style="font-size:23px;color:#1A4D4F;margin:0 0 18px;line-height:1.3;">Rooms and cars. Both courses, one login.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">${hi}</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">
        Thank you for buying the ${OPERATOR_BUNDLE.name}. Room Rental Riches
        (Della) and Car Rental Riches (Alex) are both on your dashboard now,
        self-paced, lifetime access, every future module included.
      </p>
      <p style="margin:28px 0 12px;">
        <a href="${args.rrrUrl}" style="background:#B08D57;color:#1a1a1a;padding:14px 24px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Open Room Rental Riches
        </a>
      </p>
      <p style="margin:0 0 28px;">
        <a href="${args.crrUrl}" style="background:#1A4D4F;color:#ffffff;padding:14px 24px;text-decoration:none;font-weight:600;border-radius:8px;display:inline-block;">
          Open Car Rental Riches
        </a>
      </p>
      ${accountBlock}
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0;" />
      <p style="font-size:13px;line-height:1.55;color:#4B5563;margin:0 0 10px;">
        Thirty-day money-back guarantee, no conditions. Reply to this email and
        it reaches both of us.
      </p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;">Della and Alex</p>
      <p style="font-size:12px;line-height:1.5;color:#807868;margin:0;">
        Educational content only, not financial, legal, tax, or insurance
        advice. Earnings figures discussed in the courses are illustrative, not
        a promise of what you will earn. Car Rental Riches is an independent
        educational product, not affiliated with Turo Inc.
      </p>
    </div>
  `;
  return { subject, html };
}
