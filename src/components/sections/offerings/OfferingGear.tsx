import Image from "next/image";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import type { MarketplaceTabId } from "@/app/(marketing)/marketplace/_components/types";

// Generalized from CoLivingGear. Hands off to /marketplace rather than
// duplicating it — that page is already DB-backed with admin CRUD, four
// audience tabs, click tracking, and a "Della Uses This" badge. The tab ids
// line up with the lanes: property = co-living, hotel = boutique, auto = fleet.

interface OfferingGearProps {
  tab: MarketplaceTabId;
  label: string;
  headline: string;
  body: string;
  ctaLabel: string;
  image: { src: string; alt: string };
}

export default function OfferingGear({
  tab,
  label,
  headline,
  body,
  ctaLabel,
  image,
}: OfferingGearProps) {
  return (
    <AnimatedSection theme="off-white" className="py-16 md:py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
        <div>
          <AnimatedItem>
            <SectionLabel>{label}</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              {headline}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-charcoal leading-snug mb-8">
              {body}
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <Button href={`/marketplace?tab=${tab}`} variant="secondary" size="lg">
              {ctaLabel}
            </Button>
          </AnimatedItem>
        </div>

        <AnimatedItem>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
            <Image
              src={image.src}
              alt={image.alt}
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
