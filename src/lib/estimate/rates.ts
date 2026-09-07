/**
 * Metro rate table for the earnings estimator.
 *
 * DELIBERATELY EMPTY. Neither existing calculator holds market rates: the
 * co-living P&L and the vehicle calculator both take numbers the member types
 * in. There is no rate data in this repo to seed from, and inventing one would
 * put a fabricated earnings figure in front of a prospect.
 *
 * Alex fills this array. Until it has entries, every lookup returns null, the
 * estimator renders its "no number for that market yet" state, and
 * isEstimatorEnabled() should stay false so the surface is not reachable.
 *
 * Figures are monthly GROSS, before any fee, for one asset.
 */

import type { ManagedAsset } from "@/lib/management/constants";

/** Same two assets the management bin offers. Aliased, not redeclared, so the
 *  estimator and the offer pages can never drift apart. */
export type EstimateAsset = ManagedAsset;

export interface MetroRate {
  /** Stable key used in the select and in lookups. */
  metro: string;
  /** Two-letter state, must be inside the six-state service area. */
  state: string;
  asset: EstimateAsset;
  monthlyGrossLow: number;
  monthlyGrossHigh: number;
}

export const METRO_RATES: MetroRate[] = [];

export function lookupRate(asset: EstimateAsset, metro: string): MetroRate | null {
  const key = metro.trim().toLowerCase();
  return (
    METRO_RATES.find((r) => r.asset === asset && r.metro.toLowerCase() === key) ?? null
  );
}

export function listMetros(asset: EstimateAsset): { value: string; label: string }[] {
  return METRO_RATES.filter((r) => r.asset === asset).map((r) => ({
    value: r.metro,
    label: `${r.metro}, ${r.state}`,
  }));
}
