import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import OfferingHero from "@/components/sections/shared/OfferingHero";
import OfferingOverview from "@/components/sections/offerings/OfferingOverview";
import OfferingResources from "@/components/sections/offerings/OfferingResources";
import OfferingGear from "@/components/sections/offerings/OfferingGear";
import OfferingInsights from "@/components/sections/offerings/OfferingInsights";
import CarRentalRichesWaitlistTrigger from "@/components/sections/waitlist/CarRentalRichesWaitlistTrigger";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import LaneSection from "@/components/ui/LaneSection";
import Button from "@/components/ui/Button";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { LANES } from "@/lib/lanes";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export const metadata: Metadata = {
  title: "Fleet Management | Turo Hosts & Small Rental Fleets | Be Nice Hospitality",
  description:
    "The operator playbook for rental fleets. Pricing, channel mix, ops cadence, and customer flow for Turo hosts and small fleet operators running 3 to 30 vehicles. Run by Alex Henry.",
  keywords: [
    "fleet management for Turo hosts",
    "small rental fleet operations",
    "Turo host pricing strategy",
    "car rental fleet operator",
    "Car Rental Riches",
    "rental fleet SOPs",
    "Be Nice Autos",
  ],
  alternates: { canonical: "https://benicehospitality.com/fleet" },
  openGraph: {
    title: "Fleet Management | Be Nice Hospitality",
    description:
      "Pricing, channel mix, ops cadence, and customer flow for Turo hosts and small fleet operators running 3 to 30 vehicles.",
    url: "https://benicehospitality.com/fleet",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/Alex%20Turo%20Shot.png",
        width: 1600,
        height: 900,
        alt: "Be Nice Hospitality fleet management for Turo hosts and small rental fleets",
      },
    ],
  },
};

const STATS = [
  { figure: "3-30", label: "Vehicles in the sweet spot" },
  { figure: "2x", label: "Channels beat one every time" },
  { figure: "24hr", label: "Claim window most hosts miss" },
  { figure: "2026", label: "Car Rental Riches drops" },
];

const MECHANICS = [
  {
    numeral: "i",
    heading: "The vehicle is inventory, not a car",
    body: "A car sitting in your driveway is a depreciating asset. A car on a channel with the right price on the right day is inventory that pays its own note. The operators who make money treat every vehicle like a room in a hotel: occupancy, rate, and cost per turn are the only three numbers that matter.",
  },
  {
    numeral: "ii",
    heading: "One channel is a single point of failure",
    body: "Turo is discovery, not a business. The hosts who survive a policy change or an account review are the ones already running direct bookings, corporate accounts, or a second platform alongside it. Same lesson the property side learned from the OTAs, arriving about ten years later.",
  },
  {
    numeral: "iii",
    heading: "Documentation is the whole game on claims",
    body: "Approved is not paid. The difference between a claim that pays and one that dies is a date-stamped baseline taken before the guest ever drives off, and knowing that the reporting clock starts at trip end. Most hosts learn this after they eat the first one.",
  },
];

