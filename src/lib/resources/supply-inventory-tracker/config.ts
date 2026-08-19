import type { AffiliateNetwork } from "@/lib/marketplace";

// Supply Inventory Tracker — digitized from Della's "Product/Supply Inventory
// Tracker" handout, then rebuilt around the way it actually gets used: someone
// walking a property with a phone, checking what is low. Entry is a quick-add
// form plus quantity steppers, not an eleven-column spreadsheet.
//
// The row shape below is unchanged from the original DataTableTool columns, so
// saved state and previously exported CSVs still load with no migration.

export interface InventoryItem {
  _id: string;
  /** One of INVENTORY_CATEGORIES, or free text from an imported CSV. */
  category: string;
  location: string;
  item: string;
  /** Target quantity to keep on hand. Numeric string, or "" when unset. */
  par: string;
  /** Unit of measure, e.g. "Rolls". Was labelled "Type" on the handout. */
  unit: string;
  /** Quantity counted on hand. Numeric string, or "" when unset. */
  current: string;
  /** Cost per unit, in dollars. Numeric string, or "" when unset. */
  pricePerUnit: string;
  lastRestocked: string;
  supplier: string;
  notes: string;
}

export const INVENTORY_CATEGORIES = [
  "Bathroom",
  "Kitchen",
  "Cleaning",
  "Laundry",
  "Bedroom & Linens",
  "Paper Goods",
  "Safety",
  "Maintenance",
  "Outdoor",
  "Office & Admin",
] as const;

export const INVENTORY_UNITS = [
  "Each",
  "Rolls",
  "Packs",
  "Cases",
  "Boxes",
  "Bottles",
  "Gallons",
  "Sets",
  "Pairs",
  "Bags",
] as const;

/**
 * Suggested item names per category, offered as a `<datalist>` on the quick-add
 * field. Typing is still free-form; this only saves keystrokes on the supplies
 * every co-living property carries.
 */
export const COMMON_ITEMS: Record<string, string[]> = {
  Bathroom: [
    "Toilet paper",
    "Hand soap",
    "Shampoo",
    "Conditioner",
    "Body wash",
    "Bath towels",
    "Hand towels",
    "Shower curtain liner",
    "Toilet brush",
    "Plunger",
  ],
  Kitchen: [
    "Dish soap",
    "Dishwasher pods",
    "Sponges",
    "Trash bags",
    "Paper towels",
    "Coffee",
    "Coffee filters",
    "Aluminum foil",
    "Food storage bags",
  ],
  Cleaning: [
    "All-purpose cleaner",
    "Glass cleaner",
    "Disinfecting wipes",
    "Bathroom cleaner",
    "Floor cleaner",
    "Microfiber cloths",
    "Rubber gloves",
    "Vacuum bags",
    "Mop heads",
  ],
  Laundry: [
    "Laundry detergent",
    "Dryer sheets",
    "Stain remover",
    "Bleach",
    "Laundry baskets",
  ],
  "Bedroom & Linens": [
    "Sheet sets",
    "Pillowcases",
    "Pillows",
    "Mattress protectors",
    "Blankets",
    "Comforters",
    "Hangers",
  ],
  "Paper Goods": [
    "Paper towels",
    "Toilet paper",
    "Napkins",
    "Facial tissue",
    "Paper plates",
  ],
  Safety: [
    "Smoke detector batteries",
    "Fire extinguisher",
    "First aid kit",
    "Carbon monoxide detector",
    "Door lock batteries",
    "Night lights",
  ],
  Maintenance: [
    "HVAC filters",
    "Light bulbs",
    "AA batteries",
    "AAA batteries",
    "Air fresheners",
    "Furnace filters",
    "Caulk",
    "Drain cleaner",
  ],
  Outdoor: [
    "Trash bin liners",
    "Ice melt",
    "Doormats",
    "Porch light bulbs",
    "Lawn bags",
  ],
  "Office & Admin": [
    "Printer paper",
    "Printer ink",
    "Key tags",
    "Lockbox codes card",
    "Welcome binders",
  ],
};

export type StockStatus = "out" | "low" | "ok" | "unset";

export const STATUS_LABEL: Record<StockStatus, string> = {
  out: "Out of stock",
  low: "Running low",
  ok: "Stocked",
  unset: "No par level",
};

