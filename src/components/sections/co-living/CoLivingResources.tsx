import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { liveResourceTools } from "@/lib/resources/registry";

// The top of the funnel and the identity moment in one. Every tool here sits
// behind the shared email gate, so one address unlocks the whole library — and
// that unlock is where an anonymous visitor from Della's bio page becomes a
// known person (see ResourceGate + lib/posthog-identity).
//
// The list is read from the registry rather than hardcoded, so adding a tool
// there makes it appear here with no edit to this file.

export default function CoLivingResources() {
  const tools = liveResourceTools("property");

  return (
    <AnimatedSection theme="off-white" className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-14">
          <AnimatedItem>
            <SectionLabel>Free, no catch</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              The tools I actually use.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal leading-snug">
              These are the same spreadsheets and checklists I run my own
              portfolio on, rebuilt so they work in a browser. One email
              unlocks all of them. No drip sequence designed to wear you down.
            </p>
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
                Co-living Property Calculator
              </h3>
              <p className="font-sans text-base md:text-lg text-white/85 leading-snug mb-7">
                Forty weighted questions across seven sections. Score any
                property in under ten minutes and get a plain-language fix list
                for every gap you flag. Built for co-living specifically, not
                generic short-term rental scoring.
              </p>
              <Button
                href="/resources/co-living-property-calculator"
                variant="primary"
                size="lg"
              >
                Score Your Property
              </Button>
            </div>
            <ul className="space-y-3">
              {[
                "Seven operator sections, forty weighted questions",
                "A score you can act on in ten minutes",
                "A fix list written the way I would say it",
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

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {tools.map((tool) => (
            <AnimatedItem key={tool.slug}>
              <Link
                href={`/resources/${tool.slug}`}
                className="group block h-full bg-white border border-charcoal/10 rounded-sm p-7 hover:border-warm-gold transition-colors duration-200"
              >
                <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-warm-gold mb-3">
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
            <Button href="/resources" variant="secondary" size="md">
              See the Full Library
            </Button>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
