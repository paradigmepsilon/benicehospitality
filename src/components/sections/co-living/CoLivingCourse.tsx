import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

// Prices mirror the tier pages under /courses/room-rental-riches/*. Those pages
// remain the source of truth — this is a funnel summary, so if a price changes
// there it must change here too.

const TIERS = [
  {
    name: "Self-paced",
    price: "$497",
    note: "Founding price for the first 100 students, then $697.",
    tagline: "The whole system, on your couch.",
    body: "Twelve modules, lifetime access, no cohort schedule breathing down your neck. Property selection through scaling, with the SOPs, templates, and vendor lists I use.",
    href: "/courses/room-rental-riches/self-paced",
    featured: false,
  },
  {
    name: "Cohort",
    price: "$2,497",
    note: "Eight weeks, live, capped at fifteen operators.",
    tagline: "The same system, with me in the room.",
    body: "Everything in self-paced plus eight weeks of live guided work, weekly hot seats where you bring a real situation, direct messaging with me during the cohort, and a year in the network.",
    href: "/courses/room-rental-riches/cohort",
    featured: true,
  },
  {
    name: "Operator",
    price: "$7,497",
    note: "Diagnose, build, operationalize.",
    tagline: "We build it with you.",
    body: "For operators who already have doors and want the system installed rather than taught. We diagnose what is leaking, build the fix, and stay until it runs without you.",
    href: "/courses/room-rental-riches/operator",
    featured: false,
  },
];

export default function CoLivingCourse() {
  return (
    <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-16">
          <AnimatedItem>
            <SectionLabel>The course</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              Room Rental Riches.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal leading-snug">
              The manual I wish I had in year one. Not a framework, not a
              mindset course. The actual playbook I run every Monday morning,
              written down. Three ways in depending on how much of it you want
              me involved in.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch"
        >
          {TIERS.map((tier) => (
            <AnimatedItem key={tier.name}>
              <div
                className={[
                  "h-full flex flex-col rounded-sm p-8 lg:p-9 relative",
                  tier.featured
                    ? "bg-deep-teal text-white"
                    : "bg-white border border-charcoal/10",
                ].join(" ")}
              >
                {tier.featured && (
                  <span className="absolute top-5 right-5 font-sans text-[10px] tracking-[0.25em] uppercase text-warm-gold font-semibold">
                    Most popular
                  </span>
                )}
                <p
                  className={[
                    "font-sans text-xs font-semibold tracking-[0.2em] uppercase mb-4",
                    tier.featured ? "text-warm-gold" : "text-warm-gold",
                  ].join(" ")}
                >
                  {tier.name}
                </p>
                <p
                  className={[
                    "font-display text-4xl font-semibold leading-none mb-2",
                    tier.featured ? "text-white" : "text-deep-teal",
                  ].join(" ")}
                >
                  {tier.price}
                </p>
                <p
                  className={[
                    "font-sans text-xs mb-6",
                    tier.featured ? "text-white/60" : "text-charcoal/55",
                  ].join(" ")}
                >
                  {tier.note}
                </p>
                <p
                  className={[
                    "font-display italic text-lg leading-snug mb-4",
                    tier.featured ? "text-white/90" : "text-deep-teal",
                  ].join(" ")}
                >
                  {tier.tagline}
                </p>
                <p
                  className={[
                    "font-sans text-base leading-snug mb-8 flex-grow",
                    tier.featured ? "text-white/85" : "text-charcoal/85",
                  ].join(" ")}
                >
                  {tier.body}
                </p>
                <Button
                  href={tier.href}
                  variant={tier.featured ? "primary" : "secondary"}
                  size="md"
                  fullWidth
                >
                  See {tier.name}
                </Button>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <p className="font-sans text-sm text-charcoal/60 text-center mt-10">
            Not sure which one?{" "}
            <Link
              href="/courses/room-rental-riches"
              className="text-primary-green border-b border-warm-gold hover:border-primary-green transition-colors"
            >
              Compare all three
            </Link>
            . Most people start self-paced and move up once they have a
            specific problem.
          </p>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
