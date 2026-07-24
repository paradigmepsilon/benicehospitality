import type { Metadata } from "next";
import Image from "next/image";
import CourseHero from "@/components/sections/courses/CourseHero";
import StatsStrip from "@/components/sections/courses/StatsStrip";
import TierComparison from "@/components/sections/courses/TierComparison";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { CURRICULUM, BONUS_PACK } from "@/lib/room-rental-riches";

export const metadata: Metadata = {
  title: "Room Rental Riches",
  description:
    "Run your co-living portfolio like a real business. 3 commitment tiers, from $287 self-paced to the $7,497 90-day Operator engagement. Founding pricing for the first 100 students.",
  alternates: {
    canonical: "https://benicehospitality.com/courses/room-rental-riches",
  },
  openGraph: {
    title: "Room Rental Riches | BNHG",
    description:
      "The Host-to-Operator method for co-living operators. 3 commitment tiers. Same curriculum.",
    url: "https://benicehospitality.com/courses/room-rental-riches",
    type: "website",
  },
};

export default function RRRPage() {
  return (
    <>
      <CourseHero
        eyebrow="Self-paced · Masterclass · Operator"
        headline={
          <>
            Room Rental
            <br />
            Riches.
          </>
        }
        body="Run your co-living portfolio like a real business. The Host-to-Operator method for operators renting rooms by the door, plus the short, mid, and long-term rentals that mix in. Taught at 3 commitment tiers. Same curriculum in all 3. What changes is how much support, accountability, and time with Della you get."
        primaryCta={{ label: "Compare the Tiers", href: "#tiers" }}
        secondaryCta={{
          label: "Login",
          href: "/login",
        }}
        backgroundImage={{
          src: "/images/Website Images/Golden hour Atlanta Neighborhood.png",
          alt: "Atlanta neighborhood at golden hour",
        }}
        previewTitle="What's in the curriculum"
        previewItems={[
          "Phase 1 · Foundation: opportunity framing, legal setup, path commitment",
          "Phase 2 · Acquisition: AI-powered market analysis and first-property outreach",
          "Phase 3 · Setup: hospitality-grade design and the modern tech stack",
          "Phase 4 · Launch: multi-channel listings and the MTR pricing framework",
          "Phase 5 · Operations: guest-experience systems, cleaning, vendor network",
          "Phase 6 · Growth: SOPs, VA hiring, the path-to-W-2-replacement roadmap",
          "Bonus Pack: direct booking and AI visibility for the 2026 through 2030 era",
        ]}
      />

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* Every figure here has to be checkable. The old "125 Lessons" stat was
          not: Postgres holds fourteen published lessons, with the remaining
          modules still in production. Swapped for the regulatory coverage,
          which is real and is in Module 2. */}
      <StatsStrip
        items={[
          { value: "12", label: "Modules + Bonus Pack" },
          { value: "6", label: "Phases" },
          { value: "7", label: "Southeast states covered" },
          { value: "100", label: "Founding seats" },
        ]}
      />

      {/* Editorial image strip: four full-bleed property photos */}
      <section aria-hidden className="w-full bg-white p-2 md:p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            {
              src: "/images/Website Images/hf_20260512_145728_7a1638cd-85fa-44e7-a9a7-80d04c3a3dd2.png",
              alt: "Made bedroom with linen bedding at golden hour",
            },
            {
              src: "/images/Website Images/hf_20260512_145736_e7084398-0668-4426-9b89-fbfaf407bf36.png",
              alt: "BNHG welcome basket on a kitchen counter",
            },
            {
              src: "/images/Website Images/hf_20260512_145743_c9f28975-ffa7-4402-8f40-95df8295eee9.png",
              alt: "Sunlit living room with sofa and plants",
            },
            {
              src: "/images/Website Images/hf_20260512_145750_8e221a86-8307-4a76-afc6-cde6fa59b50f.png",
              alt: "Workspace nook with monitor and reading chair",
            },
          ].map((img) => (
            <div key={img.src} className="relative aspect-[4/3] md:aspect-square">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Who this is for */}
      <AnimatedSection theme="off-white" className="py-20 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <AnimatedItem>
              <SectionLabel>Who this is for</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-6">
                2 operators. 1 course.
              </h2>
            </AnimatedItem>
          </div>
          <AnimatedItem>
            <div className="font-sans text-base md:text-lg text-charcoal leading-relaxed space-y-4">
              <p className="font-semibold text-deep-teal">
                The aspiring co-living operator without a door yet.
              </p>
              <p>
                You&rsquo;re looking at co-living and MTR because the math
                works and the W-2 doesn&rsquo;t. At least not for the next
                20 years. You want to operate in the Southeast (Atlanta,
                Tampa, Charlotte, Raleigh, Nashville, Houston, somewhere on
                that map). You haven&rsquo;t signed your first lease or closed
                your first property yet, and you want a structured path from
                &ldquo;reading about this on Reddit&rdquo; to &ldquo;first
                booking in 60 days.&rdquo; Phases 1 and 2 are built for
                you. Opportunity framing, legal setup, path commitment, then
                AI-powered market analysis and the outreach work that lands
                the first deal.
              </p>
              <p className="font-semibold text-deep-teal pt-2">
                The operator past hosting.
              </p>
              <p>
                You have between 3 and 30 units. Some mix of
                co-living, short-term, mid-term, or long-term. Your revenue is
                real. Your time is the bottleneck. You&rsquo;ve outgrown the
                spreadsheet phase, you&rsquo;re tired of Sunday-night
                cleaner-scrambles, and you&rsquo;re paying enough in OTA
                commission to fund a full-time team member. Phases 3 through 6
                are where you&rsquo;ll spend your time. Hospitality-grade
                design, the modern tech stack, the MTR pricing framework,
                guest-experience systems, vendor networks, and the path to
                W-2 replacement.
              </p>
              {/* This used to name two students, Maya and James, with unit
                  counts and backstories. Neither exists — they are personas
                  from the monetization plan, and presenting them as real
                  students is an FTC problem. The point they were making is
                  true and survives without the names. */}
              <p className="text-warm-gold font-semibold pt-2">
                Same curriculum, both directions. An operator with 5 units
                already running starts in Phase 3 and works forward. Someone
                with no property yet starts in Phase 1 and works the whole arc.
                The course was built to be entered from either end.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* Curriculum perk-card grid */}
      <AnimatedSection theme="light" className="py-20 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The curriculum</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                6 phases. 12 modules. Plus the Bonus Pack.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-charcoal/75 leading-relaxed mt-5">
                Same curriculum in every tier. Foundation through scaling. The
                full arc, from no property yet to a portfolio that runs without
                you on call.
              </p>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {CURRICULUM.map((m) => (
              <AnimatedItem key={m.number}>
                <article className="bg-white border border-light-gray rounded-lg overflow-hidden h-full hover:border-deep-teal/40 transition-colors duration-200 flex flex-col">
                  <div className="relative aspect-[3/2] w-full bg-cream">
                    <Image
                      src={m.image}
                      alt={m.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-7 md:p-8 flex-1 flex flex-col">
                    <p
                      aria-hidden
                      className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2"
                    >
                      {m.phase}
                    </p>
                    <p
                      aria-hidden
                      className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/55 mb-4"
                    >
                      Module {m.number}
                    </p>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight mb-3">
                      {m.title}
                    </h3>
                    <p className="font-sans text-base text-charcoal leading-relaxed">
                      {m.body}
                    </p>
                  </div>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          {/* Bonus Pack callout */}
          <AnimatedItem>
            <article className="mt-10 bg-deep-teal text-white rounded-lg p-8 md:p-10 border-2 border-warm-gold">
              <p
                aria-hidden
                className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3"
              >
                Bonus Pack · Included
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-cream leading-tight mb-4">
                {BONUS_PACK.title}
              </h3>
              <p className="font-sans text-base md:text-lg text-cream/85 leading-relaxed">
                {BONUS_PACK.body}
              </p>
            </article>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} />

      {/* Tier compare */}
      <AnimatedSection
        theme="off-white"
        id="tiers"
        className="py-20 md:py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The 3 tiers</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                Same curriculum. 3 commitment levels.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-charcoal/75 leading-relaxed mt-5">
                Every tier ships the full 12-module curriculum and the
                Bonus Pack. What changes is how much support, accountability,
                and time with Della you get.
              </p>
            </AnimatedItem>
          </div>

          <TierComparison />

          {/* No post-founding escalation figures here any more. Naming a
              number we would then have to honor on a date we have not set is
              a promise with no plan behind it. The cap is the real constraint
              and it is the one stated. */}
          <div className="text-center mt-10 max-w-2xl mx-auto">
            <p className="font-sans text-sm text-charcoal/70 italic">
              Founding pricing holds for the first 100 students per tier, and
              enrollment is not open yet. Reserve a seat on any tier and you
              lock the founding price plus every module the day it ships, with
              no upgrade fee.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
