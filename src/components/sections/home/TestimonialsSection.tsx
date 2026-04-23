import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { TESTIMONIALS } from "@/lib/constants";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

export default function TestimonialsSection() {
  return (
    <AnimatedSection theme="off-white" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel>Social Proof</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-4 leading-tight">
              What Hotel Owners Are Saying
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-sm text-charcoal/50 italic">
              Representative of the results our clients experience.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((t, i) => (
            <AnimatedItem key={i}>
              <div className="bg-white border border-light-gray rounded-lg p-8 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                {/* Quote mark */}
                <div
                  className="font-display text-6xl text-primary-green/20 leading-none mb-4"
                  aria-hidden="true"
                >
                  &ldquo;
                </div>
                <blockquote className="font-sans text-charcoal leading-relaxed flex-1 mb-8 text-base">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-4 border-t border-light-gray pt-6">
                  <div
                    className="relative w-12 h-12 shrink-0 rounded-full bg-primary-green/10 text-primary-green flex items-center justify-center font-sans font-semibold text-sm"
                    aria-hidden="true"
                  >
                    {getInitials(t.author)}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-near-black text-sm">
                      {t.author}
                    </p>
                    <p className="font-sans text-xs text-charcoal/60">
                      {t.title}
                    </p>
                    <p className="font-sans text-xs text-primary-green">
                      {t.property}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
