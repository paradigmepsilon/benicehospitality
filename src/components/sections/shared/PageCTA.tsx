import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";

interface PageCTAProps {
  headline?: string;
  subtext?: string;
}

export default function PageCTA({
  headline = "Let's Talk About Your Property",
  subtext = "Whether you want a free resource or you're ready for a full diagnostic, the first step is a conversation.",
}: PageCTAProps) {
  return (
    <AnimatedSection theme="dark" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedItem>
          <SectionLabel light>Start Here</SectionLabel>
        </AnimatedItem>
        <AnimatedItem>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
            {headline}
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtext}
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/book" variant="primary" size="lg">
              Book a Discovery Call
            </Button>
            <Button href="/contact#snapshot" variant="secondary" size="lg">
              Get Your Free Resource
            </Button>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
