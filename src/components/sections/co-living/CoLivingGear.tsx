import Image from "next/image";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

// Hands off to the existing marketplace rather than duplicating it. /marketplace
// is already DB-backed with admin CRUD, four audience tabs, click tracking, and
// a "Della Uses This" badge — it is just buried in the footer, so this strip is
// the first prominent entry point it has had.

export default function CoLivingGear() {
  return (
    <AnimatedSection theme="off-white" className="py-12 md:py-14 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
        <div>
          <AnimatedItem>
            <SectionLabel>The gear</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              What We Put in Every Unit
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-base md:text-lg text-charcoal leading-snug space-y-4 mb-8">
              <p>
                Browse the products, supplies, furniture, technology, and
                operating essentials we actually use across our room rental
                portfolio.
              </p>
              <p>
                Every recommendation comes from real-world experience and
                products we trust in our own business.
              </p>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <Button
              href="/marketplace?tab=property"
              variant="secondary"
              size="lg"
            >
              Explore the Marketplace
            </Button>
          </AnimatedItem>
        </div>

        <AnimatedItem>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
            <Image
              src="/images/Website%20Images/pexels-curtis-adams-1694007-16641323.jpg"
              alt="A furnished co-living room set up for a mid-term stay"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(1.05)" }}
            />
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
