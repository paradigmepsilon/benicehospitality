"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
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
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";
import {
  CAR_TWO_RULE,
  DEFAULT_STATE,
  EARNINGS_PLANS,
  GROSS_VS_NET_RULE,
  PLAN_CHOICE_FIELD_ID,
  PLAN_SECTIONS,
  TAX_NOTE,
  blankMilestone,
  blankVehicle,
  num,
  opexTotal,
  sectionFieldIds,
  startupTotal,
  trueNetMonthly,
  type FieldGroup,
  type PlanField,
  type PlanState,
  type PlanVehicle,
} from "@/lib/resources/fleet-business-plan-builder/config";

const SLUG = "fleet-business-plan-builder";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "fbp";

function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** "15000" -> "$15,000" for the document view; free text passes through. */
function moneyish(v: string): string {
  const n = parseFloat(v);
  return Number.isFinite(n) ? money(n) : v;
}

const VEHICLE_FIELDS: { key: keyof PlanVehicle; label: string; moneyLike?: boolean }[] = [
  { key: "details", label: "Make / Model / Year" },
  { key: "price", label: "Purchase price", moneyLike: true },
  { key: "financing", label: "Financing details" },
  { key: "rate", label: "Target daily rate", moneyLike: true },
  { key: "gross", label: "Projected monthly gross revenue", moneyLike: true },
  { key: "opex", label: "Projected monthly operating expenses", moneyLike: true },
  { key: "dep", label: "Projected monthly depreciation", moneyLike: true },
  { key: "trueNet", label: "Projected monthly TRUE NET", moneyLike: true },
  { key: "scenario", label: "Calculator scenario saved as" },
];

