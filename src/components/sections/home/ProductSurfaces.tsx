import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Pillar {
  label: string;
  body: string;
}

const PILLARS: Pillar[] = [
  {
    label: "Education",
    body: "Courses that help to turn your assets into businesses you actually run instead of jobs that run you.",
  },
  {
    label: "Resources",
    body: "Guides, audits, and frameworks we publish because we wished they’d existed when we started.",
  },
  {
    label: "Insights",
    body: "News and information that inspire and keep you ahead of the industry trends and news.",
  },
];

export default function ProductSurfaces() {
  return (
    <AnimatedSection
      theme="none"
      className="bg-primary-green text-white py-12 md:py-16 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
          <AnimatedItem>
            <SectionLabel light>What we built</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-[1.15] tracking-tight">
              3 Offerings 1 Company
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div aria-hidden className="mx-auto mt-6 h-px w-16 bg-warm-gold" />
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="max-w-3xl mx-auto space-y-6 md:space-y-7"
        >
          {PILLARS.map((p) => (
            <AnimatedItem key={p.label}>
              <div className="flex gap-4 md:gap-5 border-t border-warm-gold/40 pt-6 first:border-t-0 first:pt-0">
                <span
                  className="text-warm-gold font-display text-3xl leading-none mt-1 select-none"
                  aria-hidden="true"
                >
                  &bull;
                </span>
                <p className="font-sans text-base md:text-lg text-white/85 leading-relaxed">
                  <span className="font-semibold text-white">{p.label}.</span>{" "}
                  <span className="text-white/80">{p.body}</span>
                </p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem className="mt-10 md:mt-12 flex justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-warm-gold text-near-black px-7 py-3.5 font-sans font-semibold text-sm rounded-md hover:bg-warm-gold-dark transition-colors duration-200"
          >
            Contact for Details
          </Link>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
