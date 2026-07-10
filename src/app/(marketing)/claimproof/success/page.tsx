import type { Metadata } from "next";
import Link from "next/link";
import { CLAIM_PROOF } from "@/lib/claim-proof";

/**
 * Post-purchase confirmation for Claim Proof. Delivery happens by email (the
 * shared Stripe webhook sends the tier's download link), so this page
 * reassures and directs — it does not itself deliver. Same pattern as
 * /thehostsedge/success. `robots: noindex` — transactional page.
 */

export const metadata: Metadata = {
  title: "You're covered · Claim Proof",
  robots: { index: false, follow: false },
};

export default function ClaimProofSuccessPage() {
  return (
    <section className="bg-cream px-6 md:px-12 lg:px-20 pt-36 md:pt-44 pb-24 md:pb-32 min-h-[70vh]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
          Order confirmed
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-tight mb-6">
          You&rsquo;re covered. Check your email.
        </h1>
        <p className="font-sans text-lg text-charcoal leading-relaxed mb-6">
          Your Claim Proof kit is on its way to the email you used at checkout,
          with the download link. It usually lands within a minute or two.
        </p>
        <p className="font-sans text-base text-warm-gray leading-relaxed mb-10">
          Don&rsquo;t see it? Check spam or promotions. Still missing after a
          few minutes? Reply to your Stripe receipt and we&rsquo;ll get it to
          you.
        </p>

        <div className="rounded-2xl bg-white p-8 text-left shadow-sm">
          <h2 className="font-display text-xl font-semibold text-deep-teal mb-4">
            Do one thing today
          </h2>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            Print the per-trip checklist and put it wherever you stage your
            cars. That one page is the whole system, and it takes about four
            minutes a trip. The rest of the manual is there for the day a guest
            sends you a photo of something bent and swears it was not them.
          </p>
        </div>

        <p className="mt-12">
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
