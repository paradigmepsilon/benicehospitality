"use client";

import { Fragment, type ReactNode } from "react";
import {
  MONTHS,
  MONTH_NAMES,
  PNL_GROUPS,
  type PnlSectionId,
} from "@/lib/resources/co-living-profit-calculator/config";
import {
  cell,
  rawMonthValue,
  type PnlState,
  type YearCalc,
} from "@/lib/resources/co-living-profit-calculator/model";
import { compact } from "./Fields";

// The whole year at once: the original spreadsheet, kept for scanning and
// spot-editing rather than as the way in. Baseline-derived cells are washed and
// italic so a glance separates what was recorded from what was assumed.
//
// `readOnly` renders spans instead of inputs. That is what the print copy uses
// — a printout is a document, and 360 empty-looking input boxes is not one.

export default function YearGrid({
  state,
  calc,
  onChange,
  onJumpToMonth,
  readOnly = false,
}: {
  state: PnlState;
  calc: YearCalc;
  onChange?: (lineId: string, month: number, value: string) => void;
  onJumpToMonth?: (month: number) => void;
  readOnly?: boolean;
}) {
  const sections: { id: PnlSectionId; totals: number[]; annual: number; label: string }[] = [
    { id: "revenue", totals: calc.revenue, annual: calc.annual.revenue, label: "Total Revenue" },
    { id: "opex", totals: calc.opex, annual: calc.annual.opex, label: "Total Operating Expenses" },
    { id: "other", totals: calc.other, annual: calc.annual.other, label: "Total Other Expenses" },
  ];

  return (
    <>
      {/* Fourteen columns is 1168px of table. There is no honest way to fold a
          twelve-month P&L onto a 375px screen, and a sideways-dragging grid is
          not one either — so below lg the year becomes a month list showing
          what you actually come to Year view to find (which month went wrong),
          with a tap through to that month's own screen for the line detail.
          The real grid returns at lg, and prints at every size: the print
          stylesheet forces tables to the page width. */}
      <div className="lg:hidden no-print">
        <MonthSummaryList calc={calc} onJumpToMonth={onJumpToMonth} />
      </div>

      <div className="hidden lg:block print:block overflow-x-auto border border-light-gray rounded-lg bg-white">
        <table className="min-w-[900px] w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="bg-off-white">
            <th className="sticky left-0 z-20 bg-off-white text-left font-sans text-xs font-semibold text-charcoal/70 px-3 py-2.5 min-w-[13rem] border-b border-r border-light-gray">
              Line
            </th>
            {MONTHS.map((mo, m) => (
              <th
                key={mo}
                scope="col"
                className="font-sans text-xs font-semibold text-charcoal/70 px-2 py-2.5 text-right min-w-[4.5rem] border-b border-light-gray"
              >
                {onJumpToMonth && !readOnly ? (
                  <button
                    type="button"
                    onClick={() => onJumpToMonth(m)}
                    title={`Open ${MONTH_NAMES[m]}`}
                    className="no-print w-full text-right hover:text-primary-green transition-colors"
                  >
                    {mo}
                  </button>
                ) : (
                  mo
                )}
              </th>
            ))}
            <th
              scope="col"
              className="font-sans text-xs font-semibold text-near-black px-3 py-2.5 text-right min-w-[6rem] border-b border-light-gray bg-warm-gold/10"
            >
              Annual
            </th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              state={state}
              calc={calc}
              onChange={onChange}
              readOnly={readOnly}
            >
              {section.id === "opex" && (
                <TotalRow
                  label="Net Operating Income (NOI)"
                  month={calc.noi}
                  annual={calc.annual.noi}
                  emphasis
                />
              )}
              {section.id === "other" && (
                <TotalRow
                  label="Net Profit"
                  month={calc.net}
                  annual={calc.annual.net}
                  emphasis
                  strong
                />
              )}
            </SectionBlock>
          ))}
        </tbody>
        </table>
      </div>
    </>
  );
}

/**
 * The year on a phone. One row per month: the net you made, with revenue and
 * expenses underneath, and a tap through to that month's screen. Every figure
 * here is a total the grid already computes, so the two views can never
 * disagree.
 */
