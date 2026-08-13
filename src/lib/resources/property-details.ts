// Shape of the web-grounded property lookup.
//
// Every value here was extracted by a model reading live search results. It is
// an ESTIMATE WITH A CITATION, not a fact from a system of record, and the UI
// has to keep saying so — these numbers end up on a document an operator hands
// to a lender.

/** The numeric fields the lookup can fill. Null means "not found", never zero. */
export interface PropertyDetails {
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  walkScore: number | null;
  transitScore: number | null;
  bikeScore: number | null;
  /** Typical 1-BR rent in the area — the worksheet's `fmv` anchor. */
  oneBedroomRent: number | null;
  wholeHouseRent: number | null;
}

export type PropertyDetailField = keyof PropertyDetails;

export interface DetailSource {
  title: string;
  uri: string;
}

export interface PropertyDetailsResponse {
  details: PropertyDetails;
  /** Pages the model actually read. Empty means it did not search — distrust it. */
  sources: DetailSource[];
  /** The model's own caveats. Shown verbatim; never parsed. */
  notes: string;
  /**
   * True when every requested field came from the cache and no model call was
   * made. Not surfaced in the UI — a visible cache age would let one member
   * infer that another has been evaluating the same address. Useful in logs and
   * for measuring whether the cache is earning its keep.
   */
  cached: boolean;
}

// Google's Search Suggestions markup used to be carried here and rendered
// beside the results, because Gemini's Additional Terms permit displaying
// Grounded Results only "with the associated Search Suggestion(s)". Alex was
// shown that clause on 2026-08-11 and chose to drop the widget and accept the
// exposure. Restoring compliance means putting `searchSuggestionHtml` back on
// this interface and rendering it in SectionRooms, not just a config flag.

/**
 * Which form field each looked-up value lands in.
 *
 * Single source of truth for the round trip: the client uses it to work out
 * what is still blank (and therefore worth asking for), to grey exactly those
 * inputs while the search runs, and to write the answers back. A value the
 * member already typed is never requested, so their input is treated as true
 * and the lookup does less work.
 */
export const DETAIL_TO_INPUT = {
  bedrooms: "totalRooms",
  bathrooms: "bathrooms",
  squareFeet: "squareFeet",
  walkScore: "walkability",
  transitScore: "transitScore",
  bikeScore: "bikeScore",
  oneBedroomRent: "fmv",
  wholeHouseRent: "wholeHouseRent",
} as const satisfies Record<PropertyDetailField, string>;

export type DetailInputKey = (typeof DETAIL_TO_INPUT)[PropertyDetailField];

export const ALL_DETAIL_FIELDS = Object.keys(DETAIL_TO_INPUT) as PropertyDetailField[];

export const DETAIL_LABELS: Record<PropertyDetailField, string> = {
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  squareFeet: "Square feet",
  walkScore: "Walk Score",
  transitScore: "Transit Score",
  bikeScore: "Bike Score",
  oneBedroomRent: "1-bedroom rent",
  wholeHouseRent: "Whole-house rent",
};

/**
 * Plausibility bounds. A grounded model still occasionally reads the wrong
 * number off a page — a price where a square footage belongs, a ZIP where a
 * rent belongs. Anything outside these is dropped rather than shown, because a
 * wrong number that looks reasonable is worse than a blank field.
 */
export const DETAIL_BOUNDS: Record<PropertyDetailField, [number, number]> = {
  bedrooms: [1, 12],
  bathrooms: [1, 12],
  squareFeet: [200, 20000],
  walkScore: [0, 100],
  transitScore: [0, 100],
  bikeScore: [0, 100],
  oneBedroomRent: [300, 10000],
  wholeHouseRent: [400, 30000],
};

export function sanitizeDetails(raw: unknown): PropertyDetails {
  const out: PropertyDetails = {
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    walkScore: null,
    transitScore: null,
    bikeScore: null,
    oneBedroomRent: null,
    wholeHouseRent: null,
  };
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;

  for (const key of Object.keys(out) as PropertyDetailField[]) {
    const v = r[key];
    if (v === null || v === undefined || v === "") continue;
    const n = typeof v === "number" ? v : Number(String(v).replace(/[$,\s]/g, ""));
    if (!Number.isFinite(n)) continue;
    const [min, max] = DETAIL_BOUNDS[key];
    if (n < min || n > max) continue;
    // Bathrooms are the only field where a half is meaningful.
    out[key] = key === "bathrooms" ? Math.round(n * 2) / 2 : Math.round(n);
  }
  return out;
}
