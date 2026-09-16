import type { Metadata } from "next";
import HeroSection from "@/components/sections/home/HeroSection";
import ProofBand from "@/components/sections/home/ProofBand";
import ThreeDoors from "@/components/sections/home/ThreeDoors";
import StorySection from "@/components/sections/home/StorySection";
import ManagedAssets from "@/components/sections/home/ManagedAssets";
import FoundersBand from "@/components/sections/home/FoundersBand";
import HomeFAQ from "@/components/sections/home/HomeFAQ";
import LatestInsights, {
  fetchLatestInsights,
} from "@/components/sections/home/LatestInsights";
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
    canonical: "https://www.benicehospitality.com",
  },
  openGraph: {
    title: "Be Nice Hospitality Group",
    description:
      "Sharing economy asset management for the Southeast. Learn to run your co-living property or rental fleet yourself, or let BNHG run it for you.",
    url: "https://www.benicehospitality.com",
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

// The latest-insights block reads blog_posts, so the page renders per request
// like /insights does. Every other section is static data.
export const dynamic = "force-dynamic";

// Every home section hands off through a tall curved divider. The stroke
// along the curve is what makes a white-to-cream edge read as a border; the
// grounds alternate underneath it. Direction flips each time.
const GOLD = C.warmGold;

export default async function HomePage() {
  const posts = await fetchLatestInsights(3);
  const hasInsights = posts.length > 0;

  return (
    <>
      <HeroSection />
      {/* ProofBand renders nothing until Alex supplies real operating
          figures (src/lib/constants.ts OPERATING_PROOF). */}
      <ProofBand />
      <SectionDivider fromColor={C.cream} toColor={C.white} size="lg" stroke={GOLD} />
      <ThreeDoors />
      <SectionDivider fromColor={C.white} toColor={C.cream} size="lg" stroke={GOLD} flip />
      <StorySection />
      <SectionDivider fromColor={C.cream} toColor={C.white} size="lg" stroke={GOLD} />
      <ManagedAssets />
      <SectionDivider fromColor={C.white} toColor={C.cream} size="lg" stroke={GOLD} flip />
      <FoundersBand />
      <SectionDivider fromColor={C.cream} toColor={C.white} size="lg" stroke={GOLD} />
      <HomeFAQ />
      {hasInsights ? (
        <>
          <SectionDivider fromColor={C.white} toColor={C.cream} size="lg" stroke={GOLD} flip />
          <LatestInsights posts={posts} />
          <SectionDivider fromColor={C.cream} toColor={C.nearBlack} size="lg" stroke={GOLD} />
        </>
      ) : (
        <SectionDivider fromColor={C.white} toColor={C.nearBlack} size="lg" stroke={GOLD} flip />
      )}
    </>
  );
}
