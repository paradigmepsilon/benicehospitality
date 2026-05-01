import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: { absolute: "Audit request received | Be Nice Hospitality Group" },
  robots: { index: false, follow: false },
};

export default function AuditRequestThanksPage() {
  return (
    <section className="bg-off-white py-24 sm:py-32 px-6 min-h-[calc(100vh-200px)]">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-primary-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-near-black mb-4 leading-tight">
          We&apos;ve got your request.
        </h1>
        <p className="font-sans text-lg text-charcoal/70 leading-relaxed mb-3">
          Thanks. We&apos;ll have your Tier 0 Comprehensive Audit ready within
          48 hours, and we&apos;ll email you the link when it&apos;s done.
        </p>
        <p className="font-sans text-sm text-charcoal/60 leading-relaxed mb-10">
          In the meantime, no need to do anything. We&apos;ve already started
          gathering the data.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/" variant="primary">
            Back to Home
          </Button>
          <Button href="/insights" variant="secondary">
            Read Our Insights
          </Button>
        </div>

        <p className="font-sans text-xs text-charcoal/40 mt-12 leading-relaxed">
          Have a question in the meantime?{" "}
          <Link
            href="/contact"
            className="text-primary-green hover:text-primary-green-dark transition-colors"
          >
            Contact us here
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
