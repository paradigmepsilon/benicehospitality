import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Step {
  step: string;
  body: string;
}

const STEPS: Step[] = [
  {
    step: "Learn free",
    body: "Start with the calculators, checklists, and guides in the resource library. No email required for most of them.",
  },
  {
    step: "Train",
    body: "Room Rental Riches or Car Rental Riches, self-paced or live, taught by the operators who run both businesses.",
  },
  {
    step: "Hand it off",
    body: "When you would rather not run it yourself, apply for management and BNHG takes the day-to-day.",
  },
];

/**
 * The ladder's transparency line. Verbatim from the repositioning brief;
 * do not paraphrase it away.
 */
const TRANSPARENCY_LINE =
  "You can run this yourself with our course. If you would rather not, we do.";

export default function LadderSection() {
  return (
    <AnimatedSection theme="off-white" className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-14">
          <AnimatedItem>
            <SectionLabel>How the ladder works</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              Learn free. Train. Hand it off.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg italic text-charcoal leading-snug">
              {TRANSPARENCY_LINE}
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10"
        >
          {STEPS.map((s, i) => (
            <AnimatedItem key={s.step}>
              <article className="border-l-2 border-warm-gold pl-6 h-full">
                <p
                  aria-hidden="true"
                  className="font-display italic text-3xl text-warm-gold leading-none mb-4"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-3">
                  {s.step}
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug">
                  {s.body}
                </p>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
