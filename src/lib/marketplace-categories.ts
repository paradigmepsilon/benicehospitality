/**
 * Single source of truth for marketplace grouping.
 *
 * NO DB IMPORTS. This module is imported by MarketplaceAdmin.tsx, which is a
 * "use client" component. It only gets away with importing from
 * src/lib/marketplace.ts today because it uses `import type`, which is erased
 * at compile time — a value export there would pull @neondatabase/serverless
 * into the browser bundle. Keep this file a leaf so the admin form, the public
 * page, the route handlers, and scripts/ can all read the same list.
 */

export type MarketplaceTabId = "property" | "auto" | "back-office";

export const MARKETPLACE_TAB_IDS: readonly MarketplaceTabId[] = [
  "property",
  "auto",
  "back-office",
] as const;

export const MARKETPLACE_TAB_LABELS: Record<MarketplaceTabId, string> = {
  property: "Homes",
  auto: "Vehicles",
  "back-office": "Back Office",
};

export interface MarketplaceCategory {
  /** Stored verbatim in marketplace_products.category. Lowercase, stable —
   *  also used as the in-page anchor id, so keep it URL-safe. */
  readonly id: string;
  /** Section heading and room-tile label. */
  readonly label: string;
  readonly tabId: MarketplaceTabId;
  /** Order within the tab. A room walk, not alphabetical. */
  readonly position: number;
  /** One line under the room tile. Says what the room is for, the way
   *  Schoolhouse introduces a category rather than just naming it. */
  readonly blurb: string;
  /** Existing brand token hex, used as a tinted wash behind the card plate and
   *  the room tile. Never rendered as a solid behind light text — see
   *  ProductCard's plate, which washes it over cream and keeps ink dark. */
  readonly tint: string;
  /** Editorial room photography for the hub tile. Optional: a category without
   *  one falls back to the tinted plate, so adding art later is a data-only
   *  change. Must satisfy src/lib/image-sources.ts. */
  readonly image?: { readonly src: string; readonly alt: string };
}

/**
 * Rooms for Homes, jobs for Vehicles and Back Office.
 *
 * Eight rooms rather than the seventeen raw values that arrived in tags[0]:
 * IKEA's /rooms/ hub is thirteen tiles for an entire catalog, and at 83
 * products seventeen sections average five items each, which reads as a list of
 * headings rather than a place to shop.
 */
