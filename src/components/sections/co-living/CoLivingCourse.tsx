import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { BLUEPRINT } from "@/lib/blueprint";
import { RRR_PRICES, RRR_PATHS } from "@/lib/room-rental-riches";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

// Every price and path here is imported, never retyped: the book from
// lib/blueprint.ts, the two course tiers from lib/room-rental-riches.ts. This
// block is a funnel summary of pages that own their own numbers, and hand-typed
// copies are how those numbers drift apart.
//
// Operator ($7,497) is deliberately NOT a card here. It is not a self-serve
// tier: it is the one-to-one engagement offered after someone reaches out and
// takes a discovery call. It appears as the footnote under the grid instead.

const TIERS = [
  {
    name: "The book",
    price: `$${BLUEPRINT.priceUsd}`,
    note: `Normally $${BLUEPRINT.priceListUsd}. PDF and ePub, instant download.`,
    tagline: "The whole idea, in one sitting.",
    body: "Seven chapters on turning a house you already have into a co-living business. Property scoring, the real start-up numbers, furnishing, pricing, and keeping rooms full. The cheapest way to find out whether this is for you.",
    href: BLUEPRINT.path,
    cta: "Get the Book",
    image: {
      src: "/images/Website%20Images/course-book-walkthrough-v2.png",
      alt: "A co-living operator reading the Room Rental Riches book while walking through a well-designed room",
    },
    featured: false,
  },
  {
    name: "Self-paced",
    price: `$${RRR_PRICES.selfPacedUsd}`,
    note: `Normally $${RRR_PRICES.selfPacedListUsd}. Twelve modules, lifetime access.`,
    tagline: "The whole system, on your couch.",
    body: "Twelve modules, lifetime access, no class schedule breathing down your neck. Property selection through scaling, with the SOPs, templates, and vendor lists I use.",
    href: "/courses/room-rental-riches/self-paced",
    cta: "See Self-paced",
    image: {
      src: "/images/Website%20Images/course-self-paced-student-v3.png",
      alt: "A student working through the course on a laptop at a home desk",
    },
    featured: false,
  },
  {
    name: "Masterclass",
    price: `$${RRR_PRICES.masterclassUsd.toLocaleString("en-US")}`,
    note: "Runs quarterly. A two-day workshop, capped at six operators.",
    tagline: "The same system, with me in the room.",
    body: "Everything in self-paced plus a two-day small-group workshop where we apply the manual to your real business, an individual hot seat of your own, a 60-minute private follow-up, and a year in the network. Four sessions a year, so seats are limited.",
    href: RRR_PATHS.masterclass,
    cta: "See the Masterclass",
    image: {
      src: "/images/Website%20Images/course-masterclass-cohort-v2.png",
      alt: "The instructor teaching a small, diverse masterclass cohort in a conference room",
    },
    featured: true,
  },
];

