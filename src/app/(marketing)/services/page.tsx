import type { Metadata } from "next";
import ServicesHero from "@/components/sections/services/ServicesHero";
import TierZero from "@/components/sections/services/TierZero";
import TierOneTwoThree from "@/components/sections/services/TierOneTwoThree";
import PageCTA from "@/components/sections/shared/PageCTA";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute: "Co-Living & Boutique Stay Consulting Services & Pricing | BNHG",
  },
  description:
    "Consulting for co-living operators and boutique stays, from free resources to full fractional advisory. Tier 0 free resources, Tier 1 diagnostics, Tier 2 implementation, and Tier 3 ongoing advisory for independent operators.",
  alternates: {
    canonical: "https://benicehospitality.com/services",
  },
  openGraph: {
    title: "Co-Living & Boutique Stay Consulting Services & Pricing | BNHG",
    description:
      "4 tiers of hospitality consulting, from no-cost resources to full strategic partnership for independent co-living operators and boutique stays.",
    url: "https://benicehospitality.com/services",
    type: "website",
    images: [
      { url: "/images/hero-banner.png", width: 1200, height: 630, alt: "Be Nice Hospitality Group" },
    ],
  },
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />
      <TierZero />
      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
      <TierOneTwoThree />
      <PageCTA
        headline="Not Sure Where to Start? Let's Figure It Out Together."
        subtext="A 40-minute discovery call is all it takes to understand your biggest opportunity and recommend the right starting point."
      />
    </>
  );
}
