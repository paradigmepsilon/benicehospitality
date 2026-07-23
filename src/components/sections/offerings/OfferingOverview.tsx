import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

// Generalized from CoLivingOverview. Sits directly beneath the hero on every
// door page and answers "what IS this" in about sixty seconds before asking
// anyone for anything. Three mechanics, then an operator's-take callout.

export interface OverviewMechanic {
  /** Roman numeral, i / ii / iii. Decorative. */
  numeral: string;
  heading: string;
  body: string;
}

interface OfferingOverviewProps {
  label: string;
  headline: string;
  intro: string;
  mechanics: OverviewMechanic[];
  /** The "<name>'s take" callout: an honest disqualifier, not a pitch. */
  take?: { label: string; body: string };
}

export default function OfferingOverview({
  label,
  headline,
  intro,
  mechanics,
  take,
}: OfferingOverviewProps) {
  return (
    <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14 md:mb-16">
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

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12"
        >
          {mechanics.map((m) => (
            <AnimatedItem key={m.heading}>
              <article className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6 md:pl-7 h-full">
                <p
                  aria-hidden="true"
                  className="font-display italic text-3xl text-(--lane-accent,var(--color-warm-gold)) leading-none mb-4"
                >
                  {m.numeral}
                </p>
                <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight mb-4">
                  {m.heading}
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug">
                  {m.body}
                </p>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        {take && (
          <AnimatedItem>
            <div className="mt-14 md:mt-16 max-w-3xl bg-off-white border-t-2 border-(--lane-accent,var(--color-warm-gold)) p-8 md:p-10">
              <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-4">
                {take.label}
              </p>
              <p className="font-display italic text-xl md:text-2xl text-deep-teal leading-snug">
                {take.body}
              </p>
            </div>
          </AnimatedItem>
        )}
      </div>
    </AnimatedSection>
  );
}
