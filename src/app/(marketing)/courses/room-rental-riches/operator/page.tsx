import type { Metadata } from "next";
import CourseHero from "@/components/sections/courses/CourseHero";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "Room Rental Riches: Operator ($7,497)",
  description:
    "90 days with Della. 12 60-minute 1:1 sessions. Lifetime community. The deepest version of the Host-to-Operator method, capped at 5 students per cycle.",
  alternates: {
    canonical:
      "https://benicehospitality.com/courses/room-rental-riches/operator",
  },
};

const NINETY_DAY_ARC = [
  {
    phase: "Days 1–14",
    title: "Diagnose",
    body: "Onboarding plus the Modules 1 & 2 deep dive in 1:1. Portfolio (or pre-portfolio) review with Della. Where the leverage actually is. The 2 or 3 moves that matter most for the 90 days. We don't try to fix everything. We pick the right things and execute them.",
  },
  {
    phase: "Days 15–60",
    title: "Build",
    body: "The two-day Masterclass workshop runs during this window. You join the six-operator group for the two-day intensive, and you're also in monthly 1:1s with Della applying Modules 3 through 11 to your specific portfolio. The bulk of your 12 sessions land in this phase.",
  },
  {
    phase: "Days 61–90",
    title: "Operationalize",
    body: "Module 12 scaling work plus the Bonus Pack T2/T3 deep dive: AI visibility audit on your direct booking site. The handoff from project mode to operating mode. Capstone, year-2 strategic plan, and a written 90-day playbook of what got built and what's running.",
  },
];

export default function OperatorPage() {
  return (
    <>
      <CourseHero
        eyebrow="Room Rental Riches · Operator · 5 seats per cycle"
        headline={<>$7,497.</>}
        body="90 days. 12 sessions with Della. The Masterclass included. Lifetime in the Nice Host Network. Capped at 5 students per cycle, 2 cycles a year."
        primaryCta={{ label: "Login", href: "/login" }}
        secondaryCta={{
          label: "Compare Tiers",
          href: "/courses/room-rental-riches",
        }}
        previewTitle="What's included"
        previewItems={[
          "Everything in the Masterclass tier: all 12 modules, the Bonus Pack intro and Tier 2/3 Deep Dive, the two-day workshop, the permanent archive",
          "12 60-minute 1:1 sessions with Della, 1 per module, spread across 90 days",
          "Lifetime access to the Nice Host Network: not 1 year, not 3, lifetime",
          "Direct messaging access to Della between sessions for the duration of the engagement",
          "A custom portfolio (or pre-portfolio) review at kickoff: where your operation actually is, where the highest-leverage moves are, what the 90 days will focus on",
          "Della's pre-launch property reviews: listing copy, pricing strategy, photo selection, vendor-network audit, direct-booking site optimization audit",
          "Direct attorney and CPA referrals from Della's network",
          "Year 2 strategic planning session as a bonus, post-90-days",
          "A written 90-day playbook at the end: what got built, what's running, and what to do next",
        ]}
      />

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* Ninety-day arc: three perk cards */}
      <AnimatedSection theme="light" className="py-20 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The 90-day arc</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                3 phases. 12 sessions. 1 portfolio transformed.
              </h2>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {NINETY_DAY_ARC.map((p) => (
              <AnimatedItem key={p.phase}>
                <article className="bg-white border border-light-gray rounded-lg p-7 md:p-8 h-full hover:border-deep-teal/40 transition-colors duration-200">
                  <p
                    aria-hidden
                    className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4"
                  >
                    {p.phase}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-3">
                    {p.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal leading-relaxed">
                    {p.body}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.primaryGreen} flip />

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
              You&rsquo;re past the &ldquo;is this real&rdquo; phase. You want
              the work done, with the founder in it.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-base md:text-lg text-white/85 leading-relaxed space-y-4">
              <p>
                Operator is for the operator who&rsquo;s ready. You have a real
                portfolio, real revenue, and a real list of things that have
                been on your &ldquo;I&rsquo;ll get to it&rdquo; list for too
                long. You don&rsquo;t need to be convinced the method works.
                You need someone to do the 90 days with you and make sure
                it ships.
              </p>
              <p>
                Della takes 5 operators per cycle. 2 cycles a year. The
                cap isn&rsquo;t a marketing line. It&rsquo;s the math of how
                much 1:1 work is sustainable while keeping the Masterclass and
                community running.
              </p>
              <p className="text-warm-gold font-semibold">
                If you&rsquo;re not sure whether this is the right fit, start
                with the free audit. If the audit&rsquo;s findings line up
                with where you actually are, we&rsquo;ll talk about whether
                Operator makes sense for the next cycle.
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
            Founding pricing: the first 100 Operator students (across all
            cycles) get $7,497. Then it moves to $9,997. With a 5-student
            cap and 2 cycles a year, that&rsquo;s 10 years of founding
            pricing, and we expect it to fill faster than that.
          </p>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
