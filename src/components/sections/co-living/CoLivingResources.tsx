import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { liveResourceTools } from "@/lib/resources/registry";
import {
  SCORECARD_QUESTION_COUNT,
  SCORECARD_SECTIONS,
} from "@/lib/scorecard/questions";

// The top of the funnel and the identity moment in one. Every tool here sits
// behind the shared email gate, so one address unlocks the whole library — and
// that unlock is where an anonymous visitor from Della's bio page becomes a
// known person (see ResourceGate + lib/posthog-identity).
//
// The list is read from the registry rather than hardcoded, so adding a tool
// there makes it appear here with no edit to this file.
//
// Only the first six are shown. The full library is twenty-plus tools, which
// buried the rest of the page in a wall of identical cards; six is two clean
// rows at the lg breakpoint. The button carries the real total so the cap is
// never silent — a visitor can see there is more behind it.
const PREVIEW_COUNT = 6;

export default function CoLivingResources() {
  const allTools = liveResourceTools("property");
  const tools = allTools.slice(0, PREVIEW_COUNT);

  return (
    // id is the hero's "Explore Free Resources" anchor target.
    <AnimatedSection
      id="free-resources"
      theme="none"
      className="bg-(--lane-wash,var(--color-off-white)) text-charcoal py-12 md:py-16 px-6 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-14">
          <AnimatedItem>
            <SectionLabel>Free, no catch</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              Explore Our Free Resources
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-lg text-charcoal leading-snug space-y-4">
              <p>
                Start with our free calculators, templates, and checklists to
                evaluate properties, estimate your numbers, and identify
                opportunities before making your next move.
              </p>
              <p>
                They are the same resources we use across our own portfolio.
              </p>
            </div>
          </AnimatedItem>
        </div>

        {/* Featured: the qualifier. Everything else is a supporting tool, but
            this one tells someone whether they should be here at all. */}
        <AnimatedItem>
          <div className="bg-deep-teal text-white rounded-sm p-8 md:p-12 mb-10 md:mb-12 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-center">
            <div>
              <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                Start with this one
              </p>
              <h3 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-5">
                Co-living Viability Calculator
              </h3>
              <p className="font-sans text-base md:text-lg text-white/85 leading-snug mb-7">
                {SCORECARD_QUESTION_COUNT} weighted questions across{" "}
                {SCORECARD_SECTIONS.length} sections. Score any property in
                under ten minutes and get a plain-language fix list for every
                gap you flag. Built for room rentals specifically, not generic
                short-term rental scoring.
              </p>
              <Button
                href="/resources/co-living-viability-calculator"
                variant="primary"
                size="lg"
              >
                Score Your Property
              </Button>
            </div>
            <ul className="space-y-3">
              {[
                `${SCORECARD_SECTIONS.length} operator sections, ${SCORECARD_QUESTION_COUNT} weighted questions`,
                "A score you can act on in ten minutes",
                "A fix list written in plain language",
                "Works before you own a single door",
              ].map((point) => (
                <li
                  key={point}
                  className="font-sans text-sm text-white/80 flex items-start gap-3"
                >
                  <span aria-hidden="true" className="text-warm-gold mt-0.5">
                    →
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </AnimatedItem>

        <AnimatedItem>
          <p className="font-sans text-base md:text-lg text-charcoal/85 leading-snug max-w-3xl mb-10 md:mb-12">
            Every resource in this library is designed to help you launch,
            operate, and improve a room rental business with greater confidence
            and fewer costly mistakes.
          </p>
        </AnimatedItem>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {tools.map((tool) => (
            <AnimatedItem key={tool.slug}>
              <Link
                href={`/resources/${tool.slug}`}
                className="group relative block h-full overflow-hidden bg-white border border-charcoal/10 rounded-sm p-7 hover:border-(--lane-accent,var(--color-warm-gold)) transition-colors duration-200"
              >
                {/* The keyline: the carousel's color block cropped to 3px. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.75 bg-(--lane-accent,var(--color-warm-gold)) opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200"
                />
                <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-3">
                  {tool.archetype}
                </p>
                <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-3 group-hover:text-primary-green-dark transition-colors">
                  {tool.name}
                </h3>
                <p className="font-sans text-sm text-charcoal/80 leading-snug">
                  {tool.blurb}
                </p>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <div className="mt-12 text-center">
            <Button href="/resources" variant="secondary" size="lg">
              See All {allTools.length} Tools
            </Button>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
