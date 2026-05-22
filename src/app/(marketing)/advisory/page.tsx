import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import AdvisoryApplicationForm from "@/components/sections/advisory/AdvisoryApplicationForm";
import { STOCK_HANDSHAKE } from "@/lib/stock-images";

const SITE_URL = "https://benicehospitality.com";

export const metadata: Metadata = {
  title: "The Operator's Boardroom",
  description:
    "Fractional COO partnership for sharing-economy operators scaling across asset classes. Three, six, or twelve months. Application-only.",
  alternates: { canonical: `${SITE_URL}/advisory` },
  openGraph: {
    title: "The Operator's Boardroom | Be Nice Hospitality Group",
    description:
      "For operators with five to twenty-five units doing $400K to $2M in annual revenue. Strategic partnership, not a content library.",
    url: `${SITE_URL}/advisory`,
    type: "website",
  },
};

const advisoryServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/advisory#service`,
  name: "The Operator's Boardroom",
  alternateName: "BNHG Advisory",
  url: `${SITE_URL}/advisory`,
  serviceType: "Fractional COO and Operator Advisory",
  description:
    "Fractional COO partnership for sharing-economy operators with five to twenty-five units and $400K to $2M in annual revenue. Three, six, and twelve-month commitments. Application-only.",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "Country", name: "United States" },
  audience: {
    "@type": "BusinessAudience",
    audienceType:
      "Sharing-economy operators across short-term rental, long-term rental, co-living, and auto-fleet asset classes",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Advisory commitments",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Three-month focused engagement",
          description:
            "A defined problem in a defined window. Best for selling founders, operators preparing a hire, or single-issue clean-up.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Six-month operational rebuild",
          description:
            "Long enough to redesign the operation and stay through the first round of execution. The most-requested length.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Twelve-month compounding partnership",
          description:
            "The CEO's seat on retainer. Strategic oversight across the full year, with depth to compound across multiple cycles.",
        },
      },
    ],
  },
};

interface Persona {
  title: string;
  body: string;
  bestTier: string;
}

const PERSONAS: Persona[] = [
  {
    title: "The Married Operator Couple",
    body: "Eight to fifteen units. One spouse runs ops, the other contributes capital and a corporate income. The bread-and-butter engagement: turn the operation into a real business while protecting the second income.",
    bestTier: "6 or 12 months",
  },
  {
    title: "The Reluctant Real Estate Investor",
    body: "Ten to twenty units. You expected passive income. You got a full-time job. Six months gets you out of the day-to-day without selling the portfolio.",
    bestTier: "6 months",
  },
  {
    title: "The Aggressive Growth Operator",
    body: "Eight units today. Fifty in eighteen months. We professionalize the playbook before the growth breaks the operation.",
    bestTier: "12 months",
  },
  {
    title: "The Co-Living Founder",
    body: "One to three buildings, ten to thirty doors. Underserved white space; almost no serious competition. We bring the operating system the category never built.",
    bestTier: "6 or 12 months",
  },
  {
    title: "The Multi-Asset Innovator",
    body: "Property plus auto plus co-living. Most philosophically aligned with how we work. Highest LTV. Twelve-month engagement focused on the operating-system layer that connects the asset classes.",
    bestTier: "12 months",
  },
  {
    title: "The Selling Founder",
    body: "Building toward a sale or wind-down. Three or six months to clean up financials, document SOPs, and prepare for due diligence. The valuation lift usually pays for the engagement many times over.",
    bestTier: "3 or 6 months",
  },
];

interface Tier {
  name: string;
  cadence: string;
  description: string;
  whoFor: string;
  includes: string[];
  highlighted?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Three months",
    cadence: "Focused engagement",
    description:
      "A defined problem, a defined window. Best when one specific transition needs to land in a quarter. We scope tightly and ship.",
    whoFor: "Selling founders, operators preparing for a hire, or single-issue clean-up engagements.",
    includes: [
      "Weekly working session with Della and Alex",
      "One on-site or async deep-dive per month",
      "Direct Slack channel for the duration",
      "All deliverables documented in your ops library",
    ],
  },
  {
    name: "Six months",
    cadence: "Operational rebuild",
    description:
      "Long enough to redesign the operation and stay through the first round of execution. Our most-requested length.",
    whoFor: "Operators who feel the ceiling and need a system, a team, and a reporting rhythm in place by quarter-end.",
    highlighted: true,
    includes: [
      "Everything in the three-month tier",
      "Hiring and onboarding support for one new role",
      "Quarterly board-style review for partners or investors",
      "First-pass automation buildout with the BNHG Labs team",
    ],
  },
  {
    name: "Twelve months",
    cadence: "Compounding partnership",
    description:
      "The CEO's seat on retainer. Strategic oversight across the whole year, with the depth to compound across multiple cycles.",
    whoFor: "Aggressive growth operators, multi-asset innovators, and founders building toward a category-defining business.",
    includes: [
      "Everything in the six-month tier",
      "Annual planning session and quarterly off-sites",
      "Priority on Labs releases and new tooling",
      "Direct access to the Signal team for any boutique-hotel asset",
    ],
  },
];

