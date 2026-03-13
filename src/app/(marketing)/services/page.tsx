import type { Metadata } from "next";
import ServicesHero from "@/components/sections/services/ServicesHero";
import TierZero from "@/components/sections/services/TierZero";
import TierOneTwoThree from "@/components/sections/services/TierOneTwoThree";
import PageCTA from "@/components/sections/shared/PageCTA";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Boutique hotel consulting services from free resources to full fractional advisory. Tier 0 free resources, Tier 1 diagnostics, Tier 2 implementation, and Tier 3 ongoing advisory for independent hotels.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/services",
  },
  openGraph: {
    title: "Services | Be Nice Hospitality Group",
    description:
      "Four tiers of hotel consulting, from no-cost resources to full strategic partnership for independent boutique hotels.",
  },
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <TierZero />
      <TierOneTwoThree />
      <PageCTA
        headline="Not Sure Where to Start? Let's Figure It Out Together."
        subtext="A 30-minute discovery call is all it takes to understand your biggest opportunity and recommend the right starting point."
      />
    </>
  );
}
