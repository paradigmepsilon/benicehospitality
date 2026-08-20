// Resource tools registry — the single source of truth for every gated
// interactive tool under /resources. The tool pages, the /resources index
// cards, the sitemap, and the unlock endpoint's slug validation all read from
// here so tool metadata is never duplicated or allowed to drift.
//
// Adding a Phase 2 tool = add an entry here + its config/component/page.

import type { LaneId } from "@/lib/lanes";

export type ResourceArchetype =
  | "calculator"
  | "checklist"
  | "tracker"
  | "worksheet"
  | "reference";

export type ResourceAccess = "free-email";

/**
 * Audience lane a tool belongs to, matching src/lib/lanes.ts. Every Phase 1
 * tool is "property" (co-living); the fleet and boutique lanes are declared so
 * their door pages can query for tools before any exist — liveResourceTools()
 * returns [] and those sections render their empty state.
 */
export type ResourceCategory = "property" | "fleet" | "boutique";

/**
 * The registry's `category` predates src/lib/lanes.ts and says "property"
 * where the lane system says "coliving". Everything user-facing downstream of
 * the saved-resources shelf (tabs, accent colors, labels) speaks LaneId, so we
 * translate here rather than renaming twenty entries plus the index tabs, the
 * sitemap, and liveResourceTools()'s default argument — pure churn with a real
 * chance of typoing a tool off the index. lanes.ts imports nothing from this
 * module, so this direction is cycle-free.
 */
export const RESOURCE_CATEGORY_TO_LANE: Record<ResourceCategory, LaneId> = {
  property: "coliving",
  boutique: "boutique",
  fleet: "fleet",
};

export function laneForTool(tool: ResourceToolMeta): LaneId {
  return RESOURCE_CATEGORY_TO_LANE[tool.category];
}

export interface ResourceToolMeta {
  /** URL slug under /resources/<slug> and the `tool_slug` stored on leads. */
  slug: string;
  /** Display name, e.g. "Room Rental Price Calculator". */
  name: string;
  /** One-line card body on the /resources index. */
  blurb: string;
  /** 3-4 bullet points for the index card. */
  bullets: string[];
  /** Audience tab on the index. All Phase 1 tools are "property". */
  category: ResourceCategory;
  archetype: ResourceArchetype;
  access: ResourceAccess;
  /**
   * Where this tool's state lives, and therefore what "used it" means.
   *
   *   "none"     — reference content with nothing to fill in. Lands on the
   *                member's dashboard when they OPEN it, because there is no
   *                interaction to wait for.
   *   "blob"     — one JSONB row per (user, tool) in resource_tool_state.
   *   "analyses" — many named rows in resource_analyses.
   *
   * Both persisted kinds land on the dashboard on the first WRITE, never on
   * open. That distinction is the whole point: a member browsing the catalogue
   * should not collect nineteen dashboard cards.
   *
   * Required, not optional-with-a-default, so a new tool that forgets it fails
   * the typecheck instead of silently picking a behaviour.
   *
   * It happens to line up with `archetype === "reference"` today. Do NOT derive
   * it from archetype — that couples what a tool IS to where its bytes go, and
   * the first interactive reference tool would break both.
   */
  persistence: "none" | "blob" | "analyses";
  /**
   * The tool ships a completed, read-only example (its component wires up
   * ExampleMode and answers /resources/<slug>?example=1). Drives the
   * "See a completed example" link on the dashboard card. Optional so the
   * tools without one stay untouched.
   */
  hasExample?: boolean;
  status: "live" | "soon";
  /** Hero background image path under /public. */
  heroImage: string;
  /** Short eyebrow shown above the H1 on the tool page. */
  eyebrow: string;
  /** H1 headline on the tool page hero. */
  headline: string;
  /** Sub-headline paragraph on the tool page hero. */
  subhead: string;
  /** "How it works" three-step summary for the tool page. */
  howItWorks: [string, string, string];
  /** "What you'll get" list for the tool page aside. */
  whatYouGet: string[];
}

const HERO_DEFAULT =
  "/images/Website Images/pexels-curtis-adams-1694007-16641323.jpg";

