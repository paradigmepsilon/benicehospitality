// Co-Living Property Profitability Analysis Worksheet — cost model.
//
// Merges two sources into one line list:
//   1. The 41 items of Della's Start-Up Cost Projection Worksheet, moved here
//      from src/lib/resources/startup-cost-calculator/config.ts. EVERY ID IS
//      PRESERVED VERBATIM — they are the keys of the legacy localStorage import
//      and of every saved analysis from here on. Never renumber them.
//   2. Twelve monthly lines the worksheet never had, taken from the Co-Living
//      Profit Calculator's OPEX_LINES so the two tools speak the same taxonomy.
//      `pnlLineId` records the mapping.
//
// The worksheet was a launch budget, so it had no mortgage, no property tax, no
// CapEx reserve, and no maintenance. A monthly section without those would tell
// a leveraged operator they net $4,600 when they net $1,800, so those lines are
// marked `required` — they carry a visible marker and drive a warning until the
// user fills them in. They do NOT start checked; see the note on CostBucket.
//
// SPLIT SUMMARY: 25 one-time only · 14 both · 1 monthly only (u3) · 1 computed
// (c1, the contingency, which is no longer a line item — see CONTINGENCY_* in
// projection.ts). A "both" line carries two buckets and renders as ONE row that
// appears in both sections with the other bucket's field greyed, rather than as
// two rows in two accordions the user cannot see at once.
//
// PRICES ARE PROPOSALS PENDING APPROVAL. Every `product` below is a suggested
// item at a plausible Southeast-market price, provided so the tool is usable on
// day one. `affiliateUrl` is intentionally empty: until Alex supplies a tagged
// URL, the line uses the price as its default and renders NO buy pill. Nothing
// breaks, and no untagged link ships. `priceCheckedAt` is the date the figure
// was proposed, not a verified retail scrape — the refresh script sorts by it.

import type { AffiliateNetwork } from "@/lib/marketplace";

/** Property-scope lines have qty 1; per-room lines default qty to the room count. */
export type CostScope = "property" | "per-room";

export interface AffiliateProduct {
  productName: string;
  /**
   * Empty until a tagged URL is supplied. Empty means: use `price` as the
   * default, render no buy pill, no disclosure obligation for this line.
   */
  affiliateUrl: string;
  network: AffiliateNetwork;
  /** Numeric USD. The single source of truth for this line's one-time default. */
  price: number;
  /** ISO date. Drives the staleness warning at PRICE_STALE_DAYS. */
  priceCheckedAt: string;
}

export interface CostBucket {
  /**
   * Flat dollar default. MUST be omitted when the line has a `product` — the
   * product's price is the default, and two sources would silently drift.
   * assertCostConfigInvariants() enforces this.
   */
  defaultCost?: number;
  /** Percentage-of-collected-revenue lines scale when a room is added. */
  defaultMode?: "flat" | "percent-of-revenue";
  /** 0.05 = 5%. Read only when defaultMode is "percent-of-revenue". */
  defaultPercent?: number;
  /**
   * Flags a line whose absence makes the headline net a lie — the mortgage, the
   * taxes, the insurance, the reserve.
   *
   * These used to start CHECKED, with their default amounts already counting.
   * That was wrong: a brand-new analysis opened at minus three thousand a month
   * before the user had typed anything, asserting a $1,650 mortgage for a
   * property we knew nothing about. Conflating "do not forget this line" with
   * "here is what it costs" invented numbers on the user's behalf.
   *
   * Now they start unchecked like everything else, so an empty analysis is
   * genuinely empty, and this flag drives a visible marker plus a warning in
   * section 3 instead. The tool prompts; it does not presume.
   */
  required?: boolean;
  /** Overrides the row label inside this bucket, e.g. "Internet service". */
  label?: string;
}

export interface CostLine {
  id: string;
  label: string;
  hint?: string;
  scope: CostScope;
  oneTime?: CostBucket;
  monthly?: CostBucket;
  product?: AffiliateProduct;
  /** Required when there is a default but no product. Cites where it came from. */
  sourceNote?: string;
  /** Maps to co-living-profit-calculator OPEX_LINES for future interop. */
  pnlLineId?: string;
  /** Point at a BNHG resource instead of a product. */
  internalHref?: string;
}

export interface CostCategory {
  id: string;
  label: string;
  lineIds: string[];
}

