import type { Metadata } from "next";
import Image from "next/image";
import ScorecardForm from "@/components/sections/scorecard/ScorecardForm";
import { STOCK_COLIVING } from "@/lib/stock-images";
import {
  SCORECARD_QUESTION_COUNT,
  SCORECARD_SECTIONS,
} from "@/lib/scorecard/questions";

const SITE_URL = "https://benicehospitality.com";
const PAGE_PATH = "/resources/mtr-viability-scorecard";

export const metadata: Metadata = {
  title: {
    absolute: "MTR Viability Scorecard: Free Property Assessment | BNHG",
  },
  description:
    "A free, weighted scorecard that grades any property's fit for mid-term rentals. 40 questions across 7 sections. Built for owners, investors, and operators in the Southeast.",
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: "MTR Viability Scorecard: Free Property Assessment | BNHG",
    description:
      "Score any property on its fit for mid-term rentals. 40 weighted questions, instant report, recommendations from a working MTR operator.",
    url: `${SITE_URL}${PAGE_PATH}`,
    type: "website",
  },
};

const WHAT_YOU_GET = [
  "Section-by-section score across 7 weighted categories",
  "Specific Della-voice recommendation for every gap",
  "An overall band (High / Moderate / Low) with what it means",
  "A printable report you can revisit or share with a partner",
  "A recommended next move tied to your band",
];

const WHO_ITS_FOR = [
  "Owners weighing whether their property fits MTR",
  "Investors evaluating a deal before they buy",
  "Property managers building a portfolio of furnished units",
  "Anyone considering buying with MTR cash flow in mind",
];

export default function MtrViabilityScorecardPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "MTR Viability Scorecard",
    description:
      "Free 40-question weighted scorecard that grades any property's fit for mid-term rentals.",
    provider: { "@id": `${SITE_URL}/#organization` },
    serviceType: "Mid-Term Rental Property Assessment",
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
            Free Resource · MTR Viability Scorecard
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-tight">
            Is your property MTR-ready?
          </h1>
          <p className="font-sans text-lg text-white/70 mt-6 max-w-2xl mx-auto leading-relaxed">
            {SCORECARD_QUESTION_COUNT} weighted questions across{" "}
            {SCORECARD_SECTIONS.length} sections. Score any single property in
            under 10 minutes and walk away with a Della-voice fix list for
            every gap.
          </p>
          <p className="font-sans text-sm text-white/55 mt-4">
            Built by operators running MTRs in the Southeast. Free to use,
            yours to keep.
          </p>
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

      {/* How it works */}
      <section className="py-16 sm:py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-3 text-center">
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black leading-tight text-center mb-12">
            Tick what is true. We score the rest.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "1",
                title: "Walk the property",
                body: "Open the scorecard, give the property a nickname, and work through the seven sections. About 10 minutes if you know the place well.",
              },
              {
                step: "2",
                title: "We weight the answers",
                body: "Location and operations carry more than community vibes. Our weighting reflects what actually drives MTR booking rates.",
              },
              {
                step: "3",
                title: "Drop your email, see the score",
                body: "Your overall band, section breakdown, and a specific fix for every gap. Emailed to you so you can revisit any time.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-off-white border border-light-gray rounded-lg p-6"
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
    </>
  );
}
