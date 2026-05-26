import type { Metadata } from "next";
import Image from "next/image";
import AuditRequestForm from "@/components/sections/audit/AuditRequestForm";
import { STOCK_TECH } from "@/lib/stock-images";

export const metadata: Metadata = {
  title: { absolute: "Get Your Free Audit | Be Nice Hospitality Group" },
  description:
    "Free Tier 0 Comprehensive Audit. URL in, branded report out. Built for boutique hotel owners and sharing-economy operators who want a serious second opinion.",
  alternates: {
    canonical: "https://benicehospitality.com/audit/request",
  },
  openGraph: {
    title: "Get Your Free Audit | Be Nice Hospitality Group",
    description:
      "2-page diagnostic across 7 dimensions. Custom to your property, yours to keep, no commitment.",
    url: "https://benicehospitality.com/audit/request",
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
      <section className="relative bg-near-black py-24 sm:py-28 px-6 md:px-12 lg:px-20 overflow-hidden">
        <Image
          src={STOCK_TECH.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-near-black/95 via-near-black/85 to-near-black/55" />
        <div className="relative z-10 max-w-4xl">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
            Tier 0 · Free Comprehensive Audit
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-tight">
            Your operation, scored across 7 dimensions.
          </h1>
          <p className="font-sans text-lg text-white/70 mt-6 max-w-2xl leading-relaxed">
            We analyze your property or fleet, score it across 7 dimensions, and send back a 2-page diagnostic with the 3 highest-impact next moves. Free, custom, and yours to keep.
          </p>
          <p className="font-sans text-sm text-white/55 mt-4">
            Built for boutique hotel owners and sharing-economy operators. Tell us your role and we route the report to the right next step.
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
                A scored audit across 7 dimensions
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
                Audits are typically ready within 48 hours. We send the report link to your email so you can read it when you have time.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
