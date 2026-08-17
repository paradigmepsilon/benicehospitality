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
    <div className="overflow-x-auto border border-light-gray rounded-lg bg-white">
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
