import Image from "next/image";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

export default function SignalWhyNow() {
  return (
    <AnimatedSection theme="light" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 lg:gap-16 items-center">
        <div className="max-w-2xl">
          <AnimatedItem>
            <SectionLabel>The Moment</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-near-black leading-[1.05] tracking-tight">
              The window for this
              <br />
              will not stay open.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="w-16 h-px bg-warm-gold mt-6 mb-8" />
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-charcoal/80 leading-relaxed mb-5">
              Over a third of leisure travelers now begin trip planning inside ChatGPT,
              Perplexity, Gemini, or Claude. Lighthouse launched the first
              direct-booking app for hotels inside ChatGPT in March 2026. The Model
              Context Protocol (MCP) has become the de facto standard for connecting
              hotel inventory to AI assistants. OTAs and large chains are moving fast.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-charcoal/80 leading-relaxed mb-5">
              Most 10 to 50 room independent boutique luxury properties are not moving
              at all, and almost no specialized service provider exists to help them.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-charcoal/80 leading-relaxed">
              This is the window. The large agencies will eventually move down-market,
              and when they do, the properties that already have AI citations,
              MCP-ready infrastructure, and AI-native direct booking will hold the
              advantage. Signal exists to make sure you are one of those properties.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedItem>
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            {/* Aesthetic: tall portrait architectural detail. Staircase, textile close-up, brass and stone material study. Natural light. No people. */}
            <Image
              src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=80"
              alt="Architectural detail of a quiet luxury hotel interior with warm natural light on a textured material surface."
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-near-black/6 mix-blend-multiply pointer-events-none" />
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
