import Image from "next/image";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

/**
 * Homepage hero v2. Repositions BNHG from boutique-hotel firm to the operator's
 * company for the sharing economy. Puts founders on screen up top because
 * "founder presence is the single biggest credibility lever" per the brief.
 */
export default function HeroSection() {
  return (
    <AnimatedSection theme="dark" className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/backgroundimage2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-near-black/60 via-near-black/70 to-near-black/85" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <AnimatedItem>
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-warm-gold font-semibold mb-6">
            Be Nice Hospitality Group
          </p>
        </AnimatedItem>

        <AnimatedItem>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-[1.05]">
            The operator&apos;s company for the sharing economy.
          </h1>
        </AnimatedItem>

        <AnimatedItem>
          <p className="font-sans text-lg md:text-xl text-white/80 italic max-w-3xl mx-auto mb-10 leading-relaxed">
            Use OTAs for discovery. Run the rest like a business.
          </p>
        </AnimatedItem>

        {/* Founder photo strip + caption. Small, intentional, signals real humans. */}
        <AnimatedItem>
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="flex -space-x-3">
              <PlaceholderImage
                label="Della"
                aspect="square"
                rounded="full"
                className="w-14 h-14 border-2 border-near-black"
              />
              <PlaceholderImage
                label="Alex"
                aspect="square"
                rounded="full"
                className="w-14 h-14 border-2 border-near-black"
              />
            </div>
            <p className="font-sans text-sm text-white/70 text-left">
              Della &amp; Alex Henry
              <br />
              <span className="text-white/45 text-xs">Co-founders</span>
            </p>
          </div>
        </AnimatedItem>

        <AnimatedItem>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button href="/login" variant="secondary" size="lg">
              Community Login
            </Button>
            <Link
              href="#ecosystem"
              className="font-sans text-sm text-white/65 hover:text-white underline underline-offset-4 transition-colors duration-200"
            >
              Or take a tour of the ecosystem ↓
            </Link>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
