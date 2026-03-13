import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { PILLARS } from "@/lib/constants";

export default function ThreePillarsSection() {
  return (
    <AnimatedSection theme="dark" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel light>What We Do</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
              Three Pillars. One Goal:{" "}
              <span className="text-warm-gold italic">Profitable Growth.</span>
            </h2>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {PILLARS.map((pillar, i) => (
            <AnimatedItem key={i}>
              <div className="border border-white/10 rounded-lg p-8 h-full hover:border-primary-green/50 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-8 h-px bg-warm-gold/50 mb-6" />
                <h3 className="font-display text-2xl font-semibold text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="font-sans text-white/70 mb-6 leading-relaxed">
                  {pillar.tagline}
                </p>
                <ul className="space-y-2 mb-8">
                  {pillar.points.map((point, j) => (
                    <li
                      key={j}
                      className="font-sans text-sm text-white/60 flex items-start gap-2"
                    >
                      <span className="text-primary-green mt-1 flex-shrink-0">
                        →
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                {pillar.stat && (
                  <p className="font-sans text-sm text-warm-gold/80 italic border-t border-white/10 pt-6">
                    {pillar.stat}
                  </p>
                )}
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
