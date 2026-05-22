import type { Metadata } from "next";
import HeroSection from "@/components/sections/home-v2/HeroSection";
import ProblemStats from "@/components/sections/home-v2/ProblemStats";
import WhoWeServe from "@/components/sections/home-v2/WhoWeServe";
import FiveSurfaces from "@/components/sections/home-v2/FiveSurfaces";
import ThreePillars from "@/components/sections/home-v2/ThreePillars";
import LabsSpotlight from "@/components/sections/home-v2/LabsSpotlight";
import SignalSpotlight from "@/components/sections/home-v2/SignalSpotlight";
import FounderStoryTeaser from "@/components/sections/home-v2/FounderStoryTeaser";
import Testimonials from "@/components/sections/home-v2/Testimonials";
import PressBar from "@/components/sections/home-v2/PressBar";
import FreeAuditCTABanner from "@/components/sections/home-v2/FreeAuditCTABanner";

export const metadata: Metadata = {
  title: "Homepage Preview",
  description:
    "Staging surface for the v2 homepage. Not indexed. Once Della and Alex sign off, this swaps into / and the old homepage retires.",
  robots: { index: false, follow: false },
};

/**
 * Staged homepage. Ships at /preview/home so the founders can review the v2
 * design and copy in production without affecting the live home route. When
 * approved, swap src/app/(marketing)/page.tsx to render these same sections.
 */
export default function PreviewHomepage() {
  return (
    <>
      <HeroSection />
      <ProblemStats />
      <WhoWeServe />
      <FiveSurfaces />
      <ThreePillars />
      <LabsSpotlight />
      <SignalSpotlight />
      <FounderStoryTeaser />
      <Testimonials />
      <PressBar />
      <FreeAuditCTABanner />
    </>
  );
}
