// Co-Living Property Profitability Analysis Worksheet — state shape and the
// projection engine.
//
// Pure. No React, no DOM, no fetch. Both the client renderer and the PATCH
// route's summary recompute import from here, so there is exactly one
// implementation of the math and the shelf can never drift from the chart.
//
// The engine builds 36 months explicitly and rolls them up into years rather
// than computing years directly. Break-even needs monthly granularity anyway,
// the lease-up ramp requires it, and the chart falls out for free.

import {
  COST_LINES,
  COST_LINE_BY_ID,
  type CostBucket,
  type CostLine,
} from "./costs";
import { DEFAULT_CATALOG, type CostCatalog } from "./catalog";
import {
  computePricing,
  formatLocality,
  makeRoom,
  parseNum,
  type PricingSummary,
  type PropertyInputs,
  type Room,
} from "./pricing";

// ---------------------------------------------------------------- state shape

export const PLANNER_SCHEMA_VERSION = 1;

/**
 * The five pages, in order. "property" and "rooms" were one page until the
 * property block grew an address, a web lookup and eight detail fields — at
 * which point the rooms were below the fold on every visit.
 */
export type SectionId = "property" | "rooms" | "one-time" | "monthly" | "report";

export interface CostLineState {
  /** The checkbox. Controls inclusion in the sum and nothing else. */
  on: boolean;
  /** "" means auto: the room count for per-room lines, 1 for property lines. */
  qty: string;
  /** "" means use the default. A non-empty value IS "the user touched this". */
  oneTime: string;
  monthly: string;
}

export interface PlannerAssumptions {
  vacancyPct: string;
  rentGrowthPct: string;
  expenseInflationPct: string;
  leaseUpMonths: string;
  contingencyPct: string;
  reserveMonths: string;
}

export interface PlannerState {
  version: number;
  property: PropertyInputs;
  rooms: Room[];
  lines: Record<string, CostLineState>;
  assumptions: PlannerAssumptions;
}

export const DEFAULT_ASSUMPTIONS: PlannerAssumptions = {
  // Turnover in co-living is structurally higher than a 12-month single lease.
  // Five rooms at one turn a year with three weeks of downtime is 5.8%; add the
  // tenant who skips a final month and 8% is the honest anchor.
  vacancyPct: "8",
  // Rent growth and expense inflation are DELIBERATELY UNEQUAL. Setting them
  // equal produces a monotonically improving margin that does not match
  // operator reality — insurance, reassessed property tax, and utilities have
  // all run hotter than Southeast rent growth. Being slightly conservative in
  // year 3 is the correct direction to be wrong for a capital plan.
  rentGrowthPct: "3",
  expenseInflationPct: "4",
  // A naive model fills a five-room house on day one. Reality is two to four
  // months, and the difference is roughly 8% of year-one revenue.
  leaseUpMonths: "3",
  // Midpoint of Della's stated "recommend 10 to 15%".
  contingencyPct: "12",
  reserveMonths: "3",
};

/**
 * Every line starts OFF, so a fresh analysis reads $0 across the board and
 * every number on screen is one the user put there. Structurally important
 * lines are surfaced by the `required` flag and the warning it drives, not by
 * quietly pre-loading them with money.
 */
function defaultLineState(): CostLineState {
  return { on: false, qty: "", oneTime: "", monthly: "" };
}

export function initialPlannerState(): PlannerState {
  return {
    version: PLANNER_SCHEMA_VERSION,
    property: {
      street: "",
      city: "",
      state: "",
      zip: "",
      bathrooms: "",
      squareFeet: "",
      fmv: "",
      totalRooms: "",
      walkability: "",
      transitScore: "",
      bikeScore: "",
      wholeHouseRent: "",
      features: {},
      included: {},
    },
    // One room card, not a guessed three. How many bedrooms the property has is
    // asked outright in section 1 rather than inferred from a number we made up.
    rooms: [makeRoom(0, "room-1")],
    lines: Object.fromEntries(COST_LINES.map((l) => [l.id, defaultLineState()])),
    assumptions: { ...DEFAULT_ASSUMPTIONS },
  };
}

