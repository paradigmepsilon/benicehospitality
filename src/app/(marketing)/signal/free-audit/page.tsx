import type { Metadata } from "next";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import EmailCaptureForm from "@/components/forms/EmailCaptureForm";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export const metadata: Metadata = {
  title: "Free AI Visibility Audit",
  description:
    "See exactly how ChatGPT, Perplexity, and Google AI Overviews describe your boutique hotel today. 5-business-day turnaround. No commitment.",
  alternates: {
    canonical: "https://benicehospitality.com/signal/free-audit",
  },
  openGraph: {
    title: "Free AI Visibility Audit | Signal by BNHG",
    description:
      "We test your property in ChatGPT, Perplexity, Gemini, and Google AI Mode and send you a written report. Free, custom, yours to keep.",
    url: "https://benicehospitality.com/signal/free-audit",
    type: "website",
  },
};

interface AuditDeliverable {
  title: string;
  body: string;
}

const DELIVERABLES: AuditDeliverable[] = [
  {
    title: "AI search query test",
    body: "We run 20 traveler-intent queries against ChatGPT, Perplexity, Gemini, and Google AI Mode. You see the raw output, not a summary.",
  },
  {
    title: "Citation gap analysis",
    body: "Where the AI engines cited a competitor instead of you, and why. The why is the part most agencies skip.",
  },
  {
    title: "Schema and llms.txt audit",
    body: "What structured data the engines could not find on your site. The technical layer that determines whether AI can read you at all.",
  },
  {
    title: "3-action priority list",
    body: "The 3 highest-leverage moves you can make in the next 30 days, ranked by effort. Yours to implement on your own or with anyone you choose.",
  },
];

interface AuditFAQ {
  q: string;
  a: string;
}

const AUDIT_FAQ: AuditFAQ[] = [
  {
    q: "Is it really free?",
    a: "Yes. The AI Visibility Audit is the top of the Signal funnel. We deliver it because boutique hotel owners have been burned by agencies before, and we want to show you the work before we ask for a dollar. No upsell sequence. No drip emails. 1 audit, 1 report, 1 optional discovery call if you want one.",
  },
  {
    q: "What do you need from me?",
    a: "Your hotel website URL and an email address. That is it. We do the rest of the data gathering on our side.",
  },
  {
    q: "How long does it take?",
    a: "5 business days from request to delivery. We send the report as a written PDF to the email you provide.",
  },
  {
    q: "What if my hotel is not a fit for Signal?",
    a: "You still get the audit. If we genuinely cannot help, we will tell you who can. We have an active referral relationship with a small number of agencies in adjacent specialties.",
  },
  {
    q: "How is this different from the BNHG Tier 0 audit?",
    a: "The Tier 0 audit at /audit/request is broader: 7 dimensions across revenue, ops, tech, and visibility. The AI Visibility Audit is narrower and deeper: it goes 1 layer below the visibility dimension and tests how the AI engines actually describe your property right now.",
  },
];

export default function SignalFreeAuditPage() {
  return (
    <>
      <AnimatedSection theme="dark" className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>Free Tool · Signal by BNHG</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4 mb-6 leading-[1.1]">
              See exactly what AI is saying about your hotel.
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/75 leading-relaxed mb-8">
              We test your property across ChatGPT, Perplexity, Gemini, and Google AI Mode, then send you a written audit with the citations you are getting, the citations you are missing, and the 3 highest-leverage moves to make in the next 30 days. 5 business days, free.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <Button href="#request" variant="secondary" size="lg">
              Request Your Audit
            </Button>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* What you get */}
      <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>What You Get</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-4 leading-tight">
                A written report. Not a sales presentation.
              </h2>
            </AnimatedItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DELIVERABLES.map((d, i) => (
              <AnimatedItem key={d.title}>
                <div className="bg-white border border-light-gray rounded-md p-6 h-full">
                  <p className="font-display text-warm-gold text-sm font-semibold mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-near-black mb-2 leading-tight">
                    {d.title}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/75 leading-relaxed">{d.body}</p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Request form */}
      <AnimatedSection id="request" theme="light" className="py-20 md:py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel>Request</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-4 mb-4 leading-tight">
              2 fields. 5 business days.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/70 mb-8 leading-relaxed">
              Drop your email and we follow up to confirm your hotel URL and any specifics you want us to focus on. The audit lands in your inbox 5 business days later.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="max-w-md mx-auto">
              <EmailCaptureForm
                source="signal_free_audit_request"
                variant="card"
                buttonLabel="Request Audit"
                placeholder="you@yourhotel.com"
                helperText="We will email you within 1 business day to confirm your URL and queue the audit."
                successMessage="Got it. We will follow up within 1 business day to confirm your URL and start the audit."
              />
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mt-8 font-sans text-sm text-charcoal/60">
              Already know you want a real conversation?{" "}
              <Link
                href={bookingUrl({
                  callType: "discovery_call_45",
                  source: BOOKING_SOURCES.SIGNAL_FREE_AUDIT_BODY,
                })}
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 font-medium"
              >
                Book a Discovery Call
              </Link>
              .
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>Common Questions</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-3 leading-tight">
              What you might be wondering.
            </h2>
          </div>

          <div className="space-y-3">
            {AUDIT_FAQ.map((item) => (
              <AnimatedItem key={item.q}>
                <details className="group bg-white border border-light-gray rounded-md overflow-hidden">
                  <summary className="cursor-pointer px-6 py-5 flex items-center gap-4 list-none hover:bg-cream/30 transition-colors">
                    <span className="flex-1 font-display text-base font-semibold text-near-black">
                      {item.q}
                    </span>
                    <svg
                      className="w-4 h-4 text-charcoal/45 shrink-0 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5">
                    <p className="font-sans text-sm text-charcoal/75 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
