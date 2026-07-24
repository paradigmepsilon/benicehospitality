/**
 * Room Rental Riches — the shared constants behind every RRR surface.
 *
 * Before this file the prices, the twelve-module curriculum, and the eight-week
 * Masterclass arc were each retyped in four or five places: the course hub, the
 * two tier landing pages, the tier comparison table, and the co-living funnel
 * block. A price change meant finding all of them. Now it means editing one
 * object here.
 *
 * Same pattern as src/lib/blueprint.ts, which owns the book's numbers.
 *
 * WHAT THIS FILE DOES NOT OWN:
 *   - The `tier` strings in Postgres ('self-paced' | 'cohort' | 'operator').
 *     Those live in the course_tiers CHECK constraint and the WaitlistTier enum
 *     in src/lib/validation/waitlist.ts. The cohort tier is *labelled*
 *     "Masterclass" everywhere a human reads it, but the stored value is still
 *     'cohort' — renaming it is a migration, not a copy change.
 *   - Live pricing in Postgres. course_tiers.price_cents is what /account and
 *     Stripe checkout read. Keep the two in sync by hand; see the note on
 *     RRR_PRICES below.
 */

/**
 * Display pricing, in whole dollars.
 *
 * MUST match course_tiers.price_cents in Neon. scripts/migrate.ts seeds those
 * rows with ON CONFLICT DO NOTHING, so editing the seed literal does NOT update
 * an existing row — a price change here needs a matching UPDATE against the
 * course_tiers table or a signed-in member sees the old number in
 * /account/courses/browse while the marketing pages show the new one.
 */
export const RRR_PRICES = {
  /** Self-paced, the entry tier. */
  selfPacedUsd: 287,
  /** Anchor shown struck through beside $287. The pre-reduction price. */
  selfPacedListUsd: 497,
  /** The eight-week live cohort, labelled "Masterclass" on every public page. */
  masterclassUsd: 2497,
  /** 1:1. Never listed with a buy button — discovery call only. */
  operatorUsd: 7497,
} as const;

/** Public routes for the two self-serve tiers. */
export const RRR_PATHS = {
  hub: "/courses/room-rental-riches",
  selfPaced: "/courses/room-rental-riches/self-paced",
  masterclass: "/courses/room-rental-riches/masterclass",
  operator: "/courses/room-rental-riches/operator",
} as const;

const MODULE_IMAGE_BASE = "/images/Website Images";

/**
 * Release state for a module.
 *
 * Only Modules 1 and 2 have lessons in Postgres today (nine and five
 * respectively). The rest are written but not produced. The landing page shows
 * all twelve and marks which are live rather than implying the whole curriculum
 * is sitting there waiting — that claim would not survive first contact with a
 * buyer, and the CTA is a waitlist precisely because of it.
 *
 * When a module ships, flip its status here and the phase spine updates.
 */
export type ModuleStatus = "live" | "in-production";

export interface CurriculumModule {
  number: string;
  /** Phase heading this module sits under. Six phases, twelve modules. */
  phase: string;
  /** The result the module gets you. Leads the card. */
  benefit: string;
  /** The module's real title, kept as the secondary line. */
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  status: ModuleStatus;
}

