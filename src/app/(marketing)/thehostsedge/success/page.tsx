import type { Metadata } from "next";
import Link from "next/link";
import { HOSTS_EDGE } from "@/lib/hosts-edge";

/**
 * Post-purchase confirmation for The Host's Edge.
 *
 * Delivery happens by email (the shared Stripe webhook sends the download link
 * on checkout.session.completed), so this page does NOT itself deliver the
 * product — it reassures the buyer and tells them where to look. Rendered inside
 * the (marketing) shell (Header + Footer come free).
 *
 * `robots: noindex` — this is a transactional page, not something to index.
 */

export const metadata: Metadata = {
  title: "You're in — The Host's Edge",
  robots: { index: false, follow: false },
};

export default function HostsEdgeSuccessPage() {
  return (
    <section className="bg-cream px-6 md:px-12 lg:px-20 pt-36 md:pt-44 pb-24 md:pb-32 min-h-[70vh]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
          Order confirmed
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-tight mb-6">
          You&rsquo;re in. Check your email.
        </h1>
        <p className="font-sans text-lg text-charcoal leading-relaxed mb-6">
          Your Guest Message System is on its way to the email you used at
          checkout, with the download link and both formats. It usually lands
          within a minute or two.
        </p>
        <p className="font-sans text-base text-warm-gray leading-relaxed mb-10">
          Don&rsquo;t see it? Check your spam or promotions folder. If it&rsquo;s
          still not there in a few minutes, reply to the confirmation from Stripe
          and we&rsquo;ll get it to you.
        </p>

        <div className="rounded-2xl bg-white p-8 text-left shadow-sm">
          <h2 className="font-display text-xl font-semibold text-deep-teal mb-4">
            Start here
          </h2>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            Open the PDF once, then go straight to the check-in message. It is
            the one that ends the late-night &ldquo;how do I get in?&rdquo; texts.
            Fill the brackets, adapt with the AI prompts if you want, and
            you&rsquo;re running it the same day.
          </p>
        </div>

        <p className="mt-12">
          <Link
            href={HOSTS_EDGE.path}
            className="font-sans text-sm font-semibold text-deep-teal underline underline-offset-4 hover:text-teal-light"
          >
            Back to The Host&rsquo;s Edge
          </Link>
        </p>
      </div>
    </section>
  );
}