function MonthSummaryList({
  calc,
  onJumpToMonth,
}: {
  calc: YearCalc;
  onJumpToMonth?: (month: number) => void;
}) {
  const a = calc.annual;
  const rows = MONTHS.map((_, m) => ({
    month: m,
    revenue: calc.revenue[m],
    expenses: calc.opex[m] + calc.other[m],
    net: calc.net[m],
  }));

  return (
    <div className="border border-light-gray rounded-lg bg-white overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-3 py-2.5 bg-off-white border-b border-light-gray">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/70">
          Month by month
        </p>
        <p className="font-sans text-[11px] text-charcoal/55">
          Tap to open a month
        </p>
      </div>

      <ul>
        {rows.map((r) => (
          <li key={r.month} className="border-b border-light-gray/70 last:border-b-0">
            <button
              type="button"
              onClick={() => onJumpToMonth?.(r.month)}
              disabled={!onJumpToMonth}
              className="w-full min-h-11 text-left px-3 py-2.5 hover:bg-off-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-inset transition-colors disabled:hover:bg-transparent"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-sans text-sm font-semibold text-near-black">
                  {MONTH_NAMES[r.month]}
                </span>
                <span
                  className={`font-sans text-sm font-semibold tabular-nums ${
                    r.net < 0 ? "text-terracotta" : "text-near-black"
                  }`}
                >
                  {compact(r.net)}
                  <span className="font-normal text-charcoal/50"> net</span>
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-0.5 font-sans text-[11px] text-charcoal/55 tabular-nums">
                <span>Revenue {compact(r.revenue)}</span>
                <span>Expenses {compact(r.expenses)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="px-3 py-3 bg-warm-gold/10 border-t border-light-gray">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-sans text-sm font-semibold text-near-black">
            Annual
          </span>
          <span
            className={`font-display text-lg font-semibold tabular-nums ${
              a.net < 0 ? "text-terracotta" : "text-near-black"
            }`}
          >
            {compact(a.net)}
            <span className="font-sans text-[11px] font-normal text-charcoal/55">
              {" "}
              net
            </span>
          </span>
        </div>
        <div className="flex items-baseline gap-3 mt-0.5 font-sans text-[11px] text-charcoal/60 tabular-nums">
          <span>Revenue {compact(a.revenue)}</span>
          <span>Expenses {compact(a.opex + a.other)}</span>
          <span>NOI {compact(a.noi)}</span>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  state,
  calc,
  onChange,
  readOnly,
  children,
}: {
  section: { id: PnlSectionId; totals: number[]; annual: number; label: string };
  state: PnlState;
  calc: YearCalc;
  onChange?: (lineId: string, month: number, value: string) => void;
  readOnly: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      {PNL_GROUPS.filter((g) => g.section === section.id).map((group) => (
        <Fragment key={group.id}>
          <tr>
            <td className="sticky left-0 z-10 bg-cream/60 font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/70 px-3 py-1.5 border-y border-r border-light-gray whitespace-nowrap">
              {group.label}
            </td>
            <td colSpan={13} className="bg-cream/60 border-y border-light-gray" />
          </tr>
          {group.lines.map((line) => (
            <tr key={line.id} className="hover:bg-off-white/60">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white text-left font-normal px-3 py-1.5 border-b border-r border-light-gray/70"
              >
                <span className="font-sans text-sm text-near-black">{line.label}</span>
                {line.hint && (
                  <span className="block font-sans text-[11px] text-charcoal/45 leading-tight">
                    {line.hint}
                  </span>
                )}
              </th>
              {MONTHS.map((_, m) => {
                const c = cell(state, line.id, m);
                return (
                  <td key={m} className="px-1 py-1 border-b border-light-gray/70">
                    {readOnly ? (
                      <span
                        className={[
                          "block text-right px-1.5 py-1 font-sans text-sm tabular-nums",
                          c.fromBaseline ? "text-charcoal/45 italic" : "text-near-black",
                        ].join(" ")}
                      >
                        {c.n === 0 && !c.entered ? "" : compact(c.n)}
                      </span>
                    ) : (
                      <input
                        type="number"
                        inputMode="decimal"
                        value={rawMonthValue(state, line.id, m)}
                        onChange={(e) => onChange?.(line.id, m, e.target.value)}
                        placeholder={
                          c.baseline !== null ? compact(c.baseline) : "0"
                        }
                        aria-label={`${line.label}, ${MONTH_NAMES[m]}`}
                        className={[
                          "w-full text-right bg-transparent px-1.5 py-1 text-sm text-near-black rounded tabular-nums",
                          "focus:outline-none focus:bg-primary-green/5 focus:ring-1 focus:ring-primary-green/40",
                          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                          c.fromBaseline ? "bg-cream/50" : "",
                        ].join(" ")}
                      />
                    )}
                  </td>
                );
              })}
              <td className="px-3 py-1.5 text-right font-sans text-sm text-charcoal/80 border-b border-light-gray/70 bg-warm-gold/5 tabular-nums">
                {compact(calc.lineAnnual(line.id))}
              </td>
            </tr>
          ))}
        </Fragment>
      ))}
      <TotalRow label={section.label} month={section.totals} annual={section.annual} />
      {children}
    </>
  );
}

function TotalRow({
  label,
  month,
  annual,
  emphasis,
  strong,
}: {
  label: string;
  month: number[];
  annual: number;
  emphasis?: boolean;
  strong?: boolean;
}) {
  return (
    <tr className={emphasis ? "bg-near-black/[0.04]" : "bg-off-white/70"}>
      <th
        scope="row"
        className={[
          "sticky left-0 z-10 px-3 py-2 border-b border-r border-light-gray font-sans text-sm text-left",
          emphasis ? "bg-[#efece5]" : "bg-off-white",
          strong ? "font-bold" : "font-semibold",
          strong && annual < 0 ? "text-terracotta" : "text-near-black",
        ].join(" ")}
      >
        {label}
      </th>
      {month.map((v, m) => (
        <td
          key={m}
          className={[
            "px-2 py-2 text-right border-b border-light-gray font-sans text-sm tabular-nums",
            strong ? "font-bold" : "font-medium",
            v < 0 ? "text-terracotta" : "text-charcoal/80",
          ].join(" ")}
        >
          {compact(v)}
        </td>
      ))}
      <td
        className={[
          "px-3 py-2 text-right border-b border-light-gray font-sans text-sm tabular-nums bg-warm-gold/10",
          strong ? "font-bold" : "font-semibold",
          annual < 0 ? "text-terracotta" : "text-near-black",
        ].join(" ")}
      >
        {compact(annual)}
      </td>
    </tr>
  );
}
