import type { Metadata } from "next";
import SignalHero from "@/components/sections/signal/SignalHero";
import SignalProblems from "@/components/sections/signal/SignalProblems";
import SignalPnL from "@/components/sections/signal/SignalPnL";
import SignalGuarantees from "@/components/sections/signal/SignalGuarantees";
import SignalOfferings from "@/components/sections/signal/SignalOfferings";
import SignalProcess from "@/components/sections/signal/SignalProcess";
import SignalWhyNow from "@/components/sections/signal/SignalWhyNow";
import SignalFinalCTA from "@/components/sections/signal/SignalFinalCTA";

const SITE_URL = "https://benicehospitalitygroup.com";

export const metadata: Metadata = {
  title: {
    absolute: "Signal by BNHG | AI Services for Boutique Luxury Hotels",
  },
  description:
    "Signal is the AI-first services layer of Be Nice Hospitality Group for independent boutique luxury hotels with 10 to 50 rooms. Get cited in ChatGPT, recover OTA commissions, and automate the manual work eating your week. Delivered in sprints. Backed by guarantees.",
  keywords: [
    "AI services for boutique hotels",
    "hotel AEO",
    "answer engine optimization for hotels",
    "MCP for hotels",
    "ChatGPT bookable hotel",
    "hotel AI agency",
    "OTA commission recovery",
    "AI direct booking",
    "boutique hotel AI consulting",
  ],
  alternates: {
    canonical: `${SITE_URL}/signal`,
  },
  openGraph: {
    title: "Signal by BNHG | AI Services for Boutique Luxury Hotels",
    description:
      "The AI-first services layer for independent boutique luxury hotels. Get cited in ChatGPT, recover OTA commissions, and automate the work eating your week.",
    url: `${SITE_URL}/signal`,
    type: "website",
    images: [
      { url: "/images/hero-banner.png", width: 1200, height: 630, alt: "Signal by BNHG" },
    ],
  },
};

const signalServiceSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/signal#service`,
      name: "Signal by BNHG",
      alternateName: "Signal AI Services",
      url: `${SITE_URL}/signal`,
      serviceType: "AI Consulting and Implementation for Boutique Hotels",
      description:
        "AI-first services for independent boutique luxury hotels with 10 to 50 rooms. AI visibility (AEO), MCP readiness, AI direct booking, voice agents, AI operations automation, and revenue integrity monitoring. Delivered in productized sprints with outcome-tied guarantees.",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "Country", name: "United States" },
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Independent boutique luxury hotels with 10 to 50 rooms",
      },
      offers: [
        {
          "@type": "Offer",
          name: "AI Visibility Audit + AEO Foundation",
          price: "2500",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          category: "Quick Win",
        },
        {
          "@type": "Offer",
          name: "MCP Readiness Package",
          price: "3500",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          category: "Quick Win",
        },
        {
          "@type": "Offer",
          name: "AI Direct Booking Accelerator",
          price: "8500",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          category: "30-Day Sprint",
        },
        {
          "@type": "Offer",
          name: "Signal Visibility Retainer",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: "2000",
            maxPrice: "3500",
            priceCurrency: "USD",
            billingDuration: "P1M",
          },
          availability: "https://schema.org/InStock",
          category: "Monthly Retainer",
        },
        {
          "@type": "Offer",
          name: "Revenue Integrity Monitor",
          price: "1500",
          priceCurrency: "USD",
          billingDuration: "P1M",
          availability: "https://schema.org/InStock",
          category: "Monthly Retainer",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/signal#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Signal by BNHG?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Signal is the AI-first services layer of Be Nice Hospitality Group for independent boutique luxury hotels with 10 to 50 rooms. We help properties get cited in ChatGPT, Perplexity, and Gemini through Answer Engine Optimization (AEO), recover OTA commission leakage, automate manual operations work, and prepare to be bookable inside ChatGPT via the Model Context Protocol (MCP).",
          },
        },
        {
          "@type": "Question",
          name: "How much does Signal cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Signal offers four engagement layers. Quick Wins ship in 1 to 2 weeks at $1,500 to $4,500. 30-Day Sprints run $5,000 to $10,000 with outcome-tied guarantees. Monthly Retainers run $2,000 to $10,000 per month. Custom Builds start at $5,000 with hybrid revenue-share options for builds that generate directly attributable revenue. Every productized engagement under $5,000 includes a 30-day money-back guarantee.",
          },
        },
        {
          "@type": "Question",
          name: "What is AEO and why does it matter for hotels?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Answer Engine Optimization (AEO) is the practice of structuring a hotel website and content so that AI search engines like ChatGPT, Perplexity, Gemini, and Google AI Mode cite the property when travelers ask trip-planning questions. Over a third of leisure travelers now begin trip planning inside an AI assistant. Without AEO, boutique hotels are invisible to that channel.",
          },
        },
        {
          "@type": "Question",
          name: "What is MCP and how does it relate to hotel bookings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The Model Context Protocol (MCP) is the emerging standard for connecting hotel inventory and booking capabilities directly to AI assistants like ChatGPT and Claude. Lighthouse launched the first direct-booking app for hotels inside ChatGPT in March 2026 using MCP. Properties that prepare their data and booking flows for MCP today gain first-mover positioning before OTAs and large chains saturate the channel.",
          },
        },
        {
          "@type": "Question",
          name: "What measurable outcomes does Signal deliver?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Properties working with Signal typically see 2 to 5% of OTA commissions recovered through monthly Revenue Integrity Monitor reconciliation, 6 to 12 hours of owner time returned per week through AI automation of recurring tasks, and 10 to 20% lift in direct bookings through the AI Direct Booking Accelerator. The AI Visibility Audit targets a measurable AI citation in ChatGPT, Perplexity, or Gemini within 60 days of kickoff.",
          },
        },
        {
          "@type": "Question",
          name: "Who is Signal for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Signal serves independent boutique luxury hotels in the United States with 10 to 50 rooms. The ideal client is an owner or general manager who is doing too much manual work, watching OTAs take a larger share of bookings, and aware that AI is changing how travelers search but unsure how to respond. Signal is not a fit for chain hotels, large independents over 50 rooms, or properties looking for a generic digital agency.",
          },
        },
      ],
    },
  ],
};

export default function SignalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(signalServiceSchema) }}
      />
      <SignalHero />
      <SignalProblems />
      <SignalPnL />
      <SignalGuarantees />
      <SignalOfferings />
      <SignalProcess />
      <SignalWhyNow />
      <SignalFinalCTA />
    </>
  );
}
