// Earnings Plan Optimizer - puts one car's gross through all three 2026 Turo
// earnings plans and shows the trade: extra share vs. extra damage
// responsibility per claim.
//
// Plan figures are imported from the vehicle-profitability-calculator config,
// the single place the 2026 numbers live. Nothing platform-specific is
// redeclared here.

import {
  DAYS_PER_MONTH,
  EARNINGS_PLANS,
  type EarningsPlan,
} from "@/lib/resources/vehicle-profitability-calculator/config";

export { EARNINGS_PLANS, DAYS_PER_MONTH };
export type { EarningsPlan };

export interface OptimizerInputs {
  /** How gross is entered: a direct monthly figure, or ADR x utilization. */
  mode: "gross" | "adr";
  grossMonthly: string;
  adr: string;
  /** Utilization as a whole percentage, e.g. "55". */
  utilizationPct: string;
  tripsPerYear: string;
  carValue: string;
  /** Metadata-complete photos inside the 24-hour windows, every trip. */
  photoProtocol: "strong" | "building";
  riskTolerance: "comfortable" | "low";
}

export const DEFAULT_OPTIMIZER_INPUTS: OptimizerInputs = {
  mode: "adr",
  grossMonthly: "750",
  adr: "45",
  utilizationPct: "55",
  tripsPerYear: "48",
  carValue: "15000",
  photoProtocol: "building",
  riskTolerance: "comfortable",
};

/**
 * Car-value cutoffs for the recommendation. Method heuristics, not platform
 * facts: a claim on an expensive car is likelier to be an expensive claim, so
 * the capped damage responsibility of the lower plans buys more there.
 */
export const CAR_VALUE_HIGH = 35000;
export const CAR_VALUE_LOW = 20000;

export interface PlanRow {
  plan: EarningsPlan;
  monthlyShare: number;
  annualShare: number;
  /** Nulls on the first (70%) plan - there is no previous plan to step from. */
  extraAnnualVsPrev: number | null;
  extraDamageVsPrev: number | null;
  /**
   * Claims per year at which the step-up stops paying: the extra annual share
   * divided by the extra damage responsibility per claim. Below this claim
   * rate the higher plan wins; above it the step-up costs you money.
   */
  claimsToErase: number | null;
  /** The same break-even expressed as one claim every N trips. */
  tripsPerErasingClaim: number | null;
}

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function grossMonthlyOf(i: OptimizerInputs): number {
  if (i.mode === "gross") return num(i.grossMonthly);
  return num(i.adr) * (Math.min(num(i.utilizationPct), 100) / 100) * DAYS_PER_MONTH;
}

export function computePlanRows(i: OptimizerInputs): PlanRow[] {
  const gross = grossMonthlyOf(i);
  const trips = num(i.tripsPerYear);
  return EARNINGS_PLANS.map((plan, idx) => {
    const monthlyShare = gross * plan.share;
    const annualShare = monthlyShare * 12;
    const prev = idx > 0 ? EARNINGS_PLANS[idx - 1] : null;
    const extraAnnualVsPrev = prev ? (plan.share - prev.share) * gross * 12 : null;
    const extraDamageVsPrev = prev
      ? plan.damageResponsibility - prev.damageResponsibility
      : null;
    const claimsToErase =
      extraAnnualVsPrev !== null &&
      extraAnnualVsPrev > 0 &&
      extraDamageVsPrev !== null &&
      extraDamageVsPrev > 0
        ? extraAnnualVsPrev / extraDamageVsPrev
        : null;
    const tripsPerErasingClaim =
      claimsToErase !== null && claimsToErase > 0 && trips > 0
        ? trips / claimsToErase
        : null;
    return {
      plan,
      monthlyShare,
      annualShare,
      extraAnnualVsPrev,
      extraDamageVsPrev,
      claimsToErase,
      tripsPerErasingClaim,
    };
  });
}

export interface Recommendation {
  planId: EarningsPlan["id"];
  reasons: string[];
}

/**
 * The course's plan-selection logic: higher plans favor lower-value cars run
 * with a strong photo protocol; lower plans favor high-value cars and hosts
 * for whom a surprise bill would genuinely hurt.
 */
export function recommendPlan(i: OptimizerInputs): Recommendation | null {
  const carValue = num(i.carValue);
  if (grossMonthlyOf(i) <= 0 || carValue <= 0) return null;

  if (i.riskTolerance === "low") {
    return {
      planId: "peace",
      reasons: [
        "You said a surprise bill would hurt. The 70% plan caps a claim at $250, and no spreadsheet argument beats being able to sleep.",
        "Revisit this once you hold a funded reserve. Risk tolerance is a budget line, not a personality trait.",
      ],
    };
  }
  if (carValue >= CAR_VALUE_HIGH) {
    return {
      planId: "peace",
      reasons: [
        "On a car worth this much, a claim is likelier to be a big one. The lower damage responsibility is cheap insurance on an expensive asset.",
        "The extra share the higher plans pay rarely covers the extra exposure at this vehicle value.",
      ],
    };
  }
  if (carValue <= CAR_VALUE_LOW && i.photoProtocol === "strong") {
    return {
      planId: "earnings",
      reasons: [
        "Lower-value car plus a strong photo protocol is exactly where the 90% plan wins: your claims defense is documented and your worst case is capped at $2,750.",
        "Check the gut-check row below: if a claim that often is realistic in your market, step back down to Balanced.",
      ],
    };
  }
  return {
    planId: "balanced",
    reasons: [
      i.photoProtocol === "building"
        ? "Until your photo protocol is airtight (metadata-complete photos inside the 24-hour windows, every trip), the middle plan keeps the downside survivable."
        : "This car sits between the clear cases. Balanced takes most of the upside without the $2,750 worst case.",
      "Move up to 90% when the car is cheaper to replace and your documentation habit is proven; move down to 70% if the car gets more expensive.",
    ],
  };
}