/** Prices older than this flip the line to a staleness warning. */
export const PRICE_STALE_DAYS = 180;

const PROPOSED = "2026-08-10";

function amazon(productName: string, price: number): AffiliateProduct {
  return { productName, affiliateUrl: "", network: "amazon", price, priceCheckedAt: PROPOSED };
}
function lowes(productName: string, price: number): AffiliateProduct {
  return { productName, affiliateUrl: "", network: "lowes", price, priceCheckedAt: PROPOSED };
}
function wayfair(productName: string, price: number): AffiliateProduct {
  return { productName, affiliateUrl: "", network: "wayfair", price, priceCheckedAt: PROPOSED };
}

export const COST_LINES: CostLine[] = [
  // ---------------------------------------------------------------- furniture
  {
    id: "f1",
    label: "Beds, frames, and mattresses",
    scope: "per-room",
    oneTime: {},
    product: amazon("Queen platform frame + 10in memory-foam mattress", 450),
  },
  {
    id: "f2",
    label: "Mattress protectors and linen sets",
    hint: "Two sets per bed so one is always in the wash.",
    scope: "per-room",
    oneTime: {},
    product: amazon("Zippered protector + 2 sheet sets", 120),
  },
  {
    id: "f3",
    label: "Desks and chairs",
    scope: "per-room",
    oneTime: {},
    product: amazon("Compact writing desk + task chair", 160),
  },
  {
    id: "f4",
    label: "Nightstands and lamps",
    scope: "per-room",
    oneTime: {},
    product: amazon("Nightstand with USB charging + table lamp", 90),
  },
  {
    id: "f5",
    label: "Dressers and closet storage",
    scope: "per-room",
    oneTime: {},
    product: wayfair("6-drawer dresser + closet organizer set", 180),
  },
  {
    id: "f6",
    label: "Living room seating (couch, chairs)",
    scope: "property",
    oneTime: {},
    product: wayfair("Durable performance-fabric sofa + 2 accent chairs", 700),
  },
  {
    id: "f7",
    label: "Coffee, side, and dining tables",
    scope: "property",
    oneTime: {},
    product: wayfair("Coffee table, 2 side tables, 6-seat dining set", 400),
  },

  // -------------------------------------------------------------------- decor
  { id: "d1", label: "Wall art and framed decor", scope: "property", oneTime: {}, product: amazon("Framed print set (6 pieces)", 150) },
  { id: "d2", label: "Mirrors", scope: "property", oneTime: {}, product: amazon("Full-length + entry mirror", 90) },
  { id: "d3", label: "Rugs and mats", scope: "property", oneTime: {}, product: wayfair("Living area rug + runners + entry mats", 220) },
  { id: "d4", label: "Curtains and window treatments", scope: "property", oneTime: {}, product: amazon("Blackout curtain sets + rods", 180) },
  { id: "d5", label: "Throw pillows, blankets, and plants", scope: "property", oneTime: {}, product: amazon("Pillow/throw set + faux plants", 150) },

  // ------------------------------------------------------------------ kitchen
  {
    id: "k1",
    label: "Refrigerator and stove/oven (if not present)",
    hint: "Skip if the property already has working appliances.",
    scope: "property",
    oneTime: {},
    product: lowes("Top-freezer fridge + freestanding electric range", 1400),
  },
  { id: "k2", label: "Microwave, toaster, coffee maker or kettle", scope: "property", oneTime: {}, product: amazon("Microwave, 4-slice toaster, drip coffee maker", 220) },
  { id: "k3", label: "Pots, pans, and cooking utensils", scope: "property", oneTime: {}, product: amazon("12-piece cookware set + utensil set", 150) },
  { id: "k4", label: "Plates, bowls, glasses, mugs, silverware", scope: "property", oneTime: {}, product: amazon("Service for 8 + flatware set", 130) },
  {
    id: "k5",
    label: "Food storage containers",
    hint: "In co-living this is labelled per-tenant bins, so it scales with rooms.",
    scope: "per-room",
    oneTime: {},
    product: amazon("Labelled stackable bin set, per tenant", 15),
  },

  // ------------------------------------------------------------------- safety
  { id: "s1", label: "Smoke and carbon monoxide detectors", scope: "property", oneTime: {}, product: amazon("Combination smoke/CO alarms (4-pack)", 120) },
  { id: "s2", label: "Fire extinguishers", scope: "property", oneTime: {}, product: amazon("ABC extinguishers (2-pack) + mounts", 90) },
  {
    id: "s3",
    label: "Smart lock / keypad locks",
    hint: "Per-room keypad entry. The monthly side is the app or bridge plan, if any.",
    scope: "per-room",
    oneTime: {},
    monthly: { defaultCost: 5, label: "Smart lock app / bridge plan" },
    product: amazon("Keypad smart lock, per room", 160),
  },
  {
    id: "s4",
    label: "Security cameras or entry system",
    hint: "Exterior and common areas only. Never inside a private room.",
    scope: "property",
    oneTime: {},
    monthly: { defaultCost: 15, label: "Camera cloud storage plan" },
    product: amazon("2-camera exterior kit + doorbell", 250),
  },
  { id: "s5", label: "Outdoor lighting", scope: "property", oneTime: {}, product: lowes("Motion floodlights + path lighting", 150) },
  { id: "s6", label: "First aid kit", scope: "property", oneTime: {}, product: amazon("Wall-mount first aid station", 45) },

  // ---------------------------------------------------------------- utilities
  {
    id: "u1",
    label: "Utility activation and deposits",
    hint: "Setup fees and refundable deposits. The ongoing bills are three separate lines in Section 3.",
    scope: "property",
    oneTime: { defaultCost: 350 },
    sourceNote: "Typical Georgia electric, water, and gas activation plus deposits, 2026.",
  },
  {
    id: "u2",
    label: "High-speed internet",
    hint: "Install and router up front, service every month.",
    scope: "property",
    oneTime: { label: "Internet install and router" },
    monthly: { defaultCost: 85, label: "Internet service" },
    product: amazon("Wi-Fi 6 mesh router (3-pack)", 200),
    pnlLineId: "op_internet",
  },
  {
    id: "u3",
    label: "Streaming subscriptions for common areas",
    scope: "property",
    monthly: { defaultCost: 35 },
    sourceNote: "Two mainstream streaming plans at 2026 list pricing.",
    pnlLineId: "op_streaming",
  },
  {
    id: "u4",
    label: "Pest control",
    hint: "Initial treatment, then quarterly service billed monthly.",
    scope: "property",
    oneTime: { defaultCost: 180, label: "Pest control (initial service)" },
    monthly: { defaultCost: 45, label: "Pest control (ongoing)" },
    sourceNote: "Atlanta-metro quarterly plan averaged to a monthly figure.",
    pnlLineId: "op_pest",
  },

  // -------------------------------------------------------------------- legal
  {
    id: "lg1",
    label: "LLC / business registration",
    hint: "Filing fee up front, registered agent and annual report spread monthly.",
    scope: "property",
    oneTime: { defaultCost: 150 },
    monthly: { defaultCost: 10, label: "Registered agent / annual report" },
    sourceNote: "Georgia SOS LLC filing fee plus a typical registered-agent annual, divided by 12.",
    pnlLineId: "op_legal",
  },
  {
    id: "lg2",
    label: "Property, landlord, and business insurance",
    hint: "Premium divided by 12. If it is escrowed into the mortgage payment above, switch this off — you have already counted it. Set the one-time field only if you pay the year in full up front.",
    scope: "property",
    oneTime: { defaultCost: 0 },
    monthly: { defaultCost: 185, required: true },
    sourceNote: "Landlord policy on a Southeast single-family co-living conversion, premium ÷ 12.",
    pnlLineId: "op_propins",
  },
  {
    id: "lg3",
    label: "Licenses and permits",
    hint: "Initial application, then the annual renewal spread monthly.",
    scope: "property",
    oneTime: { defaultCost: 300 },
    monthly: { defaultCost: 15, label: "License renewals" },
    sourceNote: "Varies widely by jurisdiction. Check your city and county before trusting this.",
  },
  {
    id: "lg4",
    label: "Lease drafting and legal review",
    scope: "property",
    oneTime: { defaultCost: 500 },
    sourceNote: "Attorney review of a room-rental agreement. Starting from a template lowers this.",
  },

  // ---------------------------------------------------------------- marketing
  {
    id: "m1",
    label: "Professional photography",
    scope: "property",
    oneTime: { defaultCost: 450 },
    sourceNote: "Half-day interior shoot, Atlanta metro, 2026.",
    internalHref: "/resources/photo-shot-list",
  },
  {
    id: "m2",
    label: "Listing fees and platform setup",
    scope: "property",
    oneTime: { defaultCost: 100 },
    monthly: { defaultCost: 30, label: "Listing platform fees" },
    sourceNote: "Room-rental marketplace listing and promotion fees.",
  },
  {
    id: "m3",
    label: "Advertising spend",
    hint: "A launch push, then a standing budget. Zeroing the monthly side makes vacancy look free to fix.",
    scope: "property",
    oneTime: { defaultCost: 400, label: "Initial advertising push" },
    monthly: { defaultCost: 75, label: "Ongoing advertising" },
    sourceNote: "Paid social and marketplace boosts sized to a 3-month lease-up.",
    pnlLineId: "op_marketing",
  },
  { id: "m4", label: "Signage and branding", scope: "property", oneTime: {}, product: amazon("Exterior sign, yard signs, decals", 250) },

  // --------------------------------------------------------------- operations
  {
    id: "o1",
    label: "Cleaning supplies",
    scope: "property",
    oneTime: { label: "Initial cleaning supplies" },
    monthly: { defaultCost: 45, label: "Cleaning supply restock" },
    product: amazon("Full cleaning caddy + vacuum + mop system", 120),
    pnlLineId: "op_supplies",
  },
  {
    id: "o2",
    label: "Consumables (toilet paper, soap, paper towels)",
    scope: "per-room",
    oneTime: { label: "Starter consumables" },
    monthly: { defaultCost: 12, label: "Consumables restock" },
    product: amazon("Bulk paper goods and soap, per tenant", 18),
  },
  {
    id: "o3",
    label: "Laundry supplies",
    scope: "property",
    oneTime: { label: "Laundry starter kit (detergent, baskets)" },
    monthly: { defaultCost: 25, label: "Detergent and laundry restock" },
    product: amazon("Detergent, baskets, drying rack", 80),
  },
  {
    id: "o4",
    label: "Welcome kits and guest guidebook printing",
    scope: "per-room",
    oneTime: {},
    monthly: { defaultCost: 3, label: "Welcome kit replacement" },
    product: amazon("Welcome kit contents + printed guidebook, per room", 24),
  },
  {
    id: "o5",
    label: "Tenant onboarding (background checks, keys)",
    hint: "One per tenant at launch, then again at every turnover.",
    scope: "per-room",
    oneTime: { defaultCost: 40 },
    monthly: { defaultCost: 8, label: "Turnover screening and keys" },
    sourceNote: "Background and credit screening per applicant, amortized over a typical tenancy.",
    pnlLineId: "op_onboarding",
  },

  // ------------------------------------------- monthly-only lines from the P&L
  // Everything below has no worksheet equivalent. The worksheet was a launch
  // budget; these are what it costs to keep the lights on.
  // Property tax lives INSIDE this line rather than beside it. An escrowed
  // payment is one number on one statement, and asking an operator to split it
  // back apart invited the double-count the old separate line then had to warn
  // about. The default carries the tax with it: $1,650 principal and interest
  // plus $265 a month of county tax. Dropping the separate line without moving
  // its money here would have quietly made every deal look $265/mo better.
  {
    id: "op_mortgage",
    label: "Mortgage or master-lease payment, including taxes",
    hint: "Your actual payment. If it is escrowed, the property-tax portion is already in it. Rent instead, if you are leasing to sublet — then add tax only if your lease makes you pay it.",
    scope: "property",
    monthly: { defaultCost: 1915, required: true },
    sourceNote: "Placeholder only. Replace with your actual payment — this is the biggest number in the model. Default is roughly $1,650 principal and interest plus $265 a month of property tax at the Douglas / Cobb effective rate.",
    pnlLineId: "op_mortgage",
  },
  {
    id: "u1m_electric",
    label: "Electricity",
    hint: "Five adults in one house. This is the line that surprises operators who include utilities in rent.",
    scope: "property",
    monthly: { defaultCost: 260 },
    sourceNote: "Georgia Power average for a fully occupied 4-5 bedroom, 2026.",
    pnlLineId: "op_electricity",
  },
  {
    id: "u1m_water",
    label: "Water / sewer",
    scope: "property",
    monthly: { defaultCost: 110 },
    sourceNote: "Atlanta-metro municipal average at co-living occupancy.",
    pnlLineId: "op_water",
  },
  {
    id: "u1m_gas",
    label: "Gas",
    scope: "property",
    monthly: { defaultCost: 70 },
    sourceNote: "Annualized Georgia natural-gas average, ÷ 12.",
    pnlLineId: "op_gas",
  },
  {
    id: "op_maintenance",
    label: "Maintenance and repairs",
    hint: "Not replacement — that is the CapEx reserve. This is the leaking faucet.",
    scope: "property",
    monthly: { defaultCost: 180 },
    sourceNote: "Rule of thumb for a shared house at co-living wear rates.",
    pnlLineId: "op_maintenance",
  },
  {
    id: "op_cleaning",
    label: "Common-area cleaning service",
    hint: "A cleaner, not supplies. Required if you sell cleanings as an included amenity.",
    scope: "property",
    monthly: { defaultCost: 220 },
    sourceNote: "Biweekly common-area clean, Atlanta metro.",
    pnlLineId: "op_cleaning",
  },
  {
    id: "op_capex",
    label: "CapEx reserve",
    hint: "Furniture, HVAC, roof. Five adults wear furniture out on a 3-5 year cycle. Without this, year 3 profit is deferred replacement cost.",
    scope: "property",
    monthly: { defaultMode: "percent-of-revenue", defaultPercent: 0.05, required: true },
    sourceNote: "5% of collected rent, the standard reserve for furnished shared housing.",
    pnlLineId: "op_capex",
  },
  {
    id: "op_pmfees",
    label: "Property management / your time",
    hint: "Even if you self-manage, price your time. This is what the business costs to hand off, and unpaid owner labour booked as profit is not profit.",
    scope: "property",
    monthly: { defaultMode: "percent-of-revenue", defaultPercent: 0.08 },
    sourceNote: "8% of collected rent, typical Southeast co-living management fee.",
    pnlLineId: "op_pmfees",
  },
  {
    id: "op_trash",
    label: "Trash removal",
    scope: "property",
    monthly: { defaultCost: 45 },
    sourceNote: "Private haul or municipal surcharge at higher occupancy.",
    pnlLineId: "op_trash",
  },
  {
    id: "op_lawn",
    label: "Lawncare / landscaping",
    scope: "property",
    monthly: { defaultCost: 120 },
    sourceNote: "Biweekly service in the growing season, averaged across the year.",
    pnlLineId: "op_lawn",
  },
  {
    id: "op_software",
    label: "Software subscriptions",
    hint: "Rent collection, screening, messaging, accounting.",
    scope: "property",
    monthly: { defaultCost: 40 },
    sourceNote: "A rent-collection platform plus bookkeeping, single property.",
    pnlLineId: "op_software",
  },
  {
    id: "op_bankfees",
    label: "Bank fees and payment processing",
    hint: "Real money once tenants pay by card.",
    scope: "property",
    monthly: { defaultMode: "percent-of-revenue", defaultPercent: 0.029 },
    sourceNote: "2.9% card processing on collected rent.",
    pnlLineId: "op_bankfees",
  },
  {
    id: "op_biztax",
    label: "Business taxes",
    hint: "Business licence and franchise tax, not income tax. This tool does not model income tax.",
    scope: "property",
    monthly: { defaultCost: 0 },
    sourceNote: "Varies by entity and jurisdiction. Enter your own.",
    pnlLineId: "op_biztax",
  },
  {
    id: "op_misc",
    label: "Miscellaneous",
    scope: "property",
    monthly: { defaultCost: 0 },
    sourceNote: "Your catch-all. Anything the lines above miss.",
    pnlLineId: "op_misc",
  },
];

