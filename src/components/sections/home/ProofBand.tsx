import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import { OPERATING_PROOF } from "@/lib/constants";

/**
 * Real operating figures only: units managed, vehicles managed, cities,
 * years operating. `OPERATING_PROOF` in src/lib/constants.ts ships empty on
 * purpose, since Alex has not supplied these numbers yet. Rendering nothing
 * is correct until he does; the retired consulting-era METRICS values
 * (direct-booking lift, ancillary revenue, staff hours saved) describe a
 * business BNHG no longer runs and must never substitute here.
 */
export default function ProofBand() {
  if (OPERATING_PROOF.length === 0) return null;

  return (
    <AnimatedSection theme="off-white" className="py-12 md:py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="border-y border-warm-gold/30 py-8 md:py-10">
          <AnimatedDiv
            stagger
            className="flex flex-col sm:flex-row sm:divide-x sm:divide-warm-gold/30"
          >
            {OPERATING_PROOF.map((stat) => (
              <AnimatedItem key={stat.label} className="flex-1 text-center px-4 py-4 sm:py-2">
                <p className="font-display text-3xl md:text-4xl font-semibold text-deep-teal mb-1.5 leading-none">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-charcoal/65">
                  {stat.label}
                </p>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </div>
    </AnimatedSection>
  );
}
