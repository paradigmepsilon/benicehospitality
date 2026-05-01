import type { Metadata } from "next";
import AuditRequestForm from "@/components/sections/audit/AuditRequestForm";

export const metadata: Metadata = {
  title: { absolute: "Get Your Free Tier 0 Audit | Be Nice Hospitality Group" },
  description:
    "Request a free Tier 0 Comprehensive Audit for your boutique hotel. Two-page diagnostic across seven dimensions. No cost, no commitment.",
  alternates: {
    canonical: "https://www.benicehospitality.com/audit/request",
  },
  openGraph: {
    title: "Get Your Free Tier 0 Audit | Be Nice Hospitality Group",
    description:
      "Two-page diagnostic of your boutique hotel across seven dimensions. Free, custom, and yours to keep.",
    url: "https://www.benicehospitality.com/audit/request",
    type: "website",
  },
};

const SEVEN_DIMENSIONS = [
  "Revenue Opportunity",
  "Online Reputation",
  "Competitive Position",
  "Guest Personas",
  "Tech Stack",
  "Visibility & Discoverability",
  "Quick Wins",
];

export default function AuditRequestPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-near-black py-24 sm:py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-near-black to-near-black/90" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
            Tier 0 · Free Comprehensive Audit
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-tight">
            Your hotel, scored across seven dimensions.
          </h1>
          <p className="font-sans text-lg text-white/70 mt-6 max-w-2xl mx-auto leading-relaxed">
            We&apos;ll analyze your property, score it, and send you a two-page
            diagnostic with the three highest-impact actions you can take. Free,
            custom, and yours to keep.
          </p>
        </div>
      </section>

      {/* Form + side panel */}
      <section className="py-16 sm:py-20 px-6 bg-off-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <AuditRequestForm />
          </div>

          {/* What you'll get */}
          <aside className="lg:col-span-2">
            <div className="bg-white border border-light-gray rounded-lg p-6 lg:p-7 sticky top-24">
              <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-3">
                What you&apos;ll get
              </p>
              <h2 className="font-display text-xl font-semibold text-near-black leading-snug mb-5">
                A scored audit across seven dimensions
              </h2>
              <ul className="space-y-2.5 mb-6">
                {SEVEN_DIMENSIONS.map((dim) => (
                  <li key={dim} className="flex items-start gap-2 text-sm text-charcoal">
                    <svg
                      className="w-4 h-4 text-primary-green mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {dim}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-charcoal/60 leading-relaxed border-t border-light-gray pt-4">
                Audits are typically ready within 48 hours. We&apos;ll send the
                link to your email so you can review when you&apos;re ready.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
