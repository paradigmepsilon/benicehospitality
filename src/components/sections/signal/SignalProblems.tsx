import AnimatedSection, { AnimatedDiv, AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

const PROBLEMS = [
  {
    num: "01",
    title: "Eliminate manual, repetitive work.",
    body: [
      "The owner or GM is doing work a trained freshman could do if the process were written down. Responding to routine emails. Drafting the same kinds of review responses every week. Copy-pasting data from the PMS into a weekly report.",
      "Signal builds custom AI agents and automations that turn these tasks into background operations. Typical recovery: 6 to 12 hours of owner time per week.",
    ],
    related:
      "AI Review Response Launch · Custom AI Assistant · AI Operations Automation Sprint · Custom Build Retainer",
  },
  {
    num: "02",
    title: "Compliance and revenue-critical work.",
    body: [
      "The work where a mistake is expensive, but the work itself is tedious. Rate parity monitoring across OTAs. Commission reconciliation. TCPA and A2P 10DLC compliance on SMS. ADA website compliance.",
      "Signal runs this continuously on AI. Typical boutique properties recover 2 to 5% of OTA commissions paid through the commission audit alone, which usually covers the full retainer cost.",
    ],
    related:
      "Compliance Readiness Audit · Revenue Integrity Monitor · Voice AI Deployment Sprint",
  },
  {
    num: "03",
    title: "Fix outdated software without replacing it.",
    body: [
      "Most boutique hotels run some mix of a 2015-era PMS, a booking engine from a different vendor, and an email tool from a third. Ripping it out costs more than most owners can absorb.",
      "Signal wraps existing software rather than replacing it. A Claude-powered agent reads the PMS daily and produces the unified report you've been promised for years, without touching the underlying stack.",
    ],
    related: "AI Guest Intelligence Sprint · Custom AI Assistant · MCP Readiness Package",
  },
  {
    num: "04",
    title: "Connect disconnected systems.",
    body: [
      "91% of hoteliers still do manual reporting even when their underlying systems are automated. Only 11% have a fully integrated stack. Data lives in the PMS, booking engine, CRM, reviews, and accounting, and none of them speak the same language.",
      "Signal is the connective tissue. One layer of AI-readable intelligence across everything you already have, without a migration project.",
    ],
    related:
      "AI Guest Intelligence Sprint · AI Operations Automation Sprint · Signal Full Stack Retainer",
  },
  {
    num: "05",
    title: "Do what was previously impossible.",
    body: [
      "AEO citation monitoring across five AI engines. Real-time competitor rate and review intelligence. A voice agent that sounds like a luxury concierge instead of a robot. Getting bookable inside ChatGPT via MCP.",
      "These are things your property could not do twelve months ago at any price. Today they cost four figures a month, which separates the properties that win the next three years from the ones that watch.",
    ],
    related:
      "AI Visibility Audit · MCP Readiness Package · Voice AI Deployment · Signal Visibility Retainer",
  },
];

export default function SignalProblems() {
  return (
    <AnimatedSection theme="off-white" className="py-20 md:py-28" id="problems">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <AnimatedItem>
            <SectionLabel>What Signal Solves</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-near-black leading-[1.05] tracking-tight">
              Five kinds of work.
              <br />
              One operating partner.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="w-16 h-px bg-warm-gold mt-6" />
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-display italic text-xl md:text-2xl text-charcoal/70 leading-snug mt-6 max-w-2xl">
              Luxury boutique owners don&apos;t shop for AI. They shop for time back,
              risk removed, and revenue recovered. Here is how Signal contributes to
              each.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv stagger className="flex flex-col">
          {PROBLEMS.map((p, i) => (
            <AnimatedItem key={p.num}>
              <article
                className={[
                  "group grid grid-cols-[80px_1fr] md:grid-cols-[160px_1fr] gap-6 md:gap-12",
                  "py-10 md:py-14 relative",
                  i !== PROBLEMS.length - 1 ? "border-b border-light-gray" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="font-display font-light text-6xl md:text-8xl lg:text-9xl text-near-black leading-none transition-colors duration-300 group-hover:text-terracotta">
                  {p.num}
                </div>

                <div>
                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-near-black leading-tight mb-4">
                    {p.title}
                  </h3>
                  {p.body.map((para, idx) => (
                    <p
                      key={idx}
                      className="font-sans text-base md:text-lg text-charcoal/80 leading-relaxed mb-4"
                    >
                      {para}
                    </p>
                  ))}
                  <p className="font-sans text-xs tracking-[0.2em] uppercase font-semibold text-primary-green mt-6 mb-2">
                    Related Offerings
                  </p>
                  <p className="font-display italic text-base text-charcoal/70 leading-relaxed">
                    {p.related}
                  </p>
                </div>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
