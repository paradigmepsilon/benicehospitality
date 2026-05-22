import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Pillar {
  number: string;
  title: string;
  body: string;
  details: string[];
}

const PILLARS: Pillar[] = [
  {
    number: "01",
    title: "Operate Like a Business",
    body: "Systems, SOPs, and workflows that survive any tool change. The operating layer that exists whether you use Hospitable, Lodgify, or anything else.",
    details: [
      "A documented operating system",
      "Roles, hiring, and accountability frameworks",
      "Reporting cadences you trust without auditing",
    ],
  },
  {
    number: "02",
    title: "Automate With Intelligence",
    body: "AI integration that does not gut the guest experience. Real workflows, not chatbot wrappers around a half-baked PMS.",
    details: [
      "Messaging that reads like you wrote it",
      "Pricing logic that respects your margin",
      "Operations automation tied to outcomes",
    ],
  },
  {
    number: "03",
    title: "Own Your Guests",
    body: "The Return Guest Framework and the direct booking conversion engine. Turn OTA discovery into long-term relationships you control.",
    details: [
      "A direct booking site that converts on the basics",
      "Email capture and a follow-up sequence that runs without you",
      "A repeat-guest framework that earns the second stay",
    ],
  },
];

/**
 * The methodology spine on the About page. Anchor target for /about#pillars in
 * the primary nav. Same shape as the homepage's pillars section but tuned for
 * the deeper About context.
 */
export default function AboutPillars() {
  return (
    <AnimatedSection id="pillars" theme="dark" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel light>The Three Pillars</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white mt-4 leading-tight">
              The method, in three pillars.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-white/70 mt-4 leading-relaxed">
              Every course, every advisory engagement, every Signal sprint, every Labs tool maps back to these. They are how we think and how we work.
            </p>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {PILLARS.map((p) => (
            <AnimatedItem key={p.title}>
              <div className="border-t-2 border-warm-gold pt-5">
                <p className="font-display text-warm-gold text-sm font-semibold mb-2">{p.number}</p>
                <h3 className="font-display text-2xl font-semibold text-white mb-3 leading-tight">
                  {p.title}
                </h3>
                <p className="font-sans text-base text-white/75 mb-5 leading-relaxed">{p.body}</p>
                <ul className="space-y-2">
                  {p.details.map((d) => (
                    <li
                      key={d}
                      className="font-sans text-sm text-white/60 flex gap-2 leading-relaxed"
                    >
                      <span className="text-warm-gold mt-0.5">›</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
