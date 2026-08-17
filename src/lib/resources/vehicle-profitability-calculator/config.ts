// Vehicle Profitability Calculator — the CRR flagship fleet tool and the
// public Turo lead magnet (/turo-calculator redirects here).
//
// Every Turo platform figure traces to the Car Rental Riches fact base
// (verified 2026-08-15 against turo.com): three US earnings plans for trips
// booked on/after Jan 7, 2026, with "damage responsibility" per claim. When
// Turo changes plans again, THIS file is the single place the numbers live.

export interface EarningsPlan {
  id: "peace" | "balanced" | "earnings";
  label: string;
  /** Host share of trip price in standard (non-pilot) markets. */
  share: number;
  /** Damage responsibility per claim, all claim types. */
  damageResponsibility: number;
}

export const EARNINGS_PLANS: EarningsPlan[] = [
  { id: "peace", label: "More peace of mind (70%)", share: 0.7, damageResponsibility: 250 },
  { id: "balanced", label: "Balanced (80%)", share: 0.8, damageResponsibility: 1500 },
  { id: "earnings", label: "More earnings (90%)", share: 0.9, damageResponsibility: 2750 },
];

export function planById(id: string): EarningsPlan {
  return EARNINGS_PLANS.find((p) => p.id === id) ?? EARNINGS_PLANS[1];
}

/** Average days per month, matching the course spreadsheets. */
export const DAYS_PER_MONTH = 30.4;

/** Verdict thresholds on true-net (after depreciation) cash-on-cash ROI. */
export const VERDICT = {
  proceedAt: 0.2,
  cautionAt: 0.15,
} as const;

/** Years projected by the forecast table. */
export const FORECAST_YEARS = 3;

// ── Extended-trip discounts ────────────────────────────────────────────────
//
// Turo exposes weekly and monthly discount sliders in host pricing settings,
// and since the 2026 changes it also applies baseline minimum discounts to
// longer bookings. VERIFIED in the CRR fact base: Turo cut its RECOMMENDED
// monthly discount from the old 60-70% range to 45%, and dropped trip fees on
// monthly bookings in most markets (March 2025). NOT verified, and therefore
// not asserted anywhere in this tool: the exact day boundaries of Turo's own
// tiers, the mandatory minimums rolled out August 13 2026, and any recommended
// weekly number. Those move by market and by month, so every figure below is
// an editable starting point the host confirms in their own dashboard.
//
// The 90+ day tier is not a separate Turo slider. It is the deeper effective
// rate a host lands on for true long-stay bookings (gig drivers, insurance
// replacements, corporate placements), modelled separately here because its
// economics — near-zero turnovers, heavy mileage — are nothing like a 30-day
// trip's.

export type BucketId = "short" | "weekly" | "monthly" | "quarterly";

export interface TripBucket {
  id: BucketId;
  label: string;
  /** Trip lengths this bucket represents. Descriptive, not a Turo rule. */
  dayRange: string;
  /** Can this bucket carry a discount? Short trips pay the base rate. */
  discountable: boolean;
  hint: string;
}

export const TRIP_BUCKETS: TripBucket[] = [
  {
    id: "short",
    label: "Short trips",
    dayRange: "1 to 6 days",
    discountable: false,
    hint: "Base rate. Every turnover, every cleaning, every handoff.",
  },
  {
    id: "weekly",
    label: "Weekly",
    dayRange: "7 to 29 days",
    discountable: true,
    hint: "Your weekly discount setting.",
  },
  {
    id: "monthly",
    label: "Monthly",
    dayRange: "30 to 89 days",
    discountable: true,
    hint: "Your monthly discount setting. Turo now recommends 45%, down from 60-70%.",
  },
  {
    id: "quarterly",
    label: "Three months plus",
    dayRange: "90+ days",
    discountable: true,
    hint: "Long-stay rate: gig drivers, insurance replacements, corporate placements.",
  },
];

