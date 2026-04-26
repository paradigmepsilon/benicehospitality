import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";

export default function SignalFinalCTA() {
  return (
    <AnimatedSection theme="dark" className="py-24 md:py-36" id="book">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <AnimatedItem>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight mb-6">
            Let&apos;s see if Signal
            <br />
            is right for your property.
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <div className="w-16 h-px bg-warm-gold mt-6 mb-8 mx-auto" />
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-display italic text-xl md:text-2xl text-white/80 leading-snug max-w-xl mx-auto mb-10">
            A 40-minute discovery call. No pitch deck. No pressure. We will walk through
            what is possible for your specific property and leave you with a point of
            view regardless of whether you hire us.
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <div className="flex flex-col items-center gap-6">
            <Button href="/book" variant="primary" size="lg">
              Book a 40-Minute Discovery Call
            </Button>
            <a
              href="/resources"
              className="font-sans text-sm font-medium text-warm-gold hover:text-white border-b border-warm-gold/60 hover:border-white pb-1 transition-colors"
            >
              Or browse the Tier 0 resource library &rarr;
            </a>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
