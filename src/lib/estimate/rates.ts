/**
 * Metro rate table for the earnings estimator.
 *
 * Figures are monthly GROSS, before any fee, for one asset (one room, one
 * vehicle), at full occupancy. They are asking-rent ranges built from public
 * listing comparables, never from any operator's actual bookings, occupancy,
 * revenue, or costs. Do not seed a row from internal performance data.
 *
 * A metro with no row returns null from lookupRate, and the estimator renders
 * its "no number for that market yet" state. That is the correct behavior for
 * every market nobody has researched: an empty answer beats an invented one.
 *
 * CAR rows: none. There is no sourced vehicle rate research yet, so
 * isEstimatorEnabled("car") stays false.
 *
 * ROOMS rows, provenance:
 *   Source   market_experiment_2026_09.json and market-experiment-2026-09.md
 *            (sibling BNP repo, scripts/data/ and docs/). A pricing study of
 *            22 modeled rooms in 6 houses across 3 metros. Every figure in it
 *            is modeled from public listings; it contains no booking history.
 *   Pulled   2026-09-19. Comparables in the study are dated Jul to Sep 2026.
 *   Comps    Published one-bedroom rent figures by neighborhood:
 *              Charlotte     Zumper medians: Plaza Midwood $1,482 (Sep 2026),
 *                            McAlpine $1,520 (Jul 2026), Dilworth $1,665
 *                            (Sep 2026)
 *              Charleston    RentCafe West Ashley / Carolina Bay average
 *                            $1,645 (Aug 2026), Zumper East Central median
 *                            $2,110 (Jul 2026)
 *              Jacksonville  Zumper Mandarin median $1,289 (Sep 2026)
 *   Method   The per-room model in
 *            src/lib/resources/breakeven-analysis-worksheet/pricing.ts:
 *            monthly = 65% x comparable 1-bed rent + room and property
 *            premiums. Both ends of each range are anchored on the LOWEST
 *            comp in the metro, so a pricier neighborhood never lifts it:
 *              low  = 65% x lowest comp, a bare room with no premiums
 *              high = the lowest-priced shared-bath room the study modeled in
 *                     that metro (65% base plus utilities, Wi-Fi, weekly
 *                     housekeeping, linens, laundry, stocked kitchen)
 *            Private-bath suites are excluded. Both ends round DOWN to $25.
 *              Charlotte     963 -> 950,   1,248 -> 1,225
 *              Charleston    1,069 -> 1,050, 1,399 -> 1,375
 *              Jacksonville  838 -> 825,   1,168 -> 1,150
 *   Limits   Charleston and Jacksonville rest on two comps and one comp. The
 *            study itself notes the West Ashley figure comes from a newer
 *            complex and is likely a touch high for older streets nearby.
 *            Refresh the comps before trusting these past early 2027.
 *
 * rates.test.ts pins each range to its lowest comp. Change a number here and
 * that test tells you whether the comps still support it.
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

export const METRO_RATES: MetroRate[] = [
  { metro: "Charlotte", state: "NC", asset: "rooms", monthlyGrossLow: 950, monthlyGrossHigh: 1225 },
  { metro: "Charleston", state: "SC", asset: "rooms", monthlyGrossLow: 1050, monthlyGrossHigh: 1375 },
  { metro: "Jacksonville", state: "FL", asset: "rooms", monthlyGrossLow: 825, monthlyGrossHigh: 1150 },
];

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
