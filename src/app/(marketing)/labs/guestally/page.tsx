import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { STOCK_PROPERTY_ALT } from "@/lib/stock-images";

const SITE_URL = "https://benicehospitality.com";

export const metadata: Metadata = {
  title: "Guestally",
  description:
    "Property-side AI concierge for co-living and short-term rental operators. Bernice handles guest messaging, upsells, and the operations the front desk used to babysit.",
  alternates: { canonical: `${SITE_URL}/labs/guestally` },
  openGraph: {
    title: "Guestally | BNHG Labs",
    description:
      "AI concierge built for co-living and short-term rental operators. Starter $179, Growth $299, Premium $349 a month. Property-side only.",
    url: `${SITE_URL}/labs/guestally`,
    type: "website",
  },
};

const guestallyProductSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/labs/guestally#product`,
  name: "Guestally",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Hospitality Guest Messaging",
  operatingSystem: "Web",
  url: "https://guestally.ai",
  description:
    "Property-side AI concierge for co-living and short-term rental operators. Guest messaging, upsells, and operations dispatch handled by Bernice, the AI agent at the core of Guestally.",
  publisher: { "@id": `${SITE_URL}/#organization` },
  brand: {
    "@type": "Brand",
    name: "Guestally",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  },
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "179",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "179",
        priceCurrency: "USD",
        billingDuration: "P1M",
        unitText: "MONTH",
      },
      availability: "https://schema.org/InStock",
      category: "1 to 3 units",
      url: "https://guestally.ai",
    },
    {
      "@type": "Offer",
      name: "Growth",
      price: "299",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "299",
        priceCurrency: "USD",
        billingDuration: "P1M",
        unitText: "MONTH",
      },
      availability: "https://schema.org/InStock",
      category: "4 to 10 units",
      url: "https://guestally.ai",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "349",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "349",
        priceCurrency: "USD",
        billingDuration: "P1M",
        unitText: "MONTH",
      },
      availability: "https://schema.org/InStock",
      category: "11 units and up, or a co-living building",
      url: "https://guestally.ai",
    },
  ],
};

interface Plan {
  name: string;
  price: number;
  positioning: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: 179,
    positioning: "1 to 3 units. Bernice runs guest messaging end to end.",
    features: [
      "Pre-arrival and post-checkout flows",
      "Smart reply with operator override",
      "Single-property dashboard",
      "Email and chat support",
    ],
  },
  {
    name: "Growth",
    price: 299,
    positioning: "4 to 10 units. Operations layer added on top of messaging.",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Multi-property routing",
      "Cleaner and handler dispatch",
      "Upsell library (early check-in, late check-out, experiences)",
      "Slack and SMS escalations",
    ],
  },
  {
    name: "Premium",
    price: 349,
    positioning: "11 units and up, or a co-living building. Concierge-grade for the door count that needs it.",
    features: [
      "Everything in Growth",
      "Custom workflows on request",
      "Quarterly tuning session with the Guestally team",
      "Priority support",
      "Multi-channel (SMS, WhatsApp, email)",
    ],
  },
];

export default function GuestallyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guestallyProductSchema) }}
      />
      <AnimatedSection theme="dark" className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={STOCK_PROPERTY_ALT.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-near-black/75 via-near-black/85 to-near-black" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>Flagship Labs product</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4 mb-5 leading-[1.1]">
              Guestally
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/75 leading-relaxed mb-8">
              The AI concierge for property-side operators. Bernice handles guest messaging, upsells, and the operational back-and-forth that used to live in your phone. Built for co-living and short-term rental operators. Property only.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="https://guestally.ai" variant="secondary" size="lg" external>
                Visit guestally.ai
              </Button>
              <Button href="/audit/request" variant="ghost" size="lg">
                Try the Audit Generator
              </Button>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <AnimatedSection theme="off-white" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-3 leading-tight">
              3 plans. No annual lock-in.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <AnimatedItem key={plan.name}>
                <div
                  className={[
                    "h-full bg-white rounded-md p-7 flex flex-col",
                    plan.highlighted ? "border-2 border-primary-green shadow-lg" : "border border-light-gray",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display text-xl font-semibold text-near-black">{plan.name}</h3>
                    {plan.highlighted && (
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-green bg-primary-green/10 px-2 py-1">
                        Most operators
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-display text-3xl font-semibold text-near-black">${plan.price}</span>
                    <span className="font-sans text-sm text-charcoal/60">/mo</span>
                  </div>
                  <p className="font-sans text-sm text-charcoal/70 mb-5 leading-relaxed">
                    {plan.positioning}
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="font-sans text-sm text-charcoal/80 flex gap-2">
                        <span className="text-primary-green mt-0.5">›</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button href="https://guestally.ai" variant={plan.highlighted ? "primary" : "secondary"} size="md" external fullWidth>
                    Start with {plan.name}
                  </Button>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection theme="light" className="py-16 px-6">
        <div className="max-w-3xl mx-auto bg-cream/40 border-l-4 border-warm-gold p-6 md:p-8 rounded-r-md">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-warm-gold font-semibold mb-2">
            About Guestally
          </p>
          <p className="font-sans text-base text-charcoal/85 leading-relaxed">
            Guestally is a separately incorporated company founded by Alex Henry. It anchors the BNHG Labs portfolio and integrates with BNHG curriculum and advisory. The full product, support, and account management lives at{" "}
            <a
              href="https://guestally.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 font-medium"
            >
              guestally.ai
            </a>
            .
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection theme="off-white" className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-sans text-sm text-charcoal/60 mb-3">
            Want to see Bernice handle a real guest thread?
          </p>
          <Link
            href="/labs#bernice"
            className="font-sans text-base font-semibold text-primary-green hover:text-primary-green-dark underline underline-offset-4"
          >
            Open the Bernice sandbox →
          </Link>
        </div>
      </AnimatedSection>
    </>
  );
}
