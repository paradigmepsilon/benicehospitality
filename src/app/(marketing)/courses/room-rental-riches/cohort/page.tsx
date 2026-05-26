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
  title: "Room Rental Riches: Cohort ($2,497)",
  description:
    "8 weeks of live, guided work + the full curriculum + a year in the network. The cohort tier of Room Rental Riches.",
  alternates: {
    canonical:
      "https://benicehospitality.com/courses/room-rental-riches/cohort",
  },
};

const COHORT_WEEKS = [
  {
    week: "01",
    modules: "Modules 1 & 2",
    title: "Foundation: opportunity + legal",
    body: "Mindset alignment on the 2026 MTR opportunity. Legal and regulatory deep dive: state-by-state matrix workshopped live. Attorney recommendations shared.",
  },
  {
    week: "02",
    modules: "Module 3",
    title: "Path commitment",
    body: "The forced-commitment exercise, live. Each student commits to arbitrage, ownership, or co-host with cohort accountability before market analysis begins.",
  },
  {
    week: "03",
    modules: "Module 4",
    title: "AI-powered market analysis",
    body: "Live AI prompt workshop. Hot-seat market analyses on each student's chosen Southeast metro. Walk out with a defensible market thesis.",
  },
  {
    week: "04",
    modules: "Module 5",
    title: "Property pitch role-plays",
    body: "Live landlord and owner pitch role-plays with Della and Alex. The objection-handler library, drilled. Email pitch versions reviewed individually.",
  },
  {
    week: "05",
    modules: "Module 6",
    title: "Hospitality-grade design review",
    body: "The flagship module, applied. Mood-board reviews. Persona-alignment workshop. Will Guidara's Unreasonable Hospitality framework, translated to your specific property.",
  },
  {
    week: "06",
    modules: "Modules 7 & 8",
    title: "Tech stack + listing strategy",
    body: "Live listing reviews. Tech-stack troubleshooting on Hospitable, PriceLabs, Turno, Stessa. Per-platform listing optimization across Furnished Finder, Airbnb, Zillow, Apartments.com.",
  },
  {
    week: "07",
    modules: "Modules 9 & 10",
    title: "Pricing + guest experience",
    body: "MTR Pricing Calculator V3 reviewed live with each student's numbers. Message-template workshop across the 6 guest-journey phases. The contrarian discount strategy applied.",
  },
  {
    week: "08",
    modules: "Modules 11 & 12",
    title: "Operations + scaling",
    body: "Vendor network sharing. Cleaning quality audits. The path-to-W-2-replacement roadmap. SOP template library walkthrough. Property #1 readiness audit before scaling.",
  },
  {
    week: "Bonus 09",
    modules: "Bonus Pack: Tier 2/3 Deep Dive",
    title: "AI visibility live workshop",
    body: "GEO/AEO content strategy. Third-party citation strategy. MCP readiness. Live AI-visibility audits on each student's direct booking site. The 2026-2030 competitive moat.",
  },
];

export default function CohortPage() {
  return (
    <>
      <CourseHero
        eyebrow="Room Rental Riches · Cohort · Most popular"
        headline={<>$2,497.</>}
        body="8 weeks of live, guided work. The full Host-to-Operator curriculum, applied to your portfolio in real time, alongside other operators doing the same work."
        primaryCta={{ label: "Login", href: "/login" }}
        secondaryCta={{
          label: "Compare Tiers",
          href: "/courses/room-rental-riches",
        }}
        previewTitle="What's included"
        previewItems={[
          "Everything in the Self-paced tier: all 12 modules, the Bonus Pack intro, lifetime updates, 1 year of the Nice Host Network",
          "Plus the Bonus Pack Tier 2/3 Deep Dive: 8 additional lessons on GEO/AEO, third-party citations, MCP readiness, and direct-booking conversion",
          "8 weekly live sessions (90 minutes each) led by Della and Alex, plus a bonus AI-visibility workshop in week 9",
          "Cohort-only channel for working through the modules with up to 15 other operators in real time",
          "Weekly hot-seat slots: bring a real situation, get a working answer in front of the whole cohort",
          "Module-specific live work: forced-commitment exercise (W2), AI market-analysis hot seats (W3), property-pitch role-plays (W4), mood-board review (W5), pricing-calculator review (W7)",
          "Direct messaging with Della and Alex during cohort weeks",
          "Permanent cohort archive: recordings, transcripts, and shared docs stay yours after the cohort ends",
        ]}
      />

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* Eight-week arc + bonus week: perk-card grid */}
      <AnimatedSection theme="light" className="py-20 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The 8-week arc + bonus week</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                12 modules, mapped to 8 weeks of live work. Plus the AI-visibility workshop.
              </h2>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {COHORT_WEEKS.map((w) => (
              <AnimatedItem key={w.week}>
                <article className="bg-white border border-light-gray rounded-lg p-7 md:p-8 h-full hover:border-deep-teal/40 transition-colors duration-200">
                  <p
                    aria-hidden
                    className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2"
                  >
                    Week {w.week}
                  </p>
                  <p
                    aria-hidden
                    className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/55 mb-4"
                  >
                    {w.modules}
                  </p>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight mb-3">
                    {w.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal leading-relaxed">
                    {w.body}
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
              You move when the room moves. You want the founders in it.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-base md:text-lg text-white/85 leading-relaxed space-y-4">
              <p>
                Cohort is the right pick if you implement better with peer
                pressure than alone. You want a deadline, a cadence, and a
                room of operators going through the same modules at the same
                time. The 8 weeks structure the work.
              </p>
              <p>
                You also want Della and Alex live for the harder questions,
                the ones that don&rsquo;t fit in a video. Cohort gets that.
                Self-paced doesn&rsquo;t.
              </p>
              <p className="text-warm-gold font-semibold">
                Most students who buy any tier pick Cohort. It&rsquo;s the best
                value-per-dollar entry point if you can clear 8 weeks of
                Tuesday and Thursday evenings.
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
            Founding pricing: the first 100 cohort students get $2,497. Then it
            moves to $3,497. The cohort cap per cycle is set so the room stays
            useful. When a cycle fills, the next one opens.
          </p>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
