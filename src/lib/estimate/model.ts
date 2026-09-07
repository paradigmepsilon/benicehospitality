/**
 * Deterministic estimator arithmetic. No I/O, no randomness, no defaults that
 * stand in for missing market data: an unknown metro returns { unavailable }
 * so the page can say so honestly and still capture the lead.
 */

import { lookupRate, type EstimateAsset, type MetroRate } from "./rates";

export interface EstimateInput {
  asset: EstimateAsset;
  metro: string;
  /** Car only. Days per month the owner can make it available. */
  daysAvailable?: number;
  /** Car only. */
  condition?: "excellent" | "good" | "fair";
  /** Rooms only. */
  bedrooms?: number;
  /** Rooms only. */
  furnished?: boolean;
  /** Injected in tests, and by callers that already hold the rate. */
  rateOverride?: MetroRate;
  /** Management fee as a decimal. Omit to suppress the net figures. */
  feePct?: number;
}

export interface EstimateResult {
  grossLow: number;
  grossHigh: number;
  /** Null when no fee is configured. Never guessed. */
  netLow: number | null;
  netHigh: number | null;
  metro: string;
  state: string;
}

const FULL_MONTH_DAYS = 30;

/** Condition nudges the range. Kept mild: this is a range, not a valuation. */
const CONDITION_FACTOR: Record<string, number> = {
  excellent: 1.05,
  good: 1,
  fair: 0.9,
};

function round(n: number): number {
  return Math.max(0, Math.round(n));
}

export function estimate(
  input: EstimateInput,
): EstimateResult | { unavailable: true } {
  const rate = input.rateOverride ?? lookupRate(input.asset, input.metro);
  if (!rate) return { unavailable: true };

  let factor = 1;

  if (input.asset === "car") {
    const days = input.daysAvailable;
    if (typeof days === "number" && days > 0) {
      factor *= Math.min(days, FULL_MONTH_DAYS) / FULL_MONTH_DAYS;
    }
    factor *= CONDITION_FACTOR[input.condition ?? "good"] ?? 1;
  } else {
    // Rooms rates are quoted per room, so bedrooms scales linearly.
    const rooms = input.bedrooms;
    if (typeof rooms === "number" && rooms > 0) factor *= rooms;
    if (input.furnished === false) factor *= 0.85;
  }

  const grossLow = round(rate.monthlyGrossLow * factor);
  const grossHigh = round(rate.monthlyGrossHigh * factor);
  const fee = input.feePct;
  const hasFee = typeof fee === "number" && fee > 0 && fee < 1;

  return {
    grossLow,
    grossHigh,
    netLow: hasFee ? round(grossLow * (1 - fee)) : null,
    netHigh: hasFee ? round(grossHigh * (1 - fee)) : null,
    metro: rate.metro,
    state: rate.state,
  };
}
