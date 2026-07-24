import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import OfferingHero from "@/components/sections/shared/OfferingHero";
import CoLivingOverview from "@/components/sections/co-living/CoLivingOverview";
import CoLivingResources from "@/components/sections/co-living/CoLivingResources";
import CoLivingCourse from "@/components/sections/co-living/CoLivingCourse";
import CoLivingLive from "@/components/sections/co-living/CoLivingLive";
import CoLivingGear from "@/components/sections/co-living/CoLivingGear";
import CoLivingInsights from "@/components/sections/co-living/CoLivingInsights";
import CoLivingNewsletter from "@/components/sections/co-living/CoLivingNewsletter";
import SectionDivider from "@/components/ui/SectionDivider";
import LaneSection from "@/components/ui/LaneSection";
import Button from "@/components/ui/Button";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { LANES } from "@/lib/lanes";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

// CoLivingInsights reads published posts at request time, so this page cannot
// be fully static — otherwise the article cards freeze at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute:
      "Co-living | Rent by the Room in the Southeast | Be Nice Hospitality",
  },
  description:
    "We help property owners build profitable room rental (co-living) businesses through proven systems, practical education, and real-world operational support. Free calculators and checklists, the Room Rental Riches course, live sessions, and one-on-one advisement. Backed by 12 units across 5 Southeast cities.",
  keywords: [
    "co-living",
    "co-living properties",
    "room rentals",
    "room rental business",
    "rent by the room",
    "co-living operator",
    "mid-term rental",
    "MTR Atlanta",
    "co-living Southeast",
    "travel nurse housing",
    "corporate housing",
    "Be Nice Hospitality",
  ],
  alternates: { canonical: "https://benicehospitality.com/co-living" },
  openGraph: {
    title: "Build a Room Rental Business That Runs on Systems, Not Stress.",
    description:
      "Proven systems, practical education, and real-world operational support for room rental (co-living) operators. Free tools, the course, live sessions, and advisement. Backed by 12 units across 5 Southeast cities.",
    url: "https://benicehospitality.com/co-living",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/Della%20Casual.png",
        width: 1200,
        height: 1200,
        alt: "Della Henry, co-living operator and co-founder of Be Nice Hospitality Group",
      },
    ],
  },
};

const STATS = [
  { figure: "12", label: "Units in active operation" },
  { figure: "5", label: "Southeast cities" },
  { figure: "8", label: "Years running co-living and MTR" },
  { figure: "92%", label: "Trailing 12-month occupancy" },
];

export default function CoLivingPage() {
  return (
    // Publishes the co-living lane tokens to the whole page. Eyebrows pick up
    // BNP red, the Resources block picks up the wash, and everything else stays
    // on the house teal/gold palette. See src/lib/lanes.ts.
    <LaneSection lane="coliving">
      <OfferingHero
        eyebrow="Room Rentals · Co-living"
        headline="Build a Room Rental Business That Runs on Systems,"
        accentWord="Not Stress."
        message="We help property owners build profitable room rental (co-living) businesses through proven systems, practical education, and real-world operational support. Whether you are evaluating your first property or improving an existing portfolio, you will find the tools, education, and support to build a business that runs with more consistency and less chaos."
        primaryCta={{
          label: "Explore Free Resources",
          href: "#free-resources",
        }}
        secondaryCta={{
          label: "Book a Discovery Call",
          href: bookingUrl({
            founder: "della",
            source: BOOKING_SOURCES.COLIVING_HERO,
          }),
        }}
        image={{
          src: "/images/Website%20Images/hf_20260510_014447_ef5dbd72-7cea-474b-b318-1c2098bc0723.png",
          alt: "A Southeast craftsman bungalow under live oaks, the property type room rental operators convert room by room",
        }}
        note="Whether you start with our free resources, the book, the course, or the Masterclass, we have organized everything to help you take the next step."
      />

      {/* Trust bar. Same four figures as /della — this is the same operator, and
          the numbers should never disagree between her two surfaces. */}
      <section className="bg-deep-teal py-6 px-6">
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

      {/* Curves straight out of the deep-teal stats bar into the terminology
          section. fromColor must track whatever sits directly above it: a
          pull-quote band on the lane wash used to live here, and leaving the
          wash color behind after removing it would seam against the teal. */}
      <SectionDivider fromColor={C.deepTeal} toColor={C.white} flip />

      <CoLivingOverview />
      {/* The one large-area use of the lane color on this page: the tools block
          sits on the co-living wash instead of plain off-white. Dividers have to
          match the wash or the curve seams. */}
      <SectionDivider fromColor={C.white} toColor={LANES.coliving.wash} />
      <CoLivingResources />
      <SectionDivider fromColor={LANES.coliving.wash} toColor={C.cream} flip />
      <CoLivingCourse />
      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} />
      <CoLivingLive />
      <SectionDivider fromColor={C.nearBlack} toColor={C.offWhite} flip />
      <CoLivingGear />
      <SectionDivider fromColor={C.offWhite} toColor={C.white} />
      <CoLivingInsights />

      {/* Closing image band, then the one CTA this whole page is pointed at. */}
      <section className="bg-cream py-8 md:py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm">
            <Image
              src="/images/Website%20Images/Golden%20hour%20Atlanta%20Neighborhood.png"
              alt="A Southeast neighborhood at golden hour where co-living demand concentrates"
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(1.05)" }}
            />
          </div>
        </div>
      </section>

      <section className="bg-deep-teal py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            Ready to talk
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            Bring Your Questions to the Team
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-6 max-w-2xl mx-auto">
            Whether you are evaluating your first property or optimizing an
            existing portfolio, we are here to help you make informed decisions.
          </p>
          <p className="font-sans text-base md:text-lg text-white/70 leading-snug mb-12 max-w-2xl mx-auto">
            Every conversation starts with a Discovery Call so we can understand
            your goals and determine whether we are the right fit to support
            you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href={bookingUrl({
                founder: "della",
                source: BOOKING_SOURCES.COLIVING_FINAL_CTA,
              })}
              variant="primary"
              size="lg"
            >
              Book a Discovery Call
            </Button>
            <Link
              href="/della"
              className="inline-flex items-center justify-center font-sans font-semibold text-white/85 hover:text-warm-gold transition-colors duration-200 text-lg underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold"
            >
              Meet the Operator
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.deepTeal} toColor={C.nearBlack} />
      <CoLivingNewsletter />
    </LaneSection>
  );
}
