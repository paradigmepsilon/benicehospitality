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

/**
 * Audience lane a tool belongs to, matching src/lib/lanes.ts. Every Phase 1
 * tool is "property" (co-living); the fleet and boutique lanes are declared so
 * their door pages can query for tools before any exist — liveResourceTools()
 * returns [] and those sections render their empty state.
 */
export type ResourceCategory = "property" | "fleet" | "boutique";

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

  "course-outline-checklist": {
    slug: "course-outline-checklist",
    name: "Course Outline & Progress Checklist",
    blurb:
      "The whole Room Rental Riches path on one page, from research to your first tenant. Check off each milestone and watch your launch progress climb.",
    bullets: [
      "Every phase of The Be Nice Way in order",
      "Milestone checkboxes with a live progress score",
      "A running list of exactly what is left to do",
      "Autosaves in your browser, export to CSV or print",
    ],
    category: "property",
    archetype: "checklist",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Progress Checklist",
    headline: "Turn the book into\na built business.",
    subhead:
      "It is easy to finish a book with a pile of notes and no business. This checklist holds you to the work, phase by phase, so you finish with a co-living operation instead.",
    howItWorks: [
      "Check off the milestones you have already completed.",
      "Watch your launch progress climb as you go.",
      "See exactly which steps still stand between you and tenants.",
    ],
    whatYouGet: [
      "The full path from research to first tenant",
      "A live progress score you can pick up any time",
      "The exact next steps still standing in your way",
      "CSV export and a clean print view",
    ],
  },

  "rental-type-comparison-chart": {
    slug: "rental-type-comparison-chart",
    name: "Rental Type Comparison Chart",
    blurb:
      "Short-term, mid-term, and long-term rentals side by side on income, hours, regulation, and startup cost, plus a 5-question quiz to find your fit.",
    bullets: [
      "A clean side-by-side of STR, MTR, and LTR",
      "Honest pros, cons, and real income examples",
      "A 5-question decision quiz to score your best model",
      "Why mid-term room rentals hit the sweet spot",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Comparison Chart",
    headline: "Which rental model\nactually fits you?",
    subhead:
      "Before you furnish a thing, see the three rental models on the numbers: what each earns, what each demands of your week, and which one matches your time, capital, and market.",
    howItWorks: [
      "Compare the three models across the metrics that matter.",
      "Read the deep dive and real income example for each.",
      "Answer five questions to score the model that fits you.",
    ],
    whatYouGet: [
      "A side-by-side of income, hours, regulation, and cost",
      "Real worked income examples for each model",
      "A quick quiz that points you to your best fit",
      "A clean print view to keep with your research",
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

  "tenant-tracker": {
    slug: "tenant-tracker",
    name: "Tenant Tracker & Rent Collection Log",
    blurb:
      "One row per tenant for room, dates, rate, deposit, and status, plus a rent log so a late payment is a same-day conversation, not a month-end surprise.",
    bullets: [
      "Track who is in each room and their lease dates",
      "Log rate, deposit, rent due, and payment status",
      "A running count of active tenants and open items",
      "Autosaves in your browser, CSV import and export",
    ],
    category: "property",
    archetype: "tracker",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Tenant Tracker",
    headline: "Know every room,\nrent, and date.",
    subhead:
      "Cash-flow problems are usually visibility problems. Keep one clean record of who is in each room, what they pay, and when, so nothing slips through the cracks when two rooms turn over in a week.",
    howItWorks: [
      "Add a row the day someone books a room.",
      "Fill in their dates, rate, deposit, and status.",
      "Update the rent log so late payments surface early.",
    ],
    whatYouGet: [
      "A living record of every room and tenant",
      "A rent log that flags late payments the same day",
      "CSV import and export to move data anywhere",
      "A clean print view for your monthly review",
    ],
  },

  "room-rental-agreement": {
    slug: "room-rental-agreement",
    name: "Room Rental Agreement & House Rules Guide",
    blurb:
      "What belongs in a solid room rental agreement and co-living house rules, clause by clause, so you can build or review yours with confidence.",
    bullets: [
      "The essential clauses every room rental agreement needs",
      "Co-living house rules that keep a shared home calm",
      "Plain-English notes on what each section protects",
      "Attorney-review reminders baked in throughout",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Agreement Guide",
    headline: "Put it in writing,\nthe right way.",
    subhead:
      "A good agreement prevents most disputes before they start. Here is what a room rental agreement and a co-living house-rules document should cover, section by section, in plain English.",
    howItWorks: [
      "Read what each clause does and why it matters.",
      "Draft or review your own agreement against the list.",
      "Have a local attorney confirm it for your state.",
    ],
    whatYouGet: [
      "The clause-by-clause anatomy of a room rental agreement",
      "House-rules sections tuned for a shared home",
      "Plain-English notes on what each part protects",
      "A clean print view to take to your attorney",
    ],
  },

  "legal-toolkit": {
    slug: "legal-toolkit",
    name: "The Legal Toolkit Overview",
    blurb:
      "The eight attorney-informed documents every co-living operator should have, what each one does, and when you reach for it. Frameworks to adapt, not legal advice.",
    bullets: [
      "All eight documents in the co-living legal stack",
      "What each protects and when you use it",
      "The key clauses to make sure yours includes",
      "Clear guidance on getting local legal review",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Legal Toolkit",
    headline: "The paperwork that\nprotects everything.",
    subhead:
      "Co-living runs on a handful of documents most new operators do not know they need until something goes wrong. Here is the full stack, what each does, and the clauses that matter, so you can build yours with a local attorney.",
    howItWorks: [
      "See the eight documents that make up the stack.",
      "Learn what each protects and when it comes into play.",
      "Adapt the frameworks with a licensed local attorney.",
    ],
    whatYouGet: [
      "The complete co-living document checklist",
      "The purpose and key clauses of each one",
      "A clear reminder of where legal review is essential",
      "A clean print view to review with counsel",
    ],
  },

  "social-posting-calendar": {
    slug: "social-posting-calendar",
    name: "30-Day Social Posting Calendar",
    blurb:
      "Thirty days of post ideas that attract room renters, built on four weekly themes so you stay consistent without staring at a blank calendar.",
    bullets: [
      "Four weekly themes from visibility to urgency",
      "A specific post idea for all 30 days",
      "Formats spelled out: reels, stories, carousels, posts",
      "Copy any day's prompt straight into your scheduler",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Posting Calendar",
    headline: "Thirty days of posts,\nalready planned.",
    subhead:
      "Consistency is what fills rooms, and consistency is a plan, not a personality trait. Here is a month of post ideas built on four themes, so you always know what to post next.",
    howItWorks: [
      "Follow the four weekly themes in order.",
      "Use each day's specific prompt and format.",
      "Copy prompts into your scheduler and batch them.",
    ],
    whatYouGet: [
      "A full month of ready-to-use post ideas",
      "Weekly themes that build toward move-ins",
      "The right format called out for each day",
      "Copy-to-clipboard and a clean print view",
    ],
  },

  "inquiry-script-bank": {
    slug: "inquiry-script-bank",
    name: "Inbound Inquiry Script Bank",
    blurb:
      "Confident, copy-and-send replies for every inquiry you get, from 'is this still available?' to 'that's more than I expected to pay,' so you turn messages into move-ins.",
    bullets: [
      "Scripts for eight common inquiry types",
      "Two versions each: friendly-detailed and short-direct",
      "Objection and ghost-prevention follow-ups included",
      "Copy any reply to your clipboard in one click",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Script Bank",
    headline: "Reply fast, book\nthe tour.",
    subhead:
      "Under-one-hour replies win the booking, but only if you are not writing from scratch each time. Here are proven, warm replies for every inquiry, ready to copy, personalize, and send.",
    howItWorks: [
      "Find the inquiry type you just received.",
      "Copy the version that fits your voice and moment.",
      "Drop in your details and send within the hour.",
    ],
    whatYouGet: [
      "Two ready replies for each common inquiry",
      "Objection handlers and follow-ups that re-engage",
      "Wording that always points to the next step",
      "Copy-to-clipboard and a clean print view",
    ],
  },

  "nicelisting-ai": {
    slug: "nicelisting-ai",
    name: "NiceListing Builder",
    blurb:
      "Answer a few questions about your room and audience and get a platform-ready listing title and a four-part description, built on the framework that fills rooms.",
    bullets: [
      "A title in the Feature + Location + Benefit formula",
      "A four-part description that sells the experience",
      "Tuned to the tenant and platform you choose",
      "Copy the finished listing straight to your clipboard",
    ],
    category: "property",
    archetype: "worksheet",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Listing Builder",
    headline: "A listing that reads\nlike it was written for them.",
    subhead:
      "Writing listing copy from a blank page is painful. Feed the builder your property details, your ideal tenant, and your amenities, and it assembles a title and description in the structure that converts.",
    howItWorks: [
      "Enter your room details, audience, and top amenities.",
      "The builder assembles a title and four-part description.",
      "Copy it, personalize the voice, and post it.",
    ],
    whatYouGet: [
      "A platform-ready listing title",
      "A four-part description built to convert",
      "Copy tuned to your tenant and platform",
      "One-click copy of the finished listing",
    ],
  },

  "upsell-playbook": {
    slug: "upsell-playbook",
    name: "Revenue Maximization & Upsell Playbook",
    blurb:
      "How to earn more from the rooms you already have: the upsell menu with real margins, loyalty and referral engines, rent-raise timing, and the readiness test for property two.",
    bullets: [
      "An upsell menu with typical prices and your margin",
      "Loyalty and referral systems that compound",
      "When and how much to raise rent, professionally",
      "The five-point checklist before you scale",
    ],
    category: "property",
    archetype: "reference",
    access: "free-email",
    status: "live",
    heroImage: HERO_DEFAULT,
    eyebrow: "Revenue Playbook",
    headline: "Earn more without\nadding a single room.",
    subhead:
      "You do not need more rooms to earn more. You need smarter monetization of the rooms you have. Here is the playbook: upsells, loyalty, referrals, rent optimization, and the path to property two.",
    howItWorks: [
      "Add two or three upsells and read the demand.",
      "Turn tenants into renewals and referrals.",
      "Use the readiness checklist before you scale.",
    ],
    whatYouGet: [
      "An upsell menu with prices and realistic margins",
      "Loyalty, referral, and rent-optimization playbooks",
      "The five-box readiness test for your next property",
      "A clean print view to plan your quarter",
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
