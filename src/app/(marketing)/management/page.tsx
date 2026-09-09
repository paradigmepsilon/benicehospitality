import type { Metadata } from "next";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import PhotoHero from "@/components/sections/shared/PhotoHero";
import ManagedAssets from "@/components/sections/home/ManagedAssets";
import OnboardingTimeline from "@/components/sections/management/OnboardingTimeline";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { BOOKING_SOURCES } from "@/lib/booking-url";
import {
  SERVICE_AREA_LABEL,
  SERVICE_AREA_STATES,
} from "@/lib/management/constants";
import { applyHref } from "@/components/sections/management/ManagementOffer";

export const metadata: Metadata = {
  title: "Management",
  description:
    "Sharing economy asset management for the Southeast. BNHG manages your vehicle or your spare rooms while you keep ownership. Georgia, Florida, South Carolina, North Carolina, Alabama, and Tennessee.",
  keywords: [
    "sharing economy asset management",
    "fleet management company",
    "co-living management company",
    "vehicle and property management Southeast",
    "done for you rental management",
  ],
  alternates: { canonical: "https://benicehospitality.com/management" },
  openGraph: {
    title: "Management | Be Nice Hospitality Group",
    description:
      "BNHG manages your vehicle or your spare rooms while you keep ownership. Learn to run it yourself, or let us run it.",
    url: "https://benicehospitality.com/management",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/Alex%20Turo%20Shot.png",
        width: 1600,
        height: 900,
        alt: "BNHG managed assets: a rental vehicle and a co-living property",
      },
    ],
  },
};

export default function ManagementOverviewPage() {
  return (
    <>
      <PhotoHero
        eyebrow={`Management across ${SERVICE_AREA_LABEL}`}
        headline="Sharing economy asset management for the Southeast U.S."
        lede="BNHG manages the vehicle or the spare rooms you already own. Learn to run it yourself, or let us run it for you."
        primaryCta={{
          label: "Check your fit",
          href: applyHref(BOOKING_SOURCES.MGMT_OVERVIEW_CTA),
        }}
        dividerTo={C.white}
        image={{
          src: "/images/Website Images/Della At Hutchens.png",
          alt: "Della Henry outside a managed co-living property at golden hour",
          position: "object-[70%_center]",
        }}
      />

      {/* OFFER CARDS: the same two photo cards the home page uses, so the
          overview and the home never describe the offers differently. */}
      <ManagedAssets
        id="offers"
        eyebrow="Two ways in"
        heading="What are you looking to manage?"
      titleAbove
      />

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* SERVICE AREA */}
      <AnimatedSection theme="off-white" className="py-10 md:py-14 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel>Where we operate</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-8">
              Six states across the Southeast U.S.
            </h2>
          </AnimatedItem>
          <AnimatedDiv
            stagger
            className="flex flex-wrap justify-center gap-3"
          >
            {SERVICE_AREA_STATES.map((s) => (
              <AnimatedItem key={s.code}>
                <span className="inline-block font-sans text-sm font-semibold text-deep-teal bg-white border border-light-gray rounded-full px-5 py-2.5">
                  {s.name}
                </span>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>


      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* HOW IT WORKS */}
      <OnboardingTimeline />

      <SectionDivider fromColor={C.white} toColor={C.nearBlack} flip />
    </>
  );
}
