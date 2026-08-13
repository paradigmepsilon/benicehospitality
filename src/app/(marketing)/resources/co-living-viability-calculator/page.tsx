import type { Metadata } from "next";
import Image from "next/image";
import ScorecardForm from "@/components/sections/scorecard/ScorecardForm";
import { STOCK_COLIVING } from "@/lib/stock-images";
import {
  SCORECARD_QUESTION_COUNT,
  SCORECARD_SECTIONS,
} from "@/lib/scorecard/questions";

const SITE_URL = "https://benicehospitality.com";
const PAGE_PATH = "/resources/co-living-viability-calculator";

// Counts are read from the question set, never typed by hand. This copy has
// drifted out of sync with the real question count twice already.
const QUESTION_COUNT = SCORECARD_QUESTION_COUNT;
const SECTION_COUNT = SCORECARD_SECTIONS.length;

export const metadata: Metadata = {
  title: {
    absolute: "Co-living Viability Calculator: Free Property Assessment | BNHG",
  },
  description: `A free, weighted scorecard that grades any property's fit for co-living. ${QUESTION_COUNT} questions across ${SECTION_COUNT} sections. Built for owners, investors, and operators in the Southeast.`,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: "Co-living Viability Calculator: Free Property Assessment | BNHG",
    description: `Score any property on its fit for co-living. ${QUESTION_COUNT} weighted questions, instant report, recommendations from a working co-living operator.`,
    url: `${SITE_URL}${PAGE_PATH}`,
    type: "website",
  },
};

const WHAT_YOU_GET = [
  `Section-by-section score across ${SECTION_COUNT} weighted categories`,
  "Specific recommendation for every gap",
  "An overall band (High / Moderate / Low) with what it means",
  "A printable report you can revisit or share with a partner",
  "A recommended next move tied to your band",
  "Every property you score, saved side by side in your account",
];

const WHO_ITS_FOR = [
  "Owners weighing whether their property fits co-living",
  "Investors evaluating a deal before they buy",
  "Property managers building a portfolio of furnished units",
  "Anyone considering buying with co-living cash flow in mind",
];

export default function CoLivingViabilityCalculatorPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Co-living Viability Calculator",
    description: `Free ${QUESTION_COUNT}-question weighted scorecard that grades any property's fit for co-living.`,
    provider: { "@id": `${SITE_URL}/#organization` },
    serviceType: "Co-living Property Assessment",
    areaServed: { "@type": "Country", name: "United States" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    url: `${SITE_URL}${PAGE_PATH}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-20 md:pb-24 px-6 overflow-hidden">
        <Image
          src={STOCK_COLIVING.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-near-black/75 via-near-black/85 to-near-black/95" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
            Free Resource · Co-living Viability Calculator
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-tight text-balance">
            Is your property
            <br />
            Co-living-Ready?
          </h1>
          <p className="font-sans text-lg text-white/70 mt-6 max-w-2xl mx-auto leading-relaxed">
            {QUESTION_COUNT} weighted questions across {SECTION_COUNT}{" "}
            sections. Score any single property in under 10 minutes and walk
            away with a Della-voice fix list for every gap.
          </p>
          <p className="font-sans text-sm text-white/55 mt-4">
            Built by operators running co-living properties in the Southeast. Free to use,
            yours to keep.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 sm:py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-3 text-center">
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black leading-tight text-center mb-8">
            Tick what is true. We score the rest.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "1",
                title: "Walk the property",
                body: `Open the scorecard, give the property a nickname, and work through the ${SECTION_COUNT} sections. Google Maps and Zillow links are built into each one so you can check instead of guess.`,
              },
              {
                step: "2",
                title: "We weight the answers",
                body: "Location and operations carry more than community vibes. Our weighting reflects what actually drives co-living demand.",
              },
              {
                step: "3",
                title: "Drop your email, see the score",
                body: "Your overall band, section breakdown, and a specific fix for every gap. Emailed to you so you can revisit any time.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-6"
              >
                <p className="font-display text-4xl font-semibold text-warm-gold mb-3">
                  {s.step}
                </p>
                <h3 className="font-display text-lg font-semibold text-near-black mb-2">
                  {s.title}
                </h3>
                <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + side panel */}
      <section className="py-16 sm:py-20 px-6 bg-off-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <ScorecardForm />
          </div>

          {/* What you'll get */}
          <aside className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-light-gray rounded-lg p-6 lg:p-7 lg:sticky lg:top-24">
              <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-3">
                What you&apos;ll get
              </p>
              <h2 className="font-display text-xl font-semibold text-near-black leading-snug mb-5">
                An honest read on this property
              </h2>
              <ul className="space-y-2.5 mb-6">
                {WHAT_YOU_GET.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-charcoal"
                  >
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
                    {item}
                  </li>
                ))}
              </ul>
              <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-3 pt-2 border-t border-light-gray">
                Who it&apos;s for
              </p>
              <ul className="space-y-2 mb-2">
                {WHO_ITS_FOR.map((item) => (
                  <li
                    key={item}
                    className="font-sans text-sm text-charcoal/85 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-charcoal/60 leading-relaxed border-t border-light-gray pt-4 mt-4">
                We email you a copy and save it to your account. Free, no
                strings.
              </p>
            </div>
          </aside>
        </div>
      </section>

    </>
  );
}