export default function FleetPage() {
  return (
    // Fleet lane: BNA blue. See src/lib/lanes.ts.
    <LaneSection lane="fleet">
      <OfferingHero
        eyebrow="Fleet Management · Run by Alex Henry"
        headline="Rental fleets, run like"
        accentWord="a business."
        message="Pricing, channel mix, ops cadence, and customer flow for Turo hosts and small fleet operators running three to thirty vehicles. The same operator method Della runs on property, retuned for vehicles."
        primaryCta={{
          label: "Join the Car Rental Riches Waitlist",
          href: "#course",
          render: (label) => (
            <CarRentalRichesWaitlistTrigger variant="primary" size="lg">
              {label}
            </CarRentalRichesWaitlistTrigger>
          ),
        }}
        secondaryCta={{
          label: "Book a Call With Alex",
          href: bookingUrl({
            founder: "alex",
            source: BOOKING_SOURCES.FLEET_HERO,
          }),
        }}
        image={{
          src: "/images/claimproof/fleet-lineup.png",
          alt: "A rental fleet staged near the Atlanta airport at golden hour",
        }}
        note="No sales theater. Calls are working sessions."
      />

      {/* Trust bar. Same treatment as the other doors. */}
      <section className="bg-deep-teal py-7 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <p className="font-display text-4xl md:text-5xl font-semibold text-warm-gold leading-none mb-2">
                {s.figure}
              </p>
              <p className="font-sans text-sm text-white/80 leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <OfferingOverview
        label="Start here"
        headline="What fleet operating actually is."
        intro="Most people come to vehicles from the host side: one car, one platform, and a hope that the calendar fills. Operating is the part nobody posts about. Three things separate the two."
        mechanics={MECHANICS}
        take={{
          label: "Alex's take",
          body: "If you are running one car and it is covering its note, you do not need a system yet. You need a second car. Come back when the spreadsheet stops fitting in your head. That is the honest answer, and it is the one I would want somebody to give me.",
        }}
      />

      <SectionDivider fromColor={C.white} toColor={LANES.fleet.wash} />
      <OfferingResources
        category="fleet"
        label="Free, no catch"
        headline="The tools, built for vehicles."
        intro="The property side of this business has a full library of free calculators and checklists. The vehicle versions are in production now, built off the same operator logic and the same email gate."
        emptyState={{
          headline: "Fleet tools are being built now.",
          body: "Pricing calculators, claim documentation checklists, and the fleet-mix worksheets are in production. Until they land, the co-living library is open and a good chunk of it (launch budgeting, turnover tracking, vendor logs) transfers to vehicles with almost no translation.",
        }}
      />
      <SectionDivider fromColor={LANES.fleet.wash} toColor={C.white} flip />

      {/* COURSE / WAITLIST */}
      <AnimatedSection theme="light" className="py-16 md:py-24 px-6" id="course">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <AnimatedItem>
              <SectionLabel>The course</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                Car Rental Riches.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal leading-snug mb-6">
                The Host-to-Operator method retuned for Turo hosts and small
                fleet operators. Same three commitment tiers as Room Rental
                Riches, same operator-grade depth, built around vehicles instead
                of doors.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <ul className="space-y-3 mb-8">
                {[
                  "Twelve modules, from first vehicle to a scaled fleet",
                  "Fleet-mix templates and the SOPs that run them",
                  "Pricing logic that survives a slow week",
                  "Claim documentation that actually pays out",
                ].map((point) => (
                  <li
                    key={point}
                    className="font-sans text-base text-charcoal/85 flex items-start gap-3"
                  >
                    <span
                      aria-hidden="true"
                      className="text-(--lane-accent,var(--color-warm-gold)) mt-0.5"
                    >
                      &rarr;
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </AnimatedItem>
            <AnimatedItem>
              <CarRentalRichesWaitlistTrigger variant="primary" size="lg">
                Join the Waitlist
              </CarRentalRichesWaitlistTrigger>
            </AnimatedItem>
          </div>

          <AnimatedItem>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
              <Image
                src="/images/Website%20Images/crr-collage-02-steering-wheel.png"
                alt="Behind the wheel of a rental fleet vehicle"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                style={{ filter: "saturate(0.85) contrast(1.05)" }}
              />
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <OfferingGear
        tab="auto"
        label="The gear"
        headline="What goes in every vehicle."
        body="Trackers, lockboxes, cleaning supplies, dash cams, and the consumables that get replaced every few turns. Nothing aspirational. If it is on the list it is in one of our cars right now."
        ctaLabel="Open the Fleet Toolkit"
        image={{
          src: "/images/Website%20Images/crr-collage-03-dashboard.png",
          alt: "The dashboard and interior of a well-kept rental fleet vehicle",
        }}
      />

      <OfferingInsights
        category="Fleet"
        headline="Written from the actual fleet."
        body="Pricing notes, channel experiments, and the claims that went sideways before they went right. Longer thinking than a caption allows."
      />

      {/* Closing image band, then the CTA. */}
      <section className="bg-cream py-12 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm">
            <Image
              src="/images/Website%20Images/crr-collage-04-exterior.png"
              alt="A small rental fleet staged and ready for the next trip"
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(1.05)" }}
            />
          </div>
        </div>
      </section>

      <section className="bg-deep-teal py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            Still have a question
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            Bring it to a call.
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-12 max-w-2xl mx-auto">
            A vehicle you are underwriting. A car that will not book. A claim
            that got denied and you do not know why. Thirty minutes with Alex
            beats another month of guessing. If he cannot help, he will tell you
            on the call.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href={bookingUrl({
                founder: "alex",
                source: BOOKING_SOURCES.FLEET_FINAL_CTA,
              })}
              variant="primary"
              size="lg"
            >
              Book a Call With Alex
            </Button>
            <Link
              href="/alex"
              className="inline-flex items-center justify-center font-sans font-semibold text-white/85 hover:text-warm-gold transition-colors duration-200 text-lg underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold"
            >
              Or read his story first
            </Link>
          </div>
        </div>
      </section>
    </LaneSection>
  );
}
