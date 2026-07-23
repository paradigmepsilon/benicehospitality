import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import LaneSection from "@/components/ui/LaneSection";
import type { LaneId } from "@/lib/lanes";

interface Operator {
  lane: LaneId;
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: { src: string; alt: string };
}

// Unsplash placeholders until real photography ships.
const OPERATORS: Operator[] = [
  {
    lane: "coliving",
    eyebrow: "Co-living Properties",
    heading: "If you run co-living properties",
    body:
      "Co-living operators renting rooms by the door, plus the short-term and mid-term portfolios that mix in. The math is the same. Direct bookings, automation, owned guest lists. The operators we work with are the ones who got tired of running their portfolios on Sunday nights and finally want their evenings back.",
    ctaLabel: "Explore Co-living",
    ctaHref: "/co-living",
    image: {
      src: "/images/Website Images/image4.png",
      alt: "Co-living property exterior at golden hour",
    },
  },
  {
    lane: "boutique",
    eyebrow: "Boutique Stays",
    heading: "If you run independent boutique stays",
    body:
      "Independent boutique hotels, inns, and the design-forward short-term and vacation stays guests book on purpose. The OTAs are eating into your revenue, your tech stack is held together by a vendor who half-quit, and the last agency you hired left you with slides and an invoice. Signal works the way you'd actually want a partner to work. Outcome-tied, transparent, willing to be measured.",
    ctaLabel: "Explore Boutique Stays",
    ctaHref: "/boutique-stays",
    image: {
      src: "/images/Website Images/image3.png",
      alt: "Boutique stay exterior at dusk",
    },
  },
  {
    lane: "fleet",
    eyebrow: "Autos",
    heading: "If you run a rental fleet",
    body:
      "Aspiring Turo hosts and small fleet operators running 3 to 30 economy vehicles can use our same methods, applied to fleet management: pricing, channel mix, ops cadence, customer flow. Car Rental Riches is in production now.",
    ctaLabel: "Explore Fleet Management",
    ctaHref: "/fleet",
    image: {
      src: "/images/Website Images/image5.png",
      alt: "A small rental fleet of 3 economy vehicles parked in a line",
    },
  },
];

export default function WhoItsFor() {
  return (
    <AnimatedSection
      theme="off-white"
      className="pt-12 md:pt-16 pb-12 md:pb-16 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedDiv stagger className="divide-y divide-charcoal/15">
          {OPERATORS.map((op, i) => {
            const reverse = i % 2 === 1;
            return (
              <AnimatedItem
                key={op.heading}
                className="py-8 md:py-10 first:pt-0 last:pb-0"
              >
                {/* Each door is its own lane. They're stacked in separate
                    bands rather than side by side, so per-lane accents read as
                    wayfinding instead of three colors competing at once. */}
                <LaneSection
                  lane={op.lane}
                  className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center"
                >
                  <div
                    className={`relative aspect-[4/3] overflow-hidden rounded-lg shadow-sm ${
                      reverse ? "md:order-2" : ""
                    }`}
                  >
                    <Image
                      src={op.image.src}
                      alt={op.image.alt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      style={{ filter: "saturate(0.85) contrast(1.05)" }}
                    />
                  </div>
                  <div
                    className={`border-l-2 border-(--lane-accent) pl-6 md:pl-8 ${
                      reverse ? "md:order-1" : ""
                    }`}
                  >
                    <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-(--lane-accent) mb-4">
                      {op.eyebrow}
                    </p>
                    <h3 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mb-5">
                      {op.heading}
                    </h3>
                    <p className="font-sans text-base md:text-lg text-charcoal leading-relaxed mb-6">
                      {op.body}
                    </p>
                    {op.ctaLabel && op.ctaHref && (
                      <Link
                        href={op.ctaHref}
                        className="group inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-deep-teal hover:text-(--lane-accent) transition-colors duration-200"
                      >
                        {op.ctaLabel}
                        <ArrowRight
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                </LaneSection>
              </AnimatedItem>
            );
          })}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
