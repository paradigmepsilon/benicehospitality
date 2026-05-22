import Image from "next/image";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { STOCK_RESORT } from "@/lib/stock-images";

export default function FreeAuditCTABanner() {
  return (
    <AnimatedSection theme="dark" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={STOCK_RESORT.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-near-black/85 via-near-black/75 to-near-black/85" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <AnimatedItem>
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-warm-gold font-semibold mb-5">
            Start Here
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-5 leading-[1.1]">
            Get a personalized audit of your operation. Free.
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-lg text-white/75 mb-8 leading-relaxed">
            URL in. Real, written report out. The same diagnostic engine the team uses to scope paid engagements, available free for any operator who wants a serious second opinion.
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <Button href="/login" variant="secondary" size="lg">
            Community Login
          </Button>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-xs text-white/45 mt-6">
            We answer within one business day. No spam follow-up sequence.
          </p>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
