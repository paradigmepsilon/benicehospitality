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
  scrollToPanel,
  panelAnchor,
  type TabDef,
} from "@/components/resources/SectionTabs";
import { getResourceTool } from "@/lib/resources/registry";
import {
  PROTOCOL_MODES,
  INVOICE_WINDOW_DAYS,
  METADATA_RULE,
  modeItems,
  DEFAULT_PROTOCOL_STATE,
  type ProtocolState,
} from "@/lib/resources/turnover-photo-protocol/config";
import {
  EARNINGS_PLANS,
  planById,
  CALC_DISCLAIMER,
} from "@/lib/resources/vehicle-profitability-calculator/config";

const SLUG = "turnover-photo-protocol";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "tpp";

export default function TurnoverProtocolTool({ canSync = false }: {
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess - true only for a logged-in member who is not an admin
   * previewing a member tier.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<ProtocolState>(
    SLUG,
    DEFAULT_PROTOCOL_STATE,
    { sync: canSync },
  );
  const checks = state.checks ?? {};
  const planId = state.planId ?? "balanced";
  const tripsCompleted = state.tripsCompleted ?? 0;
  const plan = planById(planId);
  const invoiceDays = INVOICE_WINDOW_DAYS[plan.id];

  /** Which mode is open. Chrome, not trip progress - not persisted. */
  const [activeMode, setActiveMode] = useState<string>(PROTOCOL_MODES[0].id);

  function goTo(id: string) {
    setActiveMode(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  const modeDone = useMemo(
    () =>
      Object.fromEntries(
        PROTOCOL_MODES.map((m) => [
          m.id,
          modeItems(m).filter((i) => checks[i.id]).length,
        ]),
      ) as Record<string, number>,
    [checks],
  );

  const tabs: TabDef[] = useMemo(
    () =>
      PROTOCOL_MODES.map((m) => ({
        id: m.id,
        label: m.label,
        shortLabel: m.shortLabel,
        badge: `${modeDone[m.id]}/${modeItems(m).length}`,
      })),
    [modeDone],
  );

  const current = PROTOCOL_MODES.find((m) => m.id === activeMode)!;
  const currentRequired = modeItems(current).filter((i) => !i.optional);
  const currentRequiredDone = currentRequired.filter((i) => checks[i.id]).length;
  const modePercent = Math.round(
    (currentRequiredDone / currentRequired.length) * 100,
  );

  const anyChecked = useMemo(
    () => Object.values(checks).some(Boolean),
    [checks],
  );

  function toggle(id: string) {
    setState((prev) => ({
      ...prev,
      checks: { ...(prev.checks ?? {}), [id]: !(prev.checks ?? {})[id] },
    }));
  }

  function setPlan(id: ProtocolState["planId"]) {
    setState((prev) => ({ ...prev, planId: id }));
  }

  /**
   * The per-trip reset. Archives nothing: state is only ever the current
   * trip's checklist. Clearing it counts one more completed trip.
   */
  function startNewTrip() {
    if (!anyChecked) return;
    if (
      !window.confirm(
        "Start a new trip? This clears the current checklist and adds one to your completed-trips count. Nothing is archived.",
      )
    ) {
      return;
    }
    setState((prev) => ({
      ...prev,
      checks: {},
      tripsCompleted: (prev.tripsCompleted ?? 0) + 1,
    }));
    goTo(PROTOCOL_MODES[0].id);
  }

  function exportCsv() {
    const rows: (string | number)[][] = [["Mode", "Group", "Step", "Done"]];
    for (const m of PROTOCOL_MODES) {
      for (const g of m.groups) {
        for (const item of g.items) {
          rows.push([m.label, g.label, item.label, checks[item.id] ? "Yes" : "No"]);
        }
      }
    }
    rows.push([]);
    rows.push(["Earnings plan", plan.label, "", ""]);
    rows.push([
      "Incidental invoice window",
      `${invoiceDays} days after trip end`,
      "",
      "",
    ]);
    rows.push(["Trips completed with this protocol", tripsCompleted, "", ""]);
    downloadCsv("turnover-photo-protocol.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="font-semibold text-near-black tabular-nums">
            {tripsCompleted}
          </span>
          <span className="text-charcoal/60">
            {tripsCompleted === 1 ? "trip completed" : "trips completed"}
          </span>
        </span>
      }
    >
      {/* Timing header: the rules that decide whether a claim survives */}
      <div className="bg-near-black rounded-lg p-5 sm:p-6 mb-4 text-white">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold">
            The 2026 photo windows
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            {modePercent}
            <span className="text-base text-white/60">%</span>
          </p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/15 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-primary-green transition-[width] duration-500"
            style={{ width: `${modePercent}%` }}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {PROTOCOL_MODES.map((m) => (
            <div
              key={m.id}
              className={[
                "rounded-md border px-3 py-2.5",
                m.id === activeMode
                  ? "border-warm-gold/60 bg-white/10"
                  : "border-white/15 bg-white/5",
              ].join(" ")}
            >
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-warm-gold mb-0.5">
                {m.shortLabel}
              </p>
              <p className="font-sans text-xs text-white/85 leading-relaxed">
                {m.timing}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-sans text-xs font-semibold text-terracotta leading-relaxed">
          {METADATA_RULE}
        </p>
      </div>

      {/* Plan picker: sets the incidental invoice deadline */}
      <div className="bg-white border border-light-gray rounded-lg p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70 mr-1">
            Your earnings plan
          </p>
          {EARNINGS_PLANS.map((p) => {
            const selected = p.id === planId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                aria-pressed={selected}
                className={[
                  "font-sans text-sm font-medium px-3 py-2 min-h-11 rounded-md border cursor-pointer transition-colors",
                  selected
                    ? "bg-near-black text-white border-near-black"
                    : "bg-white text-near-black border-light-gray hover:border-primary-green",
                ].join(" ")}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-sans text-sm text-near-black">
          <span className="font-semibold">
            Incidental invoices: {invoiceDays} days after trip end
          </span>{" "}
          on {plan.label}. Fuel or charge shortfall, tolls, cleaning beyond
          normal, smoking. Submit day one if you can.
        </p>
      </div>

      {/* Start new trip */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={startNewTrip}
          disabled={!anyChecked}
          className={[
            "font-sans text-sm font-semibold px-4 py-2.5 min-h-11 rounded-md transition-colors",
            anyChecked
              ? "bg-primary-green text-white hover:bg-primary-green/90 cursor-pointer"
              : "bg-light-gray text-charcoal/40 cursor-not-allowed",
          ].join(" ")}
        >
          Start new trip
        </button>
        <p className="font-sans text-xs text-charcoal/60">
          Clears the checklist for the next guest and counts this trip as done.
        </p>
      </div>

      <SectionTabStrip
        tabs={tabs}
        activeId={activeMode}
        onSelect={goTo}
        ariaLabel="Trip modes"
        gridClassName="grid-cols-2"
      />

      {/* Modes - both mounted (for Print/Save-as-PDF), only the active one
          visible on screen. Rows are sized for thumbs in a driveway. */}
      <div className="space-y-6">
        {PROTOCOL_MODES.map((m) => {
          const isCurrent = m.id === activeMode;
          return (
            <TabPanel
              key={m.id}
              anchorId={panelAnchor(ANCHOR_PREFIX, m.id)}
              current={isCurrent}
              className="bg-white border border-light-gray rounded-lg p-4 sm:p-6"
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="font-display text-lg font-semibold text-near-black">
                  {m.label}
                </h3>
                <span className="font-sans text-sm text-charcoal/60 shrink-0">
                  {modeDone[m.id]}/{modeItems(m).length}
                </span>
              </div>
              <p className="font-sans text-xs text-charcoal/60 mb-4">{m.timing}</p>
              <div className="space-y-4">
                {m.groups.map((g) => (
                  <div key={g.label}>
                    <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/50 mb-1 px-1">
                      {g.label}
                    </p>
                    <ul className="space-y-0.5">
                      {g.items.map((item) => {
                        const checked = !!checks[item.id];
                        return (
                          <li key={item.id}>
                            <label className="flex items-start gap-3 cursor-pointer rounded-md px-2 py-2.5 min-h-12 hover:bg-off-white transition-colors">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(item.id)}
                                className="mt-0.5 h-5 w-5 accent-primary-green shrink-0"
                              />
                              <span
                                className={[
                                  "font-sans text-[15px] leading-snug",
                                  checked
                                    ? "text-charcoal/45 line-through"
                                    : "text-near-black",
                                ].join(" ")}
                              >
                                {item.label}
                                {item.optional && (
                                  <span className="ml-2 text-[11px] uppercase tracking-wide text-charcoal/40">
                                    optional
                                  </span>
                                )}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              {isCurrent && m.id === "checkin" && (
                <button
                  type="button"
                  onClick={() => goTo("checkout")}
                  className="no-print mt-4 w-full font-sans text-sm font-semibold px-4 py-3 min-h-12 rounded-md bg-near-black text-white hover:bg-near-black/90 cursor-pointer transition-colors"
                >
                  Guest has the car. Switch to check-out
                </button>
              )}
            </TabPanel>
          );
        })}
      </div>

      <p className="mt-6 font-sans text-[11px] leading-relaxed text-charcoal/50">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}
