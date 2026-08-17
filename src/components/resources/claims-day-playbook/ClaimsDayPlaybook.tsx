"use client";

import { useEffect, useMemo, useState } from "react";
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
  EARNINGS_PLANS,
  CALC_DISCLAIMER,
  type EarningsPlan,
} from "@/lib/resources/vehicle-profitability-calculator/config";
import {
  PLAYBOOK_STAGES,
  PLAYBOOK_ALL_ITEMS,
  INVOICE_WINDOW_DAYS,
  PHOTO_WINDOW_HOURS,
  METADATA_WARNING,
} from "@/lib/resources/claims-day-playbook/config";

const SLUG = "claims-day-playbook";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "cdp";

interface PlaybookState {
  planId: EarningsPlan["id"];
  /** Trip end, from a datetime-local input. Empty until the host sets it. */
  tripEnd: string;
  checked: Record<string, boolean>;
}

const DEFAULT_STATE: PlaybookState = {
  planId: "balanced",
  tripEnd: "",
  checked: {},
};

/** "2d 4h left" / "3h 20m left" from a millisecond delta. */
function fmtRemaining(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

function fmtDeadline(t: Date): string {
  return t.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ClaimsDayPlaybook({
  canSync = false,
}: {
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess: true only for a logged-in member who is not an admin
   * previewing a member tier.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<PlaybookState>(
    SLUG,
    DEFAULT_STATE,
    { sync: canSync },
  );

  // Which stage is open. Chrome, not progress: every visit starts at stage 1.
  const [activeStage, setActiveStage] = useState<string>(PLAYBOOK_STAGES[0].id);

  // Minute tick so the countdowns stay honest while the tab sits open.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const plan =
    EARNINGS_PLANS.find((p) => p.id === state.planId) ?? EARNINGS_PLANS[1];
  const windowDays = INVOICE_WINDOW_DAYS[plan.id];

  const tripEndDate = useMemo(() => {
    if (!state.tripEnd) return null;
    const d = new Date(state.tripEnd);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [state.tripEnd]);

  const photoDeadline = tripEndDate
    ? new Date(tripEndDate.getTime() + PHOTO_WINDOW_HOURS * 3_600_000)
    : null;
  const invoiceDeadline = tripEndDate
    ? new Date(tripEndDate.getTime() + windowDays * 24 * 3_600_000)
    : null;

  const doneCount = PLAYBOOK_ALL_ITEMS.filter((i) => state.checked[i.id]).length;
  const percent = Math.round((doneCount / PLAYBOOK_ALL_ITEMS.length) * 100);

  const stageDone = useMemo(
    () =>
      Object.fromEntries(
        PLAYBOOK_STAGES.map((s) => [
          s.id,
          s.items.filter((i) => state.checked[i.id]).length,
        ]),
      ) as Record<string, number>,
    [state.checked],
  );

  const tabs: TabDef[] = PLAYBOOK_STAGES.map((s) => ({
    id: s.id,
    label: s.label,
    shortLabel: s.shortLabel,
    badge: `${stageDone[s.id]}/${s.items.length}`,
  }));

  function goTo(id: string) {
    setActiveStage(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  function toggle(id: string) {
    setState((prev) => ({
      ...prev,
      checked: { ...prev.checked, [id]: !prev.checked[id] },
    }));
  }

  function exportCsv() {
    const rows = [["Stage", "Step", "Done"]];
    for (const s of PLAYBOOK_STAGES) {
      for (const i of s.items) {
        rows.push([s.label, i.label, state.checked[i.id] ? "Yes" : "No"]);
      }
    }
    rows.push([]);
    rows.push(["Plan", plan.label, ""]);
    rows.push(["Damage responsibility", `$${plan.damageResponsibility}`, ""]);
    rows.push(["Invoice window", `${windowDays} days from trip end`, ""]);
    if (tripEndDate) rows.push(["Trip end", tripEndDate.toLocaleString(), ""]);
    downloadCsv("claims-day-playbook.csv", buildCsv(TOOL_NAME, rows));
  }

  function Countdown({
    label,
    deadline,
    closedAdvice,
  }: {
    label: string;
    deadline: Date;
    closedAdvice: string;
  }) {
    const remaining = deadline.getTime() - now;
    const closed = remaining <= 0;
    return (
      <div
        className={[
          "rounded-lg border p-4",
          closed
            ? "border-terracotta/40 bg-terracotta/5"
            : "border-white/15 bg-white/5",
        ].join(" ")}
      >
        <p className="font-sans text-xs font-semibold tracking-wide uppercase text-white/60">
          {label}
        </p>
        <p
          className={[
            "font-display text-2xl sm:text-3xl font-semibold mt-1",
            closed ? "text-terracotta" : "text-warm-gold",
          ].join(" ")}
        >
          {closed ? "Window closed" : fmtRemaining(remaining)}
        </p>
        <p className="font-sans text-sm text-white/70 mt-1">
          {closed ? closedAdvice : `Deadline: ${fmtDeadline(deadline)}`}
        </p>
      </div>
    );
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="font-semibold text-near-black">{percent}%</span>
          <span className="text-charcoal/60">worked</span>
        </span>
      }
    >
      {/* The clocks. Calm, big, and honest. */}
      <div className="bg-near-black rounded-lg p-5 sm:p-7 mb-6 text-white">
        <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
          Two clocks started at trip end
        </p>
        <p className="font-sans text-base text-white/80 leading-relaxed mb-5">
          Take a breath. Claims are won on documentation and deadlines, and you
          have time for both if you start now.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          {EARNINGS_PLANS.map((p) => {
            const current = p.id === plan.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setState((prev) => ({ ...prev, planId: p.id }))
                }
                aria-pressed={current}
                className={[
                  "rounded-lg border p-3.5 text-left transition-colors cursor-pointer",
                  current
                    ? "border-warm-gold bg-warm-gold/15"
                    : "border-white/15 bg-white/5 hover:border-white/40",
                ].join(" ")}
              >
                <p className="font-sans text-sm font-semibold text-white">
                  {p.label}
                </p>
                <p className="font-sans text-xs text-white/60 mt-1">
                  ${p.damageResponsibility.toLocaleString()} damage
                  responsibility · {INVOICE_WINDOW_DAYS[p.id]}-day invoice
                  window
                </p>
              </button>
            );
          })}
        </div>

        <label className="block mb-5">
          <span className="font-sans text-xs font-medium text-white/70">
            When did the trip end? (starts both countdowns)
          </span>
          <input
            type="datetime-local"
            value={state.tripEnd}
            onChange={(e) =>
              setState((prev) => ({ ...prev, tripEnd: e.target.value }))
            }
            className="mt-1 block w-full sm:w-auto rounded-md border border-white/20 bg-white/10 px-3 py-2 font-sans text-sm text-white focus:outline-none focus:border-warm-gold [color-scheme:dark]"
          />
        </label>

        {photoDeadline && invoiceDeadline ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Countdown
              label="Post-trip photos: take AND upload"
              deadline={photoDeadline}
              closedAdvice="Photograph and upload now anyway, and note the return circumstances in your timeline."
            />
            <Countdown
              label={`Incidental invoices (${plan.label.split(" (")[0]})`}
              deadline={invoiceDeadline}
              closedAdvice="Submit anyway with an explanation, but expect denial. Fix the SOP so it cannot repeat."
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/15 bg-white/5 p-4">
              <p className="font-sans text-xs font-semibold tracking-wide uppercase text-white/60">
                Post-trip photos: take AND upload
              </p>
              <p className="font-display text-2xl sm:text-3xl font-semibold text-warm-gold mt-1">
                {PHOTO_WINDOW_HOURS} hours
              </p>
              <p className="font-sans text-sm text-white/70 mt-1">
                from trip end, metadata on
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/5 p-4">
              <p className="font-sans text-xs font-semibold tracking-wide uppercase text-white/60">
                Incidental invoices on your plan
              </p>
              <p className="font-display text-2xl sm:text-3xl font-semibold text-warm-gold mt-1">
                {windowDays} days
              </p>
              <p className="font-sans text-sm text-white/70 mt-1">
                from trip end · 5 / 4 / 3 days by plan
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The warning that voids everything else if ignored */}
      <div className="bg-terracotta/5 border border-terracotta/30 rounded-lg p-5 mb-8">
        <p className="font-sans text-sm font-semibold text-terracotta mb-1">
          Before you take a single photo
        </p>
        <p className="font-sans text-base text-near-black leading-relaxed">
          {METADATA_WARNING}
        </p>
      </div>

      <SectionTabStrip
        tabs={tabs}
        activeId={activeStage}
        onSelect={goTo}
        ariaLabel="Claims-day stages"
        gridClassName="grid-cols-2 sm:grid-cols-5"
      />

      {/* One stage at a time on screen; all stages mounted for print. */}
      <div className="space-y-6">
        {PLAYBOOK_STAGES.map((stage, idx) => (
          <TabPanel
            key={stage.id}
            anchorId={panelAnchor(ANCHOR_PREFIX, stage.id)}
            current={stage.id === activeStage}
            className="bg-white border border-light-gray rounded-lg p-5 sm:p-7"
          >
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-near-black">
                Stage {idx + 1}: {stage.label}
              </h3>
              <span className="font-sans text-sm text-charcoal/60 shrink-0">
                {stageDone[stage.id]}/{stage.items.length}
              </span>
            </div>
            <p className="font-sans text-base text-charcoal/70 leading-relaxed mb-5">
              {stage.blurb}
            </p>
            <ul className="space-y-1.5">
              {stage.items.map((item) => {
                const checked = !!state.checked[item.id];
                return (
                  <li key={item.id}>
                    <label className="flex items-start gap-3.5 cursor-pointer rounded-md px-2 py-2.5 hover:bg-off-white transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(item.id)}
                        className="mt-1 h-5 w-5 accent-primary-green shrink-0"
                      />
                      <span
                        className={[
                          "font-sans text-base leading-relaxed",
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
            {stage.note && (
              <div className="mt-5 bg-warm-gold/10 border border-warm-gold/30 rounded-md p-4">
                <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
                  {stage.note}
                </p>
              </div>
            )}
          </TabPanel>
        ))}

        <TabPager tabs={tabs} activeId={activeStage} onSelect={goTo} />
      </div>

      <p className="mt-8 text-center font-sans text-xs text-charcoal/50">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}
