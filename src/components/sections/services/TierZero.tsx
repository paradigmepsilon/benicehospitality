import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { TIER_ZERO_RESOURCES } from "@/lib/tier-zero-resources";

const SEVEN_DIMENSIONS = [
  "Revenue Opportunity",
  "Online Reputation",
  "Competitive Position",
  "Guest Personas",
  "Tech Stack",
  "Visibility & Discoverability",
  "Quick Wins",
];

export default function TierZero() {
  return (
    <AnimatedSection theme="off-white" className="py-24 px-6" id="tier-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div className="text-center lg:text-left">
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
                Your Hotel, Scored Across Seven Dimensions
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/70 leading-relaxed">
                Our flagship Tier 0 deliverable is a Comprehensive Audit: a
                two-page diagnostic of your property across seven dimensions of
                boutique hotel performance. We pull real market data, real
                competitor intelligence, and real industry benchmarks, then
                translate it into a scored report you can act on immediately.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base text-charcoal/60 mt-4 leading-relaxed">
                It&apos;s free because once you see the quality of our
                thinking, you&apos;ll want to go deeper. No pressure. No
                strings.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button href="/audit/request" variant="primary" size="lg">
                  Get Your Free Audit
                </Button>
                <Button href="#tier-0-resources" variant="secondary" size="lg">
                  Or browse single-topic resources
                </Button>
              </div>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {SEVEN_DIMENSIONS.map((dim, i) => (
              <AnimatedItem key={dim}>
                <div className="bg-white border border-light-gray rounded-lg p-5 h-full">
                  <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2">
                    Dimension {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-near-black leading-snug">
                    {dim}
                  </h3>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>

        {/* Single-topic resources (preserved for SEO) */}
        <div id="tier-0-resources" className="border-t border-light-gray pt-16">
          <div className="text-center mb-10">
            <AnimatedItem>
              <SectionLabel>Single-Topic Resources</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-near-black leading-tight">
                Prefer one piece at a time?
              </h3>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base text-charcoal/60 mt-3 max-w-2xl mx-auto leading-relaxed">
                Each of these is a deeper dive on a single dimension. We&apos;ve
                consolidated the flagship deliverable into the full audit above,
                but the underlying research is still here.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {TIER_ZERO_RESOURCES.map((resource) => (
              <AnimatedItem key={resource.slug}>
                <Link
                  href={`/resources/${resource.slug}`}
                  className="block bg-white border border-light-gray rounded-lg p-5 hover:border-primary-green/50 hover:shadow-md transition-all duration-300 h-full"
                >
                  <h3 className="font-display text-base font-semibold text-near-black leading-snug mb-2">
                    {resource.name}
                  </h3>
                  <p className="font-sans text-xs text-charcoal/60 leading-relaxed">
                    {resource.shortDescription}
                  </p>
                </Link>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </div>
    </AnimatedSection>
  );
}
