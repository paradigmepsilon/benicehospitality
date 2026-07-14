"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  MONTHS,
  REVENUE_LINES,
  OPEX_LINES,
  OTHER_LINES,
  PNL_ALL_LINES,
  type PnlLine,
} from "@/lib/resources/co-living-profit-calculator/config";

const SLUG = "co-living-profit-calculator";
const TOOL_NAME = getResourceTool(SLUG)!.name;

type State = Record<string, string>; // key: `${lineId}_${monthIndex}`

function key(lineId: string, m: number) {
  return `${lineId}_${m}`;
}
function num(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
}
function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
function compact(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function ProfitCalculator() {
  const { state, setState, reset } = useResourceTool<State>(SLUG, {});

  const calc = useMemo(() => {
    const lineAnnual = (id: string) =>
      MONTHS.reduce((sum, _, m) => sum + num(state[key(id, m)]), 0);
    const sectionMonth = (lines: PnlLine[], m: number) =>
      lines.reduce((sum, l) => sum + num(state[key(l.id, m)]), 0);
    const sectionAnnual = (lines: PnlLine[]) =>
      lines.reduce((sum, l) => sum + lineAnnual(l.id), 0);

    const revMonth = MONTHS.map((_, m) => sectionMonth(REVENUE_LINES, m));
    const opexMonth = MONTHS.map((_, m) => sectionMonth(OPEX_LINES, m));
    const otherMonth = MONTHS.map((_, m) => sectionMonth(OTHER_LINES, m));
    const noiMonth = MONTHS.map((_, m) => revMonth[m] - opexMonth[m]);
    const netMonth = MONTHS.map((_, m) => noiMonth[m] - otherMonth[m]);

    return {
      lineAnnual,
      revMonth,
      opexMonth,
      otherMonth,
      noiMonth,
      netMonth,
      revAnnual: sectionAnnual(REVENUE_LINES),
      opexAnnual: sectionAnnual(OPEX_LINES),
      otherAnnual: sectionAnnual(OTHER_LINES),
      noiAnnual: revMonth.reduce((s, v, m) => s + v - opexMonth[m], 0),
      netAnnual: netMonth.reduce((s, v) => s + v, 0),
    };
  }, [state]);

  function setCell(lineId: string, m: number, value: string) {
    setState((p) => ({ ...p, [key(lineId, m)]: value }));
  }

  function exportCsv() {
    const header = ["Line", ...MONTHS, "Annual"];
    const rows: (string | number)[][] = [header];
    const lineRow = (l: PnlLine) => [
      l.label,
      ...MONTHS.map((_, m) => num(state[key(l.id, m)])),
      calc.lineAnnual(l.id),
    ];
    const totalRow = (label: string, month: number[], annual: number) => [
      label,
      ...month,
      annual,
    ];

    rows.push(["REVENUE"]);
    REVENUE_LINES.forEach((l) => rows.push(lineRow(l)));
    rows.push(totalRow("Total Revenue", calc.revMonth, calc.revAnnual));
    rows.push(["OPERATING EXPENSES"]);
    OPEX_LINES.forEach((l) => rows.push(lineRow(l)));
    rows.push(totalRow("Total Operating Expenses", calc.opexMonth, calc.opexAnnual));
    rows.push(totalRow("Net Operating Income (NOI)", calc.noiMonth, calc.noiAnnual));
    rows.push(["OTHER EXPENSES"]);
    OTHER_LINES.forEach((l) => rows.push(lineRow(l)));
    rows.push(totalRow("Total Other Expenses", calc.otherMonth, calc.otherAnnual));
    rows.push(totalRow("Net Profit", calc.netMonth, calc.netAnnual));

    downloadCsv(
      "co-living-income-statement.csv",
      buildCsv(TOOL_NAME, rows),
    );
  }

  const netClass = (n: number) =>
    n < 0 ? "text-terracotta" : "text-near-black";

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Net profit</span>
          <span className={`font-semibold ${calc.netAnnual < 0 ? "text-terracotta" : "text-near-black"}`}>
            {money(calc.netAnnual)}
          </span>
        </span>
      }
    >
      {/* The 12-month grid is wide; print this route in landscape so the full
          year fits the sheet. Scoped to this page's print only. */}
      <style>{`@media print { @page { size: A4 landscape; } }`}</style>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Annual revenue", value: calc.revAnnual, tone: "text-white" },
          { label: "Operating expenses", value: calc.opexAnnual, tone: "text-white" },
          { label: "NOI", value: calc.noiAnnual, tone: calc.noiAnnual < 0 ? "text-terracotta" : "text-white" },
          { label: "Net profit", value: calc.netAnnual, tone: calc.netAnnual < 0 ? "text-terracotta" : "text-primary-green" },
        ].map((t) => (
          <div key={t.label} className="bg-near-black rounded-lg p-4">
            <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-warm-gold mb-1">
              {t.label}
            </p>
            <p className={`font-display text-xl sm:text-2xl font-semibold ${t.tone}`}>
              {money(t.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Grid. Line-item column is frozen (sticky left); the twelve months and
          Annual column scroll horizontally. border-separate is required for
          sticky table cells to hold in Chrome. */}
      <div className="overflow-x-auto border border-light-gray rounded-lg bg-white">
        <table className="min-w-[900px] w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-off-white">
              <th className="sticky left-0 z-20 bg-off-white text-left font-sans text-xs font-semibold text-charcoal/70 px-3 py-2.5 min-w-[13rem] border-b border-r border-light-gray">
                Line
              </th>
              {MONTHS.map((mo) => (
                <th
                  key={mo}
                  className="font-sans text-xs font-semibold text-charcoal/70 px-2 py-2.5 text-right min-w-[4.5rem] border-b border-light-gray"
                >
                  {mo}
                </th>
              ))}
              <th className="font-sans text-xs font-semibold text-near-black px-3 py-2.5 text-right min-w-[6rem] border-b border-light-gray bg-warm-gold/10">
                Annual
              </th>
            </tr>
          </thead>
          <tbody>
            <SectionRows
              title="Revenue"
              lines={REVENUE_LINES}
              state={state}
              setCell={setCell}
              lineAnnual={calc.lineAnnual}
            />
            <TotalRow label="Total Revenue" month={calc.revMonth} annual={calc.revAnnual} />

            <SectionRows
              title="Operating Expenses"
              lines={OPEX_LINES}
              state={state}
              setCell={setCell}
              lineAnnual={calc.lineAnnual}
            />
            <TotalRow label="Total Operating Expenses" month={calc.opexMonth} annual={calc.opexAnnual} />
            <TotalRow label="Net Operating Income (NOI)" month={calc.noiMonth} annual={calc.noiAnnual} emphasis />

            <SectionRows
              title="Other Expenses"
              lines={OTHER_LINES}
              state={state}
              setCell={setCell}
              lineAnnual={calc.lineAnnual}
            />
            <TotalRow label="Total Other Expenses" month={calc.otherMonth} annual={calc.otherAnnual} />
            <TotalRow label="Net Profit" month={calc.netMonth} annual={calc.netAnnual} emphasis strong className={netClass(calc.netAnnual)} />
          </tbody>
        </table>
      </div>

      <p className="font-sans text-xs text-charcoal/55 mt-4">
        Scroll sideways to reach every month. {PNL_ALL_LINES.length} lines, a
        full year. Totals and net profit update as you type.
      </p>
    </ResourceToolShell>
  );
}

function SectionRows({
  title,
  lines,
  state,
  setCell,
  lineAnnual,
}: {
  title: string;
  lines: PnlLine[];
  state: State;
  setCell: (lineId: string, m: number, value: string) => void;
  lineAnnual: (id: string) => number;
}) {
  return (
    <>
      <tr>
        <td className="sticky left-0 z-10 bg-cream/60 font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/70 px-3 py-1.5 border-y border-r border-light-gray whitespace-nowrap">
          {title}
        </td>
        <td
          colSpan={13}
          className="bg-cream/60 border-y border-light-gray"
        />
      </tr>
      {lines.map((l) => (
        <tr key={l.id} className="hover:bg-off-white/60">
          <td className="sticky left-0 z-10 bg-white px-3 py-1.5 border-b border-r border-light-gray/70">
            <span className="font-sans text-sm text-near-black">{l.label}</span>
            {l.hint && (
              <span className="block font-sans text-[11px] text-charcoal/45 leading-tight">
                {l.hint}
              </span>
            )}
          </td>
          {MONTHS.map((_, m) => (
            <td key={m} className="px-1 py-1 border-b border-light-gray/70">
              <input
                type="number"
                inputMode="decimal"
                value={state[`${l.id}_${m}`] ?? ""}
                onChange={(e) => setCell(l.id, m, e.target.value)}
                placeholder="0"
                aria-label={`${l.label} ${MONTHS[m]}`}
                className="w-full text-right bg-transparent px-1.5 py-1 text-sm text-near-black rounded focus:outline-none focus:bg-primary-green/5 focus:ring-1 focus:ring-primary-green/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </td>
          ))}
          <td className="px-3 py-1.5 text-right font-sans text-sm text-charcoal/80 border-b border-light-gray/70 bg-warm-gold/5">
            {lineAnnual(l.id).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </td>
        </tr>
      ))}
    </>
  );
}

function TotalRow({
  label,
  month,
  annual,
  emphasis,
  strong,
  className,
}: {
  label: string;
  month: number[];
  annual: number;
  emphasis?: boolean;
  strong?: boolean;
  className?: string;
}) {
  return (
    <tr className={emphasis ? "bg-near-black/[0.04]" : "bg-off-white/70"}>
      <td
        className={[
          "sticky left-0 z-10 px-3 py-2 border-b border-r border-light-gray font-sans text-sm",
          emphasis ? "bg-[#efece5]" : "bg-off-white",
          strong ? "font-bold" : "font-semibold",
          className ?? "text-near-black",
        ].join(" ")}
      >
        {label}
      </td>
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
