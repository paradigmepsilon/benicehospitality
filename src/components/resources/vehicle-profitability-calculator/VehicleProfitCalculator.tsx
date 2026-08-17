"use client";

import { useMemo, useRef } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  CALC_DISCLAIMER,
  DEFAULT_INPUTS,
  EARNINGS_PLANS,
  FORECAST_YEARS,
  VERDICT,
  computeResults,
  planById,
  withDefaults,
  type BucketId,
  type CalcInputs,
} from "@/lib/resources/vehicle-profitability-calculator/config";

const SLUG = "vehicle-profitability-calculator";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
function money2(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}
function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}
function months(n: number | null) {
  if (n === null) return `Not within ${FORECAST_YEARS} years`;
  if (n < 12) return `${n} months`;
  const y = Math.floor(n / 12);
  const m = n % 12;
  return m === 0 ? `${y} year${y > 1 ? "s" : ""}` : `${y} yr ${m} mo`;
}

/** Per-bucket input keys, so the mix rows stay driven by TRIP_BUCKETS. */
const MIX_KEYS: Record<
  BucketId,
  { mix: keyof CalcInputs; tripDays: keyof CalcInputs; discount?: keyof CalcInputs }
> = {
  short: { mix: "mixShortPct", tripDays: "shortTripDays" },
  weekly: { mix: "mixWeeklyPct", tripDays: "weeklyTripDays", discount: "weeklyDiscountPct" },
  monthly: { mix: "mixMonthlyPct", tripDays: "monthlyTripDays", discount: "monthlyDiscountPct" },
  quarterly: {
    mix: "mixQuarterlyPct",
    tripDays: "quarterlyTripDays",
    discount: "quarterlyDiscountPct",
  },
};

const VERDICT_STYLE: Record<string, { bg: string; copy: string }> = {
  PROCEED: {
    bg: "bg-primary-green text-white",
    copy: "This car clears the twenty percent true-net ROI bar. Verify your rate assumption against real local listings, then move.",
  },
  CAUTION: {
    bg: "bg-warm-gold text-near-black",
    copy: "Between fifteen and twenty percent. Workable, but thin. Test what rate or utilization gets you to twenty percent before you commit.",
  },
  PASS: {
    bg: "bg-terracotta text-white",
    copy: "Below fifteen percent true-net ROI. Walk away. The used market is full of cars; the discipline to pass is the whole method.",
  },
};

