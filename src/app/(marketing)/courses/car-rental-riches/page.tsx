import type { Metadata } from "next";
import Image from "next/image";
import CourseHero from "@/components/sections/courses/CourseHero";
import StatsStrip from "@/components/sections/courses/StatsStrip";
import CarRentalRichesTierPreview from "@/components/sections/courses/CarRentalRichesTierPreview";
import CarRentalRichesWaitlistTrigger from "@/components/sections/waitlist/CarRentalRichesWaitlistTrigger";
import CrrFoundingBuyButton from "@/components/sections/courses/CrrFoundingBuyButton";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { CRR, isCrrPresaleOpen } from "@/lib/car-rental-riches";
import { isOperatorBundleOpen } from "@/lib/operator-bundle";
import OperatorBundleBand from "@/components/sections/courses/OperatorBundleBand";

export const metadata: Metadata = {
  title: "Car Rental Riches",
  description:
    "Build a profitable car rental business in the 2026 earnings-plan era. Taught by a real Atlanta fleet operator. Founding Member pricing open now: $197.",
  alternates: {
    canonical: "https://benicehospitality.com/courses/car-rental-riches",
  },
  openGraph: {
    title: "Car Rental Riches | BNHG",
    description:
      "The Host-to-Operator method retuned for Turo hosts and small fleet operators. Same 3 commitment tiers, same operator-grade depth. Drops 2026.",
    url: "https://benicehospitality.com/courses/car-rental-riches",
    type: "website",
  },
};

const MODULE_IMAGE_BASE = "/images/Website Images";

// Mirrors the production master plan (Car Rental Riches workspace,
// 01_Course/course_master_plan.md). Keep this in sync with what the modules
// actually teach — the page must sell the course that exists.
const CURRICULUM = [
  {
    number: "01",
    phase: "Phase 1 · Foundation",
    title: "The 2026 Turo Opportunity",
    body: "What actually changed in 2026: the three earnings plans, variable host share, and why the new rules reward operators over dabblers. Turo's real numbers with gross and net labeled honestly, and a clear-eyed look at whether this business fits you.",
    image: `${MODULE_IMAGE_BASE}/crr-module-01-opportunity.png`,
    imageAlt: "Clean white economy sedan parked in a suburban driveway at golden hour",
  },
  {
    number: "02",
    phase: "Phase 1 · Foundation",
    title: "Business Foundation",
    body: "Entity choice without the LLC mythology, banking and bookkeeping from day one, the startup budget for car #1, and the insurance conversation you must have first: most personal policies exclude peer-to-peer car sharing entirely.",
    image: `${MODULE_IMAGE_BASE}/crr-module-02-legal-setup.png`,
    imageAlt: "Wooden desk with paperwork folio, fountain pen, car keys, and an olive plant",
  },
  {
    number: "03",
    phase: "Phase 2 · Acquisition",
    title: "Market Analysis & Vehicle Underwriting",
    body: "The signature method: read your local market, score a candidate car on six factors, and run it through the real Vehicle Profitability Calculator, net of Turo's share, depreciation, and every operating cost. PROCEED, CAUTION, or PASS before you spend a dollar.",
    image: `${MODULE_IMAGE_BASE}/crr-module-04-market-vehicle.png`,
    imageAlt: "Hands holding a phone showing a Southeast map with a blurred economy car behind",
  },
  {
    number: "04",
    phase: "Phase 2 · Acquisition",
    title: "Acquisition & Financing",
    body: "Where operators actually buy, inspection discipline inside Turo's eligibility box, the cash-car versus financing debate taught fairly, business credit without the free-Lamborghini mythology, and pre-listing prep through trip-ready.",
    image: `${MODULE_IMAGE_BASE}/crr-module-05-securing-vehicles.png`,
    imageAlt: "Handshake over a dealership desk with car keys and a Toyota Corolla visible through the window",
  },
  {
    number: "05",
    phase: "Phase 3 · Launch",
    title: "Listing & Pricing Mastery",
    body: "Photos and copy that convert, then the 2026 pricing levers: base rates from your underwriting, the non-refundable option, long-trip discounts, and the variable-share game where advance bookings can pay up to 100 percent of trip price.",
    image: `${MODULE_IMAGE_BASE}/crr-module-08-listing-strategy.png`,
    imageAlt: "Photographer shooting a clean white Toyota Corolla against a stucco wall at golden hour",
  },
  {
    number: "06",
    phase: "Phase 3 · Launch",
    title: "Operations That Scale From Day One",
    body: "The turnover system built around Turo's 24-hour photo windows, hospitality-grade cleaning, maintenance as a system (including the rating rule that can delist your car), and the automation stack with an honest weekly hour budget.",
    image: `${MODULE_IMAGE_BASE}/crr-module-06-vehicle-prep.png`,
    imageAlt: "Pristine economy car interior with a handwritten welcome card on the passenger seat",
  },
  {
    number: "07",
    phase: "Phase 4 · Protection",
    title: "Protection, Claims & Damage Defense",
    body: "What Turo's protection actually is (and is not), choosing your damage responsibility like an underwriter, the photo-metadata protocol that wins claims under the 2026 rules, the claims-day walkthrough, and coverage beyond Turo.",
    image: `${MODULE_IMAGE_BASE}/crr-module-07-tech-stack.png`,
    imageAlt: "iPhone on a wooden desk showing a rental app dashboard next to a black key fob",
  },
  {
    number: "08",
    phase: "Phase 4 · Protection",
    title: "Guest Experience & Five-Star Defense",
    body: "The communication cadence across the trip lifecycle, expectation-setting that prevents issues, scripts for when guests go wrong, and the review engine that compounds into search visibility and bookings.",
    image: `${MODULE_IMAGE_BASE}/crr-module-10-guest-experience.png`,
    imageAlt: "Host handing car keys to a traveler with a carry-on bag beside a white Honda Civic",
  },
  {
    number: "09",
    phase: "Phase 5 · Growth",
    title: "The Money Module",
    body: "Your real P&L: gross versus cash net versus true net after depreciation. The Fleet Financial Model, tax concepts without the mythology (professionally reviewed), and the monthly KPI ritual that tells you when to reprice, hold, or sell.",
    image: `${MODULE_IMAGE_BASE}/crr-module-09-pricing.png`,
    imageAlt: "Open notebook with handwritten number columns, calculator, car key, and coffee on a wooden desk",
  },
  {
    number: "10",
    phase: "Phase 5 · Growth",
    title: "Scaling: Car #2 to Fleet",
    body: "The car-#2 readiness rule, systems before staff, what breaks at three to five cars, your first hire, and co-hosting in both directions, including Turo's official program.",
    image: `${MODULE_IMAGE_BASE}/crr-module-11-cleaning-maintenance.png`,
    imageAlt: "Detailer in a clean apron wiping down the hood of a Toyota Corolla economy sedan",
  },
  {
    number: "11",
    phase: "Phase 5 · Growth",
    title: "Beyond the Marketplace",
    body: "The BNHG signature module: direct booking as a system. The legal and insurance floor, the booking stack, finding direct customers the way Be Nice Autos does with rideshare drivers, and the hybrid model that stops any platform from owning your revenue.",
    image: `${MODULE_IMAGE_BASE}/crr-module-03-choosing-path.png`,
    imageAlt: "Overhead view of a folded road map with three sets of car keys placed on it",
  },
  {
    number: "12",
    phase: "Phase 6 · Launch Plan",
    title: "The 90-Day Launch Plan",
    body: "Week by week from zero to first booking to steady state, the failure-mode playbook for when it goes wrong, and the capstone: a full underwriting workbook on a real car in your market.",
    image: `${MODULE_IMAGE_BASE}/crr-module-12-scaling.png`,
    imageAlt: "Row of three clean economy sedans parked side by side in a gravel lot at golden hour",
  },
];