export const COST_LINE_BY_ID: Record<string, CostLine> = Object.fromEntries(
  COST_LINES.map((l) => [l.id, l]),
);

export const ONE_TIME_CATEGORIES: CostCategory[] = [
  { id: "furniture", label: "Furniture & Furnishings", lineIds: ["f1", "f2", "f3", "f4", "f5", "f6", "f7"] },
  { id: "decor", label: "Décor & Styling", lineIds: ["d1", "d2", "d3", "d4", "d5"] },
  { id: "kitchen", label: "Kitchen & Appliances", lineIds: ["k1", "k2", "k3", "k4", "k5"] },
  { id: "safety", label: "Safety & Security", lineIds: ["s1", "s2", "s3", "s4", "s5", "s6"] },
  { id: "utilities", label: "Utilities & Setup", lineIds: ["u1", "u2", "u4"] },
  { id: "legal", label: "Legal & Insurance", lineIds: ["lg1", "lg2", "lg3", "lg4"] },
  { id: "marketing", label: "Marketing & Listing", lineIds: ["m1", "m2", "m3", "m4"] },
  { id: "operations", label: "Operations & Supplies", lineIds: ["o1", "o2", "o3", "o4", "o5"] },
];

export const MONTHLY_CATEGORIES: CostCategory[] = [
  { id: "housing", label: "Housing & Taxes", lineIds: ["op_mortgage"] },
  { id: "utilities_m", label: "Utilities", lineIds: ["u1m_electric", "u1m_water", "u1m_gas", "u2", "u3", "op_trash"] },
  { id: "services", label: "Services & Maintenance", lineIds: ["op_maintenance", "op_cleaning", "op_lawn", "u4", "s3", "s4"] },
  { id: "insurance", label: "Insurance & Legal", lineIds: ["lg2", "lg1", "lg3"] },
  { id: "tenants", label: "Marketing & Tenants", lineIds: ["m3", "m2", "o5", "o4"] },
  { id: "reserves", label: "Reserves & Admin", lineIds: ["op_capex", "op_pmfees", "o1", "o2", "o3", "op_software", "op_bankfees", "op_biztax", "op_misc"] },
];