/**
 * Fill in anything a stored payload is missing. Every read goes through this,
 * so adding a field to PlannerState never breaks an existing analysis. Mirrors
 * the defensive `state.costs ?? {}` idiom the old worksheet used.
 */
export function hydratePlannerState(raw: unknown): PlannerState {
  const base = initialPlannerState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<PlannerState>;

  const rooms = Array.isArray(r.rooms) && r.rooms.length > 0
    ? r.rooms.map((room, i) => ({ ...makeRoom(i, `room-${i + 1}`), ...room }))
    : base.rooms;

  const lines = { ...base.lines };
  if (r.lines && typeof r.lines === "object") {
    for (const [id, saved] of Object.entries(r.lines)) {
      // Drop ids that have left the config rather than carrying dead state.
      if (!COST_LINE_BY_ID[id] || !saved || typeof saved !== "object") continue;
      lines[id] = { ...lines[id], ...saved };
    }
  }

  // A property used to carry its own `nickname` beside the analysis name, so
  // one property could be "Hutchens" in the switcher and "123 Maple St" in the
  // form and neither was wrong. The analysis name won. Whatever was typed here
  // is most likely a street (the field's placeholder was literally "123 Maple
  // St"), so it moves there rather than being dropped on the floor — and the
  // dead key goes with it so it stops riding along in the JSONB.
  const rawProperty = { ...(r.property ?? {}) } as Partial<PropertyInputs> & {
    nickname?: unknown;
  };
  const legacyNickname =
    typeof rawProperty.nickname === "string" ? rawProperty.nickname.trim() : "";
  delete rawProperty.nickname;

  const property = { ...base.property, ...rawProperty };
  if (legacyNickname && !property.street.trim()) property.street = legacyNickname;

  return {
    version: PLANNER_SCHEMA_VERSION,
    property,
    rooms,
    lines,
    assumptions: { ...base.assumptions, ...(r.assumptions ?? {}) },
    // `openSections` used to live here, back when the four steps were an
    // accordion. Rows saved then still carry it; it is simply dropped on
    // hydrate. Which page you are on is local UI state now, not part of the
    // saved analysis.
  };
}

// ------------------------------------------------------------ line resolution

export type AmountSource = "default" | "user" | "percent";

export interface ResolvedLine {
  line: CostLine;
  state: CostLineState;
  bucket: CostBucket;
  /** Per-unit amount actually used. */
  amount: number;
  qty: number;
  total: number;
  source: AmountSource;
  /** Still running on our estimate rather than a typed value. */
  usingDefault: boolean;
}

/**
 * Per-unit default for a bucket. `ctx.collectedMonthlyRevenue` is only read by
 * percent-of-revenue lines, which is what lets CapEx and management fees scale
 * when a room is added instead of going stale.
 */
export function resolveDefault(
  line: CostLine,
  which: "oneTime" | "monthly",
  collectedMonthlyRevenue: number,
): { amount: number; source: AmountSource } {
  const bucket = line[which];
  if (!bucket) return { amount: 0, source: "default" };
  if (bucket.defaultMode === "percent-of-revenue") {
    return {
      amount: Math.round(collectedMonthlyRevenue * (bucket.defaultPercent ?? 0)),
      source: "percent",
    };
  }
  if (which === "oneTime" && line.product) {
    return { amount: line.product.price, source: "default" };
  }
  return { amount: bucket.defaultCost ?? 0, source: "default" };
}

