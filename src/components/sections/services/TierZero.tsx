import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { TIER_ZERO_RESOURCES } from "@/lib/tier-zero-resources";

export default function TierZero() {
  return (
    <AnimatedSection theme="off-white" className="py-24 px-6" id="tier-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div className="text-center">
            <AnimatedItem>
              <div className="inline-block bg-primary-green/15 text-primary-green text-sm font-semibold tracking-widest uppercase px-4 py-1.5 mb-4 font-sans">
                Tier 0: Free
              </div>
            </AnimatedItem>
            <AnimatedItem>
              <SectionLabel>No Cost. No Catch.</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-6 leading-tight">
                Before We Ask for Anything, We Earn Your Attention
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/70 leading-relaxed">
                Each of our Tier 0 resources is a custom, research-backed
                deliverable created specifically for your property. We pull
                real market data, real competitor intelligence, and real
                industry benchmarks, then translate it into something you can
                act on immediately.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base text-charcoal/60 mt-4 leading-relaxed">
                We offer these for free because we know that once you see the
                quality of our thinking, you&apos;ll want to go deeper. No
                pressure. No strings.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <div className="mt-8 flex justify-center">
                <Button href="/contact#snapshot" variant="primary" size="lg">
                  Request Your Free Resource
                </Button>
              </div>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {TIER_ZERO_RESOURCES.map((resource) => (
              <AnimatedItem key={resource.slug}>
                <Link
                  href={`/resources/${resource.slug}`}
                  className="block bg-white border border-light-gray rounded-lg p-5 hover:border-primary-green/50 hover:shadow-md transition-all duration-300 h-full"
                >
                  <h3 className="font-display text-xl font-semibold text-near-black leading-snug mb-2">
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