export const ONE_TIME_LINE_IDS = ONE_TIME_CATEGORIES.flatMap((c) => c.lineIds);
export const MONTHLY_LINE_IDS = MONTHLY_CATEGORIES.flatMap((c) => c.lineIds);

/** Lines carrying a real affiliate URL. Empty until Alex supplies tagged links. */
export const LINKED_PRODUCT_LINES = COST_LINES.filter(
  (l) => l.product && l.product.affiliateUrl.trim() !== "",
);

/**
 * Guards the two ways this config can silently lie. Called by the assertion
 * script and at module load in development.
 */
export function assertCostConfigInvariants(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const line of COST_LINES) {
    if (seen.has(line.id)) problems.push(`Duplicate line id: ${line.id}`);
    seen.add(line.id);

    // A product price and a separate flat default are two sources of truth for
    // one number, and a price refresh would update only one of them.
    if (line.product && line.oneTime?.defaultCost !== undefined) {
      problems.push(
        `${line.id}: has a product (${line.product.productName}) AND oneTime.defaultCost. The product price is the default — drop defaultCost.`,
      );
    }
    if (!line.oneTime && !line.monthly) {
      problems.push(`${line.id}: declares neither a oneTime nor a monthly bucket.`);
    }
    // A default with no provenance is a number a user cannot argue with.
    const hasOneTimeDefault = line.oneTime && (line.product || line.oneTime.defaultCost !== undefined);
    const hasMonthlyDefault =
      line.monthly &&
      (line.monthly.defaultCost !== undefined || line.monthly.defaultMode === "percent-of-revenue");
    if ((hasOneTimeDefault || hasMonthlyDefault) && !line.product && !line.sourceNote) {
      problems.push(`${line.id}: has a default but no product and no sourceNote.`);
    }
    if (line.monthly?.defaultMode === "percent-of-revenue" && line.monthly.defaultPercent === undefined) {
      problems.push(`${line.id}: percent-of-revenue with no defaultPercent.`);
    }
  }

  for (const id of [...ONE_TIME_LINE_IDS, ...MONTHLY_LINE_IDS]) {
    if (!COST_LINE_BY_ID[id]) problems.push(`Category references unknown line id: ${id}`);
  }
  for (const id of ONE_TIME_LINE_IDS) {
    if (!COST_LINE_BY_ID[id]?.oneTime) problems.push(`${id}: in a one-time category but has no oneTime bucket.`);
  }
  for (const id of MONTHLY_LINE_IDS) {
    if (!COST_LINE_BY_ID[id]?.monthly) problems.push(`${id}: in a monthly category but has no monthly bucket.`);
  }
  const uncategorized = COST_LINES.filter(
    (l) => !ONE_TIME_LINE_IDS.includes(l.id) && !MONTHLY_LINE_IDS.includes(l.id),
  );
  for (const l of uncategorized) problems.push(`${l.id}: not in any category, so it renders nowhere.`);

  return problems;
}
