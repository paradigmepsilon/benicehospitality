import type { Metadata } from "next";
import Image from "next/image";
import CourseHero from "@/components/sections/courses/CourseHero";
import StatsStrip from "@/components/sections/courses/StatsStrip";
import CarRentalRichesTierPreview from "@/components/sections/courses/CarRentalRichesTierPreview";
import CarRentalRichesWaitlistTrigger from "@/components/sections/waitlist/CarRentalRichesWaitlistTrigger";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "Car Rental Riches",
  description:
    "The Host-to-Operator method retuned for Turo and rental-fleet operators. 3 commitment tiers, same operator-grade depth. Founding pricing announced 2026. Join the waitlist.",
  alternates: {
    canonical: "https://benicehospitality.com/courses/car-rental-riches",
  },
  openGraph: {
    title: "Car Rental Riches | BNHG",
    description:
      "The Host-to-Operator method retuned for Turo and rental-fleet operators. Same 3 commitment tiers, same operator-grade depth. Drops 2026.",
    url: "https://benicehospitality.com/courses/car-rental-riches",
    type: "website",
  },
};

const MODULE_IMAGE_BASE = "/images/Website Images";

const CURRICULUM = [
  {
    number: "01",
    phase: "Phase 1 · Foundation",
    title: "The Turo + Fleet Rental Opportunity",
    body: "Why now. The 2026 peer-to-peer car-rental and fleet landscape. Why Turo unit economics still work after the platform fee changes. The Southeast metro map and the airport-vs-neighborhood demand split.",
    image: `${MODULE_IMAGE_BASE}/crr-module-01-opportunity.png`,
    imageAlt: "Clean white economy sedan parked in a suburban driveway at golden hour",
  },
  {
    number: "02",
    phase: "Phase 1 · Foundation",
    title: "Legal, Insurance & Business Setup",
    body: "Commercial vs. personal insurance, the Turo protection plans demystified, LLC formation for fleet operators, lien-holder rules by state, and the paperwork stack that keeps you covered when something goes wrong.",
    image: `${MODULE_IMAGE_BASE}/crr-module-02-legal-setup.png`,
    imageAlt: "Wooden desk with paperwork folio, fountain pen, car keys, and an olive plant",
  },
  {
    number: "03",
    phase: "Phase 1 · Foundation",
    title: "Choosing Your Path",
    body: "Solo host vs. fleet operator vs. co-host. The capital calculator, the time-to-payback exercise, and the forced-commitment decision that gates the rest of the course. Pick a path before you go shopping for vehicles.",
    image: `${MODULE_IMAGE_BASE}/crr-module-03-choosing-path.png`,
    imageAlt: "Overhead view of a folded road map with three sets of car keys placed on it",
  },
  {
    number: "04",
    phase: "Phase 2 · Acquisition",
    title: "Market & Vehicle Selection",
    body: "AI-powered market research the competition doesn't teach. Which makes and models actually earn in your metro. 20+ prompts. Demand-driver mapping for 7 Southeast metros. The vehicle-class matrix (economy, mid, premium, EV, specialty).",
    image: `${MODULE_IMAGE_BASE}/crr-module-04-market-vehicle.png`,
    imageAlt: "Hands holding a phone showing a Southeast map with a blurred economy car behind",
  },
  {
    number: "05",
    phase: "Phase 2 · Acquisition",
    title: "Securing Your First Vehicles",
    body: "Cash purchase vs. financed vs. lease-takeover vs. fleet partnerships. The dealer-negotiation playbook. The credit-stacking framework for operators going from 1 to 3 cars. The lien-friendly insurance setup most people miss.",
    image: `${MODULE_IMAGE_BASE}/crr-module-05-securing-vehicles.png`,
    imageAlt: "Handshake over a dealership desk with car keys and a Toyota Corolla visible through the window",
  },
  {
    number: "06",
    phase: "Phase 3 · Setup",
    title: "Hospitality-Grade Vehicle Prep",
    body: "The BNHG vehicle-handoff experience. Welcome kit, scent strategy, what to keep in the glovebox, the detail checklist that earns 5 stars. The 25+ signature touches that separate you from the host renting the dirty Camry.",
    image: `${MODULE_IMAGE_BASE}/crr-module-06-vehicle-prep.png`,
    imageAlt: "Pristine economy car interior with a handwritten welcome card on the passenger seat",
  },
  {
    number: "07",
    phase: "Phase 3 · Setup",
    title: "Your Modern Tech Stack",
    body: "Turo Pro tooling, telematics and GPS, smart-key handover, dash cams, fuel and toll automation, mileage logging, and the accounting stack (Stessa or QBO) configured for vehicle depreciation. The stack that runs without you in the loop.",
    image: `${MODULE_IMAGE_BASE}/crr-module-07-tech-stack.png`,
    imageAlt: "iPhone on a wooden desk showing a rental app dashboard next to a black key fob",
  },
  {
    number: "08",
    phase: "Phase 4 · Launch",
    title: "Listing & Distribution Strategy",
    body: "Turo first (the channel where your first 100 trips live), then the off-platform direct-booking play. 15+ AI listing-copy prompts. The photo strategy that earns the impression. Headline formulas tuned to the vehicle category.",
    image: `${MODULE_IMAGE_BASE}/crr-module-08-listing-strategy.png`,
    imageAlt: "Photographer shooting a clean white Toyota Corolla against a stucco wall at golden hour",
  },
  {
    number: "09",
    phase: "Phase 4 · Launch",
    title: "Pricing for Profit",
    body: "Dynamic pricing tuned for the Turo algorithm. The length-of-trip framework most hosts get wrong. Seasonal calendars for 7 Southeast metros. The math behind the difference between a $9,000 a year vehicle and a $14,000 a year vehicle.",
    image: `${MODULE_IMAGE_BASE}/crr-module-09-pricing.png`,
    imageAlt: "Open notebook with handwritten number columns, calculator, car key, and coffee on a wooden desk",
  },
  {
    number: "10",
    phase: "Phase 5 · Operations",
    title: "Guest Experience Systems",
    body: "20+ message templates across the trip lifecycle. The 25-scenario incident playbook (damage, late return, smoking, mileage overage, mechanical issue). Difficult-guest scripts. The communication cadence that protects your 4.95+ rating.",
    image: `${MODULE_IMAGE_BASE}/crr-module-10-guest-experience.png`,
    imageAlt: "Host handing car keys to a traveler with a carry-on bag beside a white Honda Civic",
  },
  {
    number: "11",
    phase: "Phase 5 · Operations",
    title: "Cleaning, Detailing & Maintenance",
    body: "The hospitality-grade detail checklist. Preventive-maintenance calendar by mileage and time. 6-vendor essential network (detailer, mobile mechanic, tire shop, glass repair, body shop, tow). Emergency response protocol when a trip goes sideways.",
    image: `${MODULE_IMAGE_BASE}/crr-module-11-cleaning-maintenance.png`,
    imageAlt: "Detailer in a clean apron wiping down the hood of a Toyota Corolla economy sedan",
  },
  {
    number: "12",
    phase: "Phase 6 · Growth",
    title: "Scaling Beyond Your First Vehicle",
    body: "Vehicle #1 readiness audit. SOP template library (15+ pre-built). VA hiring playbook for fleet operators. The 5 to 15 vehicle roadmap. Path-to-W-2-Replacement calculator. Honest 24 to 36 month timeline.",
    image: `${MODULE_IMAGE_BASE}/crr-module-12-scaling.png`,
    imageAlt: "Row of three clean economy sedans parked side by side in a gravel lot at golden hour",
  },
];

