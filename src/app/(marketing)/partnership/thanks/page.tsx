import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank you | Be Nice Hospitality Group",
  robots: { index: false, follow: false },
};

// Landing page for the card-payment link an admin sends from the partnership
// tracker. Static on purpose: it shows nothing about the engagement, so the
// URL is safe to land on with or without a session.
export default async function PartnershipThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const cancelled = (await searchParams).cancelled === "1";

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold text-deep-teal">
        {cancelled ? "No charge was made." : "Payment received. Thank you."}
      </h1>
      <p className="mt-5 text-lg text-charcoal/80">
        {cancelled
          ? "Your payment link is still good whenever you're ready. If something looked off, reply to the email it came in and we'll sort it out."
          : "Your receipt is on its way from Stripe. Della will be in touch within one business day with your welcome packet and the next step."}
      </p>
      <p className="mt-8 text-sm text-charcoal/60">
        Questions? <a className="underline" href="mailto:admin@benicehospitality.com">admin@benicehospitality.com</a>{" "}
        · <Link className="underline" href="/">Back to the site</Link>
      </p>
    </main>
  );
}
