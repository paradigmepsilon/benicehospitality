"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";
import {
  CAR_VALUE_HIGH,
  CAR_VALUE_LOW,
  DEFAULT_OPTIMIZER_INPUTS,
  computePlanRows,
  grossMonthlyOf,
  recommendPlan,
  type OptimizerInputs,
} from "@/lib/resources/earnings-plan-optimizer/config";

const SLUG = "earnings-plan-optimizer";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function EarningsPlanOptimizer({ canSync = false }: {
  /** access.canSync from getResourceAccess - see the exemplar for why this is
   *  not simply `loggedIn` (admin preview must not write to the admin's row). */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<OptimizerInputs>(
    SLUG,
    DEFAULT_OPTIMIZER_INPUTS,
    { sync: canSync },
  );

  const rows = useMemo(() => computePlanRows(state), [state]);
  const rec = useMemo(() => recommendPlan(state), [state]);
  const gross = grossMonthlyOf(state);
  const maxAnnual = Math.max(...rows.map((r) => r.annualShare), 1);
  const recRow = rec ? rows.find((r) => r.plan.id === rec.planId) : undefined;

  function set<K extends keyof OptimizerInputs>(k: K, v: OptimizerInputs[K]) {
    setState((p) => ({ ...p, [k]: v }));
  }

  function exportCsv() {
    const csvRows: (string | number)[][] = [
      ["INPUTS"],
      [
        "Monthly gross",
        Math.round(gross),
        state.mode === "adr" ? "From ADR x utilization" : "Entered directly",
      ],
      ["Trips per year", state.tripsPerYear || "0"],
      ["Car value", state.carValue || "0"],
      ["Photo protocol", state.photoProtocol === "strong" ? "Strong" : "Still building"],
      ["Risk tolerance", state.riskTolerance === "low" ? "Low" : "Comfortable"],
      [],
      ["PLAN COMPARISON", ...rows.map((r) => r.plan.label)],
      ["Host share of gross", ...rows.map((r) => `${Math.round(r.plan.share * 100)}%`)],
      ["Monthly host share", ...rows.map((r) => Math.round(r.monthlyShare))],
      ["Annual host share", ...rows.map((r) => Math.round(r.annualShare))],
      ["Damage responsibility per claim", ...rows.map((r) => r.plan.damageResponsibility)],
      [
        "Extra annual income vs previous plan",
        ...rows.map((r) => (r.extraAnnualVsPrev === null ? "-" : Math.round(r.extraAnnualVsPrev))),
      ],
      [
        "Extra damage exposure vs previous plan",
        ...rows.map((r) => (r.extraDamageVsPrev === null ? "-" : r.extraDamageVsPrev)),
      ],
      [
        "Claims per year to erase the step-up",
        ...rows.map((r) => (r.claimsToErase === null ? "-" : r.claimsToErase.toFixed(1))),
      ],
      [],
      ["RECOMMENDATION"],
      [rec && recRow ? recRow.plan.label : "Enter gross and car value for a recommendation"],
      ...(rec ? rec.reasons.map((t) => [t]) : []),
      [],
      [CALC_DISCLAIMER],
    ];
    downloadCsv("earnings-plan-comparison.csv", buildCsv(TOOL_NAME, csvRows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Gross / mo</span>
          <span className="font-semibold text-near-black">{money(gross)}</span>
        </span>
      }
    >
      {/* Recommendation banner */}
      <div className="rounded-lg p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-near-black text-white">
        <div className="shrink-0">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
            Run this car on
          </p>
          <p className="font-display text-4xl font-semibold leading-none mt-1">
            {recRow ? `${Math.round(recRow.plan.share * 100)}%` : "?"}
          </p>
        </div>
        <div className="flex-1">
          {rec && recRow ? (
            <>
              <p className="font-sans text-sm font-semibold text-warm-gold">
                {recRow.plan.label}
              </p>
              <ul className="mt-1 space-y-1">
                {rec.reasons.map((t) => (
                  <li key={t} className="font-sans text-sm leading-relaxed text-white/90">
                    {t}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="font-sans text-sm leading-relaxed">
              Enter your gross and the car&rsquo;s value to get a recommendation. The
              short version of the method: higher plans favor lower-value cars
              run with a strong photo protocol; lower plans favor high-value
              cars and hosts who cannot absorb a surprise bill.
            </p>
          )}
        </div>
        {recRow && (
          <div className="shrink-0 text-right">
            <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
              Worst case / claim
            </p>
            <p className="font-display text-3xl font-semibold leading-none mt-1">
              {money(recRow.plan.damageResponsibility)}
            </p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <InputSection title="Your gross">
            <div className="grid grid-cols-2 gap-2">
              <ModeButton
                active={state.mode === "adr"}
                onClick={() => set("mode", "adr")}
                label="Rate x utilization"
              />
              <ModeButton
                active={state.mode === "gross"}
                onClick={() => set("mode", "gross")}
                label="Monthly gross"
              />
            </div>
            {state.mode === "adr" ? (
              <>
                <Field label="Average daily rate" prefix="$" value={state.adr} onChange={(v) => set("adr", v)} hint="From Turo's Carculator plus comparable local listings. Be conservative." />
                <RangeField
                  label="Utilization"
                  value={state.utilizationPct}
                  onChange={(v) => set("utilizationPct", v)}
                  hint={`${state.utilizationPct || 0}% of days booked ≈ ${Math.round((parseFloat(state.utilizationPct) || 0) * 0.304)} booked days a month`}
                />
              </>
            ) : (
              <Field label="Expected monthly gross" prefix="$" value={state.grossMonthly} onChange={(v) => set("grossMonthly", v)} hint="Trip price before Turo's share. If the car is already live, use its trailing average." />
            )}
            <Field label="Trips per year" value={state.tripsPerYear} onChange={(v) => set("tripsPerYear", v)} hint="Turns the claim math into one-claim-every-N-trips context." />
          </InputSection>

          <InputSection title="The car and your risk">
            <Field label="Car value" prefix="$" value={state.carValue} onChange={(v) => set("carValue", v)} hint="What it would cost to replace this car today." />
            <ToggleRow
              label="Photo protocol"
              hint="Metadata-complete photos inside the 24-hour windows, every trip. Photos without date, time, and location metadata are invalid for claims."
              options={[
                { id: "strong", label: "Strong, every trip" },
                { id: "building", label: "Still building it" },
              ]}
              value={state.photoProtocol}
              onChange={(v) => set("photoProtocol", v as OptimizerInputs["photoProtocol"])}
            />
            <ToggleRow
              label="A surprise bill at the worst-case number would..."
              options={[
                { id: "comfortable", label: "Sting, not sink me" },
                { id: "low", label: "Genuinely hurt" },
              ]}
              value={state.riskTolerance}
              onChange={(v) => set("riskTolerance", v as OptimizerInputs["riskTolerance"])}
            />
            <p className="font-sans text-[11px] text-charcoal/50">
              Rule of thumb in this tool: under {money(CAR_VALUE_LOW)} counts as
              lower-value, over {money(CAR_VALUE_HIGH)} as high-value. Heuristic,
              not a platform figure.
            </p>
          </InputSection>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Plan cards */}
          <div className="grid sm:grid-cols-3 gap-3">
            {rows.map((r) => {
              const recommended = rec?.planId === r.plan.id;
              return (
                <div
                  key={r.plan.id}
                  className={[
                    "rounded-lg border-2 p-4 bg-white flex flex-col gap-2",
                    recommended ? "border-primary-green" : "border-light-gray",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-3xl font-semibold text-near-black leading-none">
                      {Math.round(r.plan.share * 100)}%
                    </p>
                    {recommended && (
                      <span className="font-sans text-[10px] font-semibold tracking-[0.1em] uppercase bg-primary-green text-white rounded px-1.5 py-0.5">
                        Our pick
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-charcoal/70 leading-tight">
                    {r.plan.label}
                  </p>
                  <div>
                    <p className="font-sans text-[11px] text-charcoal/50">Host share</p>
                    <p className="font-sans text-sm font-semibold text-near-black tabular-nums">
                      {money(r.monthlyShare)}/mo · {money(r.annualShare)}/yr
                    </p>
                    <div className="h-1.5 mt-1 rounded-full bg-light-gray overflow-hidden">
                      <div
                        className="h-full rounded-full bg-warm-gold"
                        style={{ width: `${Math.max((r.annualShare / maxAnnual) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] text-charcoal/50">Damage responsibility</p>
                    <p className="font-sans text-sm font-semibold text-terracotta tabular-nums">
                      {money(r.plan.damageResponsibility)} / claim
                    </p>
                  </div>
                  <p className="font-sans text-[11px] text-charcoal/60 leading-tight mt-auto">
                    {r.extraAnnualVsPrev === null
                      ? "The floor plan: smallest share, smallest worst case."
                      : `${money(r.extraAnnualVsPrev)}/yr more than the previous plan, ${money(r.extraDamageVsPrev ?? 0)} more exposure per claim.`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-off-white border-b border-light-gray">
              <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                Same car, three plans
              </p>
            </div>
            {/* Label column plus three plan columns: it fits 375px on phone
                gutters, so this stays a real table rather than three cards. */}
            <div className="overflow-x-auto">
              <table className="w-full font-sans text-sm">
                <thead>
                  <tr className="border-b border-light-gray">
                    <th className="text-left px-2.5 sm:px-4 py-2 font-semibold text-charcoal/70 text-xs" />
                    {rows.map((r) => (
                      <th
                        key={r.plan.id}
                        className={[
                          "text-right px-2.5 sm:px-4 py-2 font-semibold text-xs whitespace-nowrap",
                          rec?.planId === r.plan.id ? "text-primary-green" : "text-charcoal/70",
                        ].join(" ")}
                      >
                        {Math.round(r.plan.share * 100)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/70">
                  <CompareRow label="Monthly host share" cells={rows.map((r) => money(r.monthlyShare))} />
                  <CompareRow label="Annual host share" cells={rows.map((r) => money(r.annualShare))} strong />
                  <CompareRow label="Damage responsibility / claim" cells={rows.map((r) => money(r.plan.damageResponsibility))} danger />
                  <CompareRow
                    label="Extra income vs previous plan / yr"
                    cells={rows.map((r) => (r.extraAnnualVsPrev === null ? "-" : `+${money(r.extraAnnualVsPrev)}`))}
                  />
                  <CompareRow
                    label="Claims per year to erase the step-up"
                    cells={rows.map((r) => (r.claimsToErase === null ? "-" : r.claimsToErase.toFixed(1)))}
                    strong
                  />
                  <CompareRow
                    label="That is one claim every"
                    cells={rows.map((r) =>
                      r.tripsPerErasingClaim === null ? "-" : `${Math.round(r.tripsPerErasingClaim)} trips`,
                    )}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Gut check */}
          <div className="bg-cream border border-warm-gold/40 rounded-lg p-4 space-y-2">
            <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
              The gut check
            </p>
            {gross > 0 ? (
              rows
                .filter((r) => r.claimsToErase !== null)
                .map((r) => (
                  <p key={r.plan.id} className="font-sans text-sm text-near-black leading-relaxed">
                    Stepping up to <span className="font-semibold">{Math.round(r.plan.share * 100)}%</span> pays
                    about <span className="font-semibold">{money(r.extraAnnualVsPrev ?? 0)}</span> more a year and
                    raises your exposure by {money(r.extraDamageVsPrev ?? 0)} per claim. It takes about{" "}
                    <span className="font-semibold">{(r.claimsToErase ?? 0).toFixed(1)} claims in a year</span>
                    {r.tripsPerErasingClaim !== null && (
                      <> (one every {Math.round(r.tripsPerErasingClaim)} trips at your volume)</>
                    )}{" "}
                    to erase that step-up.
                  </p>
                ))
            ) : (
              <p className="font-sans text-sm text-charcoal/70">
                Enter a gross above and this panel shows how many claims a year
                it takes to erase each plan step-up.
              </p>
            )}
            <p className="font-sans text-[11px] text-charcoal/50 leading-relaxed">
              Damage responsibility applies to all claim types, and photos
              without metadata are invalid, so the higher plans only make sense
              on top of a disciplined photo protocol. In variable-share pilot
              markets, advance bookings can pay more; this uses the standard
              share.
            </p>
          </div>

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

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg border-2 px-2 py-2 text-center font-sans text-sm font-medium transition-colors",
        active
          ? "border-primary-green bg-primary-green/10 text-near-black"
          : "border-light-gray bg-white text-charcoal/70 hover:border-charcoal/30",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={[
              "rounded-lg border-2 px-2 py-2 text-center font-sans text-sm transition-colors",
              value === o.id
                ? "border-primary-green bg-primary-green/10 text-near-black font-medium"
                : "border-light-gray bg-white text-charcoal/70 hover:border-charcoal/30",
            ].join(" ")}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="font-sans text-[11px] text-charcoal/50 mt-1">{hint}</p>}
    </div>
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

function RangeField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
        {label}
      </label>
      <input
        type="range"
        min={20}
        max={90}
        step={5}
        value={parseFloat(value) || 55}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full accent-[#5b9a2f]"
      />
      {hint && <p className="font-sans text-[11px] text-charcoal/50 mt-1">{hint}</p>}
    </div>
  );
}

function CompareRow({
  label,
  cells,
  strong,
  danger,
}: {
  label: string;
  cells: string[];
  strong?: boolean;
  danger?: boolean;
}) {
  return (
    <tr className={strong ? "bg-warm-gold/10" : ""}>
      <td className={`px-2.5 sm:px-4 py-2.5 text-sm ${strong ? "font-semibold text-near-black" : "text-charcoal/80"}`}>
        {label}
      </td>
      {cells.map((c, i) => (
        <td
          key={i}
          className={[
            "px-2.5 sm:px-4 py-2.5 text-right tabular-nums whitespace-nowrap",
            strong ? "font-bold" : "font-medium",
            danger ? "text-terracotta" : "text-near-black",
          ].join(" ")}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}
