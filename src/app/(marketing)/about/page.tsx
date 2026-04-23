import type { Metadata } from "next";
import AboutHero from "@/components/sections/about/AboutHero";
import FoundingStory from "@/components/sections/about/FoundingStory";
import Differentiation from "@/components/sections/about/Differentiation";
import BNHGFramework from "@/components/sections/about/BNHGFramework";
import PageCTA from "@/components/sections/shared/PageCTA";

export const metadata: Metadata = {
  title: {
    absolute: "Boutique Hotel Consultants | About Be Nice Hospitality Group",
  },
  description:
    "BNHG was co-founded by Alex and Della Henry, two military veterans who combine enterprise-level operations experience with deep hospitality expertise to help independent boutique hotels grow.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/about",
  },
  openGraph: {
    title: "Boutique Hotel Consultants | About Be Nice Hospitality Group",
    description:
      "Meet the team behind BNHG. Hospitality expertise meets systems thinking for independent boutique hotels.",
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <FoundingStory />
      <Differentiation />
      <BNHGFramework />
      <PageCTA
        headline="Ready to Work Together?"
        subtext="Whether you want a free resource or a full engagement, every relationship starts with a conversation."
      />
    </>
  );
}