export const MARKETPLACE_CATEGORIES: readonly MarketplaceCategory[] = [
  {
    id: "bedroom",
    label: "Bedroom",
    tabId: "property",
    position: 1,
    blurb: "Beds, mattresses, linens, and the desk that makes a room work for a travel nurse.",
    tint: "#1A4D4F",
    image: {
      src: "/images/marketplace/rooms/bedroom.webp",
      alt: "Co-living bedroom with a made bed and a small desk by the window",
    },
  },
  {
    id: "living-common",
    label: "Living & Common Areas",
    tabId: "property",
    position: 2,
    blurb: "The shared spaces residents actually judge the house on.",
    tint: "#B08D57",
    image: {
      src: "/images/marketplace/rooms/living-common.webp",
      alt: "Shared living room with a sage sofa, wood coffee table, and rug",
    },
  },
  {
    id: "kitchen-dining",
    label: "Kitchen & Dining",
    tabId: "property",
    position: 3,
    blurb: "Appliances, cookware, and the labeled storage that stops shared-kitchen arguments.",
    tint: "#c0674a",
    image: {
      src: "/images/marketplace/rooms/kitchen-dining-shared.webp",
      alt: "Shared kitchen with matching storage bins and a small dining table",
    },
  },
  {
    id: "bathroom",
    label: "Bathroom",
    tabId: "property",
    position: 4,
    blurb: "Fixtures that survive four people, plus the consumables you restock every month.",
    tint: "#2D6A6C",
    image: {
      src: "/images/marketplace/rooms/bathroom.webp",
      alt: "Bathroom vanity with rolled towels and refillable pump bottles",
    },
  },
  {
    id: "laundry-linen",
    label: "Laundry & Linen Care",
    tabId: "property",
    position: 5,
    blurb: "What keeps towels and sheets in rotation instead of in the donation pile.",
    tint: "#4B5563",
    image: {
      src: "/images/marketplace/rooms/laundry-linen.webp",
      alt: "Laundry room with folded towels and sheets above a washer and dryer",
    },
  },
  {
    id: "cleaning-turnover",
    label: "Cleaning & Turnover",
    tabId: "property",
    position: 6,
    blurb: "The cart that resets a room between residents without a second trip to the store.",
    tint: "#2C3E50",
    image: {
      src: "/images/marketplace/rooms/cleaning-turnover.webp",
      alt: "Turnover cart with a cleaning caddy, microfiber cloths, and fresh linens",
    },
  },
  {
    id: "safety-smart-home",
    label: "Safety & Smart Home",
    tabId: "property",
    position: 7,
    blurb: "Locks, detectors, and the connectivity that makes self-check-in work.",
    tint: "#bc3229",
    image: {
      src: "/images/marketplace/rooms/safety-smart-home.webp",
      alt: "Keypad smart lock on a front door beside a console with a router",
    },
  },
  {
    id: "operations-welcome",
    label: "Operations & Welcome",
    tabId: "property",
    position: 8,
    blurb: "Curb appeal, entry, labeling, and what greets a resident on day one.",
    tint: "#294d8c",
    image: {
      src: "/images/marketplace/rooms/operations-welcome.webp",
      alt: "Craftsman front porch with a welcome basket on a bench",
    },
  },

  {
    id: "vehicle-safety",
    label: "Safety & Evidence",
    tabId: "auto",
    position: 1,
    blurb: "What settles a damage dispute before it becomes your word against theirs.",
    tint: "#294d8c",
    image: {
      src: "/images/marketplace/rooms/vehicle-safety.webp",
      alt: "Dashcam mounted behind a car's rear-view mirror",
    },
  },
  {
    id: "vehicle-maintenance",
    label: "Maintenance",
    tabId: "auto",
    position: 2,
    blurb: "Diagnostics and upkeep that catch a problem before a guest does.",
    tint: "#2C3E50",
    image: {
      src: "/images/marketplace/rooms/vehicle-maintenance.webp",
      alt: "OBD-II scanner plugged in under a car dashboard",
    },
  },
  {
    id: "vehicle-turnover",
    label: "Turnover & Detailing",
    tabId: "auto",
    position: 3,
    blurb: "The kit that resets a car between trips and keeps review scores up.",
    tint: "#2D6A6C",
    image: {
      src: "/images/marketplace/rooms/vehicle-turnover.webp",
      alt: "Car detailing kit laid out on a workbench beside a car",
    },
  },

  {
    id: "books",
    label: "Books",
    tabId: "back-office",
    position: 1,
    blurb: "The handful worth the shelf space.",
    tint: "#1A4D4F",
    image: {
      src: "/images/marketplace/rooms/books.webp",
      alt: "Stack of hardcover books on an oak desk beside a coffee mug",
    },
  },
  {
    id: "software",
    label: "Software & Accounting",
    tabId: "back-office",
    position: 2,
    blurb: "What we run the books and the business on.",
    tint: "#c0674a",
    image: {
      src: "/images/marketplace/rooms/software.webp",
      alt: "Laptop showing a bookkeeping dashboard beside a calculator",
    },
  },
  {
    id: "paper",
    label: "Planning & Paper",
    tabId: "back-office",
    position: 3,
    blurb: "Analog tools that survive a real operator's week.",
    tint: "#B08D57",
    image: {
      src: "/images/marketplace/rooms/paper.webp",
      alt: "Open weekly paper planner with a brass pen and coffee",
    },
  },
] as const;

export const MARKETPLACE_CATEGORY_IDS: readonly string[] = MARKETPLACE_CATEGORIES.map(
  (c) => c.id,
);

export const UNCATEGORIZED_LABEL = "More gear";

