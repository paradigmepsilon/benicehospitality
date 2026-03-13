import type { Metadata } from "next";
import HeroSection from "@/components/sections/home/HeroSection";
import PainPointsSection from "@/components/sections/home/PainPointsSection";
import ThreePillarsSection from "@/components/sections/home/ThreePillarsSection";
import WhoWeServeSection from "@/components/sections/home/WhoWeServeSection";
import ServiceTiersPreview from "@/components/sections/home/ServiceTiersPreview";
import GuestallyIntro from "@/components/sections/home/GuestallyIntro";
import TestimonialsSection from "@/components/sections/home/TestimonialsSection";
import HomeCTA from "@/components/sections/home/HomeCTA";

export const metadata: Metadata = {
  title: "Be Nice Hospitality Group | Boutique Hotel Consulting & Technology",
  description:
    "We help independent luxury boutique hotels grow direct revenue, streamline operations, and create guest experiences that feel premium. Serving 10–50 room properties across the U.S.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com",
  },
  openGraph: {
    title: "Be Nice Hospitality Group | Boutique Hotel Consulting",
    description:
      "Consulting and technology built exclusively for independent luxury boutique hotels with 10–50 rooms.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PainPointsSection />
      <ThreePillarsSection />
      <WhoWeServeSection />
      <ServiceTiersPreview />
      <div className="w-full px-6"><div className="max-w-7xl mx-auto h-px bg-white/15" /></div>
      <GuestallyIntro />
      <TestimonialsSection />
      <HomeCTA />
    </>
  );
}
