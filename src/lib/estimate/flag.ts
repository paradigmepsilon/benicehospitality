/**
 * The estimator is reachable only when it has data to work with. Mirrors
 * isCrrPresaleOpen(): a boolean derived from env, so an unset variable hides
 * the surface rather than shipping an empty tool.
 */

import { METRO_RATES, type EstimateAsset } from "./rates";

/**
 * Pass an asset to ask about one tool. The table can hold rooms rates and no
 * car rates (or the reverse), and a tool page should not become reachable
 * because the OTHER asset got data. With no argument it answers for the
 * shared front door: is there anything at all to estimate.
 */
export function isEstimatorEnabled(asset?: EstimateAsset): boolean {
  if (process.env.ESTIMATOR_ENABLED !== "true") return false;
  // Guard against the flag being flipped before the table is filled.
  if (asset) return METRO_RATES.some((r) => r.asset === asset);
  return METRO_RATES.length > 0;
}
