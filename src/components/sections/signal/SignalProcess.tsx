import AnimatedSection, { AnimatedDiv, AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

const STEPS = [
  {
    num: "01",
    title: "Discovery call.",
    body: "A 40-minute conversation. No pitch deck. We walk through your situation, your tech stack, and your specific goals. You walk away with a point of view on what would move the needle, whether you hire us or not.",
  },
  {
    num: "02",
    title: "Blueprint.",
    body: "We produce a written plan mapping the specific offerings that fit your property, in what order, on what timeline. Includes pricing and guarantees. Yours to keep regardless.",
  },
  {
    num: "03",
    title: "Starter engagement.",
    body: "Most properties begin with a Quick Win or a single Sprint. Never a retainer first. We earn ongoing work by delivering on a smaller engagement first.",
  },
  {
    num: "04",
    title: "Expansion or clean exit.",
    body: "If the starter engagement produces the outcome, we propose the next step. If it does not, we part as friends. The goal is a long engagement, but only when it is earned.",
  },
];

export default function SignalProcess() {
  return (
    <AnimatedSection theme="off-white" className="py-20 md:py-28" id="how-we-work">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <AnimatedItem>
            <SectionLabel>The Engagement</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-near-black leading-[1.05] tracking-tight">
              How we work.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="w-16 h-px bg-warm-gold mt-6" />
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-display italic text-xl md:text-2xl text-charcoal/70 leading-snug mt-6">
              Four steps. No surprises. Every engagement begins the same way.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {STEPS.map((s) => (
            <AnimatedItem key={s.num}>
              <div>
                <p className="font-display font-light text-6xl md:text-7xl text-terracotta leading-none mb-5">
                  {s.num}
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-near-black leading-tight mb-3">
                  {s.title}
                </h3>
                <p className="font-sans text-sm md:text-base text-charcoal/75 leading-relaxed">
                  {s.body}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