function toNum(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Three real states plus "unset". An item with no par level cannot be judged,
 * and calling it "stocked" would hide it from the restock list forever.
 */
export function stockStatus(item: InventoryItem): StockStatus {
  const par = toNum(item.par);
  const current = toNum(item.current);
  if (Number.isNaN(par) || Number.isNaN(current)) return "unset";
  if (current <= 0) return "out";
  if (current < par) return "low";
  return "ok";
}

/** Units to buy to get back to par. 0 when at or above par, or unset. */
export function unitsToReorder(item: InventoryItem): number {
  const par = toNum(item.par);
  const current = toNum(item.current);
  if (Number.isNaN(par) || Number.isNaN(current)) return 0;
  return Math.max(0, par - current);
}

/** Does this item have a usable price? Blank or non-numeric doesn't count. */
export function hasPrice(item: Pick<InventoryItem, "pricePerUnit">): boolean {
  return !Number.isNaN(toNum(item.pricePerUnit));
}

/**
 * Dollar value of this item on hand: price per unit times quantity counted.
 * A missing price is treated as $0, same as a blank cell in a spreadsheet —
 * it does not throw off items that do have a price when summed for the grand
 * total.
 */
export function lineTotal(
  item: Pick<InventoryItem, "pricePerUnit" | "current">,
): number {
  const price = toNum(item.pricePerUnit);
  if (Number.isNaN(price)) return 0;
  const qty = toNum(item.current);
  return price * (Number.isNaN(qty) ? 0 : qty);
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

/** Every editable field on an item, in the order they appear in a CSV. */
export const EDITABLE_FIELDS: (keyof Omit<InventoryItem, "_id">)[] = [
  "category",
  "location",
  "item",
  "par",
  "unit",
  "current",
  "pricePerUnit",
  "lastRestocked",
  "supplier",
  "notes",
];

/**
 * CSV shape. Labels are frozen at the originals so a CSV exported from the old
 * table still imports here; `aliases` accepts the renamed headers as well.
 * The two computed columns are written on export and ignored on import.
 */
export const CSV_COLUMNS: {
  key: keyof Omit<InventoryItem, "_id"> | "reorder" | "restock" | "subtotal";
  label: string;
  aliases?: string[];
  computed?: boolean;
}[] = [
  { key: "category", label: "Category" },
  { key: "location", label: "Location" },
  { key: "item", label: "Item Name", aliases: ["Item"] },
  { key: "par", label: "Par Level", aliases: ["Par"] },
  { key: "unit", label: "Type", aliases: ["Unit", "Unit of Measure"] },
  {
    key: "current",
    label: "Current Quantity",
    aliases: ["Current", "On Hand"],
  },
  {
    key: "pricePerUnit",
    label: "Price Per Unit",
    aliases: ["Price", "Unit Price", "Price Per", "Price/Unit"],
  },
  { key: "subtotal", label: "Subtotal", computed: true },
  { key: "reorder", label: "Units to Reorder", computed: true },
  { key: "restock", label: "Restock Needed?", computed: true },
  { key: "lastRestocked", label: "Last Restocked" },
  {
    key: "supplier",
    label: "Supplier / Brand",
    aliases: ["Supplier", "Brand"],
  },
  { key: "notes", label: "Notes" },
];

/** Does this row hold anything a human typed? Blank rows are not counted. */
export function isFilled(item: InventoryItem): boolean {
  return EDITABLE_FIELDS.some((f) => (item[f] ?? "").trim() !== "");
}

// ---------------------------------------------------------------------------
// Affiliate suggestions
// ---------------------------------------------------------------------------

/**
 * The slice of a marketplace product the tracker needs. Built on the server in
 * the tracker page from listPublishedProducts(), so products stay managed in
 * /admin/marketplace and never need a deploy to change.
 */
export interface SuggestedProduct {
  /** Product slug — what /api/marketplace/click records as product_id. */
  id: string;
  name: string;
  body: string;
  priceRange: string;
  network: AffiliateNetwork;
  affiliateUrl: string;
  imageUrl: string;
  imageAlt: string;
  badge: string | null;
  tags: string[];
}

const NETWORK_CTA: Record<AffiliateNetwork, string> = {
  amazon: "Shop on Amazon",
  lowes: "Shop at Lowe's",
  wayfair: "Shop on Wayfair",
  direct: "Buy direct",
  other: "View product",
};

export function ctaFor(network: AffiliateNetwork): string {
  return NETWORK_CTA[network] ?? "View product";
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "pack",
  "packs",
  "set",
  "sets",
  "case",
  "cases",
  "box",
  "boxes",
  "kit",
  "size",
  "count",
  "each",
]);

/** Lowercase word tokens, crudely singularized so "towels" matches "towel". */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

/** Score below this and we show nothing rather than a bad recommendation. */
const MATCH_THRESHOLD = 3;

function scoreProduct(
  itemTokens: string[],
  categoryTokens: string[],
  product: SuggestedProduct,
): number {
  const tagTokens = new Set(product.tags.flatMap(tokenize));
  const nameTokens = new Set(tokenize(product.name));
  const bodyTokens = new Set(tokenize(product.body));

  let score = 0;
  for (const t of itemTokens) {
    if (tagTokens.has(t)) score += 4;
    else if (nameTokens.has(t)) score += 3;
    else if (bodyTokens.has(t)) score += 1;
  }
  for (const t of categoryTokens) {
    if (tagTokens.has(t)) score += 2;
    else if (nameTokens.has(t)) score += 1;
  }
  return score;
}

/**
 * Best-matching product for one inventory item, or null when nothing clears
 * the threshold. Item name carries most of the weight; category only breaks
 * ties, so a "Bathroom" item never pulls in an unrelated bathroom product.
 */
export function suggestProduct(
  item: Pick<InventoryItem, "item" | "category">,
  products: SuggestedProduct[],
): SuggestedProduct | null {
  const itemTokens = tokenize(item.item);
  if (!itemTokens.length) return null;
  const categoryTokens = tokenize(item.category);

  let best: SuggestedProduct | null = null;
  let bestScore = 0;
  for (const p of products) {
    const score = scoreProduct(itemTokens, categoryTokens, p);
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return bestScore >= MATCH_THRESHOLD ? best : null;
}

/**
 * Products worth showing under the tracker: ranked by how well they match the
 * whole list, then topped up with the rest of the catalog so the strip is never
 * empty for someone who has only entered a couple of items.
 */
export function suggestionsForInventory(
  items: Pick<InventoryItem, "item" | "category">[],
  products: SuggestedProduct[],
  limit = 3,
): SuggestedProduct[] {
  const scores = new Map<string, number>();
  for (const item of items) {
    const itemTokens = tokenize(item.item);
    if (!itemTokens.length) continue;
    const categoryTokens = tokenize(item.category);
    for (const p of products) {
      const score = scoreProduct(itemTokens, categoryTokens, p);
      if (score > 0) scores.set(p.id, (scores.get(p.id) ?? 0) + score);
    }
  }

  const matched = products
    .filter((p) => (scores.get(p.id) ?? 0) > 0)
    .sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
  const rest = products.filter((p) => !(scores.get(p.id) ?? 0));
  return [...matched, ...rest].slice(0, limit);
}
