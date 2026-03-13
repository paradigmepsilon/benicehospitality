import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { DIFFERENTIATORS } from "@/lib/constants";

export default function Differentiation() {
  return (
    <AnimatedSection theme="dark" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel light>What Makes Us Different</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight">
              Not Another Generic Consultancy
            </h2>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {DIFFERENTIATORS.map((d, i) => (
            <AnimatedItem key={i}>
              <div className="border border-white/10 p-8 h-full hover:border-primary-green/40 transition-all duration-300">
                <div className="w-8 h-px bg-warm-gold/50 mb-6" />
                <h3 className="font-display text-2xl font-semibold text-white mb-4 leading-snug">
                  {d.title}
                </h3>
                <p className="font-sans text-white/65 leading-relaxed">
                  {d.description}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
