"use client";

import { useMemo, useState } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import {
  SectionTabStrip,
  TabPanel,
  TabPager,
  scrollToPanel,
  panelAnchor,
  type TabDef,
} from "@/components/resources/SectionTabs";
import { getResourceTool } from "@/lib/resources/registry";
import {
  PLAN_WEEKS,
  PLAN_ITEM_COUNT,
  GROUND_RULES,
  CAR2_RULE,
  CAR2_TAGLINE,
} from "@/lib/resources/ninety-day-launch-plan/config";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";

const SLUG = "ninety-day-launch-plan";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "ndp";

interface PlanState {
  checks: Record<string, boolean>;
  /** The self-selected "you are in week N", 1-12. */
  currentWeek: number;
  /** The car #2 readiness rule scorecard. */
  rule: Record<string, boolean>;
}

const DEFAULT_STATE: PlanState = { checks: {}, currentWeek: 1, rule: {} };

export default function LaunchPlanTool({ canSync = false }: {
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess - true only for a logged-in member who is not an admin
   * previewing a member tier.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset, hydrated } = useResourceTool<PlanState>(
    SLUG,
    DEFAULT_STATE,
    { sync: canSync },
  );
  const checks = state.checks ?? {};
  const rule = state.rule ?? {};
  const currentWeek = state.currentWeek ?? 1;

  /** Which tab is open. Chrome, not progress - deliberately not persisted. */
  const [activeWeek, setActiveWeek] = useState<string>(PLAN_WEEKS[0].id);

  function goTo(id: string) {
    setActiveWeek(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  const totalDone = useMemo(
    () =>
      PLAN_WEEKS.reduce(
        (n, w) => n + w.items.filter((i) => checks[i.id]).length,
        0,
      ),
    [checks],
  );
  const percent = Math.round((totalDone / PLAN_ITEM_COUNT) * 100);

  const weekDone = useMemo(
    () =>
      Object.fromEntries(
        PLAN_WEEKS.map((w) => [w.id, w.items.filter((i) => checks[i.id]).length]),
      ) as Record<string, number>,
    [checks],
  );

  const tabs: TabDef[] = useMemo(
    () =>
      PLAN_WEEKS.map((w) => ({
        id: w.id,
        label: `Week ${w.week}: ${w.label}`,
        shortLabel: w.week === currentWeek ? `Wk ${w.week} (now)` : `Wk ${w.week}`,
        badge: `${weekDone[w.id]}/${w.items.length}`,
      })),
    [weekDone, currentWeek],
  );

  const car2Ready = CAR2_RULE.every((r) => rule[r.id]);

  function toggle(id: string) {
    setState((prev) => ({
      ...prev,
      checks: { ...(prev.checks ?? {}), [id]: !(prev.checks ?? {})[id] },
    }));
  }

  function toggleRule(id: string) {
    setState((prev) => ({
      ...prev,
      rule: { ...(prev.rule ?? {}), [id]: !(prev.rule ?? {})[id] },
    }));
  }

  function setCurrentWeek(week: number) {
    setState((prev) => ({ ...prev, currentWeek: week }));
    const target = PLAN_WEEKS.find((w) => w.week === week);
    if (target) goTo(target.id);
  }

  function exportCsv() {
    const rows: (string | number)[][] = [["Week", "Task", "Done"]];
    for (const w of PLAN_WEEKS) {
      for (const item of w.items) {
        rows.push([
          `Week ${w.week}: ${w.label}`,
          item.label,
          checks[item.id] ? "Yes" : "No",
        ]);
      }
    }
    rows.push([]);
    rows.push(["You are in week", currentWeek, ""]);
    rows.push([]);
    rows.push(["Car #2 readiness rule", "", ""]);
    for (const r of CAR2_RULE) {
      rows.push(["", r.label, rule[r.id] ? "Yes" : "No"]);
    }
    rows.push(["", "Ready for car #2", car2Ready ? "Yes" : "Not yet"]);
    downloadCsv("ninety-day-launch-plan.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="font-semibold text-near-black">{percent}%</span>
          <span className="text-charcoal/60">complete</span>
        </span>
      }
    >
      {/* Progress header + week self-selector */}
      <div className="bg-near-black rounded-lg p-6 mb-6 text-white">
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold">
            Launch plan progress
          </p>
          <p className="font-display text-3xl font-semibold">
            {percent}
            <span className="text-lg text-white/60">%</span>
          </p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-green transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-sm text-white/70">
            {totalDone} of {PLAN_ITEM_COUNT} tasks done
            {percent === 100
              ? ". Twelve weeks, zero shortcuts. Now score the car #2 rule below."
              : `. ${PLAN_ITEM_COUNT - totalDone} to go.`}
          </p>
          <label className="no-print inline-flex items-center gap-2 font-sans text-sm text-white/80">
            You are in week
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="bg-white/10 border border-white/25 rounded-md px-2 py-1.5 text-white font-semibold cursor-pointer"
            >
              {PLAN_WEEKS.map((w) => (
                <option key={w.id} value={w.week} className="text-near-black">
                  {w.week}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Two ground rules before week one */}
      <div className="mb-6 bg-cream border border-warm-gold/40 rounded-lg p-4 sm:p-5">
        <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70 mb-2">
          Two ground rules before week one
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          {GROUND_RULES.map((r, i) => (
            <li key={i} className="font-sans text-sm text-near-black leading-relaxed">
              {r}
            </li>
          ))}
        </ol>
      </div>

      <SectionTabStrip
        tabs={tabs}
        activeId={activeWeek}
        onSelect={goTo}
        ariaLabel="Plan weeks"
        gridClassName="grid-cols-4 sm:grid-cols-6"
      />

      {/* Weeks - all mounted (for Print/Save-as-PDF), only the active one
          visible on screen. */}
      <div className="space-y-6">
        {PLAN_WEEKS.map((w) => {
          const isCurrentTab = w.id === activeWeek;
          const isMyWeek = w.week === currentWeek;
          const done = weekDone[w.id];
          return (
            <TabPanel
              key={w.id}
              anchorId={panelAnchor(ANCHOR_PREFIX, w.id)}
              current={isCurrentTab}
              className={[
                "bg-white border rounded-lg p-5 sm:p-6",
                isMyWeek ? "border-warm-gold ring-1 ring-warm-gold/40" : "border-light-gray",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="font-display text-lg font-semibold text-near-black">
                  Week {w.week}: {w.label}
                  {isMyWeek && (
                    <span className="ml-2 align-middle inline-flex items-center rounded-full bg-warm-gold text-near-black font-sans text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5">
                      You are here
                    </span>
                  )}
                </h3>
                <span className="font-sans text-sm text-charcoal/60 shrink-0">
                  {done}/{w.items.length}
                </span>
              </div>
              <p className="font-sans text-xs text-charcoal/60 mb-4">{w.phase}</p>
              <ul className="space-y-1">
                {w.items.map((item) => {
                  const checked = !!checks[item.id];
                  return (
                    <li key={item.id}>
                      <label className="flex items-start gap-3 cursor-pointer rounded-md px-2 py-2 hover:bg-off-white transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 h-4 w-4 accent-primary-green shrink-0"
                        />
                        <span
                          className={[
                            "font-sans text-sm leading-relaxed",
                            checked
                              ? "text-charcoal/45 line-through"
                              : "text-near-black",
                          ].join(" ")}
                        >
                          {item.label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 bg-off-white border border-light-gray rounded-md px-3 py-2.5 font-sans text-xs text-charcoal/70 leading-relaxed">
                <span className="font-semibold text-charcoal">Workload:</span>{" "}
                {w.note}
              </p>
            </TabPanel>
          );
        })}

        <TabPager tabs={tabs} activeId={activeWeek} onSelect={goTo} />
      </div>

      {/* End state: the car #2 readiness rule */}
      {hydrated && (
        <div className="mt-8 bg-near-black rounded-lg p-5 sm:p-6 text-white">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="font-display text-lg font-semibold">
              The car #2 readiness rule
            </h3>
            <span
              className={[
                "font-sans text-xs font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 shrink-0",
                car2Ready
                  ? "bg-primary-green text-white"
                  : "bg-white/15 text-white/80",
              ].join(" ")}
            >
              {car2Ready ? "Both true. Car #2 is earned." : "Not yet"}
            </span>
          </div>
          <p className="font-sans text-sm text-white/70 mb-3">
            Do not add a second car until BOTH are true:
          </p>
          <ul className="space-y-1">
            {CAR2_RULE.map((r) => {
              const checked = !!rule[r.id];
              return (
                <li key={r.id}>
                  <label className="flex items-start gap-3 cursor-pointer rounded-md px-2 py-2 hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRule(r.id)}
                      className="mt-0.5 h-4 w-4 accent-primary-green shrink-0"
                    />
                    <span
                      className={[
                        "font-sans text-sm leading-relaxed",
                        checked ? "text-white" : "text-white/80",
                      ].join(" ")}
                    >
                      {r.label}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 font-sans text-sm text-warm-gold">{CAR2_TAGLINE}</p>
        </div>
      )}

      <p className="mt-6 font-sans text-[11px] leading-relaxed text-charcoal/50">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}
