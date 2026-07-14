"use client";

import { useState } from "react";
import { money, num, pct, dec1, downloadCSV } from "./client-utils";
import { useSyncedState } from "./sync-client";
import { EXAMPLE_FLEET_KPI } from "./ExampleData";
import { ExampleToggle, ExampleBanner } from "./ExampleUI";

/**
 * Fleet Claim KPI Dashboard: the owner enters one period's raw numbers (pulled
 * from the Fleet Tracker export) and the eight KPIs from the KPI Guide compute
 * live. Workspace-scoped (not per-claim), so it syncs across the whole team.
 *
 * Signal coloring is deliberately restrained: only the three KPIs the Guide
 * states as ABSOLUTE rules (100% filed in window, response under one business
 * day, zero repeat failures) get a good/watch tint. The trend-based metrics
 * stay neutral, because a single month cannot say whether they are good or bad.
 */

type Inputs = {
  trips: string;
  claims: string;
  filedInWindow: string;
  supplements: string;
  gapTotal: string;
  recovered: string;
  absorbed: string;
  idleDaysTotal: string;
  closedClaims: string;
  closeDaysTotal: string;
  responseDays: string;
  repeatFailures: string;
};

const BLANK: Inputs = {
  trips: "",
  claims: "",
  filedInWindow: "",
  supplements: "",
  gapTotal: "",
  recovered: "",
  absorbed: "",
  idleDaysTotal: "",
  closedClaims: "",
  closeDaysTotal: "",
  responseDays: "",
  repeatFailures: "",
};

const FIELDS: Array<{ id: keyof Inputs; label: string; hint: string }> = [
  { id: "trips", label: "Trips this period", hint: "Completed trips across the fleet" },
  { id: "claims", label: "Claims opened", hint: "Damage claims started this period" },
  { id: "filedInWindow", label: "Filed inside 24h", hint: "Claims reported within the window" },
  { id: "supplements", label: "Needed a supplement", hint: "Claims where you pushed the number" },
  { id: "gapTotal", label: "Total initial gap ($)", hint: "Sum of shop-vs-appraisal gaps" },
  { id: "recovered", label: "Dollars recovered ($)", hint: "Reimbursed across closed claims" },
  { id: "absorbed", label: "Dollars absorbed ($)", hint: "What the business ate" },
  { id: "idleDaysTotal", label: "Total idle days", hint: "Days out of service, all claims" },
  { id: "closedClaims", label: "Claims closed", hint: "Claims resolved this period" },
  { id: "closeDaysTotal", label: "Total days to close", hint: "Sum of open-to-close days" },
  { id: "responseDays", label: "Your avg response (days)", hint: "Business days, your side" },
  { id: "repeatFailures", label: "Repeat-incident cars/staff", hint: "Same vehicle or person, again" },
];

type Signal = "good" | "watch" | null;