export const CURRICULUM: readonly CurriculumModule[] = [
  {
    number: "01",
    phase: "Phase 1 · Foundation",
    benefit: "Know why this model works before you bet on it.",
    title: "The MTR + Co-Living Opportunity",
    body: "Why now. The 2026 mid-term and co-living market. 19% MTR share. 136% growth since 2019. Atlanta as the case study. The 7-Southeast-metro opportunity map.",
    image: `${MODULE_IMAGE_BASE}/module-01-opportunity.png`,
    imageAlt: "Atlanta craftsman bungalow exterior at golden hour",
    status: "live",
  },
  {
    number: "02",
    phase: "Phase 1 · Foundation",
    benefit: "Set the business up so it can't be taken apart.",
    title: "Legal, Regulatory & Business Setup",
    body: "State-by-state matrix for GA, FL, TX, NC, SC, VA, TN. LLC formation. Insurance. Lease structure templates. The legal foundation that keeps the business standing.",
    image: `${MODULE_IMAGE_BASE}/module-02-legal-setup.png`,
    imageAlt: "Wooden desk with leather folio, fountain pen, and an olive plant",
    status: "live",
  },
  {
    number: "03",
    phase: "Phase 1 · Foundation",
    benefit: "Commit to one path instead of half-running three.",
    title: "Choosing Your Path",
    body: "Arbitrage vs. ownership vs. co-host. The decision matrix and capital calculator. The forced-commitment exercise that gates the rest of the course. Pick a path before market analysis.",
    image: `${MODULE_IMAGE_BASE}/module-03-choosing-path.png`,
    imageAlt: "3 brass keys on a wooden surface beside a folded map",
    status: "in-production",
  },
  {
    number: "04",
    phase: "Phase 2 · Acquisition",
    benefit: "Pick a market you can defend with numbers.",
    title: "Market Analysis & Property Selection",
    body: "AI-powered market research the competitors don't teach. 25+ prompts. Demand-driver mapping for 7 Southeast metros. AirDNA and Furnished Finder Pro integrated.",
    image: `${MODULE_IMAGE_BASE}/module-04-market-analysis.png`,
    imageAlt: "Laptop on a linen desk showing a stylized city map",
    status: "in-production",
  },
  {
    number: "05",
    phase: "Phase 2 · Acquisition",
    benefit: "Land the first deal without begging for it.",
    title: "Securing Your First Property",
    body: "5 email pitch versions. 25+ landlord objection handlers. 15+ owner objection handlers. Attorney-reviewed lease addendum templates. The outreach work that lands the first deal.",
    image: `${MODULE_IMAGE_BASE}/module-05-securing-property.png`,
    imageAlt: "Hands signing a lease document with a fountain pen and brass key",
    status: "in-production",
  },
  {
    number: "06",
    phase: "Phase 3 · Setup",
    benefit: "Furnish for your residents, not your taste.",
    title: "Hospitality-Grade Design",
    body: "5 tenant personas. Will Guidara's Unreasonable Hospitality framework, applied. 50+ signature touches. The BNHG welcome basket. Room-by-room design that earns 5 stars.",
    image: `${MODULE_IMAGE_BASE}/module-06-design.png`,
    imageAlt: "Linen armchair reading nook with stacked books and an olive plant",
    status: "in-production",
  },
  {
    number: "07",
    phase: "Phase 3 · Setup",
    benefit: "Put the software in place that replaces you.",
    title: "Your Modern Tech Stack",
    body: "Hospitable + PriceLabs + Turno + smart locks + Stessa, configured. 30+ AI guest-messaging prompts. The smart-lock comparison. The stack that runs without you in the loop.",
    image: `${MODULE_IMAGE_BASE}/module-07-tech-stack.png`,
    imageAlt: "Matte-black smart lock on a paneled wooden door",
    status: "in-production",
  },
  {
    number: "08",
    phase: "Phase 4 · Launch",
    benefit: "Get found by the tenants who actually pay.",
    title: "Multi-Channel Listing Strategy",
    body: "Furnished Finder first (50% travel-nurse audience), then Airbnb, Zillow, Apartments.com, Hospitable Direct. 15+ AI listing-copy prompts. 30+ headline formulas. Per-platform photo strategy.",
    image: `${MODULE_IMAGE_BASE}/module-08-multi-channel.png`,
    imageAlt: "Smartphone on a linen surface displaying a real estate listing",
    status: "in-production",
  },
  {
    number: "09",
    phase: "Phase 4 · Launch",
    benefit: "Stop guessing what a room is worth.",
    title: "Pricing for Profit (MTR Math)",
    body: "MTR Pricing Calculator V3. The length-of-stay framework other operators get wrong. 15 to 25% discounts vs. an industry that runs 35 to 46%. 7 Southeast seasonal calendars. The math behind a $9,720 per year per property delta.",
    image: `${MODULE_IMAGE_BASE}/module-09-pricing.png`,
    imageAlt:
      "Open leather notebook with handwritten number columns, calculator and coffee",
    status: "in-production",
  },
  {
    number: "10",
    phase: "Phase 5 · Operations",
    benefit: "Hold 4.85 stars without living in your inbox.",
    title: "Guest Experience Systems",
    body: "23+ message templates across 6 phases. 25-scenario issue-resolution playbook. Repeat-guest rebooking funnel. Difficult-guest scripts. The communication cadence that holds 4.85+ stars.",
    image: `${MODULE_IMAGE_BASE}/module-10-guest-experience.png`,
    imageAlt:
      "Handwritten welcome card propped against a vase of fresh herbs on a bedside table",
    status: "in-production",
  },
  {
    number: "11",
    phase: "Phase 5 · Operations",
    benefit: "Never scramble for a cleaner on a Sunday again.",
    title: "Cleaning, Maintenance & Vendor Management",
    body: "70+ item hospitality-grade cleaning checklist. 6-vendor essential network. Preventive-maintenance calendar. Emergency response protocol. The operations layer that doesn't break.",
    image: `${MODULE_IMAGE_BASE}/module-11-cleaning.png`,
    imageAlt:
      "Folded cream linen towels on a wooden bench beside a woven basket of supplies",
    status: "in-production",
  },
  {
    number: "12",
    phase: "Phase 6 · Growth",
    benefit: "Add the second property without doubling the work.",
    title: "Scaling Beyond Your First Property",
    body: "Property #1 readiness audit. SOP template library (15+ pre-built). VA hiring playbook. The 5 to 10 property roadmap. Path-to-W-2-Replacement calculator. Honest 24 to 36 month timeline.",
    image: `${MODULE_IMAGE_BASE}/module-12-scaling.png`,
    imageAlt:
      "Row of brass keys hanging on a leather key holder above a wooden console",
    status: "in-production",
  },
] as const;

