export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import InsightsHero from "@/components/sections/insights/InsightsHero";
import InsightsGrid from "@/components/sections/insights/InsightsGrid";
import NewsletterSignup from "@/components/sections/insights/NewsletterSignup";

export const metadata: Metadata = {
  title: {
    absolute: "Boutique Hotel Strategy Insights & Articles | BNHG",
  },
  description:
    "Strategy, operations, and technology thinking for independent boutique hotel owners and general managers. Direct booking strategies, tech stack optimization, guest experience frameworks, and more.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/insights",
  },
  openGraph: {
    title: "Boutique Hotel Strategy Insights & Articles | BNHG",
    description:
      "Boutique hotel insights: revenue strategy, guest experience, and technology thinking for independent hoteliers.",
    url: "https://benicehospitalitygroup.com/insights",
    type: "website",
    images: [
      { url: "/images/hero-banner.png", width: 1200, height: 630, alt: "Be Nice Hospitality Group" },
    ],
  },
};

export default function InsightsPage() {
  return (
    <>
      <InsightsHero />
      <InsightsGrid />
      <NewsletterSignup />
    </>
  );
}