export interface CalcInputs {
  /** All inputs kept as strings — they are text-field values. */
  price: string;
  cashInvested: string;
  apr: string;
  termMonths: string;
  adr: string;
  /** Utilization as a whole percentage, e.g. "55". */
  utilizationPct: string;
  planId: EarningsPlan["id"];
  cleaningPerTrip: string;
  insuranceMonthly: string;
  parkingMonthly: string;
  /** Maintenance reserve as % of gross, e.g. "8". */
  maintenancePct: string;
  /** Declining-balance depreciation, % of remaining value per year, e.g. "15". */
  depreciationPct: string;
  otherMonthly: string;
  /**
   * Share of BOOKED DAYS falling in each trip-length bucket, as whole
   * percentages. Normalized at compute time, so a mix that does not add to 100
   * still produces sane math while the UI flags it.
   */
  mixShortPct: string;
  mixWeeklyPct: string;
  mixMonthlyPct: string;
  mixQuarterlyPct: string;
  /** Discount off the base daily rate, as whole percentages. */
  weeklyDiscountPct: string;
  monthlyDiscountPct: string;
  quarterlyDiscountPct: string;
  /** Representative trip length per bucket, in days. Drives turnover count. */
  shortTripDays: string;
  weeklyTripDays: string;
  monthlyTripDays: string;
  quarterlyTripDays: string;
  /** Year-over-year change in the base daily rate, e.g. "-3". May be negative. */
  annualRateChangePct: string;
}

export const DEFAULT_INPUTS: CalcInputs = {
  price: "15000",
  cashInvested: "15000",
  apr: "",
  termMonths: "",
  adr: "45",
  utilizationPct: "55",
  planId: "balanced",
  cleaningPerTrip: "20",
  insuranceMonthly: "",
  parkingMonthly: "",
  maintenancePct: "8",
  depreciationPct: "15",
  otherMonthly: "",
  // Starts as an all-short-trip calendar so the discount question is one the
  // host answers deliberately, rather than one this tool answers for them.
  mixShortPct: "100",
  mixWeeklyPct: "0",
  mixMonthlyPct: "0",
  mixQuarterlyPct: "0",
  weeklyDiscountPct: "15",
  monthlyDiscountPct: "45",
  quarterlyDiscountPct: "50",
  shortTripDays: "4",
  weeklyTripDays: "10",
  monthlyTripDays: "35",
  quarterlyTripDays: "100",
  annualRateChangePct: "0",
};

/**
 * Saved states predate the discount and forecast fields, so a hydrated blob can
 * be missing keys. Merge over the defaults before reading anything: without
 * this, an old saved analysis computes a zero mix and reports no revenue.
 */
export function withDefaults(saved: Partial<CalcInputs> | null | undefined): CalcInputs {
  return { ...DEFAULT_INPUTS, ...(saved ?? {}) };
}

export interface BucketResult {
  bucket: TripBucket;
  /** Normalized share of booked days, 0 to 1. */
  share: number;
  bookedDays: number;
  discountPct: number;
  effectiveAdr: number;
  revenue: number;
  trips: number;
  avgTripDays: number;
}

export interface ForecastYear {
  year: number;
  gross: number;
  hostShare: number;
  loan: number;
  cleaning: number;
  maintenance: number;
  fixed: number;
  cashNet: number;
  depreciation: number;
  trueNet: number;
  cumulativeCashNet: number;
  vehicleValueEnd: number;
  loanBalanceEnd: number;
  /** Vehicle value less what is still owed. */
  equityEnd: number;
  /** Cumulative cash + equity - cash invested: the sell-today position. */
  positionEnd: number;
  /** True-net return on the original cash for this year alone. */
  roi: number | null;
}

export interface ForecastResults {
  years: ForecastYear[];
  totalCashNet: number;
  totalTrueNet: number;
  endValue: number;
  endLoanBalance: number;
  endEquity: number;
  /** Total 3-year return: cumulative cash + ending equity - cash invested. */
  totalReturn: number;
  /** totalReturn / cash invested / years. Null when no cash invested. */
  avgAnnualReturn: number | null;
  /** Months until cumulative cash net repays the cash invested, within window. */
  paybackMonths: number | null;
}

