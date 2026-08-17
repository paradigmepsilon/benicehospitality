"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  MONTHS,
  MONTH_NAMES,
  PNL_ALL_LINES,
  REVENUE_LINES,
  OPEX_LINES,
  OTHER_LINES,
  type PnlLine,
} from "@/lib/resources/co-living-profit-calculator/config";
import {
  baselineKey,
  cell,
  computeYear,
  hasAnyBaseline,
  monthKey,
  type PnlState,
} from "@/lib/resources/co-living-profit-calculator/model";
import BaselineScreen from "./BaselineScreen";
import MonthScreen from "./MonthScreen";
import YearGrid from "./YearGrid";
import TallyHeader from "./TallyHeader";
import { money } from "./Fields";

const SLUG = "co-living-profit-calculator";
const TOOL_NAME = getResourceTool(SLUG)!.name;

export default function ProfitCalculator({ canSync = false }: {
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess — true only for a logged-in member who is not an admin
   * previewing a member tier. Not `loggedIn`: that is true for a previewing
   * admin too, and their keystrokes would land on their own row.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<PnlState>(SLUG, {}, {
    sync: canSync,
  });

  // WHERE YOU ARE IS NOT SAVED STATE, deliberately. `useResourceTool` treats any
  // setState as proof the member used the tool, and a save shelves it on their
  // dashboard — so persisting the current screen would mean clicking "Next"
  // twice without typing anything counted as using the calculator. Losing your
  // place on refresh is the cheaper of the two costs.
  const [view, setView] = useState<"flow" | "year">("flow");
  const [onBaseline, setOnBaseline] = useState(true);
  const [month, setMonth] = useState(0);

  const calc = useMemo(() => computeYear(state), [state]);

  const setCell = useCallback(
    (lineId: string, m: number, value: string) => {
      setState((prev) => ({ ...prev, [monthKey(lineId, m)]: value }));
    },
    [setState],
  );

  /** Drop a month override so the line falls back to the baseline again. */
  const clearCell = useCallback(
    (lineId: string, m: number) => {
      setState((prev) => {
        const next = { ...prev };
        delete next[monthKey(lineId, m)];
        return next;
      });
    },
    [setState],
  );

  const setBaseline = useCallback(
    (lineId: string, value: string) => {
      setState((prev) => ({ ...prev, [baselineKey(lineId)]: value }));
    },
    [setState],
  );

  // Advancing a screen should land you at the top of it. Skipped on first
  // render so simply opening the page never yanks the window.
  const topRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, [view, month, onBaseline]);

  const goToMonth = useCallback((m: number) => {
    setOnBaseline(false);
    setMonth(m);
    setView("flow");
  }, []);

  function resetAll() {
    reset();
    setView("flow");
    setOnBaseline(true);
    setMonth(0);
  }

  function exportCsv() {
    const rows: (string | number)[][] = [];

    // Provenance before numbers. The annual column silently includes months
    // nobody entered, and a spreadsheet that does not say so is a spreadsheet
    // someone will quote back as though it were record.
    const derived = MONTHS.filter((_, m) => !calc.entered[m]);
    if (derived.length > 0 && hasAnyBaseline(state)) {
      rows.push([
        `Note: ${derived.join(", ")} ${derived.length === 1 ? "is" : "are"} carried from your baseline month, not entered as actuals.`,
      ]);
      rows.push([]);
    }

    rows.push(["Line", ...MONTHS, "Annual"]);

    const lineRow = (l: PnlLine) => [
      l.label,
      ...MONTHS.map((_, m) => cell(state, l.id, m).n),
      calc.lineAnnual(l.id),
    ];
    const totalRow = (label: string, byMonth: number[], annual: number) => [
      label,
      ...byMonth,
      annual,
    ];

    rows.push(["REVENUE"]);
    REVENUE_LINES.forEach((l) => rows.push(lineRow(l)));
    rows.push(totalRow("Total Revenue", calc.revenue, calc.annual.revenue));
    rows.push(["OPERATING EXPENSES"]);
    OPEX_LINES.forEach((l) => rows.push(lineRow(l)));
    rows.push(totalRow("Total Operating Expenses", calc.opex, calc.annual.opex));
    rows.push(totalRow("Net Operating Income (NOI)", calc.noi, calc.annual.noi));
    rows.push(["OTHER EXPENSES"]);
    OTHER_LINES.forEach((l) => rows.push(lineRow(l)));
    rows.push(totalRow("Total Other Expenses", calc.other, calc.annual.other));
    rows.push(totalRow("Net Profit", calc.net, calc.annual.net));

    if (hasAnyBaseline(state)) {
      rows.push([]);
      rows.push(["BASELINE MONTH (one typical month)"]);
      PNL_ALL_LINES.forEach((l) => {
        const raw = state[baselineKey(l.id)];
        if (raw !== undefined && raw.trim() !== "") {
          rows.push([l.label, parseFloat(raw) || 0]);
        }
      });
    }

    downloadCsv("co-living-income-statement.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={resetAll}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Net profit</span>
          <span
            className={`font-semibold ${calc.annual.net < 0 ? "text-terracotta" : "text-near-black"}`}
          >
            {money(calc.annual.net)}
          </span>
        </span>
      }
    >
      {/* The printed document is always the twelve-month grid, whichever screen
          you happen to be on — so print it landscape. Scoped to this route. */}
      <style>{`@media print { @page { size: A4 landscape; } }`}</style>

      <div ref={topRef} />

      <TallyHeader
        calc={calc}
        month={month}
        view={view}
        onJump={goToMonth}
        onToggleView={() => setView((v) => (v === "flow" ? "year" : "flow"))}
      />

      <div className="no-print">
        {view === "year" ? (
          <>
            <div className="mb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-near-black">
                Your year
              </h2>
              <p className="font-sans text-sm text-charcoal/60 mt-1">
                Every line, every month. Edit any cell here, or click a month
                heading to open its screen. Washed cells are carried from your
                baseline rather than entered.
              </p>
            </div>
            <YearGrid
              state={state}
              calc={calc}
              onChange={setCell}
              onJumpToMonth={goToMonth}
            />
          </>
        ) : onBaseline ? (
          <BaselineScreen
            state={state}
            onChange={setBaseline}
            onStart={() => setOnBaseline(false)}
            onSkip={() => setOnBaseline(false)}
          />
        ) : (
          <MonthScreen
            state={state}
            month={month}
            onChange={(lineId, value) => setCell(lineId, month, value)}
            onClear={(lineId) => clearCell(lineId, month)}
            onBack={() => {
              if (month === 0) setOnBaseline(true);
              else setMonth(month - 1);
            }}
            onNext={() => {
              if (month === MONTHS.length - 1) setView("year");
              else setMonth(month + 1);
            }}
          />
        )}
      </div>

      {/* A printout is a document, not a screenshot of wherever you paused. */}
      <div className="print-only">
        <YearGrid state={state} calc={calc} readOnly />
      </div>

      <p className="no-print font-sans text-xs text-charcoal/55 mt-4">
        {view === "year"
          ? "Totals and net profit update as you type."
          : onBaseline
            ? "The baseline is optional. Anything you enter here fills in every month you don't override."
            : `${MONTH_NAMES[month]} is one of twelve screens. Switch to Year view any time for the full grid.`}
      </p>
    </ResourceToolShell>
  );
}