export default function AdvisoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(advisoryServiceSchema) }}
      />
      {/* Hero */}
      <AnimatedSection theme="dark" className="relative pt-32 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={STOCK_HANDSHAKE.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-near-black via-near-black/85 to-near-black/55" />
        </div>
        <div className="relative max-w-3xl">
          <AnimatedItem>
            <SectionLabel light>The Operator&apos;s Boardroom</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4 mb-6 leading-[1.1]">
              For operators ready to scale, not just to survive.
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/75 leading-relaxed mb-8">
              Fractional COO partnership for sharing-economy operators with five to twenty-five units and $400K to $2M in annual revenue. We embed in your operation and act as the strategic seat you do not have. Three, six, and twelve-month commitments. Application-only.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <Button href="#apply" variant="secondary" size="lg">
              Apply for Advisory
            </Button>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* Personas */}
      <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>Who We Partner With</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
                Six operators we know how to help.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base text-charcoal/70 mt-4 leading-relaxed">
                These are not personas we made up for marketing. They are the actual shapes of the engagements we have run. If you do not see yourself here, write us anyway.
              </p>
            </AnimatedItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PERSONAS.map((p) => (
              <AnimatedItem key={p.title}>
                <div className="bg-white border border-light-gray rounded-md p-7 h-full">
                  <h3 className="font-display text-xl font-semibold text-near-black mb-3 leading-tight">
                    {p.title}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-4">
                    {p.body}
                  </p>
                  <p className="font-sans text-xs uppercase tracking-[0.18em] text-warm-gold font-semibold pt-3 border-t border-light-gray">
                    Best fit: {p.bestTier}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Three commitment tiers */}
      <AnimatedSection theme="light" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The Three Commitments</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
                Three, six, or twelve months.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base text-charcoal/70 mt-4 leading-relaxed">
                Pricing is shared on the discovery call once we know your shape. The structure below holds for every engagement.
              </p>
            </AnimatedItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TIERS.map((tier) => (
              <AnimatedItem key={tier.name}>
                <div
                  className={[
                    "h-full bg-white rounded-md p-7 flex flex-col",
                    tier.highlighted
                      ? "border-2 border-primary-green shadow-md"
                      : "border border-light-gray",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display text-xl font-semibold text-near-black leading-tight">
                      {tier.name}
                    </h3>
                    {tier.highlighted && (
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-green bg-primary-green/10 px-2 py-1">
                        Most common
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs uppercase tracking-[0.15em] text-warm-gold font-semibold mb-4">
                    {tier.cadence}
                  </p>
                  <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-4">
                    {tier.description}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 italic leading-relaxed mb-5 pb-5 border-b border-light-gray">
                    {tier.whoFor}
                  </p>
                  <ul className="space-y-2 flex-1">
                    {tier.includes.map((item) => (
                      <li
                        key={item}
                        className="font-sans text-sm text-charcoal/80 leading-relaxed flex gap-2"
                      >
                        <span className="text-primary-green mt-0.5">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* How it works */}
      <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>How It Works</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-4 leading-tight">
                Application. Discovery call. Decision.
              </h2>
            </AnimatedItem>
          </div>

          <div className="space-y-6">
            <AnimatedItem>
              <div className="flex gap-5">
                <div className="font-display text-warm-gold text-2xl font-semibold w-12 shrink-0">
                  01
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-near-black mb-1">
                    You apply.
                  </h3>
                  <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                    Six fields plus a paragraph on the biggest constraint on your operation. We answer every application within two business days, including the ones that are not a fit.
                  </p>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem>
              <div className="flex gap-5">
                <div className="font-display text-warm-gold text-2xl font-semibold w-12 shrink-0">
                  02
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-near-black mb-1">
                    Discovery call.
                  </h3>
                  <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                    Thirty minutes with Della or Alex. Direct conversation about your operation, our model, and whether the math works. We share pricing on this call.
                  </p>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem>
              <div className="flex gap-5">
                <div className="font-display text-warm-gold text-2xl font-semibold w-12 shrink-0">
                  03
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-near-black mb-1">
                    Engagement starts.
                  </h3>
                  <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                    If we both say yes, the engagement starts within two weeks. The first month is a structured diagnostic. Month two onward is the rebuild.
                  </p>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedSection>

      {/* Application form */}
      <AnimatedSection id="apply" theme="light" className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>Apply</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-4 leading-tight">
                Tell us about your operation.
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedItem>
            <AdvisoryApplicationForm />
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* Boutique hotel callout */}
      <section className="bg-cream/30 py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white border-l-4 border-warm-gold p-6 md:p-8">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-warm-gold font-semibold mb-2">
            Run a boutique luxury hotel?
          </p>
          <p className="font-sans text-base text-charcoal/85 leading-relaxed">
            Signal is built specifically for 10 to 50 room independent properties. Productized AI engagements with outcome guarantees, led by Alex.{" "}
            <Link
              href="/signal"
              className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 font-medium"
            >
              Explore Signal
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