/** The six phase headings, in order, derived from CURRICULUM so they can't disagree. */
export const PHASES: readonly string[] = Array.from(
  new Set(CURRICULUM.map((m) => m.phase)),
);

/** Modules grouped under their phase. Drives the phase spine on the course page. */
export const CURRICULUM_BY_PHASE: ReadonlyArray<{
  phase: string;
  modules: readonly CurriculumModule[];
}> = PHASES.map((phase) => ({
  phase,
  modules: CURRICULUM.filter((m) => m.phase === phase),
}));

/** How many modules a student can open today. Used in the honest release line. */
export const LIVE_MODULE_COUNT = CURRICULUM.filter(
  (m) => m.status === "live",
).length;

export const BONUS_PACK = {
  title: "Bonus Pack: Direct Booking & AI Visibility",
  body: "The intro (4 lessons) ships in every tier. Schema, llms.txt, the foundation AI-visibility checklist. Masterclass and Operator unlock the deep dive: GEO/AEO content strategy, third-party citations, MCP readiness, the AI-era brand. The work that pays off from 2026 through 2030.",
} as const;

export interface MasterclassWeek {
  week: string;
  modules: string;
  title: string;
  /** What happens in the ninety-minute live session. */
  live: string;
  /** What you do on your own before the next one. The cadence is the product. */
  between: string;
}

/**
 * The eight-week arc plus the bonus week.
 *
 * `live` and `between` are split deliberately. A flat description of each week
 * reads like a syllabus; splitting it shows the rhythm a student is actually
 * buying — you show up, you work, you come back with something real.
 */
export const MASTERCLASS_WEEKS: readonly MasterclassWeek[] = [
  {
    week: "01",
    modules: "Modules 1 & 2",
    title: "Foundation: opportunity and legal",
    live: "Mindset alignment on the 2026 co-living and MTR opportunity, then the legal and regulatory deep dive. The state-by-state matrix gets workshopped in the room, and Della shares the attorneys she actually uses.",
    between: "Pick your state. Read its matrix row front to back and write down every question it leaves open.",
  },
  {
    week: "02",
    modules: "Module 3",
    title: "Path commitment",
    live: "The forced-commitment exercise, live. Every operator in the room commits out loud to arbitrage, ownership, or co-host before anyone is allowed to start market analysis.",
    between: "Run the capital calculator against your real bank balance, not your optimistic one.",
  },
  {
    week: "03",
    modules: "Module 4",
    title: "AI-powered market analysis",
    live: "Live prompt workshop, then hot seats on each operator's chosen Southeast metro. You leave with a market thesis you can defend to a lender.",
    between: "Pull demand-driver data for your metro and score three candidate submarkets.",
  },
  {
    week: "04",
    modules: "Module 5",
    title: "Property pitch role-plays",
    live: "Landlord and owner pitch role-plays with Della and Alex playing the hard version. The objection-handler library gets drilled, not just read. Your email pitch is reviewed line by line.",
    between: "Send five real pitches. Bring the replies, including the rejections, to week five.",
  },
  {
    week: "05",
    modules: "Module 6",
    title: "Hospitality-grade design review",
    live: "The flagship module applied to your property. Mood-board reviews, a persona-alignment workshop, and Will Guidara's Unreasonable Hospitality framework translated into a room you can actually furnish.",
    between: "Build the room-by-room furnishing list and price it. No placeholders.",
  },
  {
    week: "06",
    modules: "Modules 7 & 8",
    title: "Tech stack and listing strategy",
    live: "Live listing reviews and tech-stack troubleshooting across Hospitable, PriceLabs, Turno, and Stessa. Per-platform optimization for Furnished Finder, Airbnb, Zillow, and Apartments.com.",
    between: "Stand up your stack and publish one listing on the platform your persona actually uses.",
  },
  {
    week: "07",
    modules: "Modules 9 & 10",
    title: "Pricing and guest experience",
    live: "The MTR Pricing Calculator reviewed against your numbers, in front of the room. Then the message-template workshop across all six phases of the guest journey, and the discount strategy most operators get backwards.",
    between: "Set your real rates and load your first six message templates.",
  },
  {
    week: "08",
    modules: "Modules 11 & 12",
    title: "Operations and scaling",
    live: "Vendor network sharing, cleaning quality audits, the SOP library walkthrough, and the property-number-one readiness audit that decides whether you are allowed to think about the second one yet.",
    between: "Write three SOPs in your own words and hand one to somebody else to run.",
  },
  {
    week: "Bonus",
    modules: "Bonus Pack deep dive",
    title: "AI visibility workshop",
    live: "GEO and AEO content strategy, third-party citations, and MCP readiness, with live AI-visibility audits on each operator's direct-booking site. The work that compounds from 2026 through 2030.",
    between: "Nothing assigned. This one is the send-off.",
  },
] as const;
