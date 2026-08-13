// Data layer for admin-editable planner cost defaults.
//
// Backs /admin/planner-costs. The static config in
// breakeven-analysis-worksheet/costs.ts remains the baseline; rows here
// replace individual field values on top of it. See catalog.ts for the merge
// rules and for why the id set is not editable.
//
// Reads are unauthenticated by design — the merged catalog is public
// information, it renders in the tool for every member. Writes go through
// requireAuth in the route.
//
// Follows src/lib/resources/analyses.ts conventions: a row interface, a
// rowToX mapper, an explicit column list, and Number() coercion because the
// Neon driver returns NUMERIC as a string.

import { sql } from "@/lib/db";
import { VALID_NETWORKS, type AffiliateNetwork } from "@/lib/marketplace";
import type { CostOverride } from "./breakeven-analysis-worksheet/catalog";

interface OverrideRow {
  line_id: string;
  one_time_cost: string | number | null;
  monthly_cost: string | number | null;
  monthly_percent: string | number | null;
  source_note: string | null;
  product_name: string | null;
  affiliate_url: string | null;
  network: string | null;
  price: string | number | null;
  price_checked_at: string | Date | null;
  updated_at: string | Date | null;
  updated_by: string | null;
}

/** NUMERIC arrives as a string from the driver; INT does not. */
function num(v: string | number | null): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** DATE/TIMESTAMPTZ come back as either a string or a Date depending on driver. */
function isoDate(v: string | Date | null): string | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  // Already 'YYYY-MM-DD', or a full timestamp we only want the date part of.
  return String(v).slice(0, 10);
}

function isoStamp(v: string | Date | null): string | null {
  if (v === null || v === undefined) return null;
  return v instanceof Date ? v.toISOString() : String(v);
}

function rowToOverride(r: OverrideRow): CostOverride {
  const network =
    r.network && VALID_NETWORKS.includes(r.network as AffiliateNetwork)
      ? (r.network as AffiliateNetwork)
      : null;
  return {
    lineId: r.line_id,
    oneTimeCost: num(r.one_time_cost),
    monthlyCost: num(r.monthly_cost),
    monthlyPercent: num(r.monthly_percent),
    sourceNote: r.source_note,
    productName: r.product_name,
    affiliateUrl: r.affiliate_url,
    network,
    price: num(r.price),
    priceCheckedAt: isoDate(r.price_checked_at),
    updatedAt: isoStamp(r.updated_at),
    updatedBy: r.updated_by,
  };
}

/**
 * Every override row. At most one per cost line, so this is bounded by the
 * config's line count (55 today) and needs no pagination.
 *
 * Called on every render of the planner page. Deliberately uncached: the table
 * is tiny, the page is already dynamic for the access check, and a cache here
 * would mean an admin edit does not show up until a tag invalidation that is
 * easy to forget. Revisit if the planner ever goes static.
 */
export async function listCostOverrides(): Promise<CostOverride[]> {
  const rows = (await sql`
    SELECT line_id, one_time_cost, monthly_cost, monthly_percent, source_note,
           product_name, affiliate_url, network, price, price_checked_at,
           updated_at, updated_by
    FROM planner_cost_overrides
    ORDER BY line_id
  `) as OverrideRow[];
  return rows.map(rowToOverride);
}

/** The values an admin may write. Undefined and null both mean "inherit". */
export interface OverrideInput {
  oneTimeCost?: number | null;
  monthlyCost?: number | null;
  monthlyPercent?: number | null;
  sourceNote?: string | null;
  productName?: string | null;
  affiliateUrl?: string | null;
  network?: AffiliateNetwork | null;
  price?: number | null;
  priceCheckedAt?: string | null;
}

/**
 * Full replace, not a patch: the admin form always submits every field it owns
 * for that line, so an omitted field means the admin cleared it back to the
 * config default. A partial-patch upsert would make "clear this field"
 * impossible to express.
 */
export async function upsertCostOverride(
  lineId: string,
  input: OverrideInput,
  actor: string | null,
): Promise<CostOverride | null> {
  const rows = (await sql`
    INSERT INTO planner_cost_overrides (
      line_id, one_time_cost, monthly_cost, monthly_percent, source_note,
      product_name, affiliate_url, network, price, price_checked_at,
      updated_at, updated_by
    ) VALUES (
      ${lineId},
      ${input.oneTimeCost ?? null},
      ${input.monthlyCost ?? null},
      ${input.monthlyPercent ?? null},
      ${input.sourceNote ?? null},
      ${input.productName ?? null},
      ${input.affiliateUrl ?? null},
      ${input.network ?? null},
      ${input.price ?? null},
      ${input.priceCheckedAt ?? null},
      NOW(),
      ${actor}
    )
    ON CONFLICT (line_id) DO UPDATE SET
      one_time_cost = EXCLUDED.one_time_cost,
      monthly_cost = EXCLUDED.monthly_cost,
      monthly_percent = EXCLUDED.monthly_percent,
      source_note = EXCLUDED.source_note,
      product_name = EXCLUDED.product_name,
      affiliate_url = EXCLUDED.affiliate_url,
      network = EXCLUDED.network,
      price = EXCLUDED.price,
      price_checked_at = EXCLUDED.price_checked_at,
      updated_at = NOW(),
      updated_by = EXCLUDED.updated_by
    RETURNING line_id, one_time_cost, monthly_cost, monthly_percent, source_note,
              product_name, affiliate_url, network, price, price_checked_at,
              updated_at, updated_by
  `) as OverrideRow[];
  return rows[0] ? rowToOverride(rows[0]) : null;
}

/** Drops the row entirely, returning the line to its config defaults. */
export async function deleteCostOverride(lineId: string): Promise<void> {
  await sql`DELETE FROM planner_cost_overrides WHERE line_id = ${lineId}`;
}