export const RESOURCE_TOOLS: Record<string, ResourceToolMeta> = {
  // ───────────────────────────────────────────────────────────────────────────
  // CO-LIVING (Room Rental Riches). Insertion order IS the running order on
  // /resources and every co-living section, because liveResourceTools() walks
  // Object.values(). These eleven are sequenced by where an operator hits them:
  // validate the market and the tenant, underwrite the money, set the property
  // up, fill the rooms, then run it. The /resources index pins the Co-living
  // Viability Calculator ahead of all of them as step one; it is a scorecard
  // route, not a registry tool. A new tool belongs at its stage, NOT appended
  // to the end of the block.
  // ───────────────────────────────────────────────────────────────────────────
  "market-demand-worksheet": {
    slug: "market-demand-worksheet",
    name: "Market Demand Worksheet",
    blurb:
      "Evaluate whether a neighborhood can actually support a co-living property, across demographics, housing, demand signals, lifestyle, and competition.",
    bullets: [
      "Guided indicators across 5 research dimensions",
      "Why each one matters, plus where to pull the data",
      "Capture your findings and write a go / no-go summary",
      "Autosaves in your browser; export to CSV or print",
    ],
    category: "property",
    archetype: "worksheet",
    access: "free-email",
    persistence: "blob",
    hasExample: true,
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Market Demand",
    headline: "Will this market actually support co-living?",
    subhead:
      "Before you sign a lease, pressure-test the neighborhood. Work through the demographic, housing, demand, lifestyle, and competition signals that decide whether room-by-room rental works here.",
    howItWorks: [
      "Pick a market, then work through each research dimension.",
      "Record your findings next to each guiding question.",
      "Write a demand-analysis summary to make the call.",
    ],
    whatYouGet: [
      "A structured read on real market demand",
      "The exact indicators and data sources to check",
      "A written go / no-go summary you can keep",
      "CSV export and a clean print view",
    ],
  },

  "target-audience-matrix": {
    slug: "target-audience-matrix",
    name: "Target Audience Identification Matrix",
    blurb:
      "The co-living tenant segments, what each one needs, where to reach them, and how to speak to them. A messaging reference you can copy from.",
    bullets: [
      "Six tenant segments with needs, channels, and messaging",
      "A budget-and-amenities view by audience type",
      "Copy any row or table straight into your marketing",
      "How-to guidance for using the matrix in campaigns",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    persistence: "none",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Audience Matrix",
    headline: "Know exactly who you are marketing to.",
    subhead:
      "Generic listings attract no one. This matrix breaks co-living demand into real tenant segments, what each values, where they look, and the message that lands, so every listing and ad speaks to someone specific.",
    howItWorks: [
      "Identify the two or three segments that best match your property and market.",
      "Tailor each listing and ad using that segment's messaging, preferred channels, and pain points.",
      "Address their needs in your amenities and copy, then revisit the matrix as you learn what actually converts.",
    ],
    whatYouGet: [
      "Six ready-to-use tenant personas",
      "The channel and message that works for each",
      "Budget and amenity expectations by segment",
      "Copy-to-clipboard and a clean print view",
    ],
  },

  // Replaces the Room Rental Price Calculator and the Start-Up Cost Projection
  // Worksheet, which each answered half a question: one priced a single room
  // and stopped, the other totalled launch costs with no idea what the property
  // would earn. Both slugs 308 here from next.config.ts. This is also the first
  // tool to keep MULTIPLE NAMED ANALYSES per member (see resource_analyses),
  // which is why its bullets promise something the other twenty cannot.
  "breakeven-analysis-worksheet": {
    slug: "breakeven-analysis-worksheet",
    // The URL keeps the old slug on purpose. It is the canonical the sitemap
    // has been serving, two retired tools 308 into it, and every member's
    // saved analyses and shelf rows are keyed to it. Renaming the display name
    // costs nothing; renaming the slug is a redirect chain plus a four-table
    // production backfill, and buys only tidiness.
    name: "Co-Living Property Profitability Analysis Worksheet",
    blurb:
      "Price every room, total what it costs to open and to run, and see your monthly net, three-year projection, and the month you break even.",
    bullets: [
      "Price each room from a real market comp, as many rooms as you have",
      "Launch costs and monthly costs, with an estimate on every line",
      "Monthly net, a three-year projection, and your break-even month",
      "Keep one analysis per property and come back to any of them",
    ],
    category: "property",
    archetype: "calculator",
    access: "free-email",
    persistence: "analyses",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Profitability Analysis",
    headline: "Will this property\nactually make money?",
    subhead:
      "Pricing a room is the easy part. The question that decides the deal is whether the rent covers the mortgage, the utilities, the turnover, and the furniture you have not bought yet. Work it end to end and get a break-even month you can plan around.",
    howItWorks: [
      "Price every room from a comparable one-bedroom in your market.",
      "Tick your launch costs and monthly costs, adjusting our estimates.",
      "Read your monthly net, three-year projection, and break-even month.",
    ],
    whatYouGet: [
      "A defensible price for every room in the property",
      "A launch budget and a true monthly cost, side by side",
      "A three-year projection and the month you break even",
      "One saved analysis per property, plus CSV export and a clean print view",
    ],
  },

  "co-living-profit-calculator": {
    slug: "co-living-profit-calculator",
    name: "Co-Living Profit Calculator",
    blurb:
      "A full twelve-month income statement for a co-living property. Enter revenue and expenses, see NOI and net profit roll up live.",
    bullets: [
      "Rental, additional, and miscellaneous revenue lines",
      "Every operating and other-expense line, month by month",
      "Live NOI, net profit, and annual totals",
      "Autosaves in your browser, export to CSV or print",
    ],
    category: "property",
    archetype: "calculator",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Profit & Loss",
    headline: "Will the numbers actually work?",
    subhead:
      "A co-living property lives or dies on the spread between rent collected and everything it costs to run. Lay out a full year, line by line, and watch net operating income and net profit resolve as you type.",
    howItWorks: [
      "Enter monthly revenue across rent and ancillary income.",
      "Fill in operating and other expenses, line by line.",
      "Read NOI, net profit, and annual totals as they update.",
    ],
    whatYouGet: [
      "A twelve-month income statement for your property",
      "Live net operating income and net profit",
      "Annual totals for every line",
      "CSV export and a clean print view",
    ],
  },

  "room-rental-setup-checklist": {
    slug: "room-rental-setup-checklist",
    name: "Room Rental Setup Checklist",
    blurb:
      "Every item a co-living property needs before you list it, grouped by room. Check your way to a launch-ready readiness score.",
    bullets: [
      "8 sections from deep-clean to pre-listing photos",
      "Live readiness percentage as you check items off",
      "A running list of exactly what is left to do",
      "Autosaves in your browser, export to CSV or print",
    ],
    category: "property",
    archetype: "checklist",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Setup Checklist",
    headline: "Is your room rental\nlaunch-ready?",
    subhead:
      "Work through every room and system a co-living property needs before the first photo goes up. Nothing fancy, just the list Della uses so nothing gets missed.",
    howItWorks: [
      "Check off what is already done, section by section.",
      "Watch your readiness score climb as gaps close.",
      "Export the remaining items and knock them out.",
    ],
    whatYouGet: [
      "A room-by-room readiness score",
      "The exact items still standing between you and launch",
      "A checklist you can revisit as you finish setup",
      "CSV export and a clean print view",
    ],
  },

  "contractor-rolodex": {
    slug: "contractor-rolodex",
    name: "Contractor Rolodex",
    blurb:
      "Every plumber, electrician, and cleaner in one place, with ratings, rates, and when you last used them.",
    bullets: [
      "Company, specialty, contact, availability, rating, rates",
      "Track last-used, last job, and cost per contractor",
      "Add, edit, and delete rows; import or export CSV",
      "Saves to your account when you are logged in",
    ],
    category: "property",
    archetype: "tracker",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Contractor Rolodex",
    headline: "Your whole vendor bench, one page.",
    subhead:
      "When something breaks at 9pm, you should not be scrolling old texts. Keep every contractor, their rate, rating, and service area in one searchable list you actually maintain.",
    howItWorks: [
      "Add each contractor with their specialty and contact info.",
      "Log rate, rating, and the last job after every visit.",
      "Filter to the right person when you need them fast.",
    ],
    whatYouGet: [
      "A single source of truth for your vendor network",
      "Rate and reliability history per contractor",
      "The right contact for every trade",
      "CSV import/export and a clean print view",
    ],
  },

  "supply-inventory-tracker": {
    slug: "supply-inventory-tracker",
    name: "Supply Inventory Tracker",
    blurb:
      "Track consumables and supplies against par levels so you never run out of toilet paper or overspend on overstock.",
    bullets: [
      "A live restock list that updates as you count",
      "One-line quick add, then tap the counts up and down",
      "Grouped by category with out / low / stocked at a glance",
      "Saves to your account when you are logged in",
    ],
    category: "property",
    archetype: "tracker",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Inventory Tracker",
    headline: "Never run out. Never overstock.",
    subhead:
      "Set a par level for every supply and let the tracker tell you what to reorder. The unglamorous system that keeps a co-living property running smoothly.",
    howItWorks: [
      "Add each supply once: what it is, where it lives, and the par level you want on hand.",
      "Walk the property and tap counts up or down. Anything below par jumps to the restock list at the top.",
      "Buy what the list says, then hit Mark restocked to reset the count to par and date it.",
    ],
    whatYouGet: [
      "A restock list you can shop straight from, with our picks where they fit",
      "Out of stock, running low, and stocked visible without reading a single row",
      "Filters and search for a property with fifty line items",
      "CSV import/export and a clean print view",
    ],
  },

  "photo-shot-list": {
    slug: "photo-shot-list",
    name: "Photo Shot List",
    blurb:
      "The exact shots a co-living listing needs, room by room, so your photos fill rooms instead of just filling space. Check them off on the shoot.",
    bullets: [
      "Every must-have shot, grouped by room and space",
      "The hero-image and sequencing guidance that converts",
      "Check items off live during the shoot",
      "Autosaves in your browser, export to CSV or print",
    ],
    category: "property",
    archetype: "checklist",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Photo Shot List",
    headline: "Shoot a listing that\nfills the room.",
    subhead:
      "Your lead photo sets your click-through rate, and the rest either build trust or lose it. Here is the shot-by-shot list so you leave the shoot with every image the listing needs.",
    howItWorks: [
      "Walk the property with the list open on your phone.",
      "Capture each shot and check it off as you go.",
      "Leave with a complete, sequenced set ready to upload.",
    ],
    whatYouGet: [
      "A room-by-room list of every shot to capture",
      "Guidance on the hero image and photo order",
      "A live count of what you still need to shoot",
      "CSV export and a clean print view",
    ],
  },

  "social-posting-calendar": {
    slug: "social-posting-calendar",
    name: "30-Day Social Posting Calendar",
    blurb:
      "Thirty days of ready-to-post content that attracts room renters: the platform, the format, the shot list, and a written caption for every single day.",
    bullets: [
      "A full production brief for all 30 days",
      "Platform, format, best posting time, and shot list",
      "A written, copy-ready caption for every day",
      "Shuffle it so your month is not everyone else's",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    persistence: "none",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Posting Calendar",
    headline: "Thirty days of posts,\nalready planned.",
    subhead:
      "Consistency is what fills rooms, and consistency is a plan, not a personality trait. Here is a month of posts already written: where each one goes, what to shoot, when to post it, and the exact caption to use.",
    howItWorks: [
      "Set up your four channels once, in 30 minutes.",
      "Batch a week of shots and captions in one sitting.",
      "Shuffle any day you want a different angle on.",
    ],
    whatYouGet: [
      "30 daily briefs: platform, format, timing, shot list",
      "A written caption for every day, ready to copy",
      "Three interchangeable angles per day, shuffleable",
      "CSV export for your scheduler and a clean print view",
    ],
  },

  "guest-message-templates": {
    slug: "guest-message-templates",
    name: "Guest Correspondence Templates",
    blurb:
      "Warm, professional message templates for every moment of the guest journey, plus 20 ready answers to the questions tenants always ask.",
    bullets: [
      "Templates: inquiry, booking, mid-stay, issues, review request",
      "Three wordings per template, from brief to detailed",
      "A recommended send time on every message",
      "20 FAQ answers written in a host's voice",
      "Copy any message to your clipboard in one click",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    persistence: "none",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Guest Messaging",
    headline: "Never stare at a blank message again.",
    subhead:
      "The right words at check-in, mid-stay, and when something goes wrong turn a fine stay into a five-star one. Copy-and-send templates and FAQ answers, ready to make your own.",
    howItWorks: [
      "Find the moment in the guest journey you are handling.",
      "Check the recommended send time, then pick the wording that sounds like you.",
      "Copy it, drop in the guest's details, and send.",
    ],
    whatYouGet: [
      "A template for every stage of the guest journey",
      "Three interchangeable wordings per template",
      "A recommended send time and why it works",
      "20 host-voice answers to common tenant questions",
      "A clean print view to keep by the desk",
    ],
  },

  "maintenance-tracker": {
    slug: "maintenance-tracker",
    name: "Maintenance Tracker",
    blurb:
      "Log every maintenance issue, what it cost, and how long it took. Spot recurring problems before they become expensive ones.",
    bullets: [
      "One row per issue: cause, priority, action, cost, resolution time",
      "Flag reoccurring problems and preventative fixes",
      "Add, edit, and delete rows; import or export CSV",
      "Saves to your account when you are logged in",
    ],
    category: "property",
    archetype: "tracker",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Maintenance Tracker",
    headline: "Stop losing track of repairs.",
    subhead:
      "A maintenance log that pays for itself: track every issue, what it cost, and how fast it was fixed, so you can catch recurring problems and forecast your repair budget.",
    howItWorks: [
      "Log each issue as it comes in, with cause and priority.",
      "Record the fix, who did it, cost, and resolution time.",
      "Review reoccurrence and cost trends to get ahead of them.",
    ],
    whatYouGet: [
      "A running maintenance history for your property",
      "Cost and response-time visibility",
      "A pattern view of what keeps breaking",
      "CSV import/export and a clean print view",
    ],
  },


  // ───────────────────────────────────────────────────────────────────────────
  // FLEET (Car Rental Riches). Turo plan figures in these tools trace to the
  // CRR fact base (verified 2026-08-15); when Turo changes terms, each tool's
  // config.ts is the single place its numbers live.
  // ───────────────────────────────────────────────────────────────────────────

  "vehicle-profitability-calculator": {
    slug: "vehicle-profitability-calculator",
    name: "Vehicle Profitability Calculator",
    blurb:
      "Underwrite any car like a deal before you buy it: real 2026 earnings-plan math, weekly and monthly discount modeling, every operating cost, depreciation, a three-year forecast, and a PROCEED / CAUTION / PASS verdict.",
    bullets: [
      "True net after Turo's share, costs, and depreciation",
      "The three 2026 earnings plans with damage responsibility",
      "Weekly, monthly, and 90-day discounts priced against turnovers saved",
      "A three-year forecast with payback, equity, and total return",
      "A PROCEED / CAUTION / PASS verdict on true-net ROI",
      "The daily rate this car needs to actually work",
    ],
    category: "fleet",
    archetype: "calculator",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-04-market-vehicle.png",
    eyebrow: "Vehicle Underwriting",
    headline: "Would this car\nactually make money?",
    subhead:
      "The income screenshots quote gross. Your bank account gets net, after Turo's share, cleaning, maintenance, financing, and the depreciation nobody screenshots. Run the whole waterfall and get a verdict before you spend a dollar.",
    howItWorks: [
      "Enter the car, your market rate, and your real costs.",
      "Split your booked days by trip length, then set your discounts.",
      "Read the verdict, then the three-year forecast underneath it.",
    ],
    whatYouGet: [
      "The full gross-to-true-net monthly waterfall",
      "Cash-on-cash ROI judged against operator thresholds",
      "What your weekly and monthly discounts cost versus the turnovers they save",
      "A three-year forecast: cash, depreciation, equity, payback, total return",
      "Your damage-responsibility exposure per claim",
      "CSV export and autosave to your account",
    ],
  },

  "fleet-pnl-dashboard": {
    slug: "fleet-pnl-dashboard",
    name: "Fleet P&L Dashboard",
    blurb:
      "One card per car, up to ten: true net after every cost and depreciation, fleet totals, best and worst performers, and the readiness rule for adding the next car.",
    bullets: [
      "Per-car gross, cash net, true net, and ROI on cash",
      "Fleet totals plus best-car and worst-car tiles",
      "The 2026 earnings plans with damage responsibility",
      "The car-#2 readiness rule as a live status strip",
    ],
    category: "fleet",
    archetype: "tracker",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-12-scaling.png",
    eyebrow: "Fleet Operations",
    headline: "Which cars earn,\nwhich cars drain?",
    subhead:
      "A fleet hides its losers inside its totals. Track every car on the same true-net math as the underwriting calculator, see the fleet roll-up live, and let the readiness rule tell you when the next car is actually earned.",
    howItWorks: [
      "Add each car with its price, rate, plan, and real costs.",
      "Watch per-car true net, ROI, and the fleet totals update live.",
      "Check the readiness strip before you buy the next car.",
    ],
    whatYouGet: [
      "True net and ROI on cash for every car, plus fleet totals",
      "Best-car and worst-car tiles that name names",
      "Your cash reserve bar: one damage responsibility per car",
      "CSV export and autosave to your account",
    ],
  },

  "vehicle-maintenance-tracker": {
    slug: "vehicle-maintenance-tracker",
    name: "Vehicle Maintenance Tracker",
    blurb:
      "A per-vehicle service log with cost totals, a preventive schedule reference by mileage, and the delisting rule that makes the paper trail non-negotiable.",
    bullets: [
      "Log every service: date, odometer, type, cost, notes",
      "Per-vehicle totals and a cost-per-month tile",
      "Preventive schedule from weekly checks to major services",
      "The 30% maintenance-rating delisting rule, up front",
    ],
    category: "fleet",
    archetype: "tracker",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-11-cleaning-maintenance.png",
    eyebrow: "Maintenance System",
    headline: "The log that keeps\nyour cars listed.",
    subhead:
      "Below a 30% five-star maintenance rating over your last 10 trips, Turo delists the car, and reinstatement takes an ASE-certified inspection. A dated service log with mileage and costs is your defense, your resale record, and your cost-control tool in one place.",
    howItWorks: [
      "Add your vehicles by nickname, then log each service as it happens.",
      "Watch per-vehicle totals and cost per month update live.",
      "Run the preventive schedule so guests never rate a problem first.",
    ],
    whatYouGet: [
      "A filterable service log across your whole fleet",
      "Cost totals and cost per month for every vehicle",
      "The Module 6 mileage schedule as a built-in reference",
      "CSV export and import, plus autosave to your account",
    ],
  },

  "fleet-guest-message-templates": {
    slug: "fleet-guest-message-templates",
    name: "Guest Message Template Bank",
    blurb:
      "The ten Turo trip-lifecycle messages, inquiry through review ask, personalized with your guest, car, and pickup spot in one pass and copied in one click.",
    bullets: [
      "All 10 lifecycle messages, booking confirmation to review ask",
      "Type guest, car, and pickup once; every template updates live",
      "2026 photo-protocol wording built into check-in and check-out",
      "Host-only notes kept visible but out of the copied text",
    ],
    category: "fleet",
    archetype: "reference",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-10-guest-experience.png",
    eyebrow: "Guest Messaging",
    headline: "The right message,\nalready written.",
    subhead:
      "Reviews are won in the messages: the on-time reminder, the clear check-in, the calm fix when something breaks. Ten field-tested templates cover the whole trip, and three fields personalize all of them at once.",
    howItWorks: [
      "Enter the guest name, car nickname, and pickup location once.",
      "Watch all ten templates fill in as you type.",
      "Copy the message for the moment you are in and send it.",
    ],
    whatYouGet: [
      "Ten templates covering the full trip lifecycle",
      "Live personalization across every template at once",
      "One-click copy with host-only notes kept separate",
      "The 2026 photo-rule wording guests actually follow",
    ],
  },

  "claims-day-playbook": {
    slug: "claims-day-playbook",
    name: "Claims-Day Playbook",
    blurb:
      "A calm, step-by-step walkthrough for the day a guest damages your car: freeze, document, report, invoice, follow up, with your plan's real deadlines counting down.",
    bullets: [
      "Five stages with checkable steps, one screen at a time",
      "Live countdowns: the 24-hour photo window and your invoice window",
      "Plan picker with 2026 damage responsibility and 5/4/3-day windows",
      "The metadata warning that keeps your photos valid",
    ],
    category: "fleet",
    archetype: "reference",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-06-vehicle-prep.png",
    eyebrow: "Incident Response",
    headline: "Damage found.\nHere is what you do.",
    subhead:
      "Claims are won on documentation and deadlines. Two clocks started at trip end: the 24-hour photo window and your plan's invoice window. Pick your plan, set the trip end time, and work the stages in order.",
    howItWorks: [
      "Pick your earnings plan and enter when the trip ended.",
      "Watch both deadline countdowns update live.",
      "Work the five stages in order, checking off each step.",
    ],
    whatYouGet: [
      "The full claims-day procedure from freeze to close-out",
      "Deadline countdowns computed from your actual trip end",
      "Your plan's damage responsibility and invoice window up front",
      "CSV export and autosave so the claim record survives the day",
    ],
  },

  "risk-coverage-guide": {
    slug: "risk-coverage-guide",
    name: "Risk & Coverage Guide",
    blurb:
      "The 2026 rules in one navigable reference: earnings plans, why Turo's protection is not insurance, the personal-policy gap, coverage options, and the photo protocol.",
    bullets: [
      "The three 2026 earnings plans, side by side",
      "Protection vs insurance: caps, exclusions, and the WA exception",
      "Gap-coverage categories with honest unverified-pricing caveats",
      "The photo protocol and a printable risk matrix",
    ],
    category: "fleet",
    archetype: "reference",
    access: "free-email",
    persistence: "none",
    status: "live",
    heroImage: "/images/Website Images/crr-module-02-legal-setup.png",
    eyebrow: "Risk & Coverage",
    headline: "Know exactly what\nyou are exposed to.",
    subhead:
      "If you learned Turo's protection system before January 2026, most of it is obsolete. This guide covers the current plans, what the protection actually promises, the gap your personal policy leaves, and how to close it.",
    howItWorks: [
      "Start with the 2026 plans table and find your tier.",
      "Read the protection and personal-policy sections twice.",
      "Print the risk matrix and score your own fleet.",
    ],
    whatYouGet: [
      "The 2026 plans with shares, damage responsibility, and windows",
      "Plain-language limits: ACV cap, exclusions, tracker withholding",
      "Four gap-coverage categories to price with your own agent",
      "A fill-in risk matrix and the full photo protocol",
    ],
  },

  "listing-optimization-checklist": {
    slug: "listing-optimization-checklist",
    name: "Listing Optimization Checklist",
    blurb:
      "Every item a Turo listing needs before it publishes, and once a month after: the eligibility gate, vehicle prep, photography, listing copy, the 2026 pricing levers, and settings.",
    bullets: [
      "The eligibility gate: age, miles, title, tracker",
      "Photography and listing copy that convert",
      "Every 2026 pricing lever in one place",
      "Live readiness score with a remaining-items list",
    ],
    category: "fleet",
    archetype: "checklist",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-08-listing-strategy.png",
    eyebrow: "Listing Optimization",
    headline: "A listing is a storefront.\nMaintain it like one.",
    subhead:
      "Run this twice: once before you publish, and once a month after. Eligibility gate first, then prep, photos, copy, the 2026 pricing levers, and the settings that quietly decide your ranking.",
    howItWorks: [
      "Clear the eligibility gate before you touch anything else.",
      "Work the six sections; your readiness score updates live.",
      "Rerun the checklist monthly. Listings drift.",
    ],
    whatYouGet: [
      "A six-section launch and maintenance checklist",
      "The 2026 pricing levers, including pilot-market advance booking",
      "A live readiness score and remaining-items list",
      "CSV export, print, and autosave to your account",
    ],
  },

  "ninety-day-launch-plan": {
    slug: "ninety-day-launch-plan",
    name: "90-Day Launch Plan",
    blurb:
      "Zero to first booking to steady state in twelve weeks: each week's 3 to 6 tasks, honest workload notes, and the rule that decides when car #2 is earned.",
    bullets: [
      "Twelve weeks of concrete tasks, in order",
      "Honest workload notes for every phase",
      "Tracks the week you are actually in",
      "The car #2 readiness rule, built in",
    ],
    category: "fleet",
    archetype: "checklist",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-12-scaling.png",
    eyebrow: "90-Day Launch",
    headline: "Twelve weeks from zero\nto a running system.",
    subhead:
      "Market analysis before money, underwriting before buying, SOPs before guests. Check off each week's tasks, mark the week you are in, and let the car #2 rule tell you when you have earned the second vehicle.",
    howItWorks: [
      "Mark the week you are in; the plan meets you there.",
      "Check off each week's tasks as you complete them.",
      "Score yourself against the car #2 rule at week 12.",
    ],
    whatYouGet: [
      "All 12 weeks with 3 to 6 tasks each",
      "Honest workload notes so nothing blindsides you",
      "The car #2 readiness rule as a live scorecard",
      "CSV export and autosave to your account",
    ],
  },

  "turnover-photo-protocol": {
    slug: "turnover-photo-protocol",
    name: "Turnover & Photo Protocol",
    blurb:
      "The per-trip runbook for check-in and check-out: the photo sequence, the 24-hour windows, the metadata rule, and your plan's incidental invoice deadline.",
    bullets: [
      "Check-in and check-out modes, built for a phone",
      "The 2026 photo windows, impossible to miss",
      "No metadata means the photo is invalid",
      "Your plan's 3, 4, or 5 day invoice window",
    ],
    category: "fleet",
    archetype: "checklist",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-11-cleaning-maintenance.png",
    eyebrow: "Trip Runbook",
    headline: "Every trip documented.\nEvery window met.",
    subhead:
      "Turo's 2026 photo rules are strict: miss a 24-hour window or strip the metadata and your documentation may be worthless in a claim. This is the driveway checklist that keeps every trip protected.",
    howItWorks: [
      "Pick your earnings plan once; your deadlines load.",
      "Tap through check-in before handoff, check-out after return.",
      "Start a new trip; the counter keeps score.",
    ],
    whatYouGet: [
      "The full pre-trip and post-trip photo sequence",
      "Timing callouts for both 24-hour windows",
      "Your plan's incidental invoice deadline",
      "CSV export and a completed-trips counter",
    ],
  },

  "earnings-plan-optimizer": {
    slug: "earnings-plan-optimizer",
    name: "Earnings Plan Optimizer",
    blurb:
      "The three 2026 Turo earnings plans side by side on your numbers: what each pays per year, what each costs per claim, and which one this car should run.",
    bullets: [
      "All three 2026 plans priced on your gross",
      "Extra annual income of each step up",
      "Claims per year that erase the savings",
      "A recommendation built on car value and risk",
    ],
    category: "fleet",
    archetype: "calculator",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-09-pricing.png",
    eyebrow: "Plan Selection",
    headline: "Which earnings plan\nshould this car run?",
    subhead:
      "Higher share means higher damage responsibility when a claim hits. That trade has a number. Put your gross through all three 2026 plans and see exactly how many claims a year it takes to erase the extra income.",
    howItWorks: [
      "Enter your monthly gross, or build it from rate and utilization.",
      "Compare all three plans: share, exposure, and the gut-check math.",
      "Read the recommendation and pressure-test it against your risk.",
    ],
    whatYouGet: [
      "Monthly and annual host share under every plan",
      "Damage responsibility exposure per claim",
      "The claims-per-year break-even between plans",
      "A plan recommendation with the reasoning shown",
    ],
  },

  "depreciation-exit-analyzer": {
    slug: "depreciation-exit-analyzer",
    name: "Depreciation & Exit Analyzer",
    blurb:
      "The five year hold picture for any car: estimated value, cumulative cash net, total position, and the year the exit rule says sell or reprice.",
    bullets: [
      "Year by year value at your depreciation rate",
      "Cumulative cash net stacked against the decline",
      "Total position: value plus cash earnings minus price",
      "A hold or sell verdict for every year",
    ],
    category: "fleet",
    archetype: "calculator",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-12-scaling.png",
    eyebrow: "Hold or Sell",
    headline: "When does this car\nstop paying you?",
    subhead:
      "Every car has a stretch where holding it costs more than it earns. The exit rule finds it: when next year's expected true net falls below next year's depreciation, the car is paying you less than it costs to hold. Run your numbers and see where that lands.",
    howItWorks: [
      "Enter price, depreciation rate, and your annual true net.",
      "Read the five year picture: value, earnings, total position.",
      "Find the crossover year and plan the exit before it arrives.",
    ],
    whatYouGet: [
      "Estimated vehicle value at each year end",
      "Cumulative true net and total position per year",
      "The exit rule verdict for all five years",
      "CSV export and autosave to your account",
    ],
  },

  "startup-budget-builder": {
    slug: "startup-budget-builder",
    name: "Startup Budget Builder",
    blurb:
      "Everything car number one costs before its first trip: acquisition, prep, operating float, and the cash reserve most hosts skip. One honest day-one number.",
    bullets: [
      "Every launch line item with editable amounts",
      "Reserve floor set by your 2026 earnings plan",
      "Cash to first trip and cash needed on day one",
      "A readiness check before you list",
    ],
    category: "fleet",
    archetype: "calculator",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-02-legal-setup.png",
    eyebrow: "Launch Budget",
    headline: "What does car #1 cost\nbefore its first trip?",
    subhead:
      "Most new hosts budget for the car and let the first month nickel them to death. Registration, a detail, a cleaning kit, photos, an insurance decision, and a reserve they never funded. Build the whole number now, with real quotes, before you spend a dollar.",
    howItWorks: [
      "Work the line items, replacing our defaults with real quotes.",
      "Pick your earnings plan; the reserve floor sets itself.",
      "Fund the reserve, decide insurance, and read your day-one number.",
    ],
    whatYouGet: [
      "A complete launch budget across four sections",
      "Your cash-to-first-trip and day-one totals",
      "A reserve target tied to the plan you choose",
      "CSV export and autosave to your account",
    ],
  },

  "market-underwriting-scorecard": {
    slug: "market-underwriting-scorecard",
    name: "Market Underwriting Scorecard",
    blurb:
      "Grade every candidate car on the six-factor underwriting method, kill the weak ones early, and send only the finalists to full calculator math.",
    bullets: [
      "Six factors scored 1 to 5 with the criteria inline",
      "A ranked shortlist of every candidate, out of 30",
      "Strong / Investigate / Pass bands plus veto flags",
      "CSV export and autosave to your account",
    ],
    category: "fleet",
    archetype: "worksheet",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-05-securing-vehicles.png",
    eyebrow: "Vehicle Underwriting",
    headline: "Score the deal\nbefore you fall for the car.",
    subhead:
      "Your consumer brain asks whether you like the car. Your underwriter brain asks whether the deal works. Six factors, scored with evidence, decide which candidates earn full calculator math and which die in fifteen minutes.",
    howItWorks: [
      "Add each candidate car with its price and notes.",
      "Score all six factors using the criteria on screen.",
      "Read the ranked shortlist and run the finalists through the calculator.",
    ],
    whatYouGet: [
      "The six-factor method with scoring criteria inline",
      "A ranked shortlist across every candidate you add",
      "Veto flags so one weak factor cannot hide in a good average",
      "CSV export and autosave to your account",
    ],
  },

  "fleet-business-plan-builder": {
    slug: "fleet-business-plan-builder",
    name: "Fleet Business Plan Builder",
    blurb:
      "Build a complete car rental business plan section by section: market, vehicles, operations, risk, true-net financials, and the milestones that gate car #2.",
    bullets: [
      "Seven guided sections with the prompts built in",
      "Completion meter per section as you fill it in",
      "Startup, operating, and true-net math that totals itself",
      "A clean document view, plus CSV export and print",
    ],
    category: "fleet",
    archetype: "worksheet",
    access: "free-email",
    persistence: "blob",
    status: "live",
    heroImage: "/images/Website Images/crr-module-03-choosing-path.png",
    eyebrow: "Business Plan",
    headline: "A plan built on true net,\nnot screenshots.",
    subhead:
      "Most car rental plans are built on gross numbers, and plans built on gross numbers fail quietly. This builder walks you through every section of a real plan, labels every dollar gross or true net, and keeps the questions that matter in front of you.",
    howItWorks: [
      "Work through the seven sections; every prompt is on screen.",
      "Pull your vehicle numbers from the Vehicle Profitability Calculator.",
      "Flip to document view, then print or export the finished plan.",
    ],
    whatYouGet: [
      "A complete business plan you can hand to an advisor or lender",
      "Section-by-section completion tracking",
      "True-net financial math wired to the calculator's method",
      "A clean document view, plus CSV export and print",
    ],
  },
};

export function getResourceTool(slug: string): ResourceToolMeta | null {
  return RESOURCE_TOOLS[slug] ?? null;
}

export const RESOURCE_TOOL_SLUGS = new Set(Object.keys(RESOURCE_TOOLS));

/** Live tools for a given audience tab, in registry order. */
export function liveResourceTools(
  category: ResourceToolMeta["category"] = "property",
): ResourceToolMeta[] {
  return Object.values(RESOURCE_TOOLS).filter(
    (t) => t.category === category && t.status === "live",
  );
}
