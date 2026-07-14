import type { Metadata } from "next";
import Link from "next/link";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import {
  CLAIM_PROOF,
  CLAIM_PROOF_PRODUCT_TAG,
  CLAIM_PROOF_TIERS,
  isClaimProofTier,
  claimProofDownloadLink,
  claimProofPortalLink,
} from "@/lib/claim-proof";
import { makeClaimProofToken } from "@/lib/claim-proof-download";
import ResendAccess from "./ResendAccess";

/**
 * Post-purchase confirmation + access hub for Claim Proof. Delivery also happens
 * by email (the shared Stripe webhook), but this page no longer dead-ends on
 * "check your email." It resolves the paid session from `session_id`, mints the
 * Command Center magic link, and hands the buyer a working way in right here —
 * so a missing or delayed email never strands a paying customer. Falls back to a
 * generic confirmation + resend form if the session can't be resolved.
 *
 * `robots: noindex` — transactional page.
 */

export const metadata: Metadata = {
  title: "You're covered · Claim Proof",
  robots: { index: false, follow: false },
};

type Access = {
  email?: string;
  tierLabel: string;
  portalMagicUrl: string; // one-click into the Command Center (no verification)
  accountUrl: string; // durable: create/sign in to a synced account
  downloadUrl: string;
};

async function resolveAccess(sessionId: string | undefined): Promise<Access | null> {
  if (!sessionId) return null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const isClaimProof = session.metadata?.product === CLAIM_PROOF_PRODUCT_TAG;
    if (!paid || !isClaimProof) return null;

    const tierRaw = session.metadata?.tier;
    const tier = isClaimProofTier(tierRaw) ? tierRaw : "core";
    const email =
      session.customer_details?.email || session.customer_email || undefined;

    const baseUrl = getBaseUrl();
    // Mirror the webhook: token doubles as the download token and the portal
    // magic link. Embeds the session id for purchase attribution on login.
    const token = makeClaimProofToken(tier, undefined, session.id);
    return {
      email: email ?? undefined,
      tierLabel: CLAIM_PROOF_TIERS[tier].label,
      // Direct magic link: /portal?t= bounces through portal-auth to set the
      // access cookie. No signup or email verification required to get in.
      portalMagicUrl: `${baseUrl}/claimproof/portal?t=${encodeURIComponent(token)}`,
      accountUrl: claimProofPortalLink(baseUrl, token),
      downloadUrl: claimProofDownloadLink(baseUrl, tier, token),
    };
  } catch (err) {
    console.error("[claimproof/success] session lookup failed:", err);
    return null;
  }
}

export default async function ClaimProofSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const access = await resolveAccess(session_id);

  return (
    <section className="bg-cream px-6 md:px-12 lg:px-20 pt-36 md:pt-44 pb-24 md:pb-32 min-h-[70vh]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
          Order confirmed
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-tight mb-6">
          You&rsquo;re covered.
        </h1>

        {access ? (
          <>
            <p className="font-sans text-lg text-charcoal leading-relaxed mb-2">
              Your {access.tierLabel} is ready.
            </p>
            <p className="font-sans text-base text-warm-gray leading-relaxed mb-10">
              We also emailed everything
              {access.email ? ` to ${access.email}` : " to your checkout email"}.
              You can jump straight in right here.
            </p>

            <div className="rounded-2xl bg-white p-8 text-left shadow-sm mb-6">
              <h2 className="font-display text-xl font-semibold text-deep-teal mb-4">
                Open your Command Center
              </h2>
              <p className="font-sans text-base text-charcoal leading-relaxed mb-6">
                Go straight to your Claim Command Center. Pick your situation and
                it hands you the next step. No password needed from this link.
              </p>
              <a
                href={access.portalMagicUrl}
                className="inline-block rounded-lg bg-warm-gold px-6 py-3 font-sans text-sm font-semibold text-near-black transition-colors hover:brightness-95"
              >
                Open my Command Center
              </a>
              <p className="mt-6 font-sans text-sm text-charcoal/75 leading-relaxed">
                Want it on every device?{" "}
                <Link
                  href={access.accountUrl}
                  className="font-semibold text-deep-teal underline underline-offset-2 hover:text-teal-light"
                >
                  Set up your free account
                </Link>{" "}
                with this same email and your claims, worksheets, and logs sync
                everywhere you sign in.
              </p>
              <p className="mt-4 font-sans text-sm">
                <a
                  href={access.downloadUrl}
                  className="font-semibold text-deep-teal underline underline-offset-2 hover:text-teal-light"
                >
                  Download the print-ready kit files
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="font-sans text-lg text-charcoal leading-relaxed mb-6">
              Your Claim Proof kit is on its way to the email you used at
              checkout, with your access link and download. It usually lands
              within a minute or two.
            </p>
            <p className="font-sans text-base text-warm-gray leading-relaxed mb-10">
              Don&rsquo;t see it? Check spam or promotions, then resend it below.
            </p>
          </>
        )}

        <div className="rounded-2xl bg-white p-8 text-left shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-deep-teal mb-4">
            Do one thing today
          </h2>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            Print the per-trip checklist and put it wherever you stage your
            vehicles. That one page is the whole system, and it takes about four
            minutes a trip. The rest of the manual is there for the day a guest
            sends you a photo of something bent and swears it was not them.
          </p>
        </div>

        <ResendAccess defaultEmail={access?.email ?? ""} />

        <p className="mt-8 font-sans text-sm text-warm-gray leading-relaxed">
          Still stuck after resending? Reply to your Stripe receipt or email{" "}
          <a
            href="mailto:hello@benicehospitality.com"
            className="font-semibold text-deep-teal underline underline-offset-2"
          >
            hello@benicehospitality.com
          </a>{" "}
          and we&rsquo;ll get you in.
        </p>

        <p className="mt-10">
          <Link
            href={CLAIM_PROOF.path}
            className="font-sans text-sm font-semibold text-deep-teal underline underline-offset-4 hover:text-teal-light"
          >
            Back to Claim Proof
          </Link>
        </p>
      </div>
    </section>
  );
}
