import type { Metadata } from "next";
import FAQHero from "@/components/sections/faq/FAQHero";
import FAQAccordion from "@/components/sections/faq/FAQAccordion";
import FAQSchema from "@/components/sections/faq/FAQSchema";
import PageCTA from "@/components/sections/shared/PageCTA";

export const metadata: Metadata = {
  title: {
    absolute:
      "Boutique Hotel Consulting FAQ | Be Nice Hospitality Group",
  },
  description:
    "Answers to the most common questions about boutique hotel consulting, OTA dependency, direct booking, hotel tech stacks, guest messaging, and working with BNHG.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/faq",
  },
  openGraph: {
    title: "Boutique Hotel Consulting FAQ | Be Nice Hospitality Group",
    description:
      "What boutique hotel consulting costs, how to reduce OTA dependency, the best guest messaging software for small hotels, and more.",
    url: "https://benicehospitalitygroup.com/faq",
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
      <FAQAccordion />
      <PageCTA
        headline="Still Have Questions?"
        subtext="Request a free resource or book a 40-minute discovery call. We answer like a partner, not a salesperson."
      />
    </>
  );
}
