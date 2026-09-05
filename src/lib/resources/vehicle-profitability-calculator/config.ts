// Vehicle Profitability Calculator — the CRR flagship fleet tool and the
// public lead magnet (/turo-calculator redirects here).
//
// Since 2026-09-04 it runs the same car THREE WAYS, the central exercise of
// The Inside Lane (Chapter 7): as a marketplace listing, as a weekly rental to
// a gig driver, and as a direct daily rental through the operator's own
// channels. All three compute from one shared car; the selected channel
// drives the headline verdict and the three-year forecast, and the
// side-by-side table shows the other two.
//
// Every Turo platform figure traces to the Car Rental Riches fact base
// (verified 2026-08-15 against turo.com): three US earnings plans for trips
// booked on/after Jan 7, 2026, with "damage responsibility" per claim. When
// Turo changes plans again, THIS file is the single place the numbers live.
// The weekly and direct defaults are the book's round planning figures, not
// market data, and every one of them is an editable input.

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

// ── Channels ───────────────────────────────────────────────────────────────

export type ChannelId = "marketplace" | "weekly" | "direct";

export interface Channel {
  id: ChannelId;
  label: string;
  short: string;
  /** What the channel takes off the top, in the operator's words. */
  channelCostLabel: string;
  /** Unit the rate is quoted in. */
  rateUnit: "day" | "week";
  /** What a bad day costs you on this channel. */
  exposure: string;
  hint: string;
}

export const CHANNELS: Channel[] = [
  {
    id: "marketplace",
    label: "Marketplace listing",
    short: "Marketplace",
    channelCostLabel: "Platform share",
    rateUnit: "day",
    exposure: "Damage responsibility per claim",
    hint: "Turo brings the renters, the trust rails, and the liability plan, and keeps a fifth or so of the gross for it.",
  },
  {
    id: "weekly",
    label: "Weekly gig rental",
    short: "Weekly",
    channelCostLabel: "Card processing",
    rateUnit: "week",
    exposure: "Your commercial deductible",
    hint: "Rented by the week to a rideshare or delivery driver. One turnover per week, real insurance, high mileage.",
  },
  {
    id: "direct",
    label: "Direct daily rental",
    short: "Direct",
    channelCostLabel: "Processing + marketing",
    rateUnit: "day",
    exposure: "Your commercial deductible",
    hint: "Your own booking page, Google Business Profile, and word of mouth. Thin at one car, strongest at scale.",
  },
];

export function channelById(id: string): Channel {
  return CHANNELS.find((c) => c.id === id) ?? CHANNELS[0];
}

// ── Extended-trip discounts (marketplace only) ─────────────────────────────
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
// rate a host lands on for true long-stay bookings (monthly renters,
// relocations, corporate placements booked through the marketplace),
// modelled separately here because its economics, near-zero turnovers and
// heavy mileage, are nothing like a 30-day trip's.

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
    hint: "Long-stay rate: monthly renters, relocations, corporate placements booked on the platform.",
  },
];

export interface CalcInputs {
  /** All inputs kept as strings: they are text-field values. */
  price: string;
  cashInvested: string;
  apr: string;
  termMonths: string;
  /** Which channel's math the verdict and forecast show. */
  channel: ChannelId;

  // ── Marketplace ──
  adr: string;
  /** Utilization as a whole percentage, e.g. "55". */
  utilizationPct: string;
  planId: EarningsPlan["id"];
  /** Off-trip insurance, marketplace column. Zero is a decision, not a default. */
  insuranceMonthly: string;

  // ── Weekly gig rental ──
  weeklyRate: string;
  weeksRentedPerYear: string;
  /** Card processing on the weekly payment, whole percent. */
  weeklyProcessingPct: string;
  /** Commercial or rideshare-rental insurance allocated to this car. */
  weeklyInsuranceMonthly: string;
  /** Higher than the marketplace reserve: a working driver adds real miles. */
  weeklyMaintenancePct: string;
  /** Higher than the marketplace rate for the same reason. */
  weeklyDepreciationPct: string;