export interface CalcResults {
  grossMonthly: number;
  hostShareMonthly: number;
  loanPayment: number;
  cleaningMonthly: number;
  maintenanceMonthly: number;
  fixedMonthly: number;
  depreciationMonthly: number;
  cashNetMonthly: number;
  trueNetMonthly: number;
  trueNetAnnual: number;
  /** Null when cash invested is 0 (ROI undefined). */
  roi: number | null;
  damageResponsibility: number;
  verdict: "PROCEED" | "CAUTION" | "PASS" | null;
  /** ADR needed for a 20% ROI at the current utilization; null if unreachable inputs. */
  breakEvenAdrForProceed: number | null;
  // Trip mix
  buckets: BucketResult[];
  bookedDaysMonthly: number;
  tripsPerMonth: number;
  /** Blended rate actually earned per booked day, after discounts. */
  effectiveAdr: number;
  /** Raw sum of the entered mix percentages, for the "adds to 100?" warning. */
  mixSum: number;
  /** Host-share revenue given up to the discounts each month. */
  discountCostMonthly: number;
  /** Cleaning avoided by the longer trips in the mix, versus an all-short calendar. */
  turnoverSavingsMonthly: number;
  forecast: ForecastResults;
}

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Like num(), but keeps the sign — rates can drift down as a car ages. */
function signedNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/** Standard amortized payment; simple division when APR is 0. */
export function loanPaymentMonthly(principal: number, aprPct: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

/** Per-bucket mix %, discount %, and representative trip length, in one place. */
function readMix(inputs: CalcInputs) {
  const raw: Record<BucketId, { mix: number; discount: number; tripDays: number }> = {
    short: {
      mix: num(inputs.mixShortPct),
      discount: 0,
      tripDays: num(inputs.shortTripDays),
    },
    weekly: {
      mix: num(inputs.mixWeeklyPct),
      discount: Math.min(num(inputs.weeklyDiscountPct), 100),
      tripDays: num(inputs.weeklyTripDays),
    },
    monthly: {
      mix: num(inputs.mixMonthlyPct),
      discount: Math.min(num(inputs.monthlyDiscountPct), 100),
      tripDays: num(inputs.monthlyTripDays),
    },
    quarterly: {
      mix: num(inputs.mixQuarterlyPct),
      discount: Math.min(num(inputs.quarterlyDiscountPct), 100),
      tripDays: num(inputs.quarterlyTripDays),
    },
  };
  return raw;
}

export function computeResults(inputs: CalcInputs): CalcResults {
  const price = num(inputs.price);
  const cash = num(inputs.cashInvested);
  const plan = planById(inputs.planId);
  const util = Math.min(num(inputs.utilizationPct), 100) / 100;
  const adr = num(inputs.adr);
  const maintRate = num(inputs.maintenancePct) / 100;
  const depRate = Math.min(num(inputs.depreciationPct), 100) / 100;
  const cleaningPerTrip = num(inputs.cleaningPerTrip);

  // ── Trip mix and extended-trip discounts ────────────────────────────────
  const mix = readMix(inputs);
  const mixSum = TRIP_BUCKETS.reduce((t, b) => t + mix[b.id].mix, 0);
  const bookedDaysMonthly = util * DAYS_PER_MONTH;

  const buckets: BucketResult[] = TRIP_BUCKETS.map((bucket) => {
    const row = mix[bucket.id];
    // An empty or zeroed mix falls back to an all-short calendar, which is
    // what this tool did before trip mix existed.
    const share =
      mixSum > 0 ? row.mix / mixSum : bucket.id === "short" ? 1 : 0;
    const discountPct = bucket.discountable ? row.discount : 0;
    const effectiveAdr = adr * (1 - discountPct / 100);
    const bookedDays = bookedDaysMonthly * share;
    return {
      bucket,
      share,
      bookedDays,
      discountPct,
      effectiveAdr,
      revenue: bookedDays * effectiveAdr,
      trips: row.tripDays > 0 ? bookedDays / row.tripDays : 0,
      avgTripDays: row.tripDays,
    };
  });

  const grossMonthly = buckets.reduce((t, b) => t + b.revenue, 0);
  const tripsPerMonth = buckets.reduce((t, b) => t + b.trips, 0);
  const effectiveAdr = bookedDaysMonthly > 0 ? grossMonthly / bookedDaysMonthly : 0;

  // What the discounts cost, and what the longer trips save, in the same
  // units — the comparison Module 5.2 says has to decide the slider.
  const fullRateGross = adr * bookedDaysMonthly;
  const discountCostMonthly = (fullRateGross - grossMonthly) * plan.share;
  const shortTripDays = num(inputs.shortTripDays);
  const tripsIfAllShort = shortTripDays > 0 ? bookedDaysMonthly / shortTripDays : tripsPerMonth;
  const turnoverSavingsMonthly = Math.max(tripsIfAllShort - tripsPerMonth, 0) * cleaningPerTrip;

  // ── Monthly waterfall ───────────────────────────────────────────────────
  const hostShareMonthly = grossMonthly * plan.share;
  const financed = Math.max(price - cash, 0);
  const aprPct = num(inputs.apr);
  const termMonths = num(inputs.termMonths);
  const loanPayment = loanPaymentMonthly(financed, aprPct, termMonths);
  const cleaningMonthly = cleaningPerTrip * tripsPerMonth;
  const maintenanceMonthly = grossMonthly * maintRate;
  const fixedMonthly =
    num(inputs.insuranceMonthly) + num(inputs.parkingMonthly) + num(inputs.otherMonthly);
  // Year one of the declining-balance schedule the forecast continues.
  const depreciationMonthly = (price * depRate) / 12;

  const cashNetMonthly =
    hostShareMonthly - loanPayment - cleaningMonthly - maintenanceMonthly - fixedMonthly;
  const trueNetMonthly = cashNetMonthly - depreciationMonthly;
  const trueNetAnnual = trueNetMonthly * 12;
  const roi = cash > 0 ? trueNetAnnual / cash : null;

  let verdict: CalcResults["verdict"] = null;
  if (roi !== null && adr > 0) {
    verdict =
      roi >= VERDICT.proceedAt ? "PROCEED" : roi >= VERDICT.cautionAt ? "CAUTION" : "PASS";
  }

  // Solve for the ADR that hits the PROCEED threshold at the current inputs.
  // Gross is linear in the base rate — the mix and its discounts only change
  // the coefficient — so the same one-line solve still works.
  let breakEvenAdrForProceed: number | null = null;
  const daysPerAdr =
    adr > 0
      ? grossMonthly / adr
      : buckets.reduce((t, b) => t + b.bookedDays * (1 - b.discountPct / 100), 0);
  const perAdr = daysPerAdr * (plan.share - maintRate);
  if (cash > 0 && perAdr > 0) {
    const targetMonthly = (VERDICT.proceedAt * cash) / 12;
    const costs = loanPayment + cleaningMonthly + fixedMonthly + depreciationMonthly;
    breakEvenAdrForProceed = (targetMonthly + costs) / perAdr;
  }

  const forecast = buildForecast({
    price,
    cash,
    depRate,
    maintRate,
    share: plan.share,
    grossMonthly,
    cleaningMonthly,
    fixedMonthly,
    financed,
    aprPct,
    termMonths,
    loanPayment,
    rateGrowth: signedNum(inputs.annualRateChangePct) / 100,
  });

  return {
    grossMonthly,
    hostShareMonthly,
    loanPayment,
    cleaningMonthly,
    maintenanceMonthly,
    fixedMonthly,
    depreciationMonthly,
    cashNetMonthly,
    trueNetMonthly,
    trueNetAnnual,
    roi,
    damageResponsibility: plan.damageResponsibility,
    verdict,
    breakEvenAdrForProceed,
    buckets,
    bookedDaysMonthly,
    tripsPerMonth,
    effectiveAdr,
    mixSum,
    discountCostMonthly,
    turnoverSavingsMonthly,
    forecast,
  };
}

/**
 * The three-year picture, walked month by month so the loan amortizes properly
 * and payback lands on a real month rather than a straight-line guess.
 *
 * Depreciation is declining-balance — each year loses dep% of the value still
 * left — matching the Depreciation & Exit Analyzer. Year one is identical to
 * straight-line on the purchase price, so the headline verdict above does not
 * move; years two and three stop overstating the loss on a car that is already
 * worth less.
 */
function buildForecast(a: {
  price: number;
  cash: number;
  depRate: number;
  maintRate: number;
  share: number;
  grossMonthly: number;
  cleaningMonthly: number;
  fixedMonthly: number;
  financed: number;
  aprPct: number;
  termMonths: number;
  loanPayment: number;
  rateGrowth: number;
}): ForecastResults {
  const monthlyRate = a.aprPct / 100 / 12;
  let balance = a.financed;
  let cumulativeCashNet = 0;
  let paybackMonths: number | null = null;

  const years: ForecastYear[] = [];

  for (let year = 1; year <= FORECAST_YEARS; year++) {
    // Rates drift from year two on; year one is always today's numbers.
    const rateFactor = Math.pow(1 + a.rateGrowth, year - 1);
    const gross = a.grossMonthly * 12 * rateFactor;
    const hostShare = gross * a.share;
    const maintenance = gross * a.maintRate;
    const cleaning = a.cleaningMonthly * 12;
    const fixed = a.fixedMonthly * 12;

    const valueStart = a.price * Math.pow(1 - a.depRate, year - 1);
    const valueEnd = a.price * Math.pow(1 - a.depRate, year);
    const depreciation = valueStart - valueEnd;

    let loanPaidThisYear = 0;
    const monthlyOperating = (hostShare - maintenance - cleaning - fixed) / 12;

    for (let m = 1; m <= 12; m++) {
      const monthIndex = (year - 1) * 12 + m;
      let payment = 0;
      if (balance > 0 && a.termMonths > 0 && monthIndex <= a.termMonths) {
        const interest = balance * monthlyRate;
        payment = Math.min(a.loanPayment, balance + interest);
        balance = Math.max(balance + interest - payment, 0);
        loanPaidThisYear += payment;
      }
      cumulativeCashNet += monthlyOperating - payment;
      if (paybackMonths === null && a.cash > 0 && cumulativeCashNet >= a.cash) {
        paybackMonths = monthIndex;
      }
    }

    const cashNet = hostShare - loanPaidThisYear - cleaning - maintenance - fixed;
    const trueNet = cashNet - depreciation;
    const equityEnd = valueEnd - balance;

    years.push({
      year,
      gross,
      hostShare,
      loan: loanPaidThisYear,
      cleaning,
      maintenance,
      fixed,
      cashNet,
      depreciation,
      trueNet,
      cumulativeCashNet,
      vehicleValueEnd: valueEnd,
      loanBalanceEnd: balance,
      equityEnd,
      positionEnd: cumulativeCashNet + equityEnd - a.cash,
      roi: a.cash > 0 ? trueNet / a.cash : null,
    });
  }

  const last = years[years.length - 1];
  const totalCashNet = last.cumulativeCashNet;
  const totalTrueNet = years.reduce((t, y) => t + y.trueNet, 0);
  const totalReturn = totalCashNet + last.equityEnd - a.cash;

  return {
    years,
    totalCashNet,
    totalTrueNet,
    endValue: last.vehicleValueEnd,
    endLoanBalance: last.loanBalanceEnd,
    endEquity: last.equityEnd,
    totalReturn,
    avgAnnualReturn: a.cash > 0 ? totalReturn / a.cash / FORECAST_YEARS : null,
    paybackMonths,
  };
}

export const CALC_DISCLAIMER =
  "Estimates for education only, not financial, tax, or insurance advice. Turo plan figures verified August 2026; Turo changes terms, so confirm current numbers in your host dashboard. Car Rental Riches is an independent educational product, not affiliated with Turo Inc.";