export default function FleetKpiDashboard() {
  const [own, setV] = useSyncedState<Inputs>("fleet-kpi", null, BLANK);
  const [example, setExample] = useState(false);
  const v = example ? EXAMPLE_FLEET_KPI : own;

  const trips = num(v.trips);
  const claims = num(v.claims);
  const recovered = num(v.recovered);
  const absorbed = num(v.absorbed);
  const closed = num(v.closedClaims);

  const claimsPer100 = trips > 0 ? (claims / trips) * 100 : null;
  const pctFiled = claims > 0 ? (num(v.filedInWindow) / claims) * 100 : null;
  const pctSupp = claims > 0 ? (num(v.supplements) / claims) * 100 : null;
  const avgGap = claims > 0 ? num(v.gapTotal) / claims : null;
  const recoveryRate = recovered + absorbed > 0 ? (recovered / (recovered + absorbed)) * 100 : null;
  const avgIdle = claims > 0 ? num(v.idleDaysTotal) / claims : null;
  const avgClose = closed > 0 ? num(v.closeDaysTotal) / closed : null;
  const avgResponse = v.responseDays.trim() === "" ? null : num(v.responseDays);
  const repeats = num(v.repeatFailures);

  // Signals only where the Guide states an absolute rule.
  const filedSignal: Signal = pctFiled === null ? null : pctFiled >= 100 ? "good" : "watch";
  const responseSignal: Signal =
    avgResponse === null ? null : avgResponse <= 1 ? "good" : "watch";
  const repeatSignal: Signal =
    v.repeatFailures.trim() === "" ? null : repeats === 0 ? "good" : "watch";

  const cards: Array<{
    label: string;
    value: string;
    watch: string;
    signal: Signal;
  }> = [
    { label: "Claims per 100 trips", value: claimsPer100 === null ? "—" : dec1(claimsPer100), watch: "Track the trend, not one month", signal: null },
    { label: "Filed inside the window", value: pct(pctFiled), watch: "Anything under 100% is a handoff fix", signal: filedSignal },
    { label: "Avg initial valuation gap", value: avgGap === null ? "—" : money(avgGap), watch: "Big gaps mean thin documentation", signal: null },
    { label: "Requiring supplements", value: pct(pctSupp), watch: "High share points at photo or paper quality", signal: null },
    { label: "Recovery rate", value: pct(recoveryRate), watch: "Recovered vs recovered plus absorbed", signal: null },
    { label: "Avg idle days per claim", value: avgIdle === null ? "—" : dec1(avgIdle), watch: "Rising stage over stage is the signal", signal: null },
    { label: "Avg days to close", value: avgClose === null ? "—" : dec1(avgClose), watch: "Process health, over time", signal: null },
    { label: "Your avg response", value: avgResponse === null ? "—" : `${dec1(avgResponse)} d`, watch: "The one number you fully control", signal: responseSignal },
    { label: "Repeat failures", value: v.repeatFailures.trim() === "" ? "—" : String(repeats), watch: "Any repeat is a lemon or a training gap", signal: repeatSignal },
  ];

  const tint = (sig: Signal) =>
    sig === "good"
      ? "border-[#8FBF86]/40 bg-[#8FBF86]/[0.07]"
      : sig === "watch"
        ? "border-[#E0916A]/45 bg-[#E0916A]/[0.07]"
        : "border-white/10 bg-white/[0.03]";
  const valueTint = (sig: Signal) =>
    sig === "good" ? "text-[#9ED194]" : sig === "watch" ? "text-[#E9A883]" : "text-white";

  function exportCsv() {
    downloadCSV(
      "fleet-claim-kpis.csv",
      ["KPI", "Value"],
      cards.map((c) => [c.label, c.value]),
    );
  }

  return (
    <div>
      <div className="cp-noprint mb-4 flex items-center justify-between gap-3">
        <button
          onClick={exportCsv}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E19C63]/45 px-4 py-1.5 font-sans text-xs font-semibold text-[#E19C63] transition-all duration-300 hover:bg-[#E19C63] hover:text-[#27262E] active:scale-[0.97]"
        >
          Export CSV
        </button>
        <ExampleToggle on={example} onToggle={setExample} />
      </div>
      {example && <ExampleBanner />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
        {/* the period's raw numbers */}
        <div>
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#8BA5BE]">
            This period&rsquo;s numbers
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.id} className="block">
                <span className="block font-sans text-sm font-semibold text-white/85">{f.label}</span>
                <span className="mb-1.5 block font-sans text-xs text-white/45">{f.hint}</span>
                <input
                  inputMode="decimal"
                  value={v[f.id]}
                  readOnly={example}
                  onChange={(e) => setV((p) => ({ ...p, [f.id]: e.target.value }))}
                  className={
                    "w-full rounded-md border border-white/12 bg-white/[0.03] px-3 py-2.5 font-sans text-sm outline-none transition-colors " +
                    (example ? "cursor-default text-[#9FB6CC]" : "text-white focus:border-[#E19C63]")
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* the computed KPIs */}
        <div className="lg:sticky lg:top-24">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#E19C63]">
            The eight numbers
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((c) => (
              <div key={c.label} className={"rounded-2xl border p-4 transition-colors " + tint(c.signal)}>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  {c.label}
                </p>
                <p className={"mt-1 font-display text-2xl font-semibold tabular-nums " + valueTint(c.signal)}>
                  {c.value}
                </p>
                <p className="mt-1.5 font-sans text-[11px] leading-relaxed text-white/40">{c.watch}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-sans text-[11px] leading-relaxed text-white/35">
            Computed from your inputs. Ten claims of history make these meaningful; two do not, so
            do not over-steer early. Green and amber appear only where the rule is absolute: file
            everything in the window, keep your response under a business day, and carry no repeats.
          </p>
        </div>
      </div>
    </div>
  );
}
