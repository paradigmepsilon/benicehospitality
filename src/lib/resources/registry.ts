// Resource tools registry — the single source of truth for every gated
// interactive tool under /resources. The tool pages, the /resources index
// cards, the sitemap, and the unlock endpoint's slug validation all read from
// here so tool metadata is never duplicated or allowed to drift.
//
// Adding a Phase 2 tool = add an entry here + its config/component/page.

export type ResourceArchetype =
  | "calculator"
  | "checklist"
  | "tracker"
  | "worksheet"
  | "reference";

export type ResourceAccess = "free-email";

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
  category: "property";
  archetype: ResourceArchetype;
  access: ResourceAccess;
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

  "room-rental-price-calculator": {
    slug: "room-rental-price-calculator",
    name: "Room Rental Price Calculator",
    blurb:
      "Turn a comparable one-bedroom rent plus your property and room features into a defensible per-room monthly price.",
    bullets: [
      "Starts from a real one-bedroom comp in your market",
      "Adjusts for amenities, upgrades, and room features",
      "Gives you a suggested monthly room rent",
      "Shows the math so you can defend the number",
    ],
    category: "property",
    archetype: "calculator",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Price Calculator",
    headline: "What should you charge\nper room?",
    subhead:
      "Guessing at rent leaves money on the table or scares off good tenants. Start from a real comp, layer in what your property actually offers, and get a price you can stand behind.",
    howItWorks: [
      "Enter the fair-market rent of a comparable one-bedroom.",
      "Tick the amenities, upgrades, and room features you offer.",
      "Get a suggested monthly rent with the reasoning attached.",
    ],
    whatYouGet: [
      "A suggested per-room monthly rent",
      "A feature-by-feature breakdown of how it was built",
      "A number grounded in a real market comp, not a guess",
      "CSV export and a clean print view",
    ],
  },

  "startup-cost-calculator": {
    slug: "startup-cost-calculator",
    name: "Start-Up Cost Projection Worksheet",
    blurb:
      "Every pre-launch expense a co-living property incurs, by category, so you know how much capital you need before the first guest.",
    bullets: [
      "Furniture, setup, marketing, legal, and safety categories",
      "Enter estimates, mark what is already purchased",
      "Live total projected start-up budget",
      "Autosaves in your browser, export to CSV or print",
    ],
    category: "property",
    archetype: "worksheet",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Start-Up Costs",
    headline: "What will it cost to\nopen your doors?",
    subhead:
      "The surprises that sink a first property are the costs you did not plan for. Line them up by category, estimate each one, and see your true launch budget before you commit.",
    howItWorks: [
      "Go category by category through every pre-launch expense.",
      "Enter an estimate and mark what you have already bought.",
      "Read your total projected start-up budget at the bottom.",
    ],
    whatYouGet: [
      "A category-by-category launch budget",
      "A percent-secured view of what is already handled",
      "A realistic number to take into loan or partner talks",
      "CSV export and a clean print view",
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
      "Par levels vs. current quantity, with auto restock flags",
      "Category, location, supplier, and last-restocked tracking",
      "Add, edit, and delete rows; import or export CSV",
      "Saves to your account when you are logged in",
    ],
    category: "property",
    archetype: "tracker",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Inventory Tracker",
    headline: "Never run out. Never overstock.",
    subhead:
      "Set a par level for every supply and let the tracker tell you what to reorder. The unglamorous system that keeps a co-living property running smoothly.",
    howItWorks: [
      "List each supply with its par level and current quantity.",
      "The tracker flags what needs restocking automatically.",
      "Update quantities after each restock and reorder run.",
    ],
    whatYouGet: [
      "A live restock list based on your par levels",
      "Supplier and location detail for every item",
      "Fewer emergency store runs and less overstock",
      "CSV import/export and a clean print view",
    ],
  },

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
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Audience Matrix",
    headline: "Know exactly who you are marketing to.",
    subhead:
      "Generic listings attract no one. This matrix breaks co-living demand into real tenant segments, what each values, where they look, and the message that lands, so every listing and ad speaks to someone specific.",
    howItWorks: [
      "Find the segments that fit your property and market.",
      "Read their needs, channels, and messaging angle.",
      "Copy the language straight into your listings and ads.",
    ],
    whatYouGet: [
      "Six ready-to-use tenant personas",
      "The channel and message that works for each",
      "Budget and amenity expectations by segment",
      "Copy-to-clipboard and a clean print view",
    ],
  },

  "guest-message-templates": {
    slug: "guest-message-templates",
    name: "Guest Correspondence Templates",
    blurb:
      "Warm, professional message templates for every moment of the guest journey, plus 20 ready answers to the questions tenants always ask.",
    bullets: [
      "Templates: inquiry, booking, mid-stay, issues, review request",
      "20 FAQ answers written in a host's voice",
      "Copy any message to your clipboard in one click",
      "House-tested wording that de-escalates and delights",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Guest Messaging",
    headline: "Never stare at a blank message again.",
    subhead:
      "The right words at check-in, mid-stay, and when something goes wrong turn a fine stay into a five-star one. Copy-and-send templates and FAQ answers, ready to make your own.",
    howItWorks: [
      "Find the moment in the guest journey you are handling.",
      "Copy the template and drop in the guest's details.",
      "Send it, and keep the FAQ answers handy for the rest.",
    ],
    whatYouGet: [
      "A template for every stage of the guest journey",
      "20 host-voice answers to common tenant questions",
      "One-click copy for every message",
      "A clean print view to keep by the desk",
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
