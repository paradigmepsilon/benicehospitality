"use client";

import {
  MONTHS,
  MONTH_NAMES,
  PNL_GROUPS,
} from "@/lib/resources/co-living-profit-calculator/config";
import {
  cell,
  baselineOf,
  rawMonthValue,
  type PnlState,
} from "@/lib/resources/co-living-profit-calculator/model";
import { GroupCard, LineField, money } from "./Fields";

// One month, all thirty lines, grouped. The month is the unit: you arrive at
// March, fill in March, see what March did, and move to April.

export default function MonthScreen({
  state,
  month,
  onChange,
  onClear,
  onBack,
  onNext,
}: {
  state: PnlState;
  month: number;
  onChange: (lineId: string, value: string) => void;
  onClear: (lineId: string) => void;
  /** Previous month, or the baseline screen from January. */
  onBack: () => void;
  /** Next month, or the year view from December. */
  onNext: () => void;
}) {
  const sectionTotal = (section: "revenue" | "opex" | "other") =>
    PNL_GROUPS.filter((g) => g.section === section)
      .flatMap((g) => g.lines)
      .reduce((total, l) => total + cell(state, l.id, month).n, 0);

  const revenue = sectionTotal("revenue");
  const opex = sectionTotal("opex");
  const other = sectionTotal("other");
  const noi = revenue - opex;
  const net = noi - other;

  const isLast = month === MONTHS.length - 1;

  return (
    <div>
      <header className="mb-5">
        <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-charcoal/50">
          Month {month + 1} of 12
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-near-black mt-1">
          {MONTH_NAMES[month]}
        </h2>
        <p className="font-sans text-sm text-charcoal/60 mt-1.5">
          Enter what actually happened. Anything you leave blank falls back to
          your baseline month.
        </p>
      </header>

      <div className="space-y-4">
        {PNL_GROUPS.map((group) => {
          const subtotal = group.lines.reduce(
            (total, l) => total + cell(state, l.id, month).n,
            0,
          );
          return (
            <GroupCard
              key={group.id}
              label={group.label}
              hint={group.hint}
              subtotal={subtotal}
              subtotalLabel={group.section === "revenue" ? "Collected" : "Spent"}
            >
              {group.lines.map((line) => (
                <LineField
                  key={line.id}
                  label={line.label}
                  hint={line.hint}
                  value={rawMonthValue(state, line.id, month)}
                  baseline={baselineOf(state, line.id)}
                  onChange={(v) => onChange(line.id, v)}
                  onClearToBaseline={() => onClear(line.id)}
                />
              ))}
            </GroupCard>
          );
        })}
      </div>

      {/* What the month did, before moving on. */}
      <div className="mt-6 border border-light-gray rounded-lg bg-off-white overflow-hidden">
        <dl className="divide-y divide-light-gray/70">
          {[
            { label: "Revenue", value: revenue },
            { label: "Operating expenses", value: -opex },
            { label: "Net operating income", value: noi, rule: true },
            { label: "Other expenses", value: -other },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <dt
                className={`font-sans text-sm ${row.rule ? "font-semibold text-near-black" : "text-charcoal/75"}`}
              >
                {row.label}
              </dt>
              <dd
                className={[
                  "font-sans text-sm tabular-nums",
                  row.rule ? "font-semibold text-near-black" : "text-charcoal/75",
                  row.value < 0 ? "text-terracotta" : "",
                ].join(" ")}
              >
                {money(row.value)}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-near-black">
            <dt className="font-sans text-sm font-semibold uppercase tracking-wide text-warm-gold">
              {MONTH_NAMES[month]} net profit
            </dt>
            <dd
              className={`font-display text-2xl font-semibold tabular-nums ${net < 0 ? "text-terracotta" : "text-white"}`}
            >
              {money(net)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="no-print flex items-center justify-between gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 px-4 border border-light-gray rounded-md bg-white font-sans text-sm font-semibold text-charcoal hover:border-charcoal/40 hover:text-near-black transition-colors"
        >
          ‹ {month === 0 ? "Baseline" : MONTH_NAMES[month - 1]}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="min-h-11 px-5 rounded-md bg-primary-green font-sans text-sm font-semibold text-white hover:bg-primary-green/90 transition-colors"
        >
          {isLast ? "See the year" : `Next: ${MONTH_NAMES[month + 1]}`} ›
        </button>
      </div>
    </div>
  );
}
