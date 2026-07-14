import Image from "next/image";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { STOCK_HOTEL_EXTERIOR } from "@/lib/stock-images";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

interface Offering {
  name: string;
  price: string;
  body: string;
}

const OFFERINGS: Offering[] = [
  {
    name: "AI Visibility Audit",
    price: "$2,500",
    body: "See exactly how ChatGPT, Perplexity, and Google AI Overviews describe your property today. 5 business days.",
  },
  {
    name: "MCP Readiness Package",
    price: "$3,500",
    body: "The structured data, llms.txt, and answer-formatted content the next generation of AI search needs to cite your property.",
  },
  {
    name: "AI Direct Booking Accelerator",
    price: "$8,500",
    body: "A 30-day sprint that turns AI-driven discovery into measurable direct booking growth. Outcome-tied continuation.",
  },
];

export default function SignalSpotlight() {
  return (
    <AnimatedSection theme="light" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-14">
          <AnimatedItem>
            <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-charcoal/10">
              <Image
                src={STOCK_HOTEL_EXTERIOR.src}
                alt={STOCK_HOTEL_EXTERIOR.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </AnimatedItem>
          <div>
            <AnimatedItem>
              <SectionLabel>Signal</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
                Be the hotel AI recommends.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base text-charcoal/75 mt-4 leading-relaxed">
                For independent boutique stays: hotels, inns, and the design-forward short-term and vacation rentals guests book on purpose. Productized AI engagements with outcome guarantees. Quick Wins, 30-day sprints, monthly retainers, and custom builds. Led by Alex.
              </p>
            </AnimatedItem>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {OFFERINGS.map((o) => (
            <AnimatedItem key={o.name}>
              <div className="h-full bg-cream/40 rounded-md p-7 border-l-4 border-warm-gold">
                <p className="font-display text-2xl font-semibold text-near-black mb-1">{o.price}</p>
                <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.15em] text-warm-gold mb-3">
                  {o.name}
                </h3>
                <p className="font-sans text-sm text-charcoal/75 leading-relaxed">{o.body}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>

        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/signal" variant="primary" size="md">
            See Signal&apos;s Full Menu
          </Button>
          <Button
            href={bookingUrl({
              callType: "discovery_call_45",
              source: BOOKING_SOURCES.HOME_SIGNAL_SPOTLIGHT,
            })}
            variant="secondary"
            size="md"
          >
            Book a Discovery Call
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}
