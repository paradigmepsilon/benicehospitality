export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import InsightsHero from "@/components/sections/insights/InsightsHero";
import InsightsGrid from "@/components/sections/insights/InsightsGrid";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute: "Hospitality Strategy Insights & Articles | BNHG",
  },
  description:
    "Strategy, operations, and technology thinking for co-living operators, boutique stays, and fleet operators. Direct booking strategies, tech stack optimization, guest experience frameworks, and more.",
  alternates: {
    canonical: "https://benicehospitality.com/insights",
  },
  openGraph: {
    title: "Hospitality Strategy Insights & Articles | BNHG",
    description:
      "Operator insights: revenue strategy, guest experience, and technology thinking for co-living, boutique stays, and fleets.",
    url: "https://benicehospitality.com/insights",
    type: "website",
    images: [
      { url: "/images/hero-banner.png", width: 1200, height: 630, alt: "Be Nice Hospitality Group" },
    ],
  },
};

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <>
      <InsightsHero />
      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />
      <InsightsGrid
        category={params.category}
        sort={params.sort}
        page={params.page}
      />
      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
