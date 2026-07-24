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
// Business Advisement ($7,497) is deliberately NOT a card here. It is not a
// self-serve tier: it is the one-to-one engagement offered after someone
// reaches out and takes a discovery call. It appears in the band under the
// grid instead.

const TIERS = [
  {
    name: "The book",
    price: `$${BLUEPRINT.priceUsd}`,
    note: `Normally $${BLUEPRINT.priceListUsd}. PDF and ePub, instant download.`,
    tagline: "Best for future operators.",
    body: "Learn the principles, framework, and operating philosophy behind successful room rental businesses. Perfect if you are exploring the model or deciding whether it is the right fit for you.",
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
    tagline: "Best for operators ready to build or improve a room rental business.",
    body: "Learn the complete Room Rental Riches Operating Manual through step-by-step lessons, templates, calculators, SOPs, and implementation resources.",
    href: "/courses/room-rental-riches/self-paced",
    cta: "Explore the Course",
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
    tagline:
      "Best for operators with at least one room rental property already operating.",
    body: "Join our quarterly two-day workshop with a maximum of six operators. Participate in Individual Business Reviews (Hot Seats), collaborate with other operators, receive personalized action plans, and continue with a private follow-up strategy session.",
    href: RRR_PATHS.masterclass,
    cta: "Explore the Masterclass",
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
            {/* One size step down from the house h2: this headline is nine
                words and wraps to four lines on mobile at text-4xl. */}
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              Choose the Learning Path That&rsquo;s Right for You
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-lg text-charcoal leading-snug space-y-4">
              <p>
                Whether you are just getting started or already operating room
                rentals, Room Rental Riches gives you multiple ways to learn the
                same operating system.
              </p>
              <p>Choose the experience that best fits where you are today.</p>
            </div>
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

        {/* Business Advisement is not self-serve, so it sits outside the
            pricing grid. The only way in is a conversation, and the copy says
            so plainly rather than dangling a button that skips the call. */}
        <AnimatedItem>
          {/* Spans the full section width to match the card grid above it. The
              paragraphs keep their own measure so the line length stays
              readable at 1280px rather than running the full width of the box. */}
          <div className="mt-10 md:mt-12 bg-white border-t-2 border-(--lane-accent,var(--color-warm-gold)) p-7 md:p-10 text-center">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-3">
              Already Have Doors?
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-5">
              Need Personalized Support?
            </h3>
            <p className="font-sans text-base text-charcoal/85 leading-snug mb-4 max-w-3xl mx-auto">
              If you are already operating room rentals and want guidance
              specific to your business, our one-on-one Business Advisement is
              designed to help you improve operations, strengthen systems, solve
              challenges, and grow with confidence.
            </p>
            <p className="font-sans text-base text-charcoal/70 leading-snug mb-6 max-w-3xl mx-auto">
              Every engagement begins with a Discovery Call so we can determine
              whether we are the right fit to support your goals.
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