const BONUS_PACK = {
  title: "Bonus Pack: Direct Booking & AI Visibility for Fleet",
  body: "The intro (4 lessons) ships in every tier. Schema, llms.txt, the foundation AI-visibility checklist tuned for vehicle listings. Cohort and Operator unlock the deep dive: GEO/AEO content strategy, third-party citations, MCP readiness, the off-Turo direct-booking brand. The work that pays off from 2026 through 2030.",
};

export default function CRRPage() {
  return (
    <>
      <CourseHero
        eyebrow="Coming 2026 · Join the waitlist"
        headline={
          <>
            Car Rental
            <br />
            Riches.
          </>
        }
        body="The Host-to-Operator method retuned for Turo and rental-fleet operators. Same 3 commitment tiers, same operator-grade depth. Drops 2026."
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

      {/* Curriculum perk-card grid (typographic — no module imagery yet) */}
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
                and time with Della you get. Founding pricing and exact
                numbers drop when the doors open in 2026.
              </p>
            </AnimatedItem>
          </div>

          <CarRentalRichesTierPreview />

          <div className="text-center mt-10 max-w-2xl mx-auto">
            <p className="font-sans text-sm text-charcoal/70 italic">
              Founding pricing: the first 100 students per tier will get launch
              pricing when Car Rental Riches opens in 2026. The waitlist is
              first in line, ahead of any public announcement.
            </p>
          </div>

          <div className="flex justify-center mt-10">
            <AnimatedItem>
              <CarRentalRichesWaitlistTrigger variant="primary" size="lg">
                Join the waitlist
              </CarRentalRichesWaitlistTrigger>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
