import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { liveResourceTools } from "@/lib/resources/registry";
import type { ResourceCategory } from "@/lib/resources/registry";

// Generalized from CoLivingResources. The top of the funnel and the identity
// moment in one: every tool sits behind the shared email gate, so one address
// unlocks the whole library, and that unlock is where an anonymous visitor
// becomes a known person (see ResourceGate + lib/posthog-identity).
//
// The list is read from the registry rather than hardcoded, so adding a tool
// there makes it appear here with no edit to this file.
//
// Fleet and boutique have no tools registered yet. Rather than render an empty
// grid, the section falls back to `emptyState` — an honest "being built" note
// that still captures intent by pointing at the co-living library. Delete
// nothing when tools land; they simply start appearing.
//
// Only the first six render, matching CoLivingResources. The button carries the
// real total so the cap is never silent.
const PREVIEW_COUNT = 6;

interface OfferingResourcesProps {
  category: ResourceCategory;
  label: string;
  headline: string;
  intro: string;
  emptyState: { headline: string; body: string };
}

export default function OfferingResources({
  category,
  label,
  headline,
  intro,
  emptyState,
}: OfferingResourcesProps) {
  const allTools = liveResourceTools(category);
  const tools = allTools.slice(0, PREVIEW_COUNT);

  return (
    <AnimatedSection
      theme="none"
      className="bg-(--lane-wash,var(--color-off-white)) text-charcoal py-16 md:py-24 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-14">
          <AnimatedItem>
            <SectionLabel>{label}</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              {headline}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal leading-snug">
              {intro}
            </p>
          </AnimatedItem>
        </div>

        {tools.length > 0 ? (
          <>
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
          </>
        ) : (
          <AnimatedItem>
            <div className="max-w-3xl bg-white border-t-2 border-(--lane-accent,var(--color-warm-gold)) rounded-sm p-8 md:p-10">
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                {emptyState.headline}
              </h3>
              <p className="font-sans text-base md:text-lg text-charcoal/85 leading-snug mb-7">
                {emptyState.body}
              </p>
              <Button href="/resources" variant="secondary" size="md">
                Browse the Current Library
              </Button>
            </div>
          </AnimatedItem>
        )}
      </div>
    </AnimatedSection>
  );
}
