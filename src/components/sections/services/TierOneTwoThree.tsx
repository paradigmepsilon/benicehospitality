import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import {
  TIER_ONE_SERVICES,
  TIER_TWO_SERVICES,
  TIER_THREE_SERVICES,
} from "@/lib/constants";

export default function TierOneTwoThree() {
  return (
    <>
      {/* Tier 1 */}
      <AnimatedSection theme="dark" className="py-24 px-6" id="tier-1">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedItem>
              <div className="inline-block bg-primary-green/20 text-primary-green text-sm font-semibold tracking-widest uppercase px-4 py-1.5 mb-4 font-sans">
                Tier 1: Diagnostics
              </div>
            </AnimatedItem>
            <AnimatedItem>
              <SectionLabel light>See the Opportunity Clearly</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
                See Exactly Where the{" "}
                <span className="text-warm-gold italic">
                  Opportunities Are
                </span>
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-white/60 max-w-xl mx-auto">
                A focused audit that gives you enough specificity to act,
                not a vague report you&apos;ll file and forget.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {TIER_ONE_SERVICES.map((service, i) => (
              <AnimatedItem key={i}>
                <div className="border border-white/10 rounded-lg p-5 sm:p-6 md:p-8 h-full hover:border-primary-green/40 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
                    <h3 className="font-display text-xl font-semibold text-white leading-snug">
                      {service.name}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <p className="font-sans text-xs text-white/40">
                        {service.timeline}
                      </p>
                    </div>
                  </div>
                  <p className="font-sans text-sm text-white/65 leading-relaxed mb-5">
                    {service.description}
                  </p>
                  <div className="border-t border-white/10 pt-5">
                    <p className="font-sans text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">
                      Deliverables
                    </p>
                    <ul className="space-y-2">
                      {service.deliverables.map((d, j) => (
                        <li
                          key={j}
                          className="font-sans text-sm text-white/55 flex items-start gap-2"
                        >
                          <span className="text-primary-green mt-0.5 flex-shrink-0">
                            ✓
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      {/* Tier 2 */}
      <AnimatedSection theme="light" className="py-24 px-6" id="tier-2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedItem>
              <div className="inline-block bg-warm-gold/15 text-warm-gold-dark text-sm font-semibold tracking-widest uppercase px-4 py-1.5 mb-4 font-sans">
                Tier 2: Implementation
              </div>
            </AnimatedItem>
            <AnimatedItem>
              <SectionLabel>Where Transformation Happens</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-near-black leading-tight mb-4">
                We Don&apos;t Just Advise.{" "}
                <span className="text-primary-green italic">We Build.</span>
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-charcoal/70 max-w-xl mx-auto">
                Every implementation engagement is scoped to deliver a
                measurable ROI that exceeds 3x the consulting fee within 12
                months.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TIER_TWO_SERVICES.map((service, i) => (
              <AnimatedItem key={i}>
                <div className="bg-off-white border border-light-gray rounded-lg p-5 sm:p-7 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <h3 className="font-display text-xl font-semibold text-near-black leading-snug">
                      {service.name}
                    </h3>
                    <span className="font-sans text-xs text-charcoal/50 bg-white border border-light-gray px-2 py-1 flex-shrink-0 whitespace-nowrap">
                      {service.timeline}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed mb-5">
                    {service.description}
                  </p>
                  <div className="border-t border-light-gray pt-5">
                    <p className="font-sans text-xs text-charcoal/40 uppercase tracking-widest mb-3 font-semibold">
                      Included
                    </p>
                    <ul className="space-y-2">
                      {service.deliverables.map((d, j) => (
                        <li
                          key={j}
                          className="font-sans text-sm text-charcoal/65 flex items-start gap-2"
                        >
                          <span className="text-primary-green mt-0.5 flex-shrink-0">
                            →
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      {/* Tier 3 */}
      <AnimatedSection theme="dark" className="py-24 px-6" id="tier-3">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedItem>
              <div className="inline-block bg-white/10 text-white text-sm font-semibold tracking-widest uppercase px-4 py-1.5 mb-4 font-sans">
                Tier 3: Fractional Advisory
              </div>
            </AnimatedItem>
            <AnimatedItem>
              <SectionLabel light>Ongoing Partnership</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
                Your Commercial Director,{" "}
                <span className="text-warm-gold italic">
                  Without the Full-Time Salary
                </span>
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-white/60 max-w-xl mx-auto">
                This is where relationships deepen and results compound. An
                ongoing strategic partner embedded in your operation on a
                monthly retainer.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {TIER_THREE_SERVICES.map((service, i) => (
              <AnimatedItem key={i}>
                <div className="border border-white/10 rounded-lg p-5 sm:p-6 md:p-8 h-full hover:border-warm-gold/40 transition-all duration-300 hover:-translate-y-1">
                  <h3 className="font-display text-2xl font-semibold text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="font-sans text-sm text-warm-gold/80 font-semibold mb-5">
                    {service.hours}/month
                  </p>
                  <p className="font-sans text-sm text-white/65 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="border-t border-white/10 pt-6">
                    <ul className="space-y-2">
                      {service.includes.map((item, j) => (
                        <li
                          key={j}
                          className="font-sans text-sm text-white/50 flex items-start gap-2"
                        >
                          <span className="text-warm-gold mt-0.5 flex-shrink-0">
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          <AnimatedItem>
            <p className="text-center font-sans text-white/50 italic text-sm max-w-lg mx-auto">
              Retainer pricing is customized based on property size and scope.
              All Tier 3 engagements begin with a Discovery Call.
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}
