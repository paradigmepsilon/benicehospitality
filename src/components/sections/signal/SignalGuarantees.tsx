import AnimatedSection, { AnimatedDiv, AnimatedItem } from "@/components/ui/AnimatedSection";

const CARDS = [
  {
    eyebrow: "Quick Wins",
    title: "30-day money-back.",
    body: "If the promised asset does not ship on time or to spec, full refund. No conversation required. We wear the risk of timely delivery so you can run a Quick Win without a committee.",
    fine: "Applies to all productized engagements under $5,000.",
  },
  {
    eyebrow: "30-Day Sprints",
    title: "Outcome-tied continuation.",
    body: "Each sprint has a specific KPI defined at kickoff. If the KPI is not hit within 60 days of delivery, we continue working at no additional cost for up to 30 days until it is. You pay once. We work until the target is met.",
    fine: "KPIs defined jointly at kickoff. Client responsibilities documented.",
  },
  {
    eyebrow: "Monthly Retainers",
    title: "60-day performance review.",
    body: "Every retainer includes a 60-day review checkpoint and a 90-day clean-exit clause. If either party is not getting value at 60 days, clean break. No penalties, no pro-rations, no guilt.",
    fine: "Month-to-month after the initial 90-day term.",
  },
];

export default function SignalGuarantees() {
  return (
    <AnimatedSection theme="none" className="bg-terracotta text-white py-20 md:py-28" id="guarantees">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <AnimatedItem>
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
              Risk Reversal
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight">
              Built around Guarantees,
              <br />
              <span className="italic font-normal text-white/65 text-3xl md:text-4xl lg:text-5xl">
                not promises.
              </span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="w-16 h-px bg-warm-gold mt-6" />
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-8 max-w-2xl space-y-5">
              <p className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-snug">
                Every engagement at Signal includes a specific, written guarantee.
              </p>
              <p className="font-sans text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-warm-gold">
                This is not marketing language.
              </p>
              <p className="font-display italic font-normal text-xl md:text-2xl text-white/85 leading-snug">
                This is how we price risk fairly for owners who have been burned before.
              </p>
            </div>
          </AnimatedItem>
        </div>

        <AnimatedDiv stagger className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {CARDS.map((c) => (
            <AnimatedItem key={c.title}>
              <article className="bg-off-white border-t-2 border-warm-gold p-8 md:p-10 h-full transition-shadow duration-300 hover:shadow-2xl">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-terracotta mb-5">
                  {c.eyebrow}
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-near-black leading-tight mb-5">
                  {c.title}
                </h3>
                <p className="font-sans text-base text-charcoal/80 leading-relaxed mb-6">
                  {c.body}
                </p>
                <p className="font-display italic text-sm text-charcoal/60 leading-relaxed">
                  {c.fine}
                </p>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <p className="font-display italic text-xl md:text-2xl text-white/90 max-w-2xl mx-auto text-center leading-snug">
            If this language reads more cautiously than a typical agency pitch, that is
            intentional.
          </p>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
