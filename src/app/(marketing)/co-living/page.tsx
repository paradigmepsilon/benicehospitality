import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CoLivingHero from "@/components/sections/co-living/CoLivingHero";
import CoLivingOverview from "@/components/sections/co-living/CoLivingOverview";
import CoLivingResources from "@/components/sections/co-living/CoLivingResources";
import CoLivingCourse from "@/components/sections/co-living/CoLivingCourse";
import CoLivingLive from "@/components/sections/co-living/CoLivingLive";
import CoLivingGear from "@/components/sections/co-living/CoLivingGear";
import CoLivingInsights from "@/components/sections/co-living/CoLivingInsights";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import { SECTION_COLORS as C } from "@/lib/section-colors";
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
    <>
      <CoLivingHero />

      {/* Trust bar. Same four figures as /della — this is the same operator, and
          the numbers should never disagree between her two surfaces. */}
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

      <CoLivingOverview />
      <SectionDivider fromColor={C.white} toColor={C.offWhite} />
      <CoLivingResources />
      <SectionDivider fromColor={C.offWhite} toColor={C.white} flip />
      <CoLivingCourse />
      <SectionDivider fromColor={C.white} toColor={C.nearBlack} />
      <CoLivingLive />
      <SectionDivider fromColor={C.nearBlack} toColor={C.offWhite} flip />
      <CoLivingGear />
      <SectionDivider fromColor={C.offWhite} toColor={C.white} />
      <CoLivingInsights />

      {/* Closing image band, then the one CTA this whole page is pointed at. */}
      <section className="bg-cream py-12 md:py-14 px-6">
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

      <section className="bg-deep-teal py-16 md:py-20 px-6">
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
    </>
  );
}
