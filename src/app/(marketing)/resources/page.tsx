import type { Metadata } from "next";
import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { STOCK_LIBRARY } from "@/lib/stock-images";
import ResourceCard, {
  type Resource,
} from "./_components/ResourceCard";

export const metadata: Metadata = {
  title: "Resource Library",
  description:
    "An ever-growing library of operator resources. Diagnostic tools, scorecards, and free audits for property operators, boutique hotels, and auto operators. Some are free, some require a quick signup, some are bundled with the course.",
  alternates: { canonical: "https://benicehospitality.com/resources" },
  openGraph: {
    title: "Resource Library | Be Nice Hospitality Group",
    description:
      "Operator-grade resources for property operators, boutique hotels, and auto operators. Free, signup-gated, and course-bundled.",
    url: "https://benicehospitality.com/resources",
    type: "website",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Audience: Property Operators (STR / MTR / co-living)
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_RESOURCES: Resource[] = [
  {
    name: "MTR Viability Scorecard",
    body: "Forty weighted questions across seven sections. Score any single property in under ten minutes and get a Della-voice fix list for every gap.",
    bullets: [
      "Forty weighted questions across seven operator sections",
      "Score a property in under ten minutes",
      "Della-voice fix list for every gap you flag",
      "Built specifically for MTR, not generic STR scoring",
    ],
    access: "free-email",
    href: "/resources/mtr-viability-scorecard",
    status: "live",
  },
  {
    name: "Direct Booking Snapshot",
    body: "What percent of your bookings are direct? Where you are vs. where you should be, by asset class.",
    bullets: [
      "Your direct-vs.-OTA share over the trailing twelve months",
      "Benchmarks by asset class (STR, MTR, co-living)",
      "Dollar value of every percentage point you recover",
      "Three specific levers to move the number this quarter",
    ],
    access: "labs-pass",
  },
  {
    name: "OTA Cost Calculator",
    body: "What you're actually paying in OTA commissions across the year. Annualized. Brutal.",
    bullets: [
      "Total annual commission paid across every platform",
      "Per-booking and per-night true-cost breakdown",
      "What one percent of direct-share recovery is worth in dollars",
      "Comparison against the Labs benchmark for your asset class",
    ],
    access: "labs-pass",
  },
  {
    name: "Pricing Position Map",
    body: "How your nightly pricing stacks against your real comp set, not just your platform's auto-suggestions.",
    bullets: [
      "Your rates vs. a hand-picked comp set across the next 90 days",
      "Days you're leaving money on the table vs. priced too high",
      "Recommended adjustments by lead-time bracket",
      "Updated weekly so the picture stays current",
    ],
    access: "labs-pass",
  },
  {
    name: "Tech Stack Quick Scan",
    body: "What you're paying for, what's redundant, what's missing. URL in, audit out.",
    bullets: [
      "Inferred stack from a single URL, no integrations required",
      "Redundant tools flagged with annual cost",
      "Gaps flagged by impact on revenue, ops, or guest experience",
      "A prioritized 90-day stack plan",
    ],
    access: "labs-pass",
  },
  {
    name: "Automation Audit",
    body: "Which of your manual tasks could already be automated with tools you have. Prioritized by hours saved.",
    bullets: [
      "Inventory of the manual tasks eating your week",
      "Which can already be automated with tools you own",
      "Hours saved per week per automation",
      "Implementation order ranked by hours-saved-per-dollar",
    ],
    access: "labs-pass",
  },
  {
    name: "Guest List Health Check",
    body: "How big your owned email list actually is and how often you mail it. Reality check, not vanity.",
    bullets: [
      "Total owned guest emails vs. lifetime stays",
      "Send frequency reality check",
      "Engagement health (open, click, unsubscribe)",
      "Three actions to grow the list this quarter",
    ],
    access: "labs-pass",
  },
  {
    name: "Review Sentiment Sweep",
    body: "What your reviews actually say about you. Themes, gaps, easy wins. Across every platform.",
    bullets: [
      "Themes across every review platform you appear on",
      "Top complaints ranked by frequency and severity",
      "Easy wins ranked by effort and impact",
      "Side-by-side comparison against your closest comps",
    ],
    access: "labs-pass",
  },
  {
    name: "Room Rental Riches curriculum",
    body: "Twelve modules plus a bonus pack. The full Host-to-Operator method, with downloadable templates, SOPs, and the operator toolkit inside every lesson.",
    bullets: [
      "Twelve modules plus a bonus pack, self-paced",
      "Downloadable SOPs, templates, and operator toolkit in every lesson",
      "Three commitment tiers from self-paced to Della-coached",
      "The full Host-to-Operator method end-to-end",
    ],
    access: "course",
    href: "/courses/room-rental-riches",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Audience: Boutique Hotels (10 to 50 room independents)
// Combines Tier 0 free audits (each has its own /resources/[slug] page) with
// the four Signal diagnostics surfaced from the Signal sub-brand.
// ─────────────────────────────────────────────────────────────────────────────

const HOTEL_RESOURCES: Resource[] = [
  {
    name: "Revenue Opportunity Snapshot",
    body: "OTA leakage, rate parity gaps, ancillary revenue gaps. A research-backed snapshot specific to your property.",
    bullets: [
      "OTA leakage and rate parity gaps across every channel",
      "Ancillary revenue your property could be earning but isn't",
      "Per-property incremental revenue estimate",
      "Delivered as a written report within one week",
    ],
    access: "free-email",
  },
  {
    name: "Visibility & Discoverability Audit",
    body: "How easily travelers find your property, including in ChatGPT, Perplexity, and Google AI Overviews. Full channel + AEO audit with a 0 to 120 score.",
    bullets: [
      "0-to-120 score across channel visibility and AEO",
      "How you appear in ChatGPT, Perplexity, and Google AI Overviews",
      "OTA visibility audit across the major travel platforms",
      "Prioritized fix list specific to your property",
    ],
    access: "free-email",
  },
  {
    name: "AEO Optimization for Hotels",
    body: "Travelers ask ChatGPT, Perplexity, and Google AI Overviews for recommendations. Find out if you're in the answer, and what to fix if not.",
    bullets: [
      "Real prompts tested in ChatGPT, Perplexity, and Google AI Overviews",
      "Whether you appear in the answer for travel queries in your market",
      "What to fix if not: schema, listings, content, or links",
      "Benchmarks against the top competitors in your area",
    ],
    access: "free-email",
  },
  {
    name: "Online Reputation Briefing",
    body: "Your review footprint across every platform, and where perception gaps are quietly costing you bookings.",
    bullets: [
      "Your review footprint across every platform you appear on",
      "Perception gaps that quietly cost you bookings",
      "Themes you can fix this month",
      "Themes that need a longer plan",
    ],
    access: "free-email",
  },
  {
    name: "Competitive Position Map",
    body: "How you stack against your top three competitors on price, positioning, and perceived value.",
    bullets: [
      "Your top three competitors mapped on price, position, and value",
      "Where you win and where you lose",
      "Pricing power you're not currently using",
      "Ten-page written briefing",
    ],
    access: "free-email",
  },
  {
    name: "Guest Persona Highlights",
    body: "A sketch of who's actually booking boutique hotels in your market and what they're looking for.",
    bullets: [
      "Who's actually booking boutique hotels in your market",
      "What they want, what they pay, where they research",
      "Where your current marketing matches them vs. misses",
      "Three persona-specific positioning angles",
    ],
    access: "free-email",
  },
  {
    name: "Tech Stack Quick Scan",
    body: "Surface-level review of your current tech: what's redundant, what's missing, what to prioritize next.",
    bullets: [
      "Review of your PMS, channel manager, and direct booking stack",
      "Redundancies and gaps in plain English",
      "Cost-of-current-stack breakdown",
      "One-page next-tool recommendation",
    ],
    access: "free-email",
  },
  {
    name: "Guestally ROI Estimate",
    body: "A projection of the incremental revenue and time savings Guestally would generate at your property.",
    bullets: [
      "Projected incremental revenue at your property",
      "Time-saved-per-week estimate for your ops team",
      "Twelve-month payback math",
      "Sized to your room count and ADR",
    ],
    access: "free-email",
  },
  {
    name: "Quick Win Action List",
    body: "Five to ten specific, implementable actions you could take this month to move performance.",
    bullets: [
      "Five to ten implementable actions for this month",
      "Ranked by revenue impact and effort",
      "Sourced from the other diagnostics combined",
      "Della-voice, no fluff",
    ],
    access: "free-email",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Audience: Auto Operators (Turo / peer-to-peer fleet)
// This is the newest segment. Library is intentionally short and will grow
// with Car Rental Riches.
// ─────────────────────────────────────────────────────────────────────────────

const AUTO_RESOURCES: Resource[] = [
  {
    name: "Fleet Utilization Report",
    body: "Per-vehicle utilization, day-of-week patterns, fleet-mix optimization. Built for Turo operators running three or more cars.",
    bullets: [
      "Per-vehicle utilization across the trailing twelve months",
      "Day-of-week and seasonal demand patterns",
      "Fleet-mix recommendations: which cars to add or retire",
      "Built for operators running three or more vehicles",
    ],
    access: "labs-pass",
  },
  {
    name: "Car Rental Riches curriculum",
    body: "The Host-to-Operator method retuned for Turo and rental-fleet operators. Same three commitment tiers, same operator-grade depth.",
    bullets: [
      "The Host-to-Operator method retuned for Turo",
      "Three commitment tiers, same operator-grade depth",
      "Fleet-mix templates and SOPs included",
      "Drops in 2026",
    ],
    access: "course",
    status: "soon",
    waitlist: { courseSlug: "car-rental-riches", tier: "interest" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <>
      {/* Hero. Full-bleed editorial image behind the headline. Mirrors the
          dark-hero pattern used by the MTR scorecard and Tier 0 detail pages. */}
      <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <Image
          src={STOCK_LIBRARY.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-near-black via-near-black/85 to-near-black/60"
        />
        <div className="relative z-10 max-w-4xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-8">
            Resource Library
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            An ever-growing operator library.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl">
            Diagnostic tools, scorecards, and free audits we&rsquo;ve built for
            the operators we serve. Some are public, some unlock with a quick
            signup, and some are bundled inside our courses.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* Audience 1: Property Operators */}
      <AnimatedSection theme="off-white" className="py-14 md:py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <AnimatedItem>
                <SectionLabel>For property operators</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-4">
                  STR, MTR, and co-living.
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base text-charcoal/85 leading-relaxed">
                  Tools that diagnose specific operator problems, plus the full
                  Room Rental Riches curriculum for the people who want the whole
                  method. Run any diagnostic on your portfolio in minutes.
                </p>
              </AnimatedItem>
            </div>
            <AnimatedItem>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/Website Images/pexels-curtis-adams-1694007-16641323.jpg"
                  alt="Boutique short-term and mid-term rental property interior"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PROPERTY_RESOURCES.map((r) => (
              <AnimatedItem key={r.name}>
                <ResourceCard r={r} variant="light" />
              </AnimatedItem>
            ))}
          </AnimatedDiv>
          <div className="mt-10">
            <p className="font-sans text-sm text-charcoal/60 italic">
              More property-operator tools ship through Labs first. Members of
              The Nice Host Network see them before the public.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} flip />

      {/* Audience 2: Boutique Hotels */}
      <AnimatedSection
        theme="none"
        className="bg-primary-green text-white py-14 md:py-16 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <AnimatedItem>
                <SectionLabel light>For boutique hotels</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-[1.15] tracking-tight mt-4 mb-4">
                  Independent 10 to 50 room properties.
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base text-white/85 leading-relaxed">
                  Free audits and diagnostics focused on the AI-search visibility,
                  OTA-recovery, and revenue-integrity problems specific to
                  independent boutique hotels. Each one is delivered as a written
                  report; share your URL, we do the research.
                </p>
              </AnimatedItem>
            </div>
            <AnimatedItem>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/Website Images/hf_20260312_051512_fbdd9c4e-fc8a-41fa-8575-219882dfe238.jpeg"
                  alt="Independent boutique hotel exterior in warm light"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {HOTEL_RESOURCES.map((r) => (
              <AnimatedItem key={r.name}>
                <ResourceCard r={r} variant="dark" />
              </AnimatedItem>
            ))}
          </AnimatedDiv>
          <div className="mt-12">
            <Button href="/signal" variant="secondary" size="lg">
              Explore Signal
            </Button>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.cream} />

      {/* Audience 3: Auto Operators */}
      <AnimatedSection theme="off-white" className="py-14 md:py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <AnimatedItem>
                <SectionLabel>For auto operators</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-4">
                  Turo and peer-to-peer fleet.
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base text-charcoal/85 leading-relaxed">
                  Our newest segment, so the library is intentionally short.
                  What&rsquo;s here today is what we use ourselves; Car Rental
                  Riches ships next and will bring a full set of fleet-grade
                  tools with it.
                </p>
              </AnimatedItem>
            </div>
            <AnimatedItem>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/Website Images/hf_20260502_232029_ed24d441-412f-4958-94ae-c47d67d782f0.png"
                  alt="Auto operator vehicle in a peer-to-peer rental fleet setting"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {AUTO_RESOURCES.map((r) => (
              <AnimatedItem key={r.name}>
                <ResourceCard r={r} variant="light" />
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
