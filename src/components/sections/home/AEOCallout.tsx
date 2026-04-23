import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";

export default function AEOCallout() {
  return (
    <AnimatedSection theme="dark" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative border border-warm-gold/30 rounded-lg p-8 md:p-14 bg-gradient-to-br from-near-black to-near-black/60 overflow-hidden">
          <div className="absolute top-0 right-0 bg-warm-gold text-near-black font-sans text-xs font-bold tracking-[0.25em] uppercase px-4 py-2">
            New Offering
          </div>

          <AnimatedItem>
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
              Answer Engine Optimization
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-white leading-tight mb-6 max-w-3xl">
              Travelers are asking ChatGPT for hotel recommendations.{" "}
              <span className="text-warm-gold italic">Are you in the answer?</span>
            </h2>
          </AnimatedItem>

          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-white/70 leading-relaxed mb-8 max-w-2xl">
              A fast-growing share of booking research is happening inside
              ChatGPT, Perplexity, Google AI Overviews, and Gemini. Most
              independent boutique properties are completely invisible in
              those answers. We built an AEO practice to change that, from a
              free snapshot to a full implementation.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                href="/resources/aeo-optimization"
                variant="primary"
                size="lg"
              >
                Get the Free AEO Snapshot
              </Button>
              <Button href="/services#tier-2" variant="secondary" size="lg">
                See AEO Implementation
              </Button>
            </div>
          </AnimatedItem>
        </div>
      </div>
    </AnimatedSection>
  );
}
