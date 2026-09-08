import type { Metadata } from "next";
import HeroSection from "@/components/sections/home/HeroSection";
import ThreeDoors from "@/components/sections/home/ThreeDoors";
import ProofBand from "@/components/sections/home/ProofBand";
import LadderSection from "@/components/sections/home/LadderSection";
import FoundersBand from "@/components/sections/home/FoundersBand";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute:
      "Be Nice Hospitality Group | Sharing Economy Asset Management for the Southeast",
  },
  description:
    "BNHG teaches operators to run co-living properties and rental fleets, and manages those assets directly for owners who would rather hand it off. Georgia, Florida, South Carolina, North Carolina, Alabama, and Tennessee. Founded by Della and Alex Henry.",
  alternates: {
    canonical: "https://benicehospitality.com",
  },
  openGraph: {
    title: "Be Nice Hospitality Group",
    description:
      "Sharing economy asset management for the Southeast. Learn to run your co-living property or rental fleet yourself, or let BNHG run it for you.",
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
      <ThreeDoors />
      <SectionDivider fromColor={C.white} toColor={C.cream} />
      {/* ProofBand renders nothing until Alex supplies real operating
          figures (src/lib/constants.ts OPERATING_PROOF). Both it and
          LadderSection share the cream/off-white background, so the divider
          above is correct whether or not ProofBand is present. */}
      <ProofBand />
      <LadderSection />
      <SectionDivider fromColor={C.cream} toColor={C.white} flip />
      <FoundersBand />
      <SectionDivider fromColor={C.white} toColor={C.nearBlack} flip />
    </>
  );
}
