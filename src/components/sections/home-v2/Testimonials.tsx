import Image from "next/image";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import {
  STOCK_PORTRAIT_F1,
  STOCK_PORTRAIT_M1,
  STOCK_PORTRAIT_F2,
  STOCK_PORTRAIT_M2,
  type StockImage,
} from "@/lib/stock-images";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  context: string;
  avatar: StockImage;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We were losing direct bookings to OTAs and didn't realize how much it was costing us until BNHG showed us the numbers. Within 90 days we had a real direct booking strategy.",
    author: "Sarah M.",
    role: "Owner-Operator",
    context: "18-room boutique hotel, Charleston SC",
    avatar: STOCK_PORTRAIT_F1,
  },
  {
    quote:
      "The audit alone was worth it. We were paying for three tools that overlapped and missing the one we actually needed. Sorted in two weeks.",
    author: "James T.",
    role: "General Manager",
    context: "32-room destination property, Asheville NC",
    avatar: STOCK_PORTRAIT_M1,
  },
  {
    quote:
      "I went from juggling four cleaners and two VAs to one part-time ops assistant and Guestally running my messaging. First weekend off in two years.",
    author: "Maya L.",
    role: "Property Operator",
    context: "Five units (STR + LTR), suburban Atlanta",
    avatar: STOCK_PORTRAIT_F2,
  },
  {
    quote:
      "I treated Turo like a hobby until I found BNHG. Now I have a documented turnover protocol, a fleet handler, and seven vehicles. Net is up 110 percent.",
    author: "Marcus K.",
    role: "Auto Operator",
    context: "Seven Turo vehicles, urban market",
    avatar: STOCK_PORTRAIT_M2,
  },
];

export default function Testimonials() {
  return (
    <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel>From the Field</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
              Operators doing the work.
            </h2>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <AnimatedItem key={t.author}>
              <figure className="bg-white border border-light-gray rounded-md p-7 h-full flex flex-col">
                <blockquote className="font-sans text-base text-charcoal/85 leading-relaxed mb-5 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="font-sans pt-4 border-t border-light-gray flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-charcoal/10 shrink-0">
                    <Image
                      src={t.avatar.src}
                      alt={t.avatar.alt}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-near-black truncate">{t.author}</p>
                    <p className="text-xs text-charcoal/60 mt-0.5 truncate">{t.role}</p>
                    <p className="text-xs text-warm-gold mt-0.5 truncate">{t.context}</p>
                  </div>
                </figcaption>
              </figure>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
