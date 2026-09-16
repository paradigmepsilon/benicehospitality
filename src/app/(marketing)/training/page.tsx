import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import PhotoHero from "@/components/sections/shared/PhotoHero";
import PhotoCTA from "@/components/sections/shared/PhotoCTA";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { RRR_PRICES, RRR_PATHS } from "@/lib/room-rental-riches";
import { CRR, isCrrPresaleOpen } from "@/lib/car-rental-riches";
import { isOperatorBundleOpen } from "@/lib/operator-bundle";
import OperatorBundleBand from "@/components/sections/courses/OperatorBundleBand";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Room Rental Riches and Car Rental Riches: the courses behind BNHG's own co-living properties and rental fleet. Self-paced, live Masterclass, or 1:1 Operator, taught by the operators who run it.",
  alternates: { canonical: "https://www.benicehospitality.com/training" },
  openGraph: {
    title: "Training | Be Nice Hospitality Group",
    description:
      "Room Rental Riches and Car Rental Riches. Learn to run a co-living property or a rental fleet like a real business, at your own pace, live, or 1:1.",
    url: "https://www.benicehospitality.com/training",
    type: "website",
  },
};

// Display copy only. Every number reads straight from RRR_PRICES, never a
// retyped literal, so a price change in that one file is the only edit a
// future update needs.
const RRR_TIERS = [
  {
    name: "Self-paced",
    price: `$${RRR_PRICES.selfPacedUsd}`,
    listPrice: `$${RRR_PRICES.selfPacedListUsd}`,
    cadence: "On your own timeline",
    body: "The full 12-module curriculum and the Bonus Pack intro. Lifetime access, work through it whenever you have the hour.",
    href: RRR_PATHS.selfPaced,
  },
  {
    name: "Masterclass",
    price: `$${RRR_PRICES.masterclassUsd.toLocaleString("en-US")}`,
    cadence: "2-day live workshop, capped at 6",
    body: "Everything in Self-paced, plus the live 2-day workshop, a hot-seat business review, and a year in the Nice Host Network.",
    href: RRR_PATHS.masterclass,
  },
  {
    name: "Operator",
    price: `$${RRR_PRICES.operatorUsd.toLocaleString("en-US")}`,
    cadence: "90-day 1:1 with Della",
    body: "A 90-day hands-on build with Della, one on one. Starts with a discovery call, not a checkout button.",
    href: RRR_PATHS.operator,
  },
] as const;

export default function TrainingPage() {
  const crrPresaleOpen = isCrrPresaleOpen();
  const bundleOpen = isOperatorBundleOpen();

  return (
    <>
      <PhotoHero
        eyebrow="Training"
        headline="Learn to run it yourself."
        lede={
          <>
            Room Rental Riches for co-living operators and Car Rental Riches
            for fleet operators, taught by the operators who run BNHG&rsquo;s
            own units. Self-paced, live, or 1:1, all built on the same
            curriculum underneath.
          </>
        }
        primaryCta={{ label: "Room Rental Riches", href: RRR_PATHS.selfPaced }}
        secondaryCta={{ label: "Car Rental Riches", href: "/courses/car-rental-riches" }}
        image={{
          src: "/images/Website Images/course-operator-della-v1.webp",
          alt: "Della Henry teaching from a co-living property",
          position: "object-[65%_center]",
        }}
      />

      {/* Room Rental Riches */}
      <section className="bg-cream py-10 md:py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Co-living &amp; MTR</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mt-4 mb-4">
            Room Rental Riches
          </h2>
          <p className="font-sans text-base text-charcoal/85 leading-relaxed max-w-2xl mb-10">
            Della&rsquo;s 12-module curriculum for operators renting rooms by
            the door, plus the short, mid, and long-term rentals that mix in.
            Three ways in, same curriculum underneath. What changes is how
            much support, accountability, and time with Della you get.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RRR_TIERS.map((t) => (
              <Link
                key={t.name}
                href={t.href}
                className="group flex flex-col bg-white border border-light-gray rounded-lg p-7 h-full transition-all duration-200 hover:border-warm-gold hover:shadow-lg hover:-translate-y-1"
              >
                <h3 className="font-display text-xl font-semibold text-deep-teal mb-2">
                  {t.name}
                </h3>
                <p className="font-display text-3xl font-semibold text-charcoal mb-1">
                  {"listPrice" in t && (
                    <span className="text-charcoal/40 line-through text-lg mr-2">
                      {t.listPrice}
                    </span>
                  )}
                  {t.price}
                </p>
                <p className="font-sans text-xs text-charcoal/60 italic mb-4">
                  {t.cadence}
                </p>
                <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-6">
                  {t.body}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-warm-gold-dark">
                  Learn more
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <p className="font-sans text-sm text-charcoal/70 mt-8">
            Want the full curriculum and the tier comparison?{" "}
            <Link
              href={RRR_PATHS.hub}
              className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 font-medium"
            >
              See Room Rental Riches
            </Link>
            .
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* Car Rental Riches */}
      <section className="bg-white py-10 md:py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Fleet &amp; Turo</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mt-4 mb-4">
            {CRR.name}
          </h2>
          <p className="font-sans text-base text-charcoal/85 leading-relaxed max-w-2xl mb-8">
            {CRR.instructor}&rsquo;s course for Turo hosts and small fleet
            operators running 3 to 30 economy vehicles, built on 2026
            earnings-plan math and claims defense from a real Atlanta fleet.
          </p>
          <div className="max-w-md bg-cream border-2 border-warm-gold rounded-lg p-7">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold-dark mb-3">
              {crrPresaleOpen ? "Founding presale, open now" : "Founding price, locked by the waitlist"}
            </p>
            <p className="font-display text-3xl font-semibold text-charcoal mb-4">
              <span className="text-charcoal/40 line-through text-lg mr-2">
                ${CRR.retailPriceUsd}
              </span>
              ${CRR.foundingPriceUsd}
            </p>
            <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-6">
              {crrPresaleOpen
                ? `Founding Members lock in $${CRR.foundingPriceUsd} (retail $${CRR.retailPriceUsd}), get every module the day it ships, and keep lifetime access.`
                : `The presale opens once Module 1 is produced. The waitlist locks in the $${CRR.foundingPriceUsd} founding price for when it does.`}
            </p>
            <Button href={CRR.path} variant="primary" size="md" fullWidth>
              {crrPresaleOpen ? "Enroll now" : "Join the waitlist"}
            </Button>
          </div>
        </div>
      </section>

      {bundleOpen && (
        <>
          <SectionDivider fromColor={C.white} toColor={C.cream} />
          <OperatorBundleBand source="training-page" />
        </>
      )}

      <PhotoCTA
        dividerFrom={bundleOpen ? C.cream : C.white}
        headline="Would rather not run it yourself?"
        body="Hand the day-to-day to BNHG and keep ownership of the vehicle or the property."
        primary={{ label: "See how management works", href: "/management" }}
        secondary={{ label: "Browse the resources", href: "/resources" }}
        image={{
          src: "/images/Website Images/crr-collage-01-keys-handoff.png",
          alt: "Keys handed over at a vehicle",
        }}
      />
    </>
  );
}
