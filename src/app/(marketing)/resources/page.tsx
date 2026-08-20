import type { Metadata } from "next";
import Image from "next/image";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { STOCK_LIBRARY } from "@/lib/stock-images";
import { type Resource } from "./_components/ResourceCard";
import ResourceCatalog, {
  type ResourceTab,
} from "./_components/ResourceCatalog";
import { publishedBooks, type FeaturedBook } from "@/lib/featured-books";
import { liveResourceTools } from "@/lib/resources/registry";
import {
  SCORECARD_QUESTION_COUNT,
  SCORECARD_SECTIONS,
} from "@/lib/scorecard/questions";

// Interactive property tools (Launch & Profit Planner, P&L, Setup Checklist)
// are sourced straight from the registry so the index never drifts from the
// tools themselves.
//
// `savableSlug` is set ONLY here, from the registry. That is what keeps the
// "Add to my dashboard" button off cards with no real tool behind them — the
// Labs Pass diagnostics, the boutique audits, and the course entries below all
// omit it, and the save API validates the slug against the registry anyway.
const RESOURCE_TOOL_CARDS: Resource[] = liveResourceTools("property").map(
  (t) => ({
    name: t.name,
    body: t.blurb,
    bullets: t.bullets,
    access: "free-account",
    href: `/resources/${t.slug}`,
    status: "live",
    savableSlug: t.slug,
  }),
);

