import AnimatedSection, { AnimatedDiv, AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

const STATS = [
  {
    stat: "2–5%",
    label: "OTA Commissions Recovered",
    desc: "The monthly Revenue Integrity Monitor reconciles every OTA statement against your actual bookings. Properties typically find this much commission has been underpaid or miscalculated.",
  },
  {
    stat: "6–12 hrs",
    label: "Owner Hours Returned Per Week",
    desc: "Custom AI agents take over recurring work: review responses, pre-arrival communication, report generation, guest inquiry triage. Hours back, at a direct staffing cost of zero.",
  },
  {
    stat: "10–20%",
    label: "Direct Bookings Lift",
    desc: "The AI Direct Booking Accelerator combines AEO, MCP readiness, and a tuned AI concierge widget. Target outcome measured against a 90-day baseline.",
  },
  {
    stat: "60 days",
    label: "To Measurable AI Citations",
    desc: "From kickoff on the AI Visibility Audit, 60 days is the outcome window for the first measurable citation in ChatGPT, Perplexity, or Gemini. If we miss it, we work for free until we don't.",
  },
];

export default function SignalPnL() {
  return (
    <AnimatedSection theme="dark" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <AnimatedItem>
            <SectionLabel light>The Bottom Line</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] tracking-tight">
              How Signal shows up
              <br />
              in your P&amp;L.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="w-16 h-px bg-warm-gold mt-6" />
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-display italic text-xl md:text-2xl text-white/75 leading-snug mt-6 max-w-2xl">
              Every Signal engagement maps to a specific line you already track. Not
              hypothetical. Measured.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {STATS.map((s) => (
            <AnimatedItem key={s.label}>
              <div className="border-t border-warm-gold/40 pt-6">
                <p className="font-display font-semibold text-5xl lg:text-6xl text-warm-gold leading-none mb-4 tracking-tight">
                  {s.stat}
                </p>
                <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-white mb-4">
                  {s.label}
                </p>
                <p className="font-sans text-sm text-white/70 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <p className="font-display italic text-xl md:text-2xl text-white/75 max-w-3xl mx-auto text-center leading-snug">
            Every outcome above is anchored by a specific guarantee. See the next
            section.
          </p>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
