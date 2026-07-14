import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function FounderStoryTeaser() {
  return (
    <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <AnimatedItem>
          <div className="grid grid-cols-2 gap-3">
            <PlaceholderImage label="Della Henry" hint="Portrait" aspect="portrait" />
            <PlaceholderImage label="Alex Henry" hint="Portrait" aspect="portrait" className="mt-8" />
          </div>
        </AnimatedItem>

        <div>
          <AnimatedItem>
            <SectionLabel>The Founders</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 mb-5 leading-tight">
              We don&apos;t teach this. We run this.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/80 mb-4 leading-relaxed">
              Della and Alex Henry have spent the last decade running the operations they teach. Co-living and rental portfolios, fleet vehicles, AI tools shipping in production. The company exists because the gap between what operators are told to do and what actually works in the field has never been wider.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/80 mb-7 leading-relaxed">
              Della leads brand, education, content, advisory delivery, and the Nice Host Network. Alex leads technology and runs both Signal and BNHG Labs. He&apos;s also the founder and CEO of Guestally.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <Link
              href="/about"
              className="font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark underline underline-offset-4"
            >
              Read the founder story →
            </Link>
          </AnimatedItem>
        </div>
      </div>
    </AnimatedSection>
  );
}