export const metadata: Metadata = {
  title: "Resource Library",
  description:
    "An ever-growing library of operator resources. Diagnostic tools, scorecards, and free audits for co-living operators, boutique stays, and fleet operators. Some are free, some require a quick signup, some are bundled with the course.",
  alternates: { canonical: "https://benicehospitality.com/resources" },
  openGraph: {
    title: "Resource Library | Be Nice Hospitality Group",
    description:
      "Operator-grade resources for co-living operators, boutique stays, and fleet operators. Free, signup-gated, and course-bundled.",
    url: "https://benicehospitality.com/resources",
    type: "website",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Audience: Property Operators (STR / MTR / co-living)
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_RESOURCES: Resource[] = [
  {
    name: "Co-living Viability Calculator",
    body: `${SCORECARD_QUESTION_COUNT} weighted questions across ${SCORECARD_SECTIONS.length} sections. Score any single property in under 10 minutes and get a Della-voice fix list for every gap.`,
    bullets: [
      `${SCORECARD_QUESTION_COUNT} weighted questions across ${SCORECARD_SECTIONS.length} operator sections`,
      "Google Maps and Zillow links built into every section",
      "Della-voice fix list for every gap you flag",
      "Built specifically for co-living, not generic STR scoring",
    ],
    access: "free-email",
    href: "/resources/co-living-viability-calculator",
    status: "live",
  },
  ...RESOURCE_TOOL_CARDS,
];

// ─────────────────────────────────────────────────────────────────────────────
// Audience: Boutique Hotels (10 to 50 room independents)
// ─────────────────────────────────────────────────────────────────────────────

const HOTEL_RESOURCES: Resource[] = [
  {
    name: "Revenue Opportunity Snapshot",
    body: "OTA leakage, rate parity gaps, ancillary revenue gaps. A research-backed snapshot specific to your property.",
    bullets: [
      "OTA leakage and rate parity gaps across every channel",
      "Ancillary revenue your property could be earning but isn't",
      "Per-property incremental revenue estimate",
      "Delivered as a written report within 1 week",
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
    name: "AEO Optimization for Boutique Stays",
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
    body: "How you stack against your top 3 competitors on price, positioning, and perceived value.",
    bullets: [
      "Your top 3 competitors mapped on price, position, and value",
      "Where you win and where you lose",
      "Pricing power you're not currently using",
      "10-page written briefing",
    ],
    access: "free-email",
  },
  {
    name: "Guest Persona Highlights",
    body: "A sketch of who's actually booking boutique stays in your market and what they're looking for.",
    bullets: [
      "Who's actually booking boutique stays in your market",
      "What they want, what they pay, where they research",
      "Where your current marketing matches them vs. misses",
      "3 persona-specific positioning angles",
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
      "1-page next-tool recommendation",
    ],
    access: "free-email",
  },
  {
    name: "Guestally ROI Estimate",
    body: "A projection of the incremental revenue and time savings Guestally would generate at your property.",
    bullets: [
      "Projected incremental revenue at your property",
      "Time-saved-per-week estimate for your ops team",
      "12-month payback math",
      "Sized to your room count and ADR",
    ],
    access: "free-email",
  },
  {
    name: "Quick Win Action List",
    body: "5 to 10 specific, implementable actions you could take this month to move performance.",
    bullets: [
      "5 to 10 implementable actions for this month",
      "Ranked by revenue impact and effort",
      "Sourced from the other diagnostics combined",
      "Della-voice, no fluff",
    ],
    access: "free-email",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Audience: Auto Operators (Turo / peer-to-peer fleet)
// ─────────────────────────────────────────────────────────────────────────────

// Interactive fleet tools come from the registry, same as the property tab —
// the index never drifts from the tools themselves, and `savableSlug` stays
// registry-validated.
const FLEET_TOOL_CARDS: Resource[] = liveResourceTools("fleet").map((t) => ({
  name: t.name,
  body: t.blurb,
  bullets: t.bullets,
  access: "free-account",
  href: `/resources/${t.slug}`,
  status: "live",
  savableSlug: t.slug,
}));

// The tab is now the registry block and nothing else, same as the co-living
// tab below the pinned viability calculator. The Fleet Utilization Report
// (Labs Pass) and the Car Rental Riches curriculum card were retired in
// August 2026; the course still has its own waitlist surface under /education.
const AUTO_RESOURCES: Resource[] = FLEET_TOOL_CARDS;

// Which tab each book audience surfaces in. Co-living books land in the
// property tab; when The Car Rental Riches Blueprint flips to available in
// src/lib/featured-books.ts it lands in the Autos tab with no change here.
const BOOK_AUDIENCE_TAB: Record<FeaturedBook["audience"], ResourceTab["id"]> = {
  property: "property",
  fleet: "auto",
};

function booksForTab(id: ResourceTab["id"]): FeaturedBook[] {
  return publishedBooks().filter((b) => BOOK_AUDIENCE_TAB[b.audience] === id);
}

const TABS: ResourceTab[] = [
  {
    id: "property",
    label: "Co-living Properties",
    sectionLabel: "For co-living operators",
    headline: "Co-living and Mid Term Rental.",
    body: "Tools that diagnose specific operator problems, from viability scoring to profit modeling to the day-to-day trackers. Run any diagnostic on your portfolio in minutes.",
    image: {
      src: "/images/Website Images/pexels-curtis-adams-1694007-16641323.jpg",
      alt: "Co-living and short-term rental property interior",
    },
    resources: PROPERTY_RESOURCES,
    books: booksForTab("property"),
  },
  {
    id: "auto",
    label: "Autos",
    sectionLabel: "For auto operators",
    headline: "Turo and peer-to-peer fleet.",
    body: "Fleet-grade interactive tools for Turo hosts and peer-to-peer operators, built on the same underwriting method Car Rental Riches teaches — 2026 earnings-plan math, true-net thinking, no gross-number theater. The set is growing as the course ships.",
    image: {
      src: "/images/Website Images/hf_20260502_232029_ed24d441-412f-4958-94ae-c47d67d782f0.png",
      alt: "Auto operator vehicle in a peer-to-peer rental fleet setting",
    },
    resources: AUTO_RESOURCES,
    books: booksForTab("auto"),
  },
  {
    id: "hotel",
    label: "Boutique Stays",
    sectionLabel: "For boutique stays",
    headline: "Boutique hotels, inns, and design-forward stays.",
    body: "Free audits and diagnostics focused on the AI-search visibility, OTA-recovery, and revenue-integrity problems specific to boutique stays: independent hotels, inns, and the design-forward short-term rentals guests book on purpose. Each one is delivered as a written report; share your URL, we do the research.",
    image: {
      src: "/images/Website Images/hf_20260312_051512_fbdd9c4e-fc8a-41fa-8575-219882dfe238.jpeg",
      alt: "Boutique stay exterior in warm light",
    },
    resources: HOTEL_RESOURCES,
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

      <ResourceCatalog tabs={TABS} />

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