export default function CoLivingCourse() {
  return (
    <AnimatedSection
      theme="none"
      className="bg-cream text-charcoal py-12 md:py-16 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-16">
          <AnimatedItem>
            <SectionLabel>The course</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              Room Rental Riches.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal leading-snug">
              The manual I wish I had in year one. Not a framework, not a
              mindset course. The actual playbook I run every Monday morning,
              written down. Three ways in, from a thirty-dollar book to two days
              with me in the room.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch"
        >
          {TIERS.map((tier) => (
            <AnimatedItem key={tier.name}>
              {/* group + a real transition on the card: the whole tile lifts,
                  deepens its shadow, and the header image zooms on hover. The
                  cards are not links (the CTA button is), so this is a hover
                  affordance that pulls the eye toward the button. */}
              <div
                className={[
                  "group h-full flex flex-col rounded-sm overflow-hidden relative",
                  "transition-all duration-300 ease-out",
                  // Raw box-shadow property, not Tailwind's shadow-* token: the
                  // --tw-shadow variables resolve to transparent in this setup,
                  // so the token renders no geometry. Setting the property
                  // directly always paints.
                  "hover:-translate-y-1.5 hover:[box-shadow:0_22px_44px_-16px_rgba(26,26,26,0.28)]",
                  tier.featured
                    ? "bg-deep-teal text-white"
                    : "bg-white border border-charcoal/10 hover:border-(--lane-accent,var(--color-warm-gold))",
                ].join(" ")}
              >
                {/* Lane keyline that wipes in on hover. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 z-20 h-0.75 bg-(--lane-accent,var(--color-warm-gold)) origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                />
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-cream">
                  <Image
                    src={tier.image.src}
                    alt={tier.image.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    style={{ filter: "saturate(0.85) contrast(1.05)" }}
                  />
                </div>

                <div className="flex flex-col flex-1 p-8 lg:p-9">
                {tier.featured && (
                  <span className="absolute top-5 right-5 font-sans text-[10px] tracking-[0.25em] uppercase text-warm-gold font-semibold">
                    Most popular
                  </span>
                )}
                <p
                  className={[
                    "font-sans text-xs font-semibold tracking-[0.2em] uppercase mb-4",
                    tier.featured
                      ? "text-warm-gold"
                      : "text-(--lane-accent,var(--color-warm-gold))",
                  ].join(" ")}
                >
                  {tier.name}
                </p>
                <p
                  className={[
                    "font-display text-4xl font-semibold leading-none mb-2",
                    tier.featured ? "text-white" : "text-deep-teal",
                  ].join(" ")}
                >
                  {tier.price}
                </p>
                <p
                  className={[
                    "font-sans text-xs mb-6",
                    tier.featured ? "text-white/60" : "text-charcoal/55",
                  ].join(" ")}
                >
                  {tier.note}
                </p>
                <p
                  className={[
                    "font-display italic text-lg leading-snug mb-4",
                    tier.featured ? "text-white/90" : "text-deep-teal",
                  ].join(" ")}
                >
                  {tier.tagline}
                </p>
                <p
                  className={[
                    "font-sans text-base leading-snug mb-8 flex-grow",
                    tier.featured ? "text-white/85" : "text-charcoal/85",
                  ].join(" ")}
                >
                  {tier.body}
                </p>
                <Button
                  href={tier.href}
                  variant={tier.featured ? "primary" : "secondary"}
                  size="md"
                  fullWidth
                >
                  {tier.cta}
                </Button>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <p className="font-sans text-sm text-charcoal/60 text-center mt-10 max-w-3xl mx-auto">
            Not sure which one?{" "}
            <Link
              href="/courses/room-rental-riches"
              className="text-primary-green border-b border-(--lane-accent,var(--color-warm-gold)) hover:border-primary-green transition-colors"
            >
              Compare all three
            </Link>
            . Most people start with the book and move up once they know this is
            the business they want.
          </p>
        </AnimatedItem>

        {/* Operator is not self-serve, so it sits outside the pricing grid.
            The only way in is a conversation, and the copy says so plainly
            rather than dangling a button that skips the discovery call. */}
        <AnimatedItem>
          {/* Spans the full section width to match the card grid above it. The
              paragraph keeps its own measure so the line length stays readable
              at 1280px rather than running the full width of the box. */}
          <div className="mt-10 md:mt-12 bg-white border-t-2 border-(--lane-accent,var(--color-warm-gold)) p-7 md:p-10 text-center">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-3">
              Already have doors?
            </p>
            <p className="font-sans text-base text-charcoal/85 leading-snug mb-6 max-w-3xl mx-auto">
              There is a fourth way in that is not on this page. Operator is a
              one-to-one engagement where we diagnose what is leaking, build the
              fix, and stay until it runs without you. It starts with a
              discovery call, not a checkout page, because I will not sell it
              until I know it is the right thing for your portfolio.
            </p>
            <Button
              href={bookingUrl({
                founder: "della",
                source: BOOKING_SOURCES.COLIVING_FINAL_CTA,
              })}
              variant="secondary"
              size="md"
            >
              Book a Discovery Call
            </Button>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
