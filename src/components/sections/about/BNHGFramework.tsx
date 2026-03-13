import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { FRAMEWORK_PHASES } from "@/lib/constants";

export default function BNHGFramework() {
  return (
    <AnimatedSection theme="off-white" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel>Our Approach</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-4 leading-tight">
              The BNHG Framework
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal/70 max-w-xl mx-auto">
              Every engagement follows the same five-phase methodology,
              adapted to your property&apos;s specific needs.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv stagger className="space-y-0">
          {FRAMEWORK_PHASES.map((phase, i) => (
            <AnimatedItem key={i}>
              <div className="flex items-start gap-8 group">
                {/* Number + Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-14 h-14 bg-near-black text-white flex items-center justify-center font-display text-xl font-semibold group-hover:bg-primary-green transition-colors duration-300">
                    {phase.number}
                  </div>
                  {i < FRAMEWORK_PHASES.length - 1 && (
                    <div className="w-px flex-1 bg-near-black/15 mt-0 h-12" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-10 pt-2">
                  <h3 className="font-display text-2xl font-semibold text-near-black mb-3">
                    {phase.name}
                  </h3>
                  <p className="font-sans text-charcoal/70 leading-relaxed max-w-2xl">
                    {phase.description}
                  </p>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