export default function VehicleProfitCalculator({ canSync = false }: {
  /** access.canSync from getResourceAccess — see other tools for why this is
   *  not simply `loggedIn` (admin preview must not write to the admin's row). */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<CalcInputs>(
    SLUG,
    DEFAULT_INPUTS,
    { sync: canSync },
  );

  // Saved analyses predate the trip-mix and forecast fields, so read through
  // the defaults rather than off the raw hydrated blob.
  const s = useMemo(() => withDefaults(state), [state]);
  const r = useMemo(() => computeResults(s), [s]);
  const plan = planById(s.planId);
  const mixOff = Math.abs(r.mixSum - 100) > 0.5;
  const f = r.forecast;
  const resultsRef = useRef<HTMLDivElement>(null);

  function set<K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) {
    setState((p) => ({ ...withDefaults(p), [k]: v }));
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["INPUTS"],
      ["Purchase price", s.price],
      ["Cash invested", s.cashInvested],
      ["Loan APR %", s.apr || "0"],
      ["Loan term (months)", s.termMonths || "0"],
      ["Average daily rate", s.adr],
      ["Utilization %", s.utilizationPct],
      ["Earnings plan", plan.label],
      ["Cleaning per trip", s.cleaningPerTrip],
      ["Insurance monthly", s.insuranceMonthly || "0"],
      ["Parking monthly", s.parkingMonthly || "0"],
      ["Maintenance reserve % of gross", s.maintenancePct],
      ["Depreciation % per year (declining balance)", s.depreciationPct],
      ["Other monthly", s.otherMonthly || "0"],
      ["Annual rate change %", s.annualRateChangePct || "0"],
      [],
      ["TRIP MIX AND EXTENDED-TRIP DISCOUNTS"],
      ["Trip length", "Day range", "% of booked days", "Avg trip (days)", "Discount %", "Effective rate", "Booked days / mo", "Trips / mo", "Revenue / mo"],
      ...r.buckets.map((b) => [
        b.bucket.label,
        b.bucket.dayRange,
        (b.share * 100).toFixed(1),
        b.avgTripDays,
        b.discountPct,
        b.effectiveAdr.toFixed(2),
        b.bookedDays.toFixed(1),
        b.trips.toFixed(2),
        Math.round(b.revenue),
      ]),
      ["Blended effective daily rate", r.effectiveAdr.toFixed(2)],
      ["Booked days per month", r.bookedDaysMonthly.toFixed(1)],
      ["Turnovers per month", r.tripsPerMonth.toFixed(2)],
      ["Discount cost (host share) per month", Math.round(r.discountCostMonthly)],
      ["Turnover savings per month", Math.round(r.turnoverSavingsMonthly)],
      [],
      ["MONTHLY MATH"],
      ["Gross revenue", Math.round(r.grossMonthly)],
      ["Host share", Math.round(r.hostShareMonthly)],
      ["Loan payment", Math.round(r.loanPayment)],
      ["Cleaning", Math.round(r.cleaningMonthly)],
      ["Maintenance reserve", Math.round(r.maintenanceMonthly)],
      ["Insurance + parking + other", Math.round(r.fixedMonthly)],
      ["Depreciation (economic cost)", Math.round(r.depreciationMonthly)],
      ["Cash net per month", Math.round(r.cashNetMonthly)],
      ["True net per month (after depreciation)", Math.round(r.trueNetMonthly)],
      [],
      ["VERDICT"],
      ["Annual true net", Math.round(r.trueNetAnnual)],
      ["Cash-on-cash ROI (true net)", r.roi === null ? "-" : pct(r.roi)],
      ["Damage responsibility per claim", r.damageResponsibility],
      ["Verdict", r.verdict ?? "-"],
      [],
      [`${FORECAST_YEARS}-YEAR FORECAST`],
      ["", ...f.years.map((y) => `Year ${y.year}`)],
      ["Gross revenue", ...f.years.map((y) => Math.round(y.gross))],
      ["Host share", ...f.years.map((y) => Math.round(y.hostShare))],
      ["Cleaning", ...f.years.map((y) => Math.round(y.cleaning))],
      ["Maintenance reserve", ...f.years.map((y) => Math.round(y.maintenance))],
      ["Insurance + parking + other", ...f.years.map((y) => Math.round(y.fixed))],
      ["Loan payments", ...f.years.map((y) => Math.round(y.loan))],
      ["Cash net", ...f.years.map((y) => Math.round(y.cashNet))],
      ["Depreciation", ...f.years.map((y) => Math.round(y.depreciation))],
      ["True net", ...f.years.map((y) => Math.round(y.trueNet))],
      ["Cumulative cash net", ...f.years.map((y) => Math.round(y.cumulativeCashNet))],
      ["Car value at year end", ...f.years.map((y) => Math.round(y.vehicleValueEnd))],
      ["Loan balance at year end", ...f.years.map((y) => Math.round(y.loanBalanceEnd))],
      ["Equity", ...f.years.map((y) => Math.round(y.equityEnd))],
      ["Position (cash + equity - cash invested)", ...f.years.map((y) => Math.round(y.positionEnd))],
      [],
      [`${FORECAST_YEARS}-year cash generated`, Math.round(f.totalCashNet)],
      [`${FORECAST_YEARS}-year true net`, Math.round(f.totalTrueNet)],
      [`Equity at year ${FORECAST_YEARS}`, Math.round(f.endEquity)],
      [`${FORECAST_YEARS}-year total return`, Math.round(f.totalReturn)],
      ["Average annual return on cash", f.avgAnnualReturn === null ? "-" : pct(f.avgAnnualReturn)],
      ["Cash payback", months(f.paybackMonths)],
      [],
      [CALC_DISCLAIMER],
    ];
    downloadCsv("vehicle-profitability-analysis.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        // Live signal without breaking the top-down flow: the whole chip jumps
        // to the verdict, so a returning member does not scroll past four
        // sections of their own inputs to find their number.
        <a
          href="#verdict"
          onClick={(e) => {
            // A same-hash anchor click is a no-op once the URL already carries
            // the hash, and this chip gets clicked repeatedly while a member
            // tunes inputs. Drive the scroll directly so it works every time.
            e.preventDefault();
            resultsRef.current?.scrollIntoView({ block: "start" });
          }}
          className="no-print inline-flex items-center gap-2.5 rounded-md border border-light-gray bg-white px-3 py-1.5 font-sans text-sm hover:border-primary-green transition-colors"
        >
          <span className="text-charcoal/60">True net / mo</span>
          <span className={`font-semibold tabular-nums ${r.trueNetMonthly < 0 ? "text-terracotta" : "text-near-black"}`}>
            {money(r.trueNetMonthly)}
          </span>
          {r.verdict && (
            <span
              className={[
                "rounded px-1.5 py-0.5 font-semibold text-[10px] tracking-[0.12em] uppercase",
                VERDICT_STYLE[r.verdict].bg,
              ].join(" ")}
            >
              {r.verdict}
            </span>
          )}
          <span aria-hidden className="text-charcoal/40">↓</span>
        </a>
      }
    >
      {/* ── ACT ONE: the inputs, worked top to bottom ─────────────────────── */}
      <div className="space-y-5">
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <InputSection step="01" title="The car" blurb="What it costs you to get the keys.">
            <Field label="Purchase price" prefix="$" value={s.price} onChange={(v) => set("price", v)} hint="All-in: price plus tax and fees. Cash car? Same number." />
            <Field label="Cash invested" prefix="$" value={s.cashInvested} onChange={(v) => set("cashInvested", v)} hint="Down payment, or the full price if you pay cash." />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Loan APR" suffix="%" value={s.apr} onChange={(v) => set("apr", v)} hint="Blank if cash." />
              <Field label="Term (months)" value={s.termMonths} onChange={(v) => set("termMonths", v)} hint="Blank if cash." />
            </div>
          </InputSection>

          <InputSection step="02" title="The market" blurb="What the car earns, and what Turo keeps.">
            <Field label="Average daily rate" prefix="$" value={s.adr} onChange={(v) => set("adr", v)} hint="Your base rate before any extended-trip discount. From Turo's Carculator plus comparable local listings. Be conservative." />
            <RangeField
              label="Utilization"
              value={s.utilizationPct}
              onChange={(v) => set("utilizationPct", v)}
              hint={`${s.utilizationPct || 0}% of days booked ≈ ${Math.round((parseFloat(s.utilizationPct) || 0) * 0.304)} booked days a month`}
            />
            <div>
              <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
                Earnings plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EARNINGS_PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set("planId", p.id)}
                    className={[
                      "rounded-lg border-2 px-2 py-2.5 text-center transition-colors",
                      s.planId === p.id
                        ? "border-primary-green bg-primary-green/10"
                        : "border-light-gray bg-white hover:border-charcoal/30",
                    ].join(" ")}
                  >
                    <span className="block font-display text-xl font-semibold text-near-black">
                      {Math.round(p.share * 100)}%
                    </span>
                    <span className="block font-sans text-[10px] text-charcoal/60 leading-tight mt-0.5">
                      {money(p.damageResponsibility)} / claim
                    </span>
                  </button>
                ))}
              </div>
              <p className="font-sans text-[11px] text-charcoal/50 mt-1.5">
                Your share of trip price vs. your damage responsibility per
                claim. In variable-share pilot markets, advance bookings can pay
                more — this uses the standard share.
              </p>
            </div>
          </InputSection>

        </div>

        <InputSection
          step="03"
          title="Trip mix & extended-trip discounts"
          blurb="Split your booked days by trip length, then set the discount each length actually earns. Longer trips bring in less per day and cost you fewer turnovers. This is where you find out which side wins."
        >
            <div className="grid md:grid-cols-2 gap-2.5">
              {r.buckets.map((b) => {
                const keys = MIX_KEYS[b.bucket.id];
                return (
                  <div
                    key={b.bucket.id}
                    className={[
                      "rounded-lg border p-3",
                      b.share > 0
                        ? "border-light-gray bg-off-white"
                        : "border-light-gray/60 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <span className="font-sans text-sm font-semibold text-near-black">
                          {b.bucket.label}
                        </span>
                        <span className="font-sans text-[11px] text-charcoal/50 ml-1.5">
                          {b.bucket.dayRange}
                        </span>
                      </div>
                      <span className="font-sans text-sm font-semibold tabular-nums text-near-black shrink-0">
                        {money2(b.effectiveAdr)}
                        <span className="font-normal text-charcoal/50">/day</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <SmallField
                        label="% of days"
                        value={s[keys.mix] as string}
                        onChange={(v) => set(keys.mix, v)}
                      />
                      <SmallField
                        label="Avg trip"
                        suffix="d"
                        value={s[keys.tripDays] as string}
                        onChange={(v) => set(keys.tripDays, v)}
                      />
                      {keys.discount ? (
                        <SmallField
                          label="Discount"
                          suffix="%"
                          value={s[keys.discount] as string}
                          onChange={(v) => set(keys.discount!, v)}
                        />
                      ) : (
                        <div className="flex items-end pb-2">
                          <span className="font-sans text-[11px] text-charcoal/40">
                            Base rate
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-sans text-[10px] text-charcoal/45 mt-1.5 leading-tight">
                      {b.bucket.hint}
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              className={[
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2",
                mixOff ? "bg-terracotta/10" : "bg-white border border-light-gray",
              ].join(" ")}
            >
              <span className="font-sans text-[11px] text-charcoal/70">
                {mixOff
                  ? `Mix adds to ${r.mixSum.toFixed(0)}%. Numbers below are scaled to 100%.`
                  : "Mix adds to 100%."}
              </span>
              <span className="font-sans text-xs font-semibold tabular-nums text-near-black shrink-0">
                ≈ {r.tripsPerMonth.toFixed(1)} turnovers / mo
              </span>
            </div>

            <p className="font-sans text-[11px] text-charcoal/50 leading-relaxed">
              Turo&apos;s recommended monthly discount is 45%, cut from the old
              60 to 70% range. The weekly and 90-day figures here are starting
              points, not Turo numbers. Turo also applies its own baseline
              minimums on longer bookings and changes them often, so read the
              current tiers in your host dashboard and set these to match.
            </p>
        </InputSection>

        <InputSection
          step="04"
          title="Operating costs"
          blurb="Everything that leaves your account, plus the one cost that never sends a bill."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Cleaning per trip" prefix="$" value={s.cleaningPerTrip} onChange={(v) => set("cleaningPerTrip", v)} hint={`× ${r.tripsPerMonth.toFixed(1)} turnovers from your trip mix.`} />
            <Field label="Off-trip insurance / mo" prefix="$" value={s.insuranceMonthly} onChange={(v) => set("insuranceMonthly", v)} hint="Most personal policies exclude car sharing." />
            <Field label="Parking / mo" prefix="$" value={s.parkingMonthly} onChange={(v) => set("parkingMonthly", v)} />
            <Field label="Other / mo" prefix="$" value={s.otherMonthly} onChange={(v) => set("otherMonthly", v)} hint="Tolls, apps, registration averaged monthly." />
            <Field label="Maintenance reserve" suffix="% of gross" value={s.maintenancePct} onChange={(v) => set("maintenancePct", v)} hint="Tires, brakes, surprises. 8% default." />
            <Field label="Depreciation" suffix="% / yr" value={s.depreciationPct} onChange={(v) => set("depreciationPct", v)} hint="The silent cost. 15% of the car's remaining value each year." />
          </div>
        </InputSection>
      </div>

      {/* ── ACT TWO: the math, once the inputs above are set ──────────────── */}
      <div id="verdict" ref={resultsRef} className="scroll-mt-24 mt-10 space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-charcoal/50 shrink-0">
            Now the math
          </span>
          <span className="h-px flex-1 bg-light-gray" />
        </div>

        {/* Verdict banner */}
        <div
          className={[
            "rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6",
            r.verdict ? VERDICT_STYLE[r.verdict].bg : "bg-near-black text-white",
          ].join(" ")}
        >
          <div className="shrink-0">
            <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
              The verdict
            </p>
            <p className="font-display text-4xl font-semibold leading-none mt-1">
              {r.verdict ?? "—"}
            </p>
          </div>
          <div className="flex-1">
            <p className="font-sans text-sm leading-relaxed">
              {r.verdict
                ? VERDICT_STYLE[r.verdict].copy
                : "Enter a daily rate and your cash invested to get a verdict. PROCEED at twenty percent true-net ROI or better, CAUTION at fifteen to twenty, PASS below fifteen."}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
              True-net ROI
            </p>
            <p className="font-display text-3xl font-semibold leading-none mt-1">
              {r.roi === null ? "—" : pct(r.roi)}
            </p>
          </div>
        </div>

        {r.verdict !== "PROCEED" && r.breakEvenAdrForProceed !== null && r.breakEvenAdrForProceed > 0 && (
          <div className="bg-cream border border-warm-gold/40 rounded-lg p-4">
            <p className="font-sans text-sm text-near-black">
              <span className="font-semibold">What would make this work:</span>{" "}
              at your current utilization and costs, this car needs about{" "}
              <span className="font-semibold">{money(r.breakEvenAdrForProceed)}/day</span>{" "}
              to clear the {Math.round(VERDICT.proceedAt * 100)}% bar. If your
              market won&apos;t pay that, change the car, not the assumption.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4 items-start">
          <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-off-white border-b border-light-gray">
              <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                The monthly waterfall
              </p>
            </div>
            <dl className="divide-y divide-light-gray/70">
              <Row
                label="Gross revenue"
                value={r.grossMonthly}
                hint={`${r.bookedDaysMonthly.toFixed(1)} booked days at a blended ${money2(r.effectiveAdr)}/day. The number the income screenshots quote.`}
              />
              <Row label={`Host share (${Math.round(plan.share * 100)}%)`} value={r.hostShareMonthly} />
              <Row label="Loan payment" value={-r.loanPayment} />
              <Row label="Cleaning" value={-r.cleaningMonthly} hint={`${r.tripsPerMonth.toFixed(1)} turnovers a month.`} />
              <Row label="Maintenance reserve" value={-r.maintenanceMonthly} />
              <Row label="Insurance + parking + other" value={-r.fixedMonthly} />
              <Row label="Cash net" value={r.cashNetMonthly} strong hint="What actually hits your bank each month." />
              <Row label="Depreciation" value={-r.depreciationMonthly} hint="Not a bill — but it is real, and it shows up the day you sell." />
              <Row label="True net" value={r.trueNetMonthly} strong hint="Judge the deal on this number, nothing else." />
            </dl>
          </div>

          {/* The month, read sideways: what the mix and the plan cost you. */}
          <div className="space-y-4">
            {r.discountCostMonthly > 0 && (
              <div className="bg-white border border-light-gray rounded-lg p-4">
                <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70 mb-2">
                  What the discounts are buying
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-xl font-semibold text-terracotta">
                      -{money(r.discountCostMonthly)}
                    </p>
                    <p className="font-sans text-[11px] text-charcoal/60 leading-tight mt-0.5">
                      Host share given up
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold text-primary-green">
                      +{money(r.turnoverSavingsMonthly)}
                    </p>
                    <p className="font-sans text-[11px] text-charcoal/60 leading-tight mt-0.5">
                      Cleaning avoided
                    </p>
                  </div>
                  <div>
                    <p
                      className={`font-display text-xl font-semibold ${
                        r.turnoverSavingsMonthly - r.discountCostMonthly < 0
                          ? "text-terracotta"
                          : "text-primary-green"
                      }`}
                    >
                      {money(r.turnoverSavingsMonthly - r.discountCostMonthly)}
                    </p>
                    <p className="font-sans text-[11px] text-charcoal/60 leading-tight mt-0.5">
                      Net, per month
                    </p>
                  </div>
                </div>
                <p className="font-sans text-[11px] text-charcoal/50 mt-3 leading-relaxed">
                  A discount is justified by what the longer trip saves you.
                  This counts the cleaning you skip, not the hours you get back
                  or the vacancy risk you avoid, so judge a small negative on
                  the calendar you would honestly fill instead.
                </p>
              </div>
            )}

            <StatTile label="Annual true net" value={money(r.trueNetAnnual)} negative={r.trueNetAnnual < 0} sub="True net per month, twelve times over." />
            <StatTile label="Damage responsibility" value={money(r.damageResponsibility)} sub="Keep this liquid per car, or the plan is wrong." />
          </div>
        </div>

        {/* Three-year forecast, with its headline numbers alongside so the
            table does not have to stretch across the full width to fill it. */}
        <div className="grid lg:grid-cols-[1.65fr_1fr] gap-4 items-start">
          <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-off-white border-b border-light-gray flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                The {FORECAST_YEARS}-year forecast
              </p>
              <label className="flex items-center gap-2 shrink-0">
                <span className="font-sans text-[11px] text-charcoal/60">
                  Rate change / yr
                </span>
                <span className="flex items-center gap-1 border border-light-gray rounded-md bg-white px-2 py-1 focus-within:ring-1 focus-within:ring-primary-green/50 focus-within:border-primary-green/50">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.annualRateChangePct}
                    onChange={(e) => set("annualRateChangePct", e.target.value)}
                    placeholder="0"
                    aria-label="Annual rate change percent"
                    className="w-12 bg-transparent font-sans text-sm tabular-nums text-near-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="font-sans text-[11px] text-charcoal/50">%</span>
                </span>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-88 border-collapse">
                <thead>
                  <tr className="border-b border-light-gray">
                    <th className="text-left font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/60 px-3 py-2">
                      Per year
                    </th>
                    {f.years.map((y) => (
                      <th
                        key={y.year}
                        className="text-right font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/60 px-3 py-2"
                      >
                        Yr {y.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <ForecastRow label="Gross revenue" values={f.years.map((y) => y.gross)} />
                  <ForecastRow label="Host share" values={f.years.map((y) => y.hostShare)} />
                  <ForecastRow
                    label="Operating costs"
                    values={f.years.map((y) => -(y.cleaning + y.maintenance + y.fixed))}
                  />
                  <ForecastRow label="Loan payments" values={f.years.map((y) => -y.loan)} />
                  <ForecastRow label="Cash net" values={f.years.map((y) => y.cashNet)} strong />
                  <ForecastRow label="Depreciation" values={f.years.map((y) => -y.depreciation)} />
                  <ForecastRow label="True net" values={f.years.map((y) => y.trueNet)} strong />
                  <ForecastRow
                    label="Cumulative cash"
                    values={f.years.map((y) => y.cumulativeCashNet)}
                  />
                  <ForecastRow
                    label="Car value, year end"
                    values={f.years.map((y) => y.vehicleValueEnd)}
                  />
                  <ForecastRow label="Equity" values={f.years.map((y) => y.equityEnd)} />
                  <ForecastRow
                    label="Position vs. cash in"
                    values={f.years.map((y) => y.positionEnd)}
                    strong
                  />
                </tbody>
              </table>
            </div>
            <p className="font-sans text-[11px] text-charcoal/50 px-4 py-3 border-t border-light-gray leading-relaxed">
              Depreciation is declining-balance: {s.depreciationPct || 0}% of
              what the car is still worth each year, not of the sticker price.
              Position is your cumulative cash plus the equity in the car, less
              the cash you put in. It is what you would walk away with if you
              sold at the end of that year. On a financed car, loan principal
              leaves your cash and comes back as equity, so position can read
              positive while true net is negative. The verdict above is still
              the buy decision. Rate change is what your daily rate does each
              year as the car ages and supply shifts; in a crowded segment, a
              negative number is the honest input.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3">
            <StatTile
              label={`${FORECAST_YEARS}-year cash generated`}
              value={money(f.totalCashNet)}
              negative={f.totalCashNet < 0}
              sub="Cash net, banked across three years."
            />
            <StatTile
              label={`${FORECAST_YEARS}-year total return`}
              value={money(f.totalReturn)}
              negative={f.totalReturn < 0}
              sub={
                f.avgAnnualReturn === null
                  ? "Enter cash invested for a return figure."
                  : `${pct(f.avgAnnualReturn)} a year on your cash, on average.`
              }
            />
            <StatTile
              label="Cash payback"
              value={months(f.paybackMonths)}
              sub={`Cumulative cash net repays the ${money(parseFloat(s.cashInvested) || 0)} you put in.`}
            />
          </div>
        </div>

        <p className="font-sans text-[11px] leading-relaxed text-charcoal/50">
          {CALC_DISCLAIMER}
        </p>
      </div>
    </ResourceToolShell>
  );
}

/**
 * One numbered step of the input pass. The numerals are not decoration: this
 * tool reads top to bottom now, and each block depends on the one above it —
 * the car sets the financing, the market sets the rate the mix discounts, and
 * the mix sets the turnover count the costs multiply.
 */
function InputSection({
  step,
  title,
  blurb,
  children,
}: {
  step?: string;
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-light-gray rounded-lg p-4 sm:p-5 space-y-3 h-full">
      <div className="flex items-baseline gap-3">
        {step && (
          <span className="font-display text-lg font-semibold text-warm-gold leading-none shrink-0 tabular-nums">
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
            {title}
          </h3>
          {blurb && (
            <p className="font-sans text-[12px] text-charcoal/60 leading-relaxed mt-1">
              {blurb}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-1.5 border border-light-gray rounded-lg bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-primary-green/50 focus-within:border-primary-green/50">
        {prefix && <span className="font-sans text-sm text-charcoal/50">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          aria-label={label}
          className="w-full bg-transparent font-sans text-sm text-near-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="font-sans text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>}
      </div>
      {hint && <p className="font-sans text-[11px] text-charcoal/50 mt-1">{hint}</p>}
    </div>
  );
}

/** Compact numeric input for the trip-mix grid: three fit across on mobile. */
function SmallField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-charcoal/55 block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1 border border-light-gray rounded-md bg-white px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary-green/50 focus-within:border-primary-green/50">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          aria-label={label}
          className="w-full min-w-0 bg-transparent font-sans text-sm tabular-nums text-near-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="font-sans text-[11px] text-charcoal/50 shrink-0">{suffix}</span>
        )}
      </div>
    </div>
  );
}

/** One metric across the forecast years. */
function ForecastRow({
  label,
  values,
  strong,
}: {
  label: string;
  values: number[];
  strong?: boolean;
}) {
  return (
    <tr className={`border-b border-light-gray/70 last:border-0 ${strong ? "bg-warm-gold/10" : ""}`}>
      <th
        scope="row"
        className={`text-left font-sans text-[12px] font-normal px-3 py-2 ${
          strong ? "font-semibold text-near-black" : "text-charcoal/80"
        }`}
      >
        {label}
      </th>
      {values.map((v, i) => (
        <td
          key={i}
          className={[
            "text-right font-sans text-[12px] tabular-nums px-3 py-2 whitespace-nowrap",
            strong ? "font-bold" : "font-medium",
            v < 0 ? "text-terracotta" : "text-near-black",
          ].join(" ")}
        >
          {money(v)}
        </td>
      ))}
    </tr>
  );
}

function RangeField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
        {label}
      </label>
      <input
        type="range"
        min={20}
        max={90}
        step={5}
        value={parseFloat(value) || 55}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full accent-[#5b9a2f]"
      />
      {hint && <p className="font-sans text-[11px] text-charcoal/50 mt-1">{hint}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  hint,
}: {
  label: string;
  value: number;
  strong?: boolean;
  hint?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 px-4 py-2.5 ${strong ? "bg-warm-gold/10" : ""}`}>
      <dt>
        <span className={`font-sans text-sm ${strong ? "font-semibold text-near-black" : "text-charcoal/80"}`}>
          {label}
        </span>
        {hint && (
          <span className="block font-sans text-[11px] text-charcoal/45 leading-tight">
            {hint}
          </span>
        )}
      </dt>
      <dd
        className={[
          "font-sans text-sm tabular-nums",
          strong ? "font-bold" : "font-medium",
          value < 0 ? "text-terracotta" : "text-near-black",
        ].join(" ")}
      >
        {money(value)}
      </dd>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  negative?: boolean;
}) {
  return (
    <div className="bg-near-black rounded-lg p-4">
      <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-warm-gold mb-1">
        {label}
      </p>
      <p className={`font-display text-2xl font-semibold ${negative ? "text-terracotta" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="font-sans text-[11px] text-white/60 mt-1 leading-tight">{sub}</p>}
    </div>
  );
}
