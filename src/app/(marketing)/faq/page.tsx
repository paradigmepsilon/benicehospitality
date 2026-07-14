import type { Metadata } from "next";
import FAQHero from "@/components/sections/faq/FAQHero";
import FAQAccordion from "@/components/sections/faq/FAQAccordion";
import FAQSchema from "@/components/sections/faq/FAQSchema";
import PageCTA from "@/components/sections/shared/PageCTA";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute:
      "Hospitality Consulting FAQ | Be Nice Hospitality Group",
  },
  description:
    "Answers to the most common questions about our consulting for co-living operators, boutique stays, and fleet operators. OTA dependency, direct booking, tech stacks, guest messaging, and working with BNHG.",
  alternates: {
    canonical: "https://benicehospitality.com/faq",
  },
  openGraph: {
    title: "Hospitality Consulting FAQ | Be Nice Hospitality Group",
    description:
      "What our consulting costs, how to reduce OTA dependency, the best guest messaging software for small operators, and more.",
    url: "https://benicehospitality.com/faq",
    type: "website",
    images: [
      { url: "/images/hero-banner.png", width: 1200, height: 630, alt: "Be Nice Hospitality Group" },
    ],
  },
};

export default function FAQPage() {
  return (
    <>
      <FAQSchema />
      <FAQHero />
      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />
      <FAQAccordion />
      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
      <PageCTA
        headline="Still Have Questions?"
        subtext="Request a free resource or book a 40-minute discovery call. We answer like a partner, not a salesperson."
      />
    </>
  );
}
