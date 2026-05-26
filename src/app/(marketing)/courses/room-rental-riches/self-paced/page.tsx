import type { Metadata } from "next";
import CourseHero from "@/components/sections/courses/CourseHero";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "Room Rental Riches: Self-paced ($497)",
  description:
    "Lifetime course access. 1 year of community. The full Host-to-Operator curriculum on your timeline.",
  alternates: {
    canonical:
      "https://benicehospitality.com/courses/room-rental-riches/self-paced",
  },
};

export default function SelfPacedPage() {
  return (
    <>
      <CourseHero
        eyebrow="Room Rental Riches · Self-paced"
        headline={<>$497.</>}
        body="Lifetime course access. 1 year of the Nice Host Network. The full Host-to-Operator method on your own schedule."
        primaryCta={{ label: "Login", href: "/login" }}
        secondaryCta={{
          label: "Compare Tiers",
          href: "/courses/room-rental-riches",
        }}
        previewTitle="What's included"
        previewItems={[
          "Lifetime access to all 12 modules of the Room Rental Riches curriculum, organized across 6 phases: Foundation, Acquisition, Setup, Launch, Operations, Growth",
          "The Bonus Pack intro: 4 lessons on direct booking and AI visibility (the deep-dive 8 lessons unlock at Cohort and Operator)",
          "All 100+ downloadable resources: 25+ AI prompts, the MTR Pricing Calculator V3, lease addendum templates, the 70+ item cleaning checklist, the SOP template library",
          "Lifetime access to module updates: quarterly regulatory refreshes, semi-annual tech-stack updates, annual market data refreshes",
          "1 full year of access to the Nice Host Network: 2 live founder-led sessions a week, 47 weeks live",
          "Quarterly office hours with Della",
          "Course completion certificate when you ship your first booking",
        ]}
      />

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} flip />

      {/* Who picks this tier */}
      <AnimatedSection
        theme="none"
        className="bg-primary-green text-white py-20 md:py-24 px-6"
      >
        <div className="max-w-3xl mx-auto">
          <AnimatedItem>
            <SectionLabel light>Who picks this tier</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-[1.15] tracking-tight mt-4 mb-6">
              You learn well from text and video. Cohort cadence isn&rsquo;t
              the right fit right now.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-base md:text-lg text-white/85 leading-relaxed space-y-4">
              <p>
                The self-paced tier is the right pick if you have read-the-docs
                energy. You move fast, you take notes, you implement on your
                own timeline, and live cohorts feel like a constraint.
              </p>
              <p>
                The community access matters. You don&rsquo;t need the
                8-week cohort, but you do want to be in a room with
                operators doing the same work, for the moments when a question
                comes up that can&rsquo;t be answered by a video.
              </p>
              <p className="text-warm-gold font-semibold">
                Self-paced is also the cleanest upgrade path. 2 of the first
                cohort students started here, finished the modules, then
                upgraded to Cohort for the live work.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.cream} />

      {/* Founding pricing note */}
      <AnimatedSection theme="off-white" className="py-12 md:py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-sans text-sm text-charcoal/70 italic">
            Founding pricing: the first 100 self-paced students get $497. Then
            it moves to $697. The lifetime access doesn&rsquo;t change.
          </p>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