const BONUS_PACK = {
  title: "Bonus Pack: Direct Booking & AI Visibility for Fleet",
  body: "The intro (4 lessons) ships in every tier. Schema, llms.txt, the foundation AI-visibility checklist tuned for vehicle listings. Cohort and Operator unlock the deep dive: GEO/AEO content strategy, third-party citations, MCP readiness, the off-Turo direct-booking brand. The work that pays off from 2026 through 2030.",
};

export default async function CRRPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const { purchase } = await searchParams;
  const justPurchased = purchase === "success" || purchase === "bundle-success";
  const presaleOpen = isCrrPresaleOpen();
  const bundleOpen = isOperatorBundleOpen();
  return (
    <>
      {justPurchased && (
        <section className="bg-deep-teal">
          <div className="mx-auto max-w-3xl px-6 py-10 text-center">
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
              Founding Member confirmed
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight">
              You&apos;re in. Check your email for your login link and the
              founding welcome from Alex.
            </h2>
            <p className="font-sans text-sm text-white/80 mt-4 leading-relaxed">
              One more thing worth grabbing while you&apos;re here: Turo&apos;s
              2026 claim rules reject photos without date, time, and location
              metadata. <strong>ClaimProof</strong> is the damage-dispute
              defense kit Alex uses to survive claims, and it&apos;s the
              backbone of Module 7.
            </p>
            <a
              href="/claimproof"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-warm-gold bg-warm-gold px-8 py-3 mt-6 font-sans text-base font-semibold tracking-wide text-near-black transition-all duration-200 hover:border-gold-light hover:bg-gold-light"
            >
              Add ClaimProof from $47
            </a>
          </div>
        </section>
      )}
      <CourseHero
        eyebrow={
          justPurchased
            ? "Founding Member · Welcome aboard"
            : presaleOpen
              ? `Founding launch · $${CRR.foundingPriceUsd} (retail $${CRR.retailPriceUsd})`
              : `Founding price $${CRR.foundingPriceUsd} · presale opens with Module 1`
        }
        headline={
          <>
            Car Rental
            <br />
            Riches.
          </>
        }
        body={
          presaleOpen
            ? `Turo rewrote its rules in 2026, and most advice you'll find is now stale. This is the operator's course: real underwriting math, claims defense, and the direct-booking system, from a real Atlanta fleet. Founding Members lock in $${CRR.foundingPriceUsd}.`
            : `Turo rewrote its rules in 2026, and most advice you'll find is now stale. This is the operator's course: real underwriting math, claims defense, and the direct-booking system, from a real Atlanta fleet. The waitlist locks the $${CRR.foundingPriceUsd} founding price for when the presale opens.`
        }
        primaryCta={{ label: "See the curriculum", href: "#curriculum" }}
        secondaryCta={{
          label: "Login",
          href: "/login",
        }}
        backgroundImage={{
          src: "/images/Website Images/hf_20260502_204237_3666d5f3-848c-491f-9f2d-2f4a233b43c6.png",
          alt: "Editorial fleet vehicle scene",
        }}
        previewTitle="What's in the curriculum"
        previewItems={[
          "Phase 1 · Foundation: opportunity framing, insurance setup, path commitment",
          "Phase 2 · Acquisition: AI-powered vehicle selection and first-fleet financing",
          "Phase 3 · Setup: hospitality-grade vehicle prep and the modern fleet tech stack",
          "Phase 4 · Launch: Turo-first distribution and the dynamic-pricing framework",
          "Phase 5 · Operations: guest experience, detail and maintenance vendor network",
          "Phase 6 · Growth: SOPs, VA hiring, the path-to-W-2-replacement roadmap",
          "Bonus Pack: direct booking and AI visibility for the 2026 through 2030 era",
        ]}
      />

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      <StatsStrip
        items={[
          { value: "12", label: "Modules + Bonus Pack" },
          { value: "6", label: "Phases" },
          { value: "120+", label: "Lessons planned" },
          { value: "2026", label: "Launch year" },
        ]}
      />

      {/* Editorial image strip: four full-bleed fleet photos */}
      <section aria-hidden className="w-full bg-white p-2 md:p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            {
              src: "/images/Website Images/crr-collage-01-keys-handoff.png",
              alt: "Hand holding out a set of car keys at golden hour",
            },
            {
              src: "/images/Website Images/crr-collage-02-steering-wheel.png",
              alt: "Driver POV hands on an economy sedan steering wheel at golden hour",
            },
            {
              src: "/images/Website Images/crr-collage-03-dashboard.png",
              alt: "Pristine economy sedan dashboard with infotainment screen",
            },
            {
              src: "/images/Website Images/crr-collage-04-exterior.png",
              alt: "Three-quarter exterior of a clean white Toyota Corolla at golden hour",
            },
          ].map((img) => (
            <div key={img.src} className="relative aspect-[4/3] md:aspect-square">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Who this is for */}
      <AnimatedSection theme="off-white" className="py-20 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <AnimatedItem>
              <SectionLabel>Who this is for</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-6">
                2 operators. 1 course.
              </h2>
            </AnimatedItem>
          </div>
          <AnimatedItem>
            <div className="font-sans text-base md:text-lg text-charcoal leading-relaxed space-y-4">
              <p className="font-semibold text-deep-teal">
                The aspiring host without a vehicle yet.
              </p>
              <p>
                You&rsquo;re looking at Turo and peer-to-peer car rental
                because the math works and the W-2 doesn&rsquo;t. At least
                not for the next 20 years. You want to operate in the Southeast
                (Atlanta, Tampa, Charlotte, Raleigh, Nashville, Houston,
                somewhere on that map). You haven&rsquo;t bought your first
                vehicle yet, and you want a structured path from
                &ldquo;reading about this on Reddit&rdquo; to &ldquo;first
                trip in 60 days.&rdquo; Phases 1 and 2 are built for you.
                Opportunity framing, insurance and business setup, path
                commitment, then AI-powered vehicle selection and the
                financing work that lands the first car.
              </p>
              <p className="font-semibold text-deep-teal pt-2">
                The operator past hosting.
              </p>
              <p>
                You have between 3 and 15 vehicles. Some mix of economy,
                mid-tier, premium, or specialty. Your revenue is real. Your
                time is the bottleneck. You&rsquo;re tired of Sunday-night
                detail scrambles, you&rsquo;ve had at least one bad trip you
                wish you&rsquo;d caught earlier, and you&rsquo;re paying
                enough in platform fees to fund a full-time team member.
                Phases 3 through 6 are where you&rsquo;ll spend your time.
                Hospitality-grade vehicle prep, the modern fleet tech stack,
                the dynamic-pricing framework, guest-experience systems,
                vendor networks, and the path to W-2 replacement.
              </p>
              <p className="text-warm-gold font-semibold pt-2">
                Same curriculum, both directions. Marcus runs 6 vehicles in
                suburban Atlanta and started in Phase 3. Tasha had no car yet
                and started in Phase 1. The course was built for both of them.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* Curriculum perk-card grid (typographic, no module imagery yet) */}
      <AnimatedSection
        theme="light"
        id="curriculum"
        className="py-20 md:py-24 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The curriculum</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                6 phases. 12 modules. Plus the Bonus Pack.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-charcoal/75 leading-relaxed mt-5">
                Same curriculum in every tier. Foundation through scaling. The
                full arc, from no vehicle yet to a fleet that runs without you
                on call.
              </p>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {CURRICULUM.map((m) => (
              <AnimatedItem key={m.number}>
                <article className="bg-white border border-light-gray rounded-lg overflow-hidden h-full hover:border-deep-teal/40 transition-colors duration-200 flex flex-col">
                  <div className="relative aspect-[3/2] w-full bg-cream">
                    <Image
                      src={m.image}
                      alt={m.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-7 md:p-8 flex-1 flex flex-col">
                    <p
                      aria-hidden
                      className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2"
                    >
                      {m.phase}
                    </p>
                    <p
                      aria-hidden
                      className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/55 mb-4"
                    >
                      Module {m.number}
                    </p>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight mb-3">
                      {m.title}
                    </h3>
                    <p className="font-sans text-base text-charcoal leading-relaxed">
                      {m.body}
                    </p>
                  </div>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          {/* Bonus Pack callout */}
          <AnimatedItem>
            <article className="mt-10 bg-deep-teal text-white rounded-lg p-8 md:p-10 border-2 border-warm-gold">
              <p
                aria-hidden
                className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3"
              >
                Bonus Pack · Included
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-cream leading-tight mb-4">
                {BONUS_PACK.title}
              </h3>
              <p className="font-sans text-base md:text-lg text-cream/85 leading-relaxed">
                {BONUS_PACK.body}
              </p>
            </article>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} />

      {/* Tier preview */}
      <AnimatedSection
        theme="off-white"
        id="tiers"
        className="py-20 md:py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The 3 tiers</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                Same curriculum. 3 commitment levels.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-charcoal/75 leading-relaxed mt-5">
                Every tier ships the full 12-module curriculum and the
                Bonus Pack. What changes is how much support, accountability,
                and time with Alex you get. Founding pricing is open now on
                the self-paced tier; cohort and operator numbers drop when
                those doors open.
              </p>
            </AnimatedItem>
          </div>

          <CarRentalRichesTierPreview presaleOpen={presaleOpen} />

          <div className="text-center mt-10 max-w-2xl mx-auto">
            <p className="font-sans text-sm text-charcoal/70 italic">
              Founding Members lock in ${CRR.foundingPriceUsd} (retail $
              {CRR.retailPriceUsd}), get every module the day it ships,
              lifetime access with every future update, and a 30-day
              unconditional money-back guarantee.
              {presaleOpen
                ? ""
                : " The presale opens when Module 1 is produced; the waitlist hears first."}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 mt-10">
            {presaleOpen ? (
              <>
                <AnimatedItem>
                  <CrrFoundingBuyButton source="page-footer" />
                </AnimatedItem>
                <AnimatedItem>
                  <p className="font-sans text-sm text-charcoal/60">
                    Not ready?{" "}
                    <CarRentalRichesWaitlistTrigger variant="ghost" size="sm">
                      Join the waitlist instead
                    </CarRentalRichesWaitlistTrigger>
                  </p>
                </AnimatedItem>
              </>
            ) : (
              <AnimatedItem>
                <CarRentalRichesWaitlistTrigger variant="primary" size="lg">
                  Join the waitlist, lock ${CRR.foundingPriceUsd}
                </CarRentalRichesWaitlistTrigger>
              </AnimatedItem>
            )}
          </div>

          <div className="text-center mt-8 max-w-2xl mx-auto">
            <p className="font-sans text-xs text-charcoal/50">
              Car Rental Riches is an independent educational product and is not
              affiliated with or endorsed by Turo Inc. Educational content only,
              not financial, legal, tax, or insurance advice. Earnings figures
              discussed are illustrative, not a promise of results.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {bundleOpen ? <OperatorBundleBand source="crr-page" /> : null}

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
