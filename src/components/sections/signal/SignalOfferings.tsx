import AnimatedSection, { AnimatedDiv, AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Offer {
  name: string;
  price: string;
  desc: string;
}

interface Tier {
  layer: string;
  name: string;
  price: string;
  timeline: string;
  desc: string;
  offers?: Offer[];
  more?: string;
}

const TIERS: Tier[] = [
  {
    layer: "Layer One",
    name: "Quick Wins",
    price: "$1,500 to $4,500",
    timeline: "1 to 2 weeks",
    desc: "Productized one-shots that solve a single specific problem. Designed to produce a tangible artifact in under two weeks. Every Quick Win includes the 30-day money-back guarantee.",
    offers: [
      {
        name: "AI Visibility Audit + AEO Foundation",
        price: "$2,500",
        desc: "The flagship Quick Win. See where your property appears across ChatGPT, Perplexity, Gemini, and Google AI Mode. Fix the structural gaps that keep you invisible.",
      },
      {
        name: "MCP Readiness Package",
        price: "$3,500",
        desc: "Prepare your property to be bookable inside ChatGPT via the Model Context Protocol. First-mover positioning.",
      },
      {
        name: "Luxury Brand Voice AI Pack",
        price: "$1,500",
        desc: "Calibrate every AI touchpoint to your specific brand voice. Review responses, chatbot, email templates, voice scripts.",
      },
    ],
    more: "+ 5 more Quick Wins. See the full menu on your discovery call.",
  },
  {
    layer: "Layer Two",
    name: "30-Day Sprints",
    price: "$5,000 to $10,000",
    timeline: "30 days",
    desc: "Fixed-scope implementations with outcome-tied guarantees. Each sprint produces a measurable lift against a KPI defined at kickoff.",
    offers: [
      {
        name: "AI Direct Booking Accelerator",
        price: "$8,500",
        desc: "The flagship Sprint. AEO + MCP + AI concierge widget + direct booking email engine. 90-day measurable lift.",
      },
      {
        name: "AI Operations Automation Sprint",
        price: "$6,500",
        desc: "Build 3 to 5 custom workflow automations for recurring hotel operations. Delivered with Loom walkthroughs and support.",
      },
      {
        name: "Voice AI Deployment Sprint",
        price: "$9,500",
        desc: "A luxury-tuned AI voice agent for your main line, integrated with your PMS for live availability and rate quotes.",
      },
    ],
  },
  {
    layer: "Layer Three",
    name: "Monthly Retainers",
    price: "$2,000 to $10,000 per month",
    timeline: "Ongoing",
    desc: "Compounding services with 60-day performance review and clean 90-day exit clauses. Retainers are where Signal becomes part of the operating rhythm.",
    offers: [
      {
        name: "Signal Visibility Retainer",
        price: "$2,000 to $3,500/mo",
        desc: "Monthly AEO and GEO optimization. Citation tracking across five AI engines. Content and schema updates monthly.",
      },
      {
        name: "Visibility + Revenue Retainer",
        price: "$4,500 to $6,500/mo",
        desc: "Everything above plus direct booking optimization, AI review management, monthly revenue attribution reporting.",
      },
      {
        name: "Revenue Integrity Monitor",
        price: "$1,500/mo",
        desc: "Weekly rate parity scans. Monthly OTA commission audit. Quarterly rate leakage reports. The retainer that pays for itself.",
      },
    ],
  },
];

const CUSTOM = {
  layer: "Layer Four",
  name: "Custom Builds",
  price: "$5,000 to $20,000+",
  desc: "Bespoke AI agents, custom automations, and MCP integrations for properties with specific needs that don't fit a productized layer. Hybrid revenue-share options available on builds that generate directly attributable revenue.",
};

const BAND_BG = ["bg-light-gray/40", "bg-off-white", "bg-light-gray/40"];

export default function SignalOfferings() {
  return (
    <section id="offerings">
      <AnimatedSection theme="light" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <AnimatedItem>
              <SectionLabel>The Offerings</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-near-black leading-[1.05] tracking-tight">
                Start small.
                <br />
                Expand only if it works.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <div className="w-16 h-px bg-warm-gold mt-6" />
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-display italic text-xl md:text-2xl text-charcoal/70 leading-snug mt-6">
                Four engagement layers. Priced for staged commitment. Most clients begin
                with a Quick Win and expand as results compound.
              </p>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedSection>

      {TIERS.map((tier, i) => (
        <AnimatedSection
          key={tier.name}
          theme="none"
          className={`${BAND_BG[i]} py-16 md:py-24`}
        >
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-10 lg:gap-16">
            <AnimatedItem>
              <div>
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-primary-green mb-4">
                  {tier.layer}
                </p>
                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black leading-tight mb-5">
                  {tier.name}
                </h3>
                <p className="font-sans text-sm text-charcoal/70 mb-1">
                  <span className="font-semibold text-near-black">Price range:</span>{" "}
                  {tier.price}
                </p>
                <p className="font-sans text-sm text-charcoal/70">
                  <span className="font-semibold text-near-black">Timeline:</span>{" "}
                  {tier.timeline}
                </p>
                <div className="w-12 h-px bg-warm-gold my-5" />
                <p className="font-sans text-base text-charcoal/80 leading-relaxed max-w-sm">
                  {tier.desc}
                </p>
              </div>
            </AnimatedItem>

            <AnimatedDiv stagger>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {tier.offers!.map((o) => (
                  <AnimatedItem key={o.name}>
                    <article className="bg-white border border-light-gray p-6 h-full transition-all duration-300 hover:border-terracotta hover:-translate-y-0.5 hover:shadow-md">
                      <h4 className="font-display text-xl md:text-2xl font-semibold text-near-black leading-tight mb-2">
                        {o.name}
                      </h4>
                      <p className="font-sans text-sm font-semibold tracking-wide text-terracotta mb-3">
                        {o.price}
                      </p>
                      <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                        {o.desc}
                      </p>
                    </article>
                  </AnimatedItem>
                ))}
              </div>
              {tier.more && (
                <AnimatedItem>
                  <a
                    href="/book"
                    className="font-display italic text-base text-primary-green hover:text-primary-green-dark transition-colors mt-6 inline-block"
                  >
                    {tier.more}
                  </a>
                </AnimatedItem>
              )}
            </AnimatedDiv>
          </div>
        </AnimatedSection>
      ))}

      {/* Layer Four: Custom Builds, dark band, centered */}
      <AnimatedSection theme="dark" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <AnimatedItem>
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
              {CUSTOM.layer}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              {CUSTOM.name}
            </h3>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-sm text-white/70 mb-2">
              <span className="font-semibold text-white">Price range:</span>{" "}
              {CUSTOM.price}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-white/80 leading-relaxed mt-6 max-w-2xl mx-auto">
              {CUSTOM.desc}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <a
              href="/book"
              className="font-sans text-sm font-medium text-warm-gold hover:text-white border-b border-warm-gold/60 hover:border-white pb-1 mt-8 inline-block transition-colors"
            >
              Discuss a custom build &rarr;
            </a>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
