import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";

interface Operator {
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
    eyebrow: "Property",
    heading: "If you operate property",
    body:
      "New Operators, 3 STRs, a co-living building, or a portfolio that mixes them. The math is the same. Direct bookings, automation, owned guest lists. The operators we work with are the ones who got tired of running their portfolios on Sunday nights and finally want their evenings back.",
    ctaLabel: "Join the Room Rental Riches Masterclass",
    ctaHref: "/courses/room-rental-riches",
    image: {
      src: "/images/Website Images/image4.png",
      alt: "Residential home exterior at golden hour",
    },
  },
  {
    eyebrow: "Boutique Hotels",
    heading: "If you run an independent property with 10 to 50 rooms",
    body:
      "The OTAs are eating into your revenue, your tech stack is held together by a vendor who half-quit, and the last agency you hired left you with slides and an invoice. Signal works the way you'd actually want a partner to work. Outcome-tied, transparent, willing to be measured.",
    ctaLabel: "Explore Signal Offerings",
    ctaHref: "/signal",
    image: {
      src: "/images/Website Images/image3.png",
      alt: "Boutique hotel exterior at dusk",
    },
  },
  {
    eyebrow: "Autos",
    heading: "If you operate auto",
    body:
      "Aspiring Turo hosts and small fleet operators running 3 to 30 economy vehicles can use our same methods, applied to vehicles: pricing, channel mix, ops cadence, customer flow. Car Rental Riches is in production now.",
    ctaLabel: "Join the Car Rental Riches Waitlist",
    ctaHref: "/alex",
    image: {
      src: "/images/Website Images/image5.png",
      alt: "A small fleet of 3 economy vehicles parked in a line",
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
                <article className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
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
                  <div className={reverse ? "md:order-1" : ""}>
                    <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
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
                        className="inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-deep-teal hover:text-warm-gold transition-colors duration-200"
                      >
                        {op.ctaLabel}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </article>
              </AnimatedItem>
            );
          })}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