  // ── Direct daily rental ──
  directDailyRate: string;
  /** Rented days a month through your own channels. */
  directRentedDays: string;
  /** Representative rental length, in days. Drives the turnover count. */
  directAvgRentalDays: string;
  directProcessingPct: string;
  /** Booking software, the occasional ad, a Google Business Profile. */
  directMarketingMonthly: string;
  directInsuranceMonthly: string;
  /** Damage waiver, fuel, delivery, late fees: per rented day, on average. */
  directAncillaryPerDay: string;

  // ── Shared operating costs ──
  cleaningPerTrip: string;
  parkingMonthly: string;
  /** Maintenance reserve as % of gross, marketplace and direct, e.g. "8". */
  maintenancePct: string;
  /** Declining-balance depreciation, % of remaining value per year, e.g. "15". */
  depreciationPct: string;
  otherMonthly: string;

  // ── Marketplace trip mix ──
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
  /** Year-over-year change in the base rate, e.g. "-3". May be negative. */
  annualRateChangePct: string;
}

export const DEFAULT_INPUTS: CalcInputs = {
  price: "15000",
  cashInvested: "15000",
  apr: "",
  termMonths: "",
  channel: "marketplace",

  adr: "45",
  utilizationPct: "55",
  planId: "balanced",
  insuranceMonthly: "",

  // The book's hypothetical weekly column: $250 a week, 46 rented weeks, a
  // $200 insurance placeholder that a real quote must replace.
  weeklyRate: "250",
  weeksRentedPerYear: "46",
  weeklyProcessingPct: "3",
  weeklyInsuranceMonthly: "200",
  weeklyMaintenancePct: "10",
  weeklyDepreciationPct: "20",

  // The book's direct column: thin demand at one car, real insurance, a
  // small marketing line, and an ancillary menu the operator has to build.
  directDailyRate: "45",
  directRentedDays: "15",
  directAvgRentalDays: "4",
  directProcessingPct: "3",
  directMarketingMonthly: "50",
  directInsuranceMonthly: "200",
  directAncillaryPerDay: "0",

  cleaningPerTrip: "20",
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
 * Saved states predate the discount, forecast, and channel fields, so a
 * hydrated blob can be missing keys. Merge over the defaults before reading
 * anything: without this, an old saved analysis computes a zero mix and
 * reports no revenue, or has no channel and cannot render.
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

/** One channel's month, in the same shape for all three so they line up. */
export interface ChannelResult {
  channel: Channel;
  grossMonthly: number;
  /** Platform share, or processing plus marketing. Positive number. */
  channelCostMonthly: number;
  /** Gross less channel cost: the money that reaches your account. */
  netRevenueMonthly: number;
  insuranceMonthly: number;
  cleaningMonthly: number;
  maintenanceMonthly: number;
  /** Insurance + parking + other, the lines the forecast carries as fixed. */
  fixedMonthly: number;
  depreciationMonthly: number;
  loanPayment: number;
  cashNetMonthly: number;
  trueNetMonthly: number;
  trueNetAnnual: number;
  /** Null when cash invested is 0 (ROI undefined). */
  roi: number | null;
  verdict: "PROCEED" | "CAUTION" | "PASS" | null;
  turnoversMonthly: number;
  /** Rented or booked days a month. */
  rentedDaysMonthly: number;
  /** Rate actually earned per rented unit (day or week) after discounts. */
  effectiveRate: number;
  /** Rate needed for a 20% ROI at the current inputs; null if unreachable. */
  breakEvenRateForProceed: number | null;
  /** Dollar figure behind `channel.exposure`, when there is one. */
  exposureAmount: number | null;
  /** The fraction of gross that survives the channel's percentage cost. */
  channelKeepRate: number;
  /** Channel costs that do not scale with gross (marketing). */
  channelFixedMonthly: number;
  maintRate: number;
  depRate: number;
}

export interface ForecastYear {
  year: number;
  gross: number;
  /** Gross less channel cost. */
  netRevenue: number;
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
  /** The selected channel. */
  channel: Channel;
  /** All three channels, in CHANNELS order, for the side-by-side table. */
  channels: ChannelResult[];
  /** The selected channel's result, also spread below for the headline UI. */
  active: ChannelResult;
  grossMonthly: number;
  channelCostMonthly: number;
  netRevenueMonthly: number;
  loanPayment: number;
  cleaningMonthly: number;
  maintenanceMonthly: number;
  fixedMonthly: number;
  depreciationMonthly: number;
  cashNetMonthly: number;
  trueNetMonthly: number;
  trueNetAnnual: number;
  roi: number | null;
  damageResponsibility: number;
  verdict: "PROCEED" | "CAUTION" | "PASS" | null;
  breakEvenRateForProceed: number | null;
  // Marketplace trip mix (always computed; only shown on that channel)
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

/** Like num(), but keeps the sign: rates can drift down as a car ages. */
function signedNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function pctRate(v: string, cap = 100): number {
  return Math.min(num(v), cap) / 100;
}

/** Standard amortized payment; simple division when APR is 0. */
export function loanPaymentMonthly(principal: number, aprPct: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

function verdictFor(roi: number | null, hasRate: boolean): ChannelResult["verdict"] {
  if (roi === null || !hasRate) return null;
  return roi >= VERDICT.proceedAt ? "PROCEED" : roi >= VERDICT.cautionAt ? "CAUTION" : "PASS";
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

/**
 * The waterfall every channel shares once its gross, channel cost, insurance,
 * turnovers, maintenance rate, and depreciation rate are known. Keeping it in
 * one function is what guarantees the three columns are comparable.
 */
function finishChannel(a: {
  channel: Channel;
  grossMonthly: number;
  channelKeepRate: number;
  channelFixedMonthly: number;
  insuranceMonthly: number;
  turnoversMonthly: number;
  rentedDaysMonthly: number;
  effectiveRate: number;
  /** Gross per unit of rate: booked days (discount-weighted) or weeks/month. */
  grossPerRate: number;
  /** Gross that does not move with the rate (ancillaries). */
  grossFixed: number;
  maintRate: number;
  depRate: number;
  exposureAmount: number | null;
  hasRate: boolean;
  shared: {
    price: number;
    cash: number;
    loanPayment: number;
    cleaningPerTrip: number;
    parkingMonthly: number;
    otherMonthly: number;
  };
}): ChannelResult {
  const s = a.shared;
  const channelCostMonthly =
    a.grossMonthly * (1 - a.channelKeepRate) + a.channelFixedMonthly;
  const netRevenueMonthly = a.grossMonthly - channelCostMonthly;
  const cleaningMonthly = s.cleaningPerTrip * a.turnoversMonthly;
  const maintenanceMonthly = a.grossMonthly * a.maintRate;
  const fixedMonthly = a.insuranceMonthly + s.parkingMonthly + s.otherMonthly;
  const depreciationMonthly = (s.price * a.depRate) / 12;

  const cashNetMonthly =
    netRevenueMonthly - s.loanPayment - cleaningMonthly - maintenanceMonthly - fixedMonthly;
  const trueNetMonthly = cashNetMonthly - depreciationMonthly;
  const trueNetAnnual = trueNetMonthly * 12;
  const roi = s.cash > 0 ? trueNetAnnual / s.cash : null;

  // Solve for the rate that hits the PROCEED threshold. Gross is linear in
  // the rate on every channel (the mix and its discounts only change the
  // coefficient), so one division does it.
  let breakEvenRateForProceed: number | null = null;
  const perRate = a.grossPerRate * (a.channelKeepRate - a.maintRate);
  if (s.cash > 0 && perRate > 0) {
    const targetMonthly = (VERDICT.proceedAt * s.cash) / 12;
    const costs =
      s.loanPayment + cleaningMonthly + fixedMonthly + depreciationMonthly + a.channelFixedMonthly;
    const fixedContribution = a.grossFixed * (a.channelKeepRate - a.maintRate);
    breakEvenRateForProceed = (targetMonthly + costs - fixedContribution) / perRate;
  }

  return {
    channel: a.channel,
    grossMonthly: a.grossMonthly,
    channelCostMonthly,
    netRevenueMonthly,
    insuranceMonthly: a.insuranceMonthly,
    cleaningMonthly,
    maintenanceMonthly,
    fixedMonthly,
    depreciationMonthly,
    loanPayment: s.loanPayment,
    cashNetMonthly,
    trueNetMonthly,
    trueNetAnnual,
    roi,
    verdict: verdictFor(roi, a.hasRate),
    turnoversMonthly: a.turnoversMonthly,
    rentedDaysMonthly: a.rentedDaysMonthly,
    effectiveRate: a.effectiveRate,
    breakEvenRateForProceed,
    exposureAmount: a.exposureAmount,
    channelKeepRate: a.channelKeepRate,
    channelFixedMonthly: a.channelFixedMonthly,
    maintRate: a.maintRate,
    depRate: a.depRate,
  };
}

export function computeResults(inputs: CalcInputs): CalcResults {
  const price = num(inputs.price);
  const cash = num(inputs.cashInvested);
  const plan = planById(inputs.planId);
  const util = Math.min(num(inputs.utilizationPct), 100) / 100;
  const adr = num(inputs.adr);
  const maintRate = pctRate(inputs.maintenancePct);
  const depRate = pctRate(inputs.depreciationPct);
  const cleaningPerTrip = num(inputs.cleaningPerTrip);

  const financed = Math.max(price - cash, 0);
  const aprPct = num(inputs.apr);
  const termMonths = num(inputs.termMonths);
  const loanPayment = loanPaymentMonthly(financed, aprPct, termMonths);
  const shared = {
    price,
    cash,
    loanPayment,
    cleaningPerTrip,
    parkingMonthly: num(inputs.parkingMonthly),
    otherMonthly: num(inputs.otherMonthly),
  };

  // ── Marketplace: trip mix and extended-trip discounts ───────────────────
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

  const mpGross = buckets.reduce((t, b) => t + b.revenue, 0);
  const tripsPerMonth = buckets.reduce((t, b) => t + b.trips, 0);
  const effectiveAdr = bookedDaysMonthly > 0 ? mpGross / bookedDaysMonthly : 0;

  // What the discounts cost, and what the longer trips save, in the same
  // units: the comparison Module 5.2 says has to decide the slider.
  const fullRateGross = adr * bookedDaysMonthly;
  const discountCostMonthly = (fullRateGross - mpGross) * plan.share;
  const shortTripDays = num(inputs.shortTripDays);
  const tripsIfAllShort = shortTripDays > 0 ? bookedDaysMonthly / shortTripDays : tripsPerMonth;
  const turnoverSavingsMonthly = Math.max(tripsIfAllShort - tripsPerMonth, 0) * cleaningPerTrip;

  const marketplace = finishChannel({
    channel: channelById("marketplace"),
    grossMonthly: mpGross,
    channelKeepRate: plan.share,
    channelFixedMonthly: 0,
    insuranceMonthly: num(inputs.insuranceMonthly),
    turnoversMonthly: tripsPerMonth,
    rentedDaysMonthly: bookedDaysMonthly,
    effectiveRate: effectiveAdr,
    grossPerRate: buckets.reduce((t, b) => t + b.bookedDays * (1 - b.discountPct / 100), 0),
    grossFixed: 0,
    maintRate,
    depRate,
    exposureAmount: plan.damageResponsibility,
    hasRate: adr > 0,
    shared,
  });

  // ── Weekly gig rental ───────────────────────────────────────────────────
  const weeklyRate = num(inputs.weeklyRate);
  const weeksPerYear = Math.min(num(inputs.weeksRentedPerYear), 52);
  const weeksPerMonth = weeksPerYear / 12;
  const weekly = finishChannel({
    channel: channelById("weekly"),
    grossMonthly: weeklyRate * weeksPerMonth,
    channelKeepRate: 1 - pctRate(inputs.weeklyProcessingPct),
    channelFixedMonthly: 0,
    insuranceMonthly: num(inputs.weeklyInsuranceMonthly),
    // One turnover per rented week: the structural reason this column wins
    // on hours.
    turnoversMonthly: weeksPerMonth,
    rentedDaysMonthly: weeksPerMonth * 7,
    effectiveRate: weeklyRate,
    grossPerRate: weeksPerMonth,
    grossFixed: 0,
    maintRate: pctRate(inputs.weeklyMaintenancePct),
    depRate: pctRate(inputs.weeklyDepreciationPct),
    exposureAmount: null,
    hasRate: weeklyRate > 0,
    shared,
  });

  // ── Direct daily rental ─────────────────────────────────────────────────
  const directRate = num(inputs.directDailyRate);
  const directDays = Math.min(num(inputs.directRentedDays), 31);
  const directLen = num(inputs.directAvgRentalDays);
  const ancillary = num(inputs.directAncillaryPerDay) * directDays;
  const direct = finishChannel({
    channel: channelById("direct"),
    grossMonthly: directRate * directDays + ancillary,
    channelKeepRate: 1 - pctRate(inputs.directProcessingPct),
    channelFixedMonthly: num(inputs.directMarketingMonthly),
    insuranceMonthly: num(inputs.directInsuranceMonthly),
    turnoversMonthly: directLen > 0 ? directDays / directLen : 0,
    rentedDaysMonthly: directDays,
    effectiveRate: directDays > 0 ? (directRate * directDays + ancillary) / directDays : 0,
    grossPerRate: directDays,
    grossFixed: ancillary,
    maintRate,
    depRate,
    exposureAmount: null,
    hasRate: directRate > 0,
    shared,
  });

  const channels = [marketplace, weekly, direct];
  const channel = channelById(inputs.channel);
  const active = channels.find((c) => c.channel.id === channel.id) ?? marketplace;

  const forecast = buildForecast({
    price,
    cash,
    depRate: active.depRate,
    maintRate: active.maintRate,
    keepRate: active.channelKeepRate,
    channelFixedMonthly: active.channelFixedMonthly,
    grossMonthly: active.grossMonthly,
    cleaningMonthly: active.cleaningMonthly,
    fixedMonthly: active.fixedMonthly,
    financed,
    aprPct,
    termMonths,
    loanPayment,
    rateGrowth: signedNum(inputs.annualRateChangePct) / 100,
  });

  return {
    channel,
    channels,
    active,
    grossMonthly: active.grossMonthly,
    channelCostMonthly: active.channelCostMonthly,
    netRevenueMonthly: active.netRevenueMonthly,
    loanPayment,
    cleaningMonthly: active.cleaningMonthly,
    maintenanceMonthly: active.maintenanceMonthly,
    fixedMonthly: active.fixedMonthly,
    depreciationMonthly: active.depreciationMonthly,
    cashNetMonthly: active.cashNetMonthly,
    trueNetMonthly: active.trueNetMonthly,
    trueNetAnnual: active.trueNetAnnual,
    roi: active.roi,
    damageResponsibility: plan.damageResponsibility,
    verdict: active.verdict,
    breakEvenRateForProceed: active.breakEvenRateForProceed,
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
 * Depreciation is declining-balance: each year loses dep% of the value still
 * left, matching the Depreciation & Exit Analyzer. Year one is identical to
 * straight-line on the purchase price, so the headline verdict above does not
 * move; years two and three stop overstating the loss on a car that is already
 * worth less.
 */
function buildForecast(a: {
  price: number;
  cash: number;
  depRate: number;
  maintRate: number;
  /** Fraction of gross left after the channel's percentage cost. */
  keepRate: number;
  /** Channel cost that does not scale with gross (marketing), per month. */
  channelFixedMonthly: number;
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
    const netRevenue = gross * a.keepRate - a.channelFixedMonthly * 12;
    const maintenance = gross * a.maintRate;
    const cleaning = a.cleaningMonthly * 12;
    const fixed = a.fixedMonthly * 12;

    const valueStart = a.price * Math.pow(1 - a.depRate, year - 1);
    const valueEnd = a.price * Math.pow(1 - a.depRate, year);
    const depreciation = valueStart - valueEnd;

    let loanPaidThisYear = 0;
    const monthlyOperating = (netRevenue - maintenance - cleaning - fixed) / 12;

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

    const cashNet = netRevenue - loanPaidThisYear - cleaning - maintenance - fixed;
    const trueNet = cashNet - depreciation;
    const equityEnd = valueEnd - balance;

    years.push({
      year,
      gross,
      netRevenue,
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
  "Estimates for education only, not financial, tax, or insurance advice. Turo plan figures verified August 2026; Turo changes terms, so confirm current numbers in your host dashboard. Weekly and direct figures are planning placeholders until you replace them with real quotes, especially insurance. Car Rental Riches is an independent educational product, not affiliated with Turo Inc.";
