// Merges admin overrides onto the static cost config.
//
// costs.ts is the baseline and stays the source of truth for STRUCTURE — which
// lines exist, what scope they have, which bucket they declare, what category
// they sit in. The `planner_cost_overrides` table supplies VALUES on top:
// dollar defaults, percentages, source notes, and affiliate product details.
//
// That split is deliberate. Line ids are the keys of every saved analysis and
// of the legacy worksheet import, so the id set has to be a compile-time
// constant that a database row cannot grow, shrink, or rename. An override with
// an unknown line_id is dropped silently, which is also what makes deleting a
// line from costs.ts safe: the orphaned row stops applying instead of crashing.
//
// The merge is per FIELD, not per line, and null means inherit. Zero is a real
// value here (op_biztax and op_misc both default to 0), so "reset to the config
// default" is null, never 0.

import {
  COST_LINES,
  MONTHLY_CATEGORIES,
  ONE_TIME_CATEGORIES,
  MONTHLY_LINE_IDS,
  ONE_TIME_LINE_IDS,
  type AffiliateProduct,
  type CostBucket,
  type CostCategory,
  type CostLine,
} from "./costs";
import type { AffiliateNetwork } from "@/lib/marketplace";

/**
 * One row of `planner_cost_overrides`, already coerced out of the driver's
 * NUMERIC-as-string. Every value field is nullable and null means "inherit the
 * config value".
 */
export interface CostOverride {
  lineId: string;
  oneTimeCost: number | null;
  monthlyCost: number | null;
  /** 0.05 = 5%. Only meaningful on percent-of-revenue lines. */
  monthlyPercent: number | null;
  sourceNote: string | null;
  productName: string | null;
  affiliateUrl: string | null;
  network: AffiliateNetwork | null;
  price: number | null;
  /** ISO yyyy-mm-dd. Stamped by the API when the price changes. */
  priceCheckedAt: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface CostCatalog {
  lines: CostLine[];
  byId: Record<string, CostLine>;
  oneTimeCategories: CostCategory[];
  monthlyCategories: CostCategory[];
  oneTimeLineIds: string[];
  monthlyLineIds: string[];
  /** Line ids carrying at least one applied override. Drives the admin badge. */
  overriddenIds: string[];
}

function mergeBucket(
  bucket: CostBucket | undefined,
  cost: number | null,
  percent: number | null,
): CostBucket | undefined {
  if (!bucket) return undefined;
  const next: CostBucket = { ...bucket };
  if (bucket.defaultMode === "percent-of-revenue") {
    // A flat dollar override on a percent line would silently change what the
    // number means, so only the percentage is honoured here.
    if (percent !== null) next.defaultPercent = percent;
  } else if (cost !== null) {
    next.defaultCost = cost;
  }
  return next;
}

function mergeProduct(
  product: AffiliateProduct | undefined,
  o: CostOverride,
): AffiliateProduct | undefined {
  if (!product) return undefined;
  return {
    productName: o.productName ?? product.productName,
    affiliateUrl: o.affiliateUrl ?? product.affiliateUrl,
    network: o.network ?? product.network,
    price: o.price ?? product.price,
    priceCheckedAt: o.priceCheckedAt ?? product.priceCheckedAt,
  };
}

/** True when this row actually changes anything. An all-null row is a no-op. */
export function overrideIsEmpty(o: CostOverride): boolean {
  return (
    o.oneTimeCost === null &&
    o.monthlyCost === null &&
    o.monthlyPercent === null &&
    o.sourceNote === null &&
    o.productName === null &&
    o.affiliateUrl === null &&
    o.network === null &&
    o.price === null &&
    o.priceCheckedAt === null
  );
}

export function applyOverride(line: CostLine, o: CostOverride): CostLine {
  return {
    ...line,
    // A line with a product takes its one-time default from the product price,
    // never from oneTime.defaultCost — two sources for one number is exactly
    // what assertCostConfigInvariants() exists to prevent. So a one-time dollar
    // override is ignored on product lines; the admin UI edits the price there.
    oneTime: mergeBucket(line.oneTime, line.product ? null : o.oneTimeCost, null),
    monthly: mergeBucket(line.monthly, o.monthlyCost, o.monthlyPercent),
    product: mergeProduct(line.product, o),
    sourceNote: o.sourceNote ?? line.sourceNote,
  };
}

export function buildCatalog(overrides: CostOverride[] = []): CostCatalog {
  const byOverrideId = new Map<string, CostOverride>();
  for (const o of overrides) {
    // Unknown ids are dropped, not an error: an override left behind by a line
    // that costs.ts no longer declares must not break the tool.
    if (!COST_LINES.some((l) => l.id === o.lineId)) continue;
    if (overrideIsEmpty(o)) continue;
    byOverrideId.set(o.lineId, o);
  }

  const lines = COST_LINES.map((l) => {
    const o = byOverrideId.get(l.id);
    return o ? applyOverride(l, o) : l;
  });

  return {
    lines,
    byId: Object.fromEntries(lines.map((l) => [l.id, l])),
    // Structure is never overridable, so these pass straight through.
    oneTimeCategories: ONE_TIME_CATEGORIES,
    monthlyCategories: MONTHLY_CATEGORIES,
    oneTimeLineIds: ONE_TIME_LINE_IDS,
    monthlyLineIds: MONTHLY_LINE_IDS,
    overriddenIds: [...byOverrideId.keys()],
  };
}

/**
 * The catalog with no overrides applied. Used by the pure engine's default
 * argument, by the smoke suite, and anywhere a DB read would be absurd.
 */
export const DEFAULT_CATALOG: CostCatalog = buildCatalog();

// --------------------------------------------------------------- admin view

/**
 * Which fields the admin form may edit for a line. Derived from the config so
 * the UI never has to restate the invariants — notably that a product line's
 * one-time default IS its price.
 */
export interface EditableFields {
  oneTimeCost: boolean;
  monthlyCost: boolean;
  monthlyPercent: boolean;
  product: boolean;
}

export function editableFields(line: CostLine): EditableFields {
  return {
    oneTimeCost: Boolean(line.oneTime) && !line.product,
    monthlyCost: Boolean(line.monthly) && line.monthly?.defaultMode !== "percent-of-revenue",
    monthlyPercent: line.monthly?.defaultMode === "percent-of-revenue",
    product: Boolean(line.product),
  };
}
