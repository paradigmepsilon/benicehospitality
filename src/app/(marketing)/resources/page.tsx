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
import { CRR_FREE_EBOOK } from "@/lib/crr-free-ebook";
import {
  SCORECARD_QUESTION_COUNT,
  SCORECARD_SECTIONS,
} from "@/lib/scorecard/questions";

// Interactive property tools (Launch & Profit Planner, P&L, Setup Checklist)
// are sourced straight from the registry so the index never drifts from the
// tools themselves.
//
// `savableSlug` is set ONLY here, from the registry. That is what keeps the
// "Add to my dashboard" button off cards with no real tool behind them: the
// Labs Pass diagnostics and the course entries below all omit it, and the
// save API validates the slug against the registry anyway.
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
    "An ever-growing library of operator resources, grouped by asset class. Calculators, checklists, trackers, and worksheets for co-living and rental fleet operators. Some are free, some require a quick signup, some are bundled with the course.",
  alternates: { canonical: "https://benicehospitality.com/resources" },
  openGraph: {
    title: "Resource Library | Be Nice Hospitality Group",
    description:
      "Operator-grade resources for co-living and rental fleet operators, grouped by asset class. Free, signup-gated, and course-bundled.",
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
// Audience: Auto Operators (Turo / peer-to-peer fleet)
// ─────────────────────────────────────────────────────────────────────────────

// Interactive fleet tools come from the registry, same as the property tab.
// The index never drifts from the tools themselves, and `savableSlug` stays
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

// The free Car Rental Riches ebook: an email-gated lead magnet like the
// registry tools above, but its own static page rather than a registry
// entry, so it is listed here by hand rather than pulled from the registry.
const CRR_FREE_EBOOK_CARD: Resource = {
  name: CRR_FREE_EBOOK.name,
  body: CRR_FREE_EBOOK.subtitle,
  bullets: [
    "Gross versus net, and why the number that brought you here is gross",
    "Depreciation, insurance, and the same car run three different ways",
    "Your quit criteria, written down before you own anything",
    "Free, by email, PDF and ePub",
  ],
  access: "free-email",
  href: CRR_FREE_EBOOK.path,
  status: "live",
};

// The tab is now the registry block plus the free ebook, same as the
// co-living tab below the pinned viability calculator. The Fleet Utilization
// Report (Labs Pass) and the Car Rental Riches curriculum card were retired
// in August 2026; the course still has its own waitlist surface under
// /training.
const AUTO_RESOURCES: Resource[] = [...FLEET_TOOL_CARDS, CRR_FREE_EBOOK_CARD];

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

// Two tabs, grouped by asset class rather than by audience. Boutique stays
// (the third, "For boutique stays" tab and its nine email-gated audit cards)
// were removed with the resources registry regroup: BNHG no longer sells
// boutique-stay services, so there is no audience left to serve there.
const TABS: ResourceTab[] = [
  {
    id: "property",
    label: "Rooms",
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
    label: "Cars",
    sectionLabel: "For car operators",
    headline: "Turo and peer-to-peer fleet.",
    body: "Fleet-grade interactive tools for Turo hosts and peer-to-peer operators, built on the same underwriting method Car Rental Riches teaches: 2026 earnings-plan math, true-net thinking, no gross-number theater. The set is growing as the course ships.",
    image: {
      src: "/images/Website Images/hf_20260502_232029_ed24d441-412f-4958-94ae-c47d67d782f0.png",
      alt: "Auto operator vehicle in a peer-to-peer rental fleet setting",
    },
    resources: AUTO_RESOURCES,
    books: booksForTab("auto"),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <>
      {/* Hero. Full-bleed editorial image behind the headline. Mirrors the
          dark-hero pattern used by the MTR scorecard detail pages. */}
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
            Diagnostic tools, scorecards, and calculators we&rsquo;ve built for
            the operators we serve, grouped by asset class. Some are public,
            some need a quick signup, and some are bundled inside our courses.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      <ResourceCatalog tabs={TABS} />

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
