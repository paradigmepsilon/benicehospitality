"use client";

import { useMemo } from "react";
import Link from "next/link";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";
import {
  DEFAULT_EXIT_INPUTS,
  EXIT_RULE,
  computeExit,
  type ExitInputs,
} from "@/lib/resources/depreciation-exit-analyzer/config";

const SLUG = "depreciation-exit-analyzer";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function DepreciationExitAnalyzer({ canSync = false }: {
  /** access.canSync from getResourceAccess - see the exemplar for why this is
   *  not simply `loggedIn` (admin preview must not write to the admin's row). */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<ExitInputs>(
    SLUG,
    DEFAULT_EXIT_INPUTS,
    { sync: canSync },
  );

  const r = useMemo(() => computeExit(state), [state]);
  const price = parseFloat(state.price) || 0;
  const hasInputs = price > 0 && (parseFloat(state.annualCashNet) || 0) >= 0;
  const failYears = r.rows.filter((row) => !row.holds).length;

  // One scale for the bar chart: the largest magnitude on display.
  const barMax = Math.max(
    price,
    ...r.rows.map((row) => Math.max(row.valueEnd, row.cumulativeCashNet, Math.abs(row.totalPosition))),
    1,
  );

  function set<K extends keyof ExitInputs>(k: K, v: ExitInputs[K]) {
    setState((p) => ({ ...p, [k]: v }));
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["INPUTS"],
      ["Purchase price", state.price],
      ["Depreciation % per year (declining balance)", state.depreciationPct],
      ["Annual cash net (before depreciation)", state.annualCashNet],
      ["Loan balance (today)", state.loanBalance || "0"],
      [],
      [
        "Year",
        "Est. value at year end",
        "Depreciation that year",
        "True net that year (cash net - depreciation)",
        "Cumulative cash net",
        "Total position (value + cash earnings - price)",
        "Verdict",
        ...(state.loanBalance.trim() ? ["Equity after entered loan balance"] : []),
      ],
      ...r.rows.map((row) => [
        row.year,
        Math.round(row.valueEnd),
        Math.round(row.depreciationThisYear),
        Math.round(row.trueNetThisYear),
        Math.round(row.cumulativeCashNet),
        Math.round(row.totalPosition),
        row.holds ? "EARNING ITS KEEP" : "SELL OR REPRICE",
        ...(row.equityAfterLoan !== null ? [Math.round(row.equityAfterLoan)] : []),
      ]),
      [],
      ["EXIT RULE", EXIT_RULE],
      [],
      [CALC_DISCLAIMER],
    ];
    downloadCsv("depreciation-exit-analysis.csv", buildCsv(TOOL_NAME, rows));
  }

  const verdictLabel = !hasInputs
    ? null
    : failYears === 0
      ? "HOLD"
      : r.firstHoldYear === null
        ? "EXIT"
        : `YEAR ${r.firstHoldYear}`;

  const verdictCopy = !hasInputs
    ? "Enter the price and this car's annual cash net to see the five year hold picture. Pull cash net from the Vehicle Profitability Calculator; it is what hits your bank before depreciation."
    : failYears === 0
      ? "Cash net covers the car's depreciation in every modeled year, so true net stays positive the whole hold. Keep it, keep repricing, and re-run this with real numbers each year, because rates soften as cars age."
      : r.firstHoldYear === null
        ? "True net is negative in all five modeled years: cash net never covers the car's depreciation at these numbers. The car costs more to hold than it pays. Sell it, or reprice it until the cash net changes the answer."
        : `Through year ${r.firstHoldYear - 1}, true net runs negative: cash net falls short of the year's depreciation, so you are paying to hold this car. From year ${r.firstHoldYear} the decline slows enough for cash net to cover it. The honest question is whether a car this age still earns today's cash net.`;

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Position @ yr 5</span>
          <span
            className={`font-semibold ${r.rows[4] && r.rows[4].totalPosition < 0 ? "text-terracotta" : "text-near-black"}`}
          >
            {hasInputs && r.rows[4] ? money(r.rows[4].totalPosition) : "-"}
          </span>
        </span>
      }
    >
      {/* Verdict banner */}
      <div
        className={[
          "rounded-lg p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6",
          !hasInputs
            ? "bg-near-black text-white"
            : failYears === 0
              ? "bg-primary-green text-white"
              : r.firstHoldYear === null
                ? "bg-terracotta text-white"
                : "bg-warm-gold text-near-black",
        ].join(" ")}
      >
        <div className="shrink-0">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
            {failYears > 0 && r.firstHoldYear !== null ? "Clears from" : "The exit read"}
          </p>
          <p className="font-display text-4xl font-semibold leading-none mt-1">
            {verdictLabel ?? "?"}
          </p>
        </div>
        <div className="flex-1">
          <p className="font-sans text-sm leading-relaxed">{verdictCopy}</p>
        </div>
        {hasInputs && r.bestExitYear !== null && (
          <div className="shrink-0 text-right">
            <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
              Best position
            </p>
            <p className="font-display text-3xl font-semibold leading-none mt-1">
              Year {r.bestExitYear}
            </p>
          </div>
        )}
      </div>

      {/* min-w-0 on both columns: a grid item defaults to min-width:auto, so
          below lg the single column refused to shrink under the min-content
          width of the stat tiles and the disclaimer, and pushed the whole page
          19px sideways at 768. */}
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6">
        {/* Inputs */}
        <div className="min-w-0 space-y-5">
          <InputSection title="The car">
            <Field label="Purchase price" prefix="$" value={state.price} onChange={(v) => set("price", v)} hint="What you paid, all-in." />
            <Field
              label="Depreciation"
              suffix="% / yr"
              value={state.depreciationPct}
              onChange={(v) => set("depreciationPct", v)}
              hint="Of current value, compounding down each year. 15% default; luxury and EV often higher."
            />
            <Field
              label="Annual cash net (before depreciation)"
              prefix="$"
              value={state.annualCashNet}
              onChange={(v) => set("annualCashNet", v)}
              hint="What hits your bank each year, after every cost except depreciation."
            />
            <p className="font-sans text-[11px] text-charcoal/60 -mt-1">
              Cash net from the{" "}
              <Link
                href="/resources/vehicle-profitability-calculator"
                className="underline text-primary-green hover:text-near-black"
              >
                Vehicle Profitability Calculator
              </Link>
              : what hits your bank before depreciation. Not the true net line;
              this tool subtracts depreciation itself, through the value curve.
            </p>
            <Field
              label="Loan balance today"
              prefix="$"
              value={state.loanBalance}
              onChange={(v) => set("loanBalance", v)}
              hint="Optional. Adds an equity column. It uses this balance for every year, so update it for the year you are testing."
            />
          </InputSection>

          <div className="bg-cream border border-warm-gold/40 rounded-lg p-4">
            <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70 mb-1.5">
              The exit rule
            </p>
            <p className="font-sans text-sm text-near-black leading-relaxed">{EXIT_RULE}</p>
            <p className="font-sans text-[11px] text-charcoal/50 mt-2 leading-relaxed">
              Depreciation here is declining-balance: each year loses your
              percentage of whatever value remains. The model holds cash net
              flat while that decline shrinks, which flatters the later years;
              in reality rates soften as a car ages. Re-run it annually with
              the car&rsquo;s real trailing numbers.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="min-w-0 space-y-4">
          {/* Bars */}
          <div className="bg-white border border-light-gray rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                Value vs. what it has paid you
              </p>
              <div className="flex items-center gap-3 font-sans text-[11px] text-charcoal/60">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-warm-gold inline-block" /> Est. value
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary-green inline-block" /> Cumulative cash net
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {r.rows.map((row) => (
                <div key={row.year}>
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="font-sans text-xs font-semibold text-near-black">
                      Year {row.year}
                    </p>
                    <p
                      className={`font-sans text-xs tabular-nums font-semibold ${row.totalPosition < 0 ? "text-terracotta" : "text-near-black"}`}
                    >
                      Position {hasInputs ? money(row.totalPosition) : "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 rounded-full bg-light-gray overflow-hidden">
                      <div
                        className="h-full rounded-full bg-warm-gold transition-all"
                        style={{ width: `${Math.max((row.valueEnd / barMax) * 100, 0)}%` }}
                      />
                    </div>
                    <div className="h-2.5 rounded-full bg-light-gray overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-green transition-all"
                        style={{ width: `${Math.max((row.cumulativeCashNet / barMax) * 100, 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-off-white border-b border-light-gray">
              <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                The five year hold picture
              </p>
            </div>
            <div className="overflow-x-auto stack-table-wrap">
              {/* Eight columns of money is a spreadsheet, not a phone screen —
                  below 40rem each year becomes its own card. See .stack-table
                  in globals.css. */}
              <table className="w-full font-sans text-sm stack-table">
                <thead>
                  <tr className="border-b border-light-gray text-xs text-charcoal/70">
                    <th className="text-left px-4 py-2 font-semibold">Year</th>
                    <th className="text-right px-4 py-2 font-semibold whitespace-nowrap">Est. value</th>
                    <th className="text-right px-4 py-2 font-semibold whitespace-nowrap">Dep. that year</th>
                    <th className="text-right px-4 py-2 font-semibold whitespace-nowrap">True net that year</th>
                    <th className="text-right px-4 py-2 font-semibold whitespace-nowrap">Cum. cash net</th>
                    <th className="text-right px-4 py-2 font-semibold whitespace-nowrap">Total position</th>
                    {state.loanBalance.trim() !== "" && (
                      <th className="text-right px-4 py-2 font-semibold whitespace-nowrap">Equity after loan</th>
                    )}
                    <th className="text-right px-4 py-2 font-semibold">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/70">
                  {r.rows.map((row) => {
                    const crossover = r.firstHoldYear === row.year && failYears > 0;
                    return (
                      <tr key={row.year} className={crossover ? "bg-warm-gold/15" : ""}>
                        <td
                          data-label=""
                          className="px-4 py-2.5 font-semibold text-near-black whitespace-nowrap"
                        >
                          {row.year}
                          {crossover && (
                            <span className="ml-1.5 font-sans text-[10px] font-semibold tracking-[0.08em] uppercase text-charcoal/60">
                              crossover
                            </span>
                          )}
                        </td>
                        <Num label="Est. value" v={row.valueEnd} show={hasInputs} />
                        <Num label="Dep. that year" v={-row.depreciationThisYear} show={hasInputs} />
                        <Num label="True net that year" v={row.trueNetThisYear} show={hasInputs} />
                        <Num label="Cum. cash net" v={row.cumulativeCashNet} show={hasInputs} />
                        <Num label="Total position" v={row.totalPosition} show={hasInputs} strong />
                        {state.loanBalance.trim() !== "" && (
                          <Num label="Equity after loan" v={row.equityAfterLoan ?? 0} show={hasInputs && row.equityAfterLoan !== null} />
                        )}
                        <td data-label="Verdict" className="px-4 py-2.5 text-right">
                          {hasInputs ? (
                            <span
                              className={[
                                "inline-block rounded px-2 py-0.5 font-sans text-[10px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap",
                                row.holds
                                  ? "bg-primary-green/15 text-primary-green"
                                  : "bg-terracotta/15 text-terracotta",
                              ].join(" ")}
                            >
                              {row.holds ? "Earning its keep" : "Sell or reprice"}
                            </span>
                          ) : (
                            <span className="text-charcoal/40">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label="Value at year 5"
              value={hasInputs ? money(r.rows[4].valueEnd) : "-"}
              sub={`Of ${money(price)} paid. Depreciation is not a bill, but it shows up the day you sell.`}
            />
            <StatTile
              label="Position at year 5"
              value={hasInputs ? money(r.rows[4].totalPosition) : "-"}
              negative={hasInputs && r.rows[4].totalPosition < 0}
              sub="Value plus everything it earned, minus what you paid."
            />
          </div>

          {r.underwaterFromYear !== null && (
            <div className="bg-cream border border-terracotta/40 rounded-lg p-4">
              <p className="font-sans text-sm text-near-black">
                <span className="font-semibold">Loan check:</span> from year{" "}
                {r.underwaterFromYear}, the car&rsquo;s estimated value drops below
                the loan balance you entered. If the payoff really tracks that
                high, selling means writing a check. Watch the payoff against
                this curve, not against the payment.
              </p>
            </div>
          )}

          <p className="font-sans text-[11px] leading-relaxed text-charcoal/50">
            {CALC_DISCLAIMER}
          </p>
        </div>
      </div>
    </ResourceToolShell>
  );
}

function InputSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-light-gray rounded-lg p-4 space-y-3">
      <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
        {title}
      </p>
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

function Num({
  v,
  show,
  strong,
  label,
}: {
  v: number;
  show: boolean;
  strong?: boolean;
  /** Column heading, echoed beside the value in the stacked phone layout. */
  label: string;
}) {
  return (
    <td
      data-label={label}
      className={[
        "px-4 py-2.5 text-right tabular-nums whitespace-nowrap",
        strong ? "font-bold" : "font-medium",
        v < 0 ? "text-terracotta" : "text-near-black",
      ].join(" ")}
    >
      {show ? money(v) : "-"}
    </td>
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
