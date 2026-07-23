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
    "Co-living and mid-term rental operations from an operator running 12 units across 5 Southeast cities. Free property scoring tools, the Room Rental Riches course, weekly live sessions, and the gear list. Run by Della Henry.",
  keywords: [
    "co-living",
    "co-living properties",
    "rent by the room",
    "co-living operator",
    "mid-term rental",
    "MTR Atlanta",
    "co-living Southeast",
    "travel nurse housing",
    "corporate housing",
    "room rental business",
    "Della Henry",
    "Be Nice Hospitality",
  ],
  alternates: { canonical: "https://benicehospitality.com/co-living" },
  openGraph: {
    title: "Co-living, run like a business.",
    description:
      "Free property scoring, the course, weekly lives, and the gear list. From an operator running 12 co-living and mid-term units across 5 Southeast cities.",
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
        eyebrow="Co-living · Run by Della Henry"
        headline="Co-living, run like"
        accentWord="a business."
        message="I run twelve co-living and mid-term units across five Southeast cities. The calculators, the checklists, the course, and the answers I wish somebody had handed me in year one all live on this page."
        primaryCta={{
          label: "Score Your Property Free",
          href: "/resources/co-living-property-calculator",
        }}
        secondaryCta={{
          label: "Book a Call With Me",
          href: bookingUrl({
            founder: "della",
            source: BOOKING_SOURCES.COLIVING_HERO,
          }),
        }}
        image={{
          src: "/images/Website%20Images/hf_20260510_014447_ef5dbd72-7cea-474b-b318-1c2098bc0723.png",
          alt: "A Southeast craftsman bungalow under live oaks, the property type co-living operators convert room by room",
        }}
        note="No sales theater. Calls are working sessions."
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

      {/* Della's portrait moved here when the hero became the shared
          OfferingHero. Her face still lands above the fold on most screens and
          keeps the handoff from her bio page personal. Quote first, portrait
          right: the words carry the weight, the face confirms who said them. */}
      <section className="bg-(--lane-wash,var(--color-off-white)) py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-14 items-center">
          <figure className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6 md:pl-8">
            <span
              aria-hidden
              className="block font-display text-5xl md:text-6xl leading-none text-(--lane-accent,var(--color-warm-gold)) mb-2"
            >
              &ldquo;
            </span>
            <blockquote className="font-display italic text-xl md:text-2xl lg:text-3xl text-deep-teal leading-snug max-w-2xl">
              Everything I know about renting by the room lives on this page.
              Start with the free property score. It takes about ten minutes and
              tells you whether your property is worth converting before you
              spend a dollar on it.
            </blockquote>
            <figcaption className="mt-5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold))">
              Della Henry
              <span className="block mt-1 font-normal tracking-normal normal-case text-sm text-charcoal/70">
                Co-founder, Be Nice Hospitality Group
              </span>
            </figcaption>
          </figure>

          <div className="relative w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 shrink-0 overflow-hidden rounded-sm lg:justify-self-end">
            <Image
              src="/images/Website%20Images/Della%20Casual.png"
              alt="Della Henry, co-living and mid-term rental operator, co-founder of Be Nice Hospitality Group"
              fill
              sizes="(max-width: 768px) 10rem, (max-width: 1024px) 13rem, 15rem"
              className="object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
            />
          </div>
        </div>
      </section>

      {/* Separates Della's quote from "What co-living actually is." The quote
          band sits on the lane wash so this curve has two colors to work with —
          a white-on-white divider would render invisible. */}
      <SectionDivider
        fromColor={LANES.coliving.wash}
        toColor={C.white}
        flip
      />

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
            Still have a question
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            Bring it to a call.
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-12 max-w-2xl mx-auto">
            A deal you are underwriting. A room that will not fill. A city
            ordinance nobody can give you a straight answer on. Thirty minutes
            with me beats another month of guessing. If I cannot help, I will
            tell you on the call.
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
              Book a Call With Della
            </Button>
            <Link
              href="/della"
              className="inline-flex items-center justify-center font-sans font-semibold text-white/85 hover:text-warm-gold transition-colors duration-200 text-lg underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold"
            >
              Or read her story first
            </Link>
          </div>
        </div>
      </section>
    </LaneSection>
  );
}