export function effectiveQty(
  line: CostLine,
  state: CostLineState,
  roomCount: number,
): number {
  if (line.scope === "property") return 1;
  const raw = state.qty.trim();
  if (raw === "") return roomCount;
  const n = parseFloat(raw);
  // Preserves the old worksheet's effQty semantics: invalid means 0, not 1.
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function resolveLine(
  line: CostLine,
  state: CostLineState,
  which: "oneTime" | "monthly",
  roomCount: number,
  collectedMonthlyRevenue: number,
): ResolvedLine | null {
  const bucket = line[which];
  if (!bucket) return null;

  const qty = effectiveQty(line, state, roomCount);

  if (!state.on) {
    return { line, state, bucket, amount: 0, qty, total: 0, source: "default", usingDefault: true };
  }

  const typedRaw = (which === "oneTime" ? state.oneTime : state.monthly).trim();
  const typed = parseFloat(typedRaw);
  const hasTyped = typedRaw !== "" && Number.isFinite(typed);

  const { amount, source } = hasTyped
    ? { amount: Math.max(0, typed), source: "user" as AmountSource }
    : resolveDefault(line, which, collectedMonthlyRevenue);

  return {
    line,
    state,
    bucket,
    amount,
    qty,
    total: amount * qty,
    source,
    usingDefault: !hasTyped,
  };
}

export interface BucketTotals {
  resolved: ResolvedLine[];
  /** Sum of every checked line. */
  subtotal: number;
  activeCount: number;
  /** Checked lines still running on our estimate. */
  defaultCount: number;
}

function resolveBucket(
  lineIds: string[],
  lines: Record<string, CostLineState>,
  which: "oneTime" | "monthly",
  roomCount: number,
  collectedMonthlyRevenue: number,
  byId: Record<string, CostLine>,
): BucketTotals {
  const resolved: ResolvedLine[] = [];
  let subtotal = 0;
  let activeCount = 0;
  let defaultCount = 0;

  for (const id of lineIds) {
    const line = byId[id];
    if (!line) continue;
    const state = lines[id] ?? defaultLineState();
    const r = resolveLine(line, state, which, roomCount, collectedMonthlyRevenue);
    if (!r) continue;
    resolved.push(r);
    if (state.on) {
      subtotal += r.total;
      activeCount += 1;
      if (r.usingDefault) defaultCount += 1;
    }
  }

  return { resolved, subtotal, activeCount, defaultCount };
}

// ------------------------------------------------------------------- the math

export interface ProjectionInputs {
  grossScheduledRent: number;
  monthlyRecurring: number;
  totalOneTime: number;
  vacancyPct: number;
  rentGrowthPct: number;
  expenseInflationPct: number;
  leaseUpMonths: number;
  reserveMonths: number;
}

export interface MonthRow {
  m: number;
  year: number;
  gross: number;
  rampLoss: number;
  vacancyLoss: number;
  collected: number;
  expense: number;
  net: number;
  cumulative: number;
}

export interface YearRow {
  year: number;
  gross: number;
  rampLoss: number;
  vacancyLoss: number;
  revenue: number;
  expense: number;
  net: number;
  launch: number;
  netAfterLaunch: number;
  cumulative: number;
}

/** How far past the display horizon the engine looks for a crossing. */
export const BREAK_EVEN_SEARCH_MONTHS = 120;
export const DISPLAY_MONTHS = 36;

export function monthOf(m: number, i: ProjectionInputs) {
  const year = Math.ceil(m / 12);
  // Step function at months 13 and 25, not continuous compounding. Rents reset
  // at renewal, and "year 2 is 3% higher" is explainable in a report in a way
  // a monthly curve is not.
  const rentFactor = (1 + i.rentGrowthPct) ** (year - 1);
  const expFactor = (1 + i.expenseInflationPct) ** (year - 1);
  const fill = i.leaseUpMonths > 0 ? Math.min(1, m / i.leaseUpMonths) : 1;

  const gross = i.grossScheduledRent * rentFactor;
  const rampLoss = gross * (1 - fill);
  // Vacancy applies to rent NET of the ramp. Applying both to gross
  // double-discounts the early months.
  const vacancyLoss = (gross - rampLoss) * i.vacancyPct;
  const collected = gross - rampLoss - vacancyLoss;
  const expense = i.monthlyRecurring * expFactor;

  return { m, year, gross, rampLoss, vacancyLoss, collected, expense, net: collected - expense };
}

export type BreakEvenCase =
  | "paid-back"
  | "never-negative-net"
  | "beyond-horizon"
  | "beyond-search"
  | "no-launch-costs"
  | "immediate"
  | "no-revenue";

export interface BreakEven {
  /** First month where cumulative cash covers the launch cost. */
  capitalPaybackMonth: number | null;
  /** First month the property covers its own bills, ignoring launch capital. */
  operatingBreakEvenMonth: number | null;
  case: BreakEvenCase;
  /** Cumulative position at the end of the display horizon. */
  cumulativeAtHorizon: number;
  /** Monthly shortfall when the net never turns positive. */
  monthlyGap: number;
  /** Extra rooms at today's average price that would close that gap. */
  roomsToClose: number;
}

export interface ProjectionResult {
  inputs: ProjectionInputs;
  months: MonthRow[];
  years: YearRow[];
  /** Steady-state monthly net, after lease-up, at year-1 prices. */
  monthlyNet: number;
  effectiveMonthlyRevenue: number;
  breakEven: BreakEven;
  /** Launch cost plus an operating reserve. What you actually need at the door. */
  cashAtTheDoor: number;
}

function findBreakEven(
  i: ProjectionInputs,
  months: MonthRow[],
  averageRoomPrice: number,
): BreakEven {
  const cumulativeAtHorizon = months[months.length - 1]?.cumulative ?? -i.totalOneTime;

  let cum = -i.totalOneTime;
  let capitalPaybackMonth: number | null = null;
  let operatingBreakEvenMonth: number | null = null;
  let lastNet = 0;
  let lastExpense = 0;
  let lastCollected = 0;

  for (let m = 1; m <= BREAK_EVEN_SEARCH_MONTHS; m++) {
    const mo = monthOf(m, i);
    lastNet = mo.net;
    lastExpense = mo.expense;
    lastCollected = mo.collected;
    if (operatingBreakEvenMonth === null && mo.net > 0) operatingBreakEvenMonth = m;
    cum += mo.net;
    if (capitalPaybackMonth === null && cum >= 0) {
      capitalPaybackMonth = m;
      break;
    }
  }

  const monthlyGap = Math.max(0, lastExpense - lastCollected);
  const roomsToClose =
    averageRoomPrice > 0 ? Math.ceil(monthlyGap / averageRoomPrice) : 0;

  let kind: BreakEvenCase;
  if (i.grossScheduledRent <= 0) {
    kind = "no-revenue";
  } else if (capitalPaybackMonth === null && lastNet <= 0) {
    kind = "never-negative-net";
  } else if (capitalPaybackMonth === null) {
    kind = "beyond-search";
  } else if (i.totalOneTime <= 0) {
    // Profitable from the start, but there is nothing to pay back. Never print
    // a triumphant "month 0" — it reads as a result when it is a missing input.
    kind = "no-launch-costs";
  } else if (capitalPaybackMonth === 1) {
    kind = "immediate";
  } else if (capitalPaybackMonth > DISPLAY_MONTHS) {
    kind = "beyond-horizon";
  } else {
    kind = "paid-back";
  }

  return {
    capitalPaybackMonth,
    operatingBreakEvenMonth,
    case: kind,
    cumulativeAtHorizon,
    monthlyGap,
    roomsToClose,
  };
}

export function buildProjection(
  i: ProjectionInputs,
  averageRoomPrice = 0,
): ProjectionResult {
  const months: MonthRow[] = [];
  let cum = -i.totalOneTime;

  for (let m = 1; m <= DISPLAY_MONTHS; m++) {
    const mo = monthOf(m, i);
    cum += mo.net;
    months.push({ ...mo, cumulative: cum });
  }

  const years: YearRow[] = [];
  let yearCum = 0;
  for (let y = 1; y <= DISPLAY_MONTHS / 12; y++) {
    const inYear = months.filter((m) => m.year === y);
    const sum = (k: keyof MonthRow) => inYear.reduce((t, m) => t + (m[k] as number), 0);
    const revenue = sum("collected");
    const expense = sum("expense");
    const net = revenue - expense;
    // One-time costs land in month 0 and are excluded from every Expense(y).
    // Spreading them would double-count against the monthly CapEx reserve.
    const launch = y === 1 ? i.totalOneTime : 0;
    const netAfterLaunch = net - launch;
    yearCum += netAfterLaunch;
    years.push({
      year: y,
      gross: sum("gross"),
      rampLoss: sum("rampLoss"),
      vacancyLoss: sum("vacancyLoss"),
      revenue,
      expense,
      net,
      launch,
      netAfterLaunch,
      cumulative: yearCum,
    });
  }

  // Steady state = after the ramp, at year-1 prices. The headline number.
  const steady = monthOf(Math.max(1, Math.ceil(i.leaseUpMonths)), i);

  return {
    inputs: i,
    months,
    years,
    monthlyNet: steady.net,
    effectiveMonthlyRevenue: steady.collected,
    breakEven: findBreakEven(i, months, averageRoomPrice),
    cashAtTheDoor: i.totalOneTime + i.reserveMonths * i.monthlyRecurring,
  };
}

/**
 * Break-even as a range rather than a point. Reporting "month 16" off a stack
 * of estimates implies an accuracy that is not there; a range is the honest
 * shape. Three passes of a bounded loop, so effectively free.
 */
export interface BreakEvenBand {
  optimistic: number | null;
  expected: number | null;
  pessimistic: number | null;
}

export function breakEvenBand(i: ProjectionInputs, averageRoomPrice = 0): BreakEvenBand {
  const run = (o: Partial<ProjectionInputs>) =>
    buildProjection({ ...i, ...o }, averageRoomPrice).breakEven.capitalPaybackMonth;

  return {
    optimistic: run({
      vacancyPct: Math.max(0, i.vacancyPct - 0.03),
      totalOneTime: i.totalOneTime * 0.9,
      leaseUpMonths: Math.max(0, i.leaseUpMonths - 1),
    }),
    expected: run({}),
    pessimistic: run({
      vacancyPct: i.vacancyPct + 0.05,
      totalOneTime: i.totalOneTime * 1.15,
      leaseUpMonths: i.leaseUpMonths + 2,
    }),
  };
}

// -------------------------------------------------------- the whole-tool view

export interface PlannerComputation {
  pricing: PricingSummary;
  oneTime: BucketTotals;
  monthly: BucketTotals;
  oneTimeSubtotal: number;
  contingency: number;
  totalOneTime: number;
  monthlyRecurring: number;
  projection: ProjectionResult;
  band: BreakEvenBand;
  /** Property-level "included" amenities sold with no matching cost booked. */
  couplingWarnings: string[];
  /**
   * Structural monthly lines still switched off. Replaces the old
   * pre-checked-with-money behaviour: the tool points at what is missing
   * instead of filling it in with a number the user never gave.
   */
  missingRequired: { id: string; label: string }[];
  readiness: { property: boolean; rooms: boolean; oneTime: boolean; monthly: boolean };
}

function pct(v: string, fallback: number): number {
  const n = parseNum(v);
  return Number.isFinite(n) ? n / 100 : fallback;
}

/**
 * `catalog` carries the admin's overrides on top of costs.ts. It defaults to
 * the untouched config so the smoke suite and any caller that has no reason to
 * hit the database keep working unchanged — and so a failed override fetch
 * degrades to correct-but-stale numbers rather than a broken tool.
 *
 * Overrides can only change VALUES, never the set of line ids, which is why
 * initialPlannerState and hydratePlannerState need no catalog: the keys of
 * `state.lines` are a compile-time constant.
 */
export function computePlanner(
  state: PlannerState,
  catalog: CostCatalog = DEFAULT_CATALOG,
): PlannerComputation {
  const pricing = computePricing(state.property, state.rooms);

  const vacancyPct = Math.min(1, Math.max(0, pct(state.assumptions.vacancyPct, 0.08)));
  // Percent-of-revenue cost lines need a revenue figure before the monthly
  // total exists, so they key off collected rent at steady state rather than
  // net — no circularity.
  const collectedMonthlyRevenue = pricing.grossScheduledRent * (1 - vacancyPct);

  const oneTime = resolveBucket(
    catalog.oneTimeLineIds,
    state.lines,
    "oneTime",
    pricing.roomCount,
    collectedMonthlyRevenue,
    catalog.byId,
  );
  const monthly = resolveBucket(
    catalog.monthlyLineIds,
    state.lines,
    "monthly",
    pricing.roomCount,
    collectedMonthlyRevenue,
    catalog.byId,
  );

  const contingencyPct = Math.min(0.3, Math.max(0, pct(state.assumptions.contingencyPct, 0.12)));
  const contingency = Math.round(oneTime.subtotal * contingencyPct);
  // Break-even repays the TOTAL including contingency. Excluding it produces a
  // date the operator misses by exactly the surprises the buffer exists for.
  const totalOneTime = oneTime.subtotal + contingency;

  const inputs: ProjectionInputs = {
    grossScheduledRent: pricing.grossScheduledRent,
    monthlyRecurring: monthly.subtotal,
    totalOneTime,
    vacancyPct,
    rentGrowthPct: pct(state.assumptions.rentGrowthPct, 0.03),
    expenseInflationPct: pct(state.assumptions.expenseInflationPct, 0.04),
    leaseUpMonths: Math.max(0, parseNum(state.assumptions.leaseUpMonths)),
    reserveMonths: Math.max(0, parseNum(state.assumptions.reserveMonths)),
  };

  const projection = buildProjection(inputs, pricing.averageRoomPrice);

  // Selling utilities or Wi-Fi as included and then booking $0 of them is the
  // fastest way to make a bad deal look good.
  const couplingWarnings: string[] = [];
  const lineIsZero = (id: string) => {
    const st = state.lines[id];
    const line = catalog.byId[id];
    if (!line || !st) return true;
    const r = resolveLine(line, st, "monthly", pricing.roomCount, collectedMonthlyRevenue);
    return !r || r.total <= 0;
  };
  if (state.property.included.utilitiesIncluded && ["u1m_electric", "u1m_water", "u1m_gas"].every(lineIsZero)) {
    couplingWarnings.push(
      "You are charging for all-utilities-included but have no utility costs entered.",
    );
  }
  if (state.property.included.wifiIncluded && lineIsZero("u2")) {
    couplingWarnings.push("You are charging for Wi-Fi but have no internet cost entered.");
  }
  if (state.rooms.some((r) => r.included.roomCleanings) && lineIsZero("op_cleaning")) {
    couplingWarnings.push(
      "You are charging for room cleanings but have no cleaning service entered.",
    );
  }

  const on = (id: string) => Boolean(state.lines[id]?.on);

  const missingRequired = catalog.monthlyLineIds.filter((id) => {
    const line = catalog.byId[id];
    return line?.monthly?.required && !on(id);
  }).map((id) => {
    const line = catalog.byId[id]!;
    return { id, label: line.monthly?.label ?? line.label };
  });

  return {
    pricing,
    oneTime,
    monthly,
    oneTimeSubtotal: oneTime.subtotal,
    contingency,
    totalOneTime,
    monthlyRecurring: monthly.subtotal,
    projection,
    band: breakEvenBand(inputs, pricing.averageRoomPrice),
    couplingWarnings,
    missingRequired,
    readiness: {
      // The comp rent is what every room price is derived from, so a blank one
      // is a different failure from "no rooms added" and gets pointed at the
      // page that actually fixes it.
      property: parseNum(state.property.fmv) > 0,
      rooms: pricing.grossScheduledRent > 0,
      oneTime: oneTime.activeCount > 0,
      monthly: monthly.activeCount > 0,
    },
  };
}

/**
 * The denormalized figures stored on resource_analyses. Computed server-side
 * from `data` on every write and never accepted from the client — otherwise a
 * shared dashboard is one fetch away from "my property nets $9,999,999".
 */
export interface PlannerSummary {
  monthlyNet: number | null;
  breakEvenMonth: number | null;
  startupTotal: number | null;
  /** "Douglasville, GA", or null when no address has been entered. */
  location: string | null;
}

export function summarizePlanner(
  raw: unknown,
  catalog: CostCatalog = DEFAULT_CATALOG,
): PlannerSummary {
  const empty: PlannerSummary = {
    monthlyNet: null,
    breakEvenMonth: null,
    startupTotal: null,
    location: null,
  };
  try {
    const state = hydratePlannerState(raw);
    // Location is independent of whether any room has been priced — an address
    // typed into an otherwise blank analysis should still label its list row.
    const location = formatLocality(state.property) || null;
    const c = computePlanner(state, catalog);
    if (!c.readiness.rooms) return { ...empty, location };
    return {
      monthlyNet: Math.round(c.projection.monthlyNet),
      breakEvenMonth: c.projection.breakEven.capitalPaybackMonth,
      startupTotal: Math.round(c.totalOneTime),
      location,
    };
  } catch {
    // A summary is a label. Never let it fail a save.
    return empty;
  }
}
