import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

const REPORT_PARTS = [
  {
    label: "Overall Score",
    title: "Overall Score & Letter Grade",
    description:
      "A single 0-100 score with a letter grade (A-F) that captures how your property performs across every dimension we evaluate. The headline number you can benchmark against yourself over time.",
  },
  {
    label: "Dimension 01",
    title: "Revenue Opportunity",
    description:
      "Where money is being left on the table. Pricing strategy, channel mix, ancillary revenue, length-of-stay patterns, and rate parity issues across OTAs.",
  },
  {
    label: "Dimension 02",
    title: "Online Reputation",
    description:
      "What guests are saying and where. Review velocity, sentiment themes, response patterns, and how your reputation stacks up against your direct competitive set.",
  },
  {
    label: "Dimension 03",
    title: "Competitive Position",
    description:
      "Who you are really competing against and where you are winning or losing. Comp set definition, rate positioning, amenity gaps, and brand differentiation.",
  },
  {
    label: "Dimension 04",
    title: "Guest Personas",
    description:
      "The actual humans booking your rooms. Inferred personas based on review language, booking patterns, and market data, so your marketing speaks to the right people.",
  },
  {
    label: "Dimension 05",
    title: "Tech Stack",
    description:
      "What you are running and what is missing. PMS, booking engine, channel manager, CRM, messaging, and the integration gaps that are costing you bookings or staff hours.",
  },
  {
    label: "Dimension 06",
    title: "Visibility & Discoverability",
    description:
      "How findable you are. Direct-booking SEO, local search, OTA placement, AEO readiness, and where guests are dropping off before they ever land on your site.",
  },
  {
    label: "Synthesis",
    title: "Three Quick Wins",
    description:
      "Three specific, prioritized actions you can take this week, this month, or this quarter. Each one tied to a finding, a pillar, and a concrete next step.",
  },
];

const USE_CASES = [
  {
    title: "A diagnostic snapshot",
    body: "See exactly where your property is strong, where it is weak, and where the highest-leverage opportunities live, scored and benchmarked.",
  },
  {
    title: "An internal alignment tool",
    body: "Share it with your owner, GM, or partners so everyone is looking at the same numbers and the same priorities, not their own gut feel.",
  },
  {
    title: "A roadmap for what to fix first",
    body: "The Quick Wins section turns the diagnostic into a tactical to-do list. Implement on your own, or use it as the starting point for a deeper engagement with us.",
  },
];

export default function TierZero() {
  return (
    <AnimatedSection theme="off-white" className="py-24 px-6" id="tier-0">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <AnimatedItem>
            <div className="inline-block bg-primary-green/15 text-primary-green text-sm font-semibold tracking-widest uppercase px-4 py-1.5 mb-4 font-sans">
              Tier 0: Free Audit
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <SectionLabel>No Cost. No Catch.</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-6 leading-tight">
              Your Hotel, Scored Across Six Dimensions
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal/70 leading-relaxed">
              Our flagship Tier 0 deliverable is a Comprehensive Audit: a
              two-page diagnostic of your property across six dimensions of
              boutique hotel performance, plus three prioritized quick wins. We
              pull real market data, real competitor intelligence, and real
              industry benchmarks, then translate it into a scored report you
              can act on immediately.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/60 mt-4 leading-relaxed">
              It&apos;s free because once you see the quality of our thinking,
              you&apos;ll want to go deeper. No pressure. No strings.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-8 flex justify-center">
              <Button href="/audit/request" variant="primary" size="lg">
                Get Your Free Audit
              </Button>
            </div>
          </AnimatedItem>
        </div>

        <div className="border-t border-light-gray pt-14 mb-16">
          <div className="text-center mb-10">
            <AnimatedItem>
              <SectionLabel>What&apos;s Inside the Report</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-near-black leading-tight">
                Eight sections, one cohesive picture.
              </h3>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {REPORT_PARTS.map((part) => (
              <AnimatedItem key={part.title}>
                <div className="bg-white border border-light-gray rounded-lg p-5 h-full">
                  <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2">
                    {part.label}
                  </p>
                  <h4 className="font-display text-lg font-semibold text-near-black leading-snug mb-2">
                    {part.title}
                  </h4>
                  <p className="font-sans text-sm text-charcoal/65 leading-relaxed">
                    {part.description}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>

        <div className="border-t border-light-gray pt-14">
          <div className="text-center mb-10">
            <AnimatedItem>
              <SectionLabel>How Operators Use It</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-near-black leading-tight">
                A working document, not a sales deck.
              </h3>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
          >
            {USE_CASES.map((useCase) => (
              <AnimatedItem key={useCase.title}>
                <div className="bg-white border border-light-gray rounded-lg p-6 h-full">
                  <h4 className="font-display text-lg font-semibold text-near-black leading-snug mb-2">
                    {useCase.title}
                  </h4>
                  <p className="font-sans text-sm text-charcoal/65 leading-relaxed">
                    {useCase.body}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </div>
    </AnimatedSection>
  );
}
