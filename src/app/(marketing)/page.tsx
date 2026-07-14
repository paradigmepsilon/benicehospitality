import type { Metadata } from "next";
import HeroSection from "@/components/sections/home/HeroSection";
import ThreePillarsSection from "@/components/sections/home/ThreePillarsSection";
import ProductSurfaces from "@/components/sections/home/ProductSurfaces";
import WhoItsFor from "@/components/sections/home/WhoItsFor";
import FoundersBand from "@/components/sections/home/FoundersBand";
import WhoItsForBanner from "@/components/sections/home/WhoItsForBanner";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute:
      "Be Nice Hospitality Group | The Operator's Company for the Sharing Economy",
  },
  description:
    "Training, services, and software for operators running co-living properties, boutique stays, and rental fleets. Atlanta-headquartered. Founded by Della and Alex Henry.",
  alternates: {
    canonical: "https://benicehospitality.com",
  },
  openGraph: {
    title: "Be Nice Hospitality Group",
    description:
      "Built by operators, for operators. Training and community for co-living operators, AI services for boutique stays, and the BNHG Labs portfolio of operator tools.",
    url: "https://benicehospitality.com",
    type: "website",
    images: [
      {
        url: "/images/hero-banner.png",
        width: 1200,
        height: 630,
        alt: "Be Nice Hospitality Group",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionDivider fromColor={C.nearBlack} toColor={C.white} />
      <ThreePillarsSection />
      <SectionDivider fromColor={C.white} toColor={C.warmGold} flip />
      <WhoItsForBanner />
      <WhoItsFor />
      <ProductSurfaces />
      <SectionDivider fromColor={C.primaryGreen} toColor={C.white} />
      <FoundersBand />
      <SectionDivider fromColor={C.white} toColor={C.nearBlack} flip />
    </>
  );
}
