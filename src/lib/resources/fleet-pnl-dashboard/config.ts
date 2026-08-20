// Fleet P&L Dashboard - up to 10 cars, one card each, with fleet totals.
//
// The math mirrors the CRR Fleet Financial Model spreadsheet
// (Courses/Car Rental Riches/_production/build_tools.py, fleet_model):
//   gross        = ADR x utilization x 30.4
//   host share   = gross x plan share
//   total costs  = loan payment + cleaning/ops + insurance/parking + gross x maintenance %
//   depreciation = purchase price x depreciation % / 12
//   cash net     = host share - total costs
//   true net     = cash net - depreciation
//   ROI on cash  = (true net x 12) / cash invested
//
// Earnings-plan shares and damage responsibility come from the single source of
// truth in the Vehicle Profitability Calculator config - never redeclared here.

import {
  DAYS_PER_MONTH,
  EARNINGS_PLANS,
  planById,
  type EarningsPlan,
} from "@/lib/resources/vehicle-profitability-calculator/config";

export { DAYS_PER_MONTH, EARNINGS_PLANS, planById };

export const MAX_CARS = 10;

export interface CarInput {
  _id: string;
  nickname: string;
  /** All numeric inputs kept as strings - they are text-field values. */
  price: string;
  cashInvested: string;
  loanMonthly: string;
  adr: string;
  /** Utilization as a whole percentage, e.g. "55". */
  utilizationPct: string;
  planId: EarningsPlan["id"];
  cleaningOpsMonthly: string;
  insParkingMonthly: string;
  /** Maintenance reserve as % of gross, e.g. "8". */
  maintenancePct: string;
  /** Straight-line depreciation as % of purchase price per year, e.g. "15". */
  depreciationPct: string;
}

export interface FleetState {
  cars: CarInput[];
  /** Self-attestation: fleet true net positive three straight months. */
  attestThreeMonths: boolean;
  /** Self-attestation: one full damage responsibility held in cash per car. */
  attestCashReserve: boolean;
  /**
   * Ids of car cards the member has folded shut. Collapsed rather than open
   * ids, matching DataTableTool and the Vehicle Maintenance Tracker: state
   * saved before this feature has no key at all, and a car added later is not
   * in the list. Both read as "open", which is the default we want. Nothing is
   * ever hidden that the member did not hide.
   */
  collapsed?: string[];
}

/** Defaults matching the course spreadsheet's assumption rows. */
export const CAR_DEFAULTS: Omit<CarInput, "_id" | "nickname"> = {
  price: "",
  cashInvested: "",
  loanMonthly: "",
  adr: "",
  utilizationPct: "55",
  planId: "balanced",
  cleaningOpsMonthly: "",
  insParkingMonthly: "",
  maintenancePct: "8",
  depreciationPct: "15",
};

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** A car counts toward fleet totals once it has a name, a price, or a rate. */
export function isCarFilled(c: CarInput): boolean {
  return (
    c.nickname.trim() !== "" || num(c.price) > 0 || num(c.adr) > 0
  );
}

export interface CarResults {
  grossMonthly: number;
  hostShareMonthly: number;
  totalCostsMonthly: number;
  depreciationMonthly: number;
  cashNetMonthly: number;
  trueNetMonthly: number;
  trueNetAnnual: number;
  /** Null when cash invested is 0 (ROI undefined). */
  roi: number | null;
  damageResponsibility: number;
}

export function computeCar(c: CarInput): CarResults {
  const plan = planById(c.planId);
  const price = num(c.price);
  const cash = num(c.cashInvested);
  const util = Math.min(num(c.utilizationPct), 100) / 100;

  const grossMonthly = num(c.adr) * util * DAYS_PER_MONTH;
  const hostShareMonthly = grossMonthly * plan.share;
  const totalCostsMonthly =
    num(c.loanMonthly) +
    num(c.cleaningOpsMonthly) +
    num(c.insParkingMonthly) +
    grossMonthly * (num(c.maintenancePct) / 100);
  const depreciationMonthly = (price * (num(c.depreciationPct) / 100)) / 12;
  const cashNetMonthly = hostShareMonthly - totalCostsMonthly;
  const trueNetMonthly = cashNetMonthly - depreciationMonthly;
  const trueNetAnnual = trueNetMonthly * 12;

  return {
    grossMonthly,
    hostShareMonthly,
    totalCostsMonthly,
    depreciationMonthly,
    cashNetMonthly,
    trueNetMonthly,
    trueNetAnnual,
    roi: cash > 0 ? trueNetAnnual / cash : null,
    damageResponsibility: plan.damageResponsibility,
  };
}

export interface FleetTotals {
  carCount: number;
  grossMonthly: number;
  hostShareMonthly: number;
  totalCostsMonthly: number;
  depreciationMonthly: number;
  cashNetMonthly: number;
  trueNetMonthly: number;
  trueNetAnnual: number;
  cashInvested: number;
  /** Null when total cash invested is 0. */
  roi: number | null;
  /** Sum of each active car's damage responsibility - the cash reserve bar. */
  reserveRequired: number;
  best: { car: CarInput; results: CarResults } | null;
  worst: { car: CarInput; results: CarResults } | null;
}

export function computeFleet(cars: CarInput[]): FleetTotals {
  const active = cars.filter(isCarFilled);
  const results = active.map((car) => ({ car, results: computeCar(car) }));

  const sum = (f: (r: CarResults) => number) =>
    results.reduce((t, x) => t + f(x.results), 0);

  const cashInvested = active.reduce((t, c) => t + num(c.cashInvested), 0);
  const trueNetAnnual = sum((r) => r.trueNetAnnual);

  let best: FleetTotals["best"] = null;
  let worst: FleetTotals["worst"] = null;
  for (const x of results) {
    if (!best || x.results.trueNetMonthly > best.results.trueNetMonthly) best = x;
    if (!worst || x.results.trueNetMonthly < worst.results.trueNetMonthly) worst = x;
  }

  return {
    carCount: active.length,
    grossMonthly: sum((r) => r.grossMonthly),
    hostShareMonthly: sum((r) => r.hostShareMonthly),
    totalCostsMonthly: sum((r) => r.totalCostsMonthly),
    depreciationMonthly: sum((r) => r.depreciationMonthly),
    cashNetMonthly: sum((r) => r.cashNetMonthly),
    trueNetMonthly: sum((r) => r.trueNetMonthly),
    trueNetAnnual,
    cashInvested,
    roi: cashInvested > 0 ? trueNetAnnual / cashInvested : null,
    reserveRequired: sum((r) => r.damageResponsibility),
    best,
    worst: results.length > 1 ? worst : null,
  };
}

/** The car-#2 readiness rule, straight from the course. */
export const READINESS_RULE =
  "Add the next car only when the fleet's true net is positive three straight months and you hold one full damage responsibility in cash per car.";
