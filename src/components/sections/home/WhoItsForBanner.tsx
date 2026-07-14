import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";

export default function WhoItsForBanner() {
  return (
    <AnimatedSection
      theme="none"
      className="bg-warm-gold py-6 md:py-8 px-6"
    >
      <AnimatedItem className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-[1.2] tracking-tight">
          Whether you run 3 co-living doors, 22 rooms, or a Turo fleet; if
          you&rsquo;re trying to run an operation instead of creating a job,
          you&rsquo;re in the right place.
        </h2>
      </AnimatedItem>
    </AnimatedSection>
  );
}