export default function FleetBusinessPlanBuilder({ canSync = false }: {
  /** access.canSync from getResourceAccess, same contract as the calculator. */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<PlanState>(
    SLUG,
    DEFAULT_STATE,
    { sync: canSync },
  );

  const [activeSection, setActiveSection] = useState<string>(PLAN_SECTIONS[0].id);
  /** "View as document" renders the filled plan as clean prose. */
  const [docView, setDocView] = useState(false);

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  const f = state.fields;

  function setField(id: string, value: string) {
    setState((p) => ({ ...p, fields: { ...p.fields, [id]: value } }));
  }

  const filled = (id: string) => (f[id] ?? "").trim().length > 0;

  // Completion per section, for the tab badges and the overall meter.
  const sectionProgress = useMemo(() => {
    return Object.fromEntries(
      PLAN_SECTIONS.map((s) => {
        const ids = sectionFieldIds(s);
        const done = ids.filter((id) => (f[id] ?? "").trim().length > 0).length;
        return [s.id, { done, total: ids.length }];
      }),
    ) as Record<string, { done: number; total: number }>;
  }, [f]);

  const overall = useMemo(() => {
    const done = Object.values(sectionProgress).reduce((a, p) => a + p.done, 0);
    const total = Object.values(sectionProgress).reduce((a, p) => a + p.total, 0);
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [sectionProgress]);

  const tabs: TabDef[] = useMemo(
    () =>
      PLAN_SECTIONS.map((s) => ({
        id: s.id,
        label: s.label,
        shortLabel: s.shortLabel,
        badge: `${sectionProgress[s.id].done}/${sectionProgress[s.id].total}`,
      })),
    [sectionProgress],
  );

  const chosenPlan = EARNINGS_PLANS.find((p) => p.id === f[PLAN_CHOICE_FIELD_ID]);
  const suTotal = startupTotal(f);
  const oxTotal = opexTotal(f);
  const trueNet = trueNetMonthly(f);
  const hasFinancialInput =
    num(f.finGross) > 0 || oxTotal > 0 || num(f.finDep) > 0;

  // Vehicles and milestones -------------------------------------------------

  function updateVehicle(id: string, key: keyof PlanVehicle, value: string) {
    setState((p) => ({
      ...p,
      vehicles: p.vehicles.map((v) => (v.id === id ? { ...v, [key]: value } : v)),
    }));
  }

  function updateMilestone(
    id: string,
    key: "milestone" | "trigger" | "action",
    value: string,
  ) {
    setState((p) => ({
      ...p,
      milestones: p.milestones.map((m) =>
        m.id === id ? { ...m, [key]: value } : m,
      ),
    }));
  }

  // Export ------------------------------------------------------------------

  function exportCsv() {
    const rows: (string | number)[][] = [["Section", "Field", "Value"]];
    for (const section of PLAN_SECTIONS) {
      if (section.id === "risk") {
        rows.push([section.label, "Earnings plan", chosenPlan?.label ?? ""]);
      }
      for (const group of section.groups) {
        for (const field of group.fields) {
          rows.push([section.label, field.label, f[field.id] ?? ""]);
        }
        if (section.id === "financial" && group.heading === "Startup costs") {
          rows.push([section.label, "Total startup costs", Math.round(suTotal)]);
        }
        if (
          section.id === "financial" &&
          group.heading === "Monthly operating expenses"
        ) {
          rows.push([
            section.label,
            "Total monthly operating expenses",
            Math.round(oxTotal),
          ]);
        }
      }
      if (section.id === "vehicles") {
        state.vehicles.forEach((v, i) => {
          for (const vf of VEHICLE_FIELDS) {
            rows.push([section.label, `Vehicle ${i + 1}: ${vf.label}`, v[vf.key]]);
          }
          rows.push([section.label, `Vehicle ${i + 1}: Rationale`, v.rationale]);
        });
      }
      if (section.id === "financial") {
        rows.push([
          section.label,
          "Projected monthly TRUE NET (gross - opex - depreciation)",
          Math.round(trueNet),
        ]);
      }
      if (section.id === "milestones") {
        state.milestones.forEach((m, i) => {
          rows.push([
            section.label,
            `Milestone ${i + 1}`,
            `${m.milestone} | Trigger: ${m.trigger} | Action: ${m.action}`,
          ]);
        });
      }
    }
    rows.push([]);
    rows.push([GROSS_VS_NET_RULE]);
    rows.push([TAX_NOTE]);
    rows.push([CALC_DISCLAIMER]);
    downloadCsv("fleet-business-plan.csv", buildCsv(TOOL_NAME, rows));
  }

  // Render ------------------------------------------------------------------

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDocView((v) => !v)}
            aria-pressed={docView}
            className={[
              "inline-flex items-center gap-2 border font-medium text-sm px-4 py-2 rounded-md transition-colors",
              docView
                ? "border-near-black bg-near-black text-white"
                : "border-light-gray bg-white hover:border-primary-green text-near-black",
            ].join(" ")}
          >
            {docView ? "Back to editing" : "View as document"}
          </button>
          <span className="font-sans text-sm text-charcoal/60 whitespace-nowrap">
            {overall.pct}% complete
          </span>
        </span>
      }
    >
      {/* The one rule */}
      <div className="bg-near-black text-white rounded-lg p-5 mb-6">
        <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold">
          The one rule
        </p>
        <p className="font-sans text-sm leading-relaxed mt-1.5">{GROSS_VS_NET_RULE}</p>
        <div className="mt-3 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-warm-gold rounded-full transition-all"
            style={{ width: `${overall.pct}%` }}
          />
        </div>
        <p className="font-sans text-[11px] text-white/60 mt-1.5">
          {overall.done} of {overall.total} plan fields filled in
        </p>
      </div>

      {docView ? (
        <PlanDocument
          state={state}
          chosenPlanLabel={chosenPlan?.label}
          suTotal={suTotal}
          oxTotal={oxTotal}
          trueNet={trueNet}
          hasFinancialInput={hasFinancialInput}
        />
      ) : (
        <>
          <SectionTabStrip
            tabs={tabs}
            activeId={activeSection}
            onSelect={goTo}
            ariaLabel="Business plan sections"
            gridClassName="grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
          />

          <div className="space-y-6">
            {PLAN_SECTIONS.map((section) => (
              <TabPanel
                key={section.id}
                anchorId={panelAnchor(ANCHOR_PREFIX, section.id)}
                current={section.id === activeSection}
                className="bg-white border border-light-gray rounded-lg p-5 sm:p-6"
              >
                <h3 className="font-display text-lg font-semibold text-near-black">
                  {section.label}
                </h3>
                <p className="font-sans text-xs text-charcoal/55 mt-0.5 mb-4">
                  {sectionProgress[section.id].done} of{" "}
                  {sectionProgress[section.id].total} filled in
                </p>

                {section.intro && (
                  <div className="bg-cream border border-warm-gold/40 rounded-lg p-4 mb-5">
                    <p className="font-sans text-sm text-near-black leading-relaxed">
                      {section.intro}
                      {(section.id === "vehicles" || section.id === "financial") && (
                        <>
                          {" "}
                          <Link
                            href="/resources/vehicle-profitability-calculator"
                            className="font-semibold text-primary-green underline underline-offset-2 hover:text-near-black transition-colors"
                          >
                            Open the calculator
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  </div>
                )}

                {section.id === "risk" && (
                  <PlanChoice
                    value={f[PLAN_CHOICE_FIELD_ID] ?? ""}
                    onChange={(v) => setField(PLAN_CHOICE_FIELD_ID, v)}
                  />
                )}

                {section.id === "milestones" && (
                  <>
                    <div className="bg-cream border border-warm-gold/40 rounded-lg p-4 mb-5">
                      <p className="font-sans text-sm text-near-black leading-relaxed">
                        <span className="font-semibold">The readiness rule:</span>{" "}
                        {CAR_TWO_RULE} Growth is a consequence of that rule, not a
                        date on a calendar.
                      </p>
                    </div>
                    <MilestonesEditor
                      milestones={state.milestones}
                      onChange={updateMilestone}
                      onAdd={() =>
                        setState((p) => ({
                          ...p,
                          milestones: [...p.milestones, blankMilestone()],
                        }))
                      }
                      onRemove={(id) =>
                        setState((p) => ({
                          ...p,
                          milestones: p.milestones.filter((m) => m.id !== id),
                        }))
                      }
                    />
                  </>
                )}

                <div className="space-y-5">
                  {section.groups.map((group, gi) => (
                    <Fragment key={gi}>
                      <GroupCard
                        group={group}
                        values={f}
                        onChange={setField}
                        footer={
                          section.id === "financial" &&
                          group.heading === "Startup costs" ? (
                            <TotalRow label="Total startup costs" value={suTotal} />
                          ) : section.id === "financial" &&
                            group.heading === "Monthly operating expenses" ? (
                            <TotalRow
                              label="Total monthly operating expenses"
                              value={oxTotal}
                            />
                          ) : section.id === "financial" &&
                            group.heading === "Revenue and depreciation" ? (
                            <TrueNetTile
                              trueNet={trueNet}
                              gross={num(f.finGross)}
                              opex={oxTotal}
                              dep={num(f.finDep)}
                              active={hasFinancialInput}
                            />
                          ) : undefined
                        }
                      />
                      {section.id === "vehicles" && gi === 0 && (
                        <VehiclesEditor
                          vehicles={state.vehicles}
                          onChange={updateVehicle}
                          onAdd={() =>
                            setState((p) => ({
                              ...p,
                              vehicles: [...p.vehicles, blankVehicle()],
                            }))
                          }
                          onRemove={(id) =>
                            setState((p) => ({
                              ...p,
                              vehicles: p.vehicles.filter((v) => v.id !== id),
                            }))
                          }
                        />
                      )}
                    </Fragment>
                  ))}
                </div>

                {section.id === "financial" && (
                  <p className="font-sans text-xs text-charcoal/55 leading-relaxed mt-5 bg-off-white border border-light-gray rounded-lg p-4">
                    <span className="font-semibold text-near-black">Tax note: </span>
                    {TAX_NOTE}
                  </p>
                )}
              </TabPanel>
            ))}

            <TabPager tabs={tabs} activeId={activeSection} onSelect={goTo} />
          </div>
        </>
      )}

      <p className="font-sans text-[11px] leading-relaxed text-charcoal/50 mt-6">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}

// ── Form building blocks ─────────────────────────────────────────────────────

function GroupCard({
  group,
  values,
  onChange,
  footer,
}: {
  group: FieldGroup;
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
  footer?: React.ReactNode;
}) {
  const allMoney = group.fields.every((fd) => fd.kind === "money");
  return (
    <section className="border border-light-gray rounded-lg p-4">
      {group.heading && (
        <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
          {group.heading}
        </p>
      )}
      {group.note && (
        <p className="font-sans text-xs text-charcoal/55 mt-1 leading-relaxed">
          {group.note}
        </p>
      )}
      <div
        className={[
          group.heading || group.note ? "mt-3" : "",
          allMoney ? "grid sm:grid-cols-2 gap-x-4 gap-y-3" : "space-y-4",
        ].join(" ")}
      >
        {group.fields.map((field) => (
          <FieldControl
            key={field.id}
            field={field}
            value={values[field.id] ?? ""}
            onChange={(v) => onChange(field.id, v)}
          />
        ))}
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </section>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: PlanField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="font-sans text-sm font-semibold text-near-black block mb-1">
        {field.label}
      </label>
      {field.helper && (
        <p className="font-sans text-xs text-charcoal/55 mb-1.5 leading-relaxed">
          {field.helper}
        </p>
      )}
      {field.kind === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          aria-label={field.label}
          className="w-full border border-light-gray px-3 py-2 text-sm rounded-md bg-white text-near-black focus:outline-none focus:border-primary-green resize-y"
        />
      ) : (
        <div className="flex items-center gap-1.5 border border-light-gray rounded-md bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-primary-green/50 focus-within:border-primary-green/50">
          {field.kind === "money" && (
            <span className="font-sans text-sm text-charcoal/50">$</span>
          )}
          <input
            type={field.kind === "money" ? "number" : "text"}
            inputMode={field.kind === "money" ? "decimal" : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? (field.kind === "money" ? "0" : "")}
            aria-label={field.label}
            className="w-full bg-transparent font-sans text-sm text-near-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      )}
    </div>
  );
}

function PlanChoice({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="border border-light-gray rounded-lg p-4 mb-5">
      <p className="font-sans text-sm font-semibold text-near-black">
        Earnings plan you will run
      </p>
      <p className="font-sans text-xs text-charcoal/55 mt-1 mb-3 leading-relaxed">
        Pick the plan whose damage responsibility you could pay in cash tomorrow.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {EARNINGS_PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={value === p.id}
            className={[
              "rounded-lg border-2 px-2 py-2.5 text-center transition-colors",
              value === p.id
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
    </div>
  );
}

function VehiclesEditor({
  vehicles,
  onChange,
  onAdd,
  onRemove,
}: {
  vehicles: PlanVehicle[];
  onChange: (id: string, key: keyof PlanVehicle, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="border border-light-gray rounded-lg p-4">
      <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
        Initial fleet composition
      </p>
      {vehicles.length === 0 && (
        <p className="font-sans text-sm text-charcoal/60 mt-3">
          No vehicles yet. Add each planned vehicle with the numbers the
          calculator gave you, gross and true net both.
        </p>
      )}
      <div className="mt-3 space-y-4">
        {vehicles.map((v, i) => (
          <div key={v.id} className="bg-off-white border border-light-gray rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="font-sans text-sm font-bold text-near-black">
                Vehicle {i + 1}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Remove vehicle ${i + 1}?`)) onRemove(v.id);
                }}
                className="font-sans text-xs text-charcoal/50 hover:text-terracotta transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
              {VEHICLE_FIELDS.map((vf) => (
                <div key={vf.key}>
                  <label className="font-sans text-xs font-semibold text-near-black block mb-1">
                    {vf.label}
                  </label>
                  <div className="flex items-center gap-1.5 border border-light-gray rounded-md bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-primary-green/50 focus-within:border-primary-green/50">
                    {vf.moneyLike && (
                      <span className="font-sans text-sm text-charcoal/50">$</span>
                    )}
                    <input
                      type={vf.moneyLike ? "number" : "text"}
                      inputMode={vf.moneyLike ? "decimal" : undefined}
                      value={v[vf.key]}
                      onChange={(e) => onChange(v.id, vf.key, e.target.value)}
                      aria-label={`Vehicle ${i + 1}: ${vf.label}`}
                      className="w-full bg-transparent font-sans text-sm text-near-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="font-sans text-xs font-semibold text-near-black block mb-1">
                Rationale
              </label>
              <textarea
                value={v.rationale}
                onChange={(e) => onChange(v.id, "rationale", e.target.value)}
                placeholder="Why this car, in one paragraph"
                rows={2}
                aria-label={`Vehicle ${i + 1}: Rationale`}
                className="w-full border border-light-gray px-3 py-2 text-sm rounded-md bg-white text-near-black focus:outline-none focus:border-primary-green resize-y"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="no-print mt-3 inline-flex items-center gap-2 bg-primary-green text-white hover:bg-primary-green/90 font-sans font-semibold text-sm px-4 py-2 rounded-md transition-colors"
      >
        Add a vehicle
      </button>
    </section>
  );
}

function MilestonesEditor({
  milestones,
  onChange,
  onAdd,
  onRemove,
}: {
  milestones: PlanState["milestones"];
  onChange: (id: string, key: "milestone" | "trigger" | "action", v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="border border-light-gray rounded-lg p-4 mb-5">
      <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70 mb-3">
        Milestones and triggers
      </p>
      <div className="space-y-3">
        {milestones.map((m, i) => (
          <div key={m.id} className="bg-off-white border border-light-gray rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="font-sans text-xs font-bold text-charcoal/60">
                Milestone {i + 1}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove this milestone?")) onRemove(m.id);
                }}
                className="font-sans text-xs text-charcoal/50 hover:text-terracotta transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {(
                [
                  ["milestone", "Milestone"],
                  ["trigger", "Trigger"],
                  ["action", "Action"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="font-sans text-xs font-semibold text-near-black block mb-1">
                    {label}
                  </label>
                  <textarea
                    value={m[key]}
                    onChange={(e) => onChange(m.id, key, e.target.value)}
                    rows={2}
                    aria-label={`Milestone ${i + 1}: ${label}`}
                    className="w-full border border-light-gray px-3 py-2 text-sm rounded-md bg-white text-near-black focus:outline-none focus:border-primary-green resize-y"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="no-print mt-3 inline-flex items-center gap-2 bg-primary-green text-white hover:bg-primary-green/90 font-sans font-semibold text-sm px-4 py-2 rounded-md transition-colors"
      >
        Add a milestone
      </button>
    </section>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 bg-warm-gold/10 rounded-md px-3 py-2.5">
      <span className="font-sans text-sm font-semibold text-near-black">{label}</span>
      <span className="font-sans text-sm font-bold tabular-nums text-near-black">
        {money(value)}
      </span>
    </div>
  );
}

function TrueNetTile({
  trueNet,
  gross,
  opex,
  dep,
  active,
}: {
  trueNet: number;
  gross: number;
  opex: number;
  dep: number;
  active: boolean;
}) {
  return (
    <div className="bg-near-black rounded-lg p-4">
      <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-warm-gold mb-1">
        Projected monthly true net
      </p>
      {active ? (
        <>
          <p
            className={`font-display text-2xl font-semibold ${trueNet < 0 ? "text-terracotta" : "text-white"}`}
          >
            {money(trueNet)}
          </p>
          <p className="font-sans text-[11px] text-white/60 mt-1 leading-tight">
            {money(gross)} gross, minus {money(opex)} operating expenses, minus{" "}
            {money(dep)} depreciation. Judge the plan on this number, nothing
            else.
          </p>
        </>
      ) : (
        <p className="font-sans text-sm text-white/70">
          Enter gross revenue, operating expenses, and depreciation to see the
          true-net line update live.
        </p>
      )}
    </div>
  );
}

// ── Document view ────────────────────────────────────────────────────────────

function PlanDocument({
  state,
  chosenPlanLabel,
  suTotal,
  oxTotal,
  trueNet,
  hasFinancialInput,
}: {
  state: PlanState;
  chosenPlanLabel?: string;
  suTotal: number;
  oxTotal: number;
  trueNet: number;
  hasFinancialInput: boolean;
}) {
  const f = state.fields;
  const val = (id: string) => (f[id] ?? "").trim();

  return (
    <article className="bg-white border border-light-gray rounded-lg p-6 sm:p-10">
      {/* Title block */}
      <header className="text-center border-b border-light-gray pb-6 mb-8">
        <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-charcoal/60">
          Car Rental Business Plan
        </p>
        <h2 className="font-display text-3xl font-semibold text-near-black mt-2">
          {val("businessName") || "Untitled fleet business"}
        </h2>
        <p className="font-sans text-sm text-charcoal/60 mt-2">
          {[
            val("preparedBy") && `Prepared by ${val("preparedBy")}`,
            val("contact"),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <div className="space-y-10">
        {PLAN_SECTIONS.map((section) => {
          const blocks: React.ReactNode[] = [];

          if (section.id === "risk" && chosenPlanLabel) {
            blocks.push(
              <DocField
                key="plan"
                label="Earnings plan"
                value={chosenPlanLabel}
              />,
            );
          }

          if (section.id === "milestones") {
            const rows = state.milestones.filter(
              (m) => m.milestone.trim() || m.trigger.trim() || m.action.trim(),
            );
            if (rows.length > 0) {
              blocks.push(
                <div key="milestones" className="overflow-x-auto">
                  <p className="font-sans text-sm font-semibold text-near-black mb-2">
                    Milestones and triggers
                  </p>
                  <table className="w-full text-left border border-light-gray">
                    <thead>
                      <tr className="bg-off-white border-b border-light-gray">
                        {["Milestone", "Trigger", "Action"].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 font-sans text-xs font-semibold text-charcoal/70"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-gray/70">
                      {rows.map((m) => (
                        <tr key={m.id}>
                          <td className="px-3 py-2 font-sans text-sm text-near-black align-top">
                            {m.milestone}
                          </td>
                          <td className="px-3 py-2 font-sans text-sm text-charcoal/80 align-top">
                            {m.trigger}
                          </td>
                          <td className="px-3 py-2 font-sans text-sm text-charcoal/80 align-top">
                            {m.action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>,
              );
            }
          }

          for (const group of section.groups) {
            const moneyFields = group.fields.filter(
              (fd) => fd.kind === "money" && val(fd.id),
            );
            const proseFields = group.fields.filter(
              (fd) => fd.kind !== "money" && val(fd.id),
            );
            if (moneyFields.length === 0 && proseFields.length === 0) continue;

            blocks.push(
              <div key={group.heading ?? group.fields[0].id}>
                {group.heading && (
                  <p className="font-sans text-sm font-semibold text-near-black mb-2">
                    {group.heading}
                  </p>
                )}
                {proseFields.map((fd) => (
                  <DocField key={fd.id} label={fd.label} value={val(fd.id)} />
                ))}
                {moneyFields.length > 0 && (
                  <table className="w-full max-w-md text-left mt-2">
                    <tbody className="divide-y divide-light-gray/70">
                      {moneyFields.map((fd) => (
                        <tr key={fd.id}>
                          <td className="py-1.5 pr-4 font-sans text-sm text-charcoal/80">
                            {fd.label}
                          </td>
                          <td className="py-1.5 font-sans text-sm font-medium tabular-nums text-near-black text-right">
                            {moneyish(val(fd.id))}
                          </td>
                        </tr>
                      ))}
                      {section.id === "financial" &&
                        group.heading === "Startup costs" && (
                          <DocTotalRow label="Total startup costs" value={suTotal} />
                        )}
                      {section.id === "financial" &&
                        group.heading === "Monthly operating expenses" && (
                          <DocTotalRow
                            label="Total monthly operating expenses"
                            value={oxTotal}
                          />
                        )}
                      {section.id === "financial" &&
                        group.heading === "Revenue and depreciation" &&
                        hasFinancialInput && (
                          <DocTotalRow
                            label="Projected monthly TRUE NET"
                            value={trueNet}
                          />
                        )}
                    </tbody>
                  </table>
                )}
              </div>,
            );
          }

          if (section.id === "vehicles") {
            const cars = state.vehicles.filter((v) =>
              VEHICLE_FIELDS.some((vf) => v[vf.key].trim()),
            );
            cars.forEach((v, i) => {
              blocks.push(
                <div key={v.id}>
                  <p className="font-sans text-sm font-semibold text-near-black mb-2">
                    Vehicle {i + 1}
                    {v.details.trim() ? `: ${v.details.trim()}` : ""}
                  </p>
                  <table className="w-full max-w-md text-left">
                    <tbody className="divide-y divide-light-gray/70">
                      {VEHICLE_FIELDS.filter(
                        (vf) => vf.key !== "details" && v[vf.key].trim(),
                      ).map((vf) => (
                        <tr key={vf.key}>
                          <td className="py-1.5 pr-4 font-sans text-sm text-charcoal/80">
                            {vf.label}
                          </td>
                          <td className="py-1.5 font-sans text-sm font-medium tabular-nums text-near-black text-right">
                            {vf.moneyLike ? moneyish(v[vf.key]) : v[vf.key]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {v.rationale.trim() && (
                    <DocField label="Rationale" value={v.rationale} />
                  )}
                </div>,
              );
            });
          }

          return (
            <section key={section.id}>
              <h3 className="font-display text-xl font-semibold text-near-black border-b border-light-gray pb-2 mb-4">
                {section.label}
              </h3>
              {blocks.length > 0 ? (
                <div className="space-y-5">{blocks}</div>
              ) : (
                <p className="font-sans text-sm text-charcoal/45 italic">
                  Not filled in yet.
                </p>
              )}
              {section.id === "financial" && (
                <p className="font-sans text-xs text-charcoal/55 leading-relaxed mt-4">
                  {TAX_NOTE}
                </p>
              )}
            </section>
          );
        })}
      </div>

      <p className="font-sans text-xs text-charcoal/50 leading-relaxed border-t border-light-gray pt-4 mt-10">
        {GROSS_VS_NET_RULE}
      </p>
    </article>
  );
}

function DocField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <p className="font-sans text-xs font-semibold tracking-wide uppercase text-charcoal/55">
        {label}
      </p>
      <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap mt-0.5">
        {value}
      </p>
    </div>
  );
}

function DocTotalRow({ label, value }: { label: string; value: number }) {
  return (
    <tr className="bg-warm-gold/10">
      <td className="py-1.5 px-2 font-sans text-sm font-semibold text-near-black">
        {label}
      </td>
      <td className="py-1.5 px-2 font-sans text-sm font-bold tabular-nums text-near-black text-right">
        {money(value)}
      </td>
    </tr>
  );
}