/**
 * Raw tags[0] value (and legacy slug) → category id.
 *
 * The 80 rows imported in September 2026 carried their category in tags[0] by
 * convention. The 12 rows seeded in May 2026 never followed that convention —
 * their tags[0] is a keyword ("lockbox", "dashcam"), not a category — so they
 * are mapped by slug in the migration instead. Both maps live here so the
 * backfill and any future re-categorisation read the same table.
 */
export const RAW_TAG_TO_CATEGORY: Readonly<Record<string, string>> = {
  "bedroom essentials": "bedroom",
  "bedroom workspace": "bedroom",
  "living room & common areas": "living-common",
  "cookware & kitchen tools": "kitchen-dining",
  "kitchen appliances": "kitchen-dining",
  "shared kitchen organization": "kitchen-dining",
  dining: "kitchen-dining",
  "bathroom essentials": "bathroom",
  "bathroom consumables & welcome kit": "bathroom",
  "laundry & linen care": "laundry-linen",
  "cleaning & turnover": "cleaning-turnover",
  "safety & emergency": "safety-smart-home",
  "smart home & security": "safety-smart-home",
  "technology & connectivity": "safety-smart-home",
  "property operations & organization": "operations-welcome",
  "resident welcome & co-living essentials": "operations-welcome",
  "outdoor & entry": "operations-welcome",
  // May 2026 seed rows, whose tags[0] is a keyword rather than a category.
  linen: "bedroom",
  mattress: "bedroom",
  lockbox: "safety-smart-home",
  dashcam: "vehicle-safety",
  obd2: "vehicle-maintenance",
  detail: "vehicle-turnover",
  book: "books",
  accounting: "software",
  planner: "paper",
};

/** lower + trim + collapse internal whitespace. "" for anything non-string. */
export function normalizeCategory(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findCategory(id: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === normalizeCategory(id));
}

export function isKnownCategory(id: string): boolean {
  return findCategory(id) !== undefined;
}

export function categoryLabel(id: string): string {
  return findCategory(id)?.label ?? UNCATEGORIZED_LABEL;
}

export function categoriesForTab(tabId: MarketplaceTabId): MarketplaceCategory[] {
  return MARKETPLACE_CATEGORIES.filter((c) => c.tabId === tabId).sort(
    (a, b) => a.position - b.position,
  );
}

export function isTabId(value: unknown): value is MarketplaceTabId {
  return (
    typeof value === "string" &&
    (MARKETPLACE_TAB_IDS as readonly string[]).includes(value)
  );
}

export interface CategoryGroup<T> {
  /** null for the trailing catch-all bucket. */
  category: MarketplaceCategory | null;
  label: string;
  /** Anchor id for the in-page jump nav. */
  anchor: string;
  items: T[];
}

/**
 * The one room-grouping implementation.
 *
 * Walks categoriesForTab() in position order emitting only non-empty buckets,
 * then appends a single trailing bucket holding everything whose category is
 * empty or unrecognised. A product can never disappear from the page because
 * its category string drifted — it lands under "More gear" instead.
 *
 * Callers must pass the *filtered* list, not the full tab, or section headings
 * will report counts that do not match what is rendered beneath them.
 */
export function groupByCategory<T extends { category: string }>(
  items: readonly T[],
  tabId: MarketplaceTabId,
): CategoryGroup<T>[] {
  const buckets = new Map<string, T[]>();
  const loose: T[] = [];

  for (const item of items) {
    const id = normalizeCategory(item.category);
    const known = findCategory(id);
    if (!known || known.tabId !== tabId) {
      loose.push(item);
      continue;
    }
    const existing = buckets.get(known.id);
    if (existing) existing.push(item);
    else buckets.set(known.id, [item]);
  }

  const groups: CategoryGroup<T>[] = [];
  for (const category of categoriesForTab(tabId)) {
    const bucket = buckets.get(category.id);
    if (!bucket || bucket.length === 0) continue;
    groups.push({
      category,
      label: category.label,
      anchor: `shop-${category.id}`,
      items: bucket,
    });
  }
  if (loose.length > 0) {
    groups.push({
      category: null,
      label: UNCATEGORIZED_LABEL,
      anchor: "shop-more",
      items: loose,
    });
  }
  return groups;
}
