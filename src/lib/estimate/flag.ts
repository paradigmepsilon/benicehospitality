/**
 * The estimator is reachable only when it has data to work with. Mirrors
 * isCrrPresaleOpen(): a boolean derived from env, so an unset variable hides
 * the surface rather than shipping an empty tool.
 */

import { METRO_RATES } from "./rates";

export function isEstimatorEnabled(): boolean {
  if (process.env.ESTIMATOR_ENABLED !== "true") return false;
  // Guard against the flag being flipped before the table is filled.
  return METRO_RATES.length > 0;
}
