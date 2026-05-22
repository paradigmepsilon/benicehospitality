import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import { PILLARS } from "@/lib/constants";

export default function ThreePillarsSection() {
  return (
    <AnimatedSection theme="light" className="pt-6 md:pt-8 pb-6 md:pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20 max-w-3xl mx-auto">
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight">
              Top 3 things that separate operators from hosts
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div
              aria-hidden
              className="mx-auto mt-6 h-px w-16 bg-warm-gold"
            />
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 lg:gap-14"
        >
          {PILLARS.map((pillar, i) => (
            <AnimatedItem key={pillar.title}>
              <article className="border-l-2 border-warm-gold pl-6 md:pl-8">
                <p
                  aria-hidden="true"
                  className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  {pillar.title}
                </h3>
                <p className="font-sans text-base italic text-charcoal/80 leading-relaxed mb-4">
                  {pillar.tagline}
                </p>
                {pillar.body && (
                  <p className="font-sans text-base text-charcoal leading-relaxed">
                    {pillar.body}
                  </p>
                )}
              </article>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
