"use client";

import { useState } from "react";
import { downloadCSV, money, num } from "./client-utils";
import { useSyncedState } from "./sync-client";
import { EXAMPLE_FLEET_CLAIMS } from "./ExampleData";
import { ExampleToggle, ExampleBanner } from "./ExampleUI";

/**
 * Multi-Vehicle Claim Tracker (Fleet tier). One card per open claim; the two
 * fields that run the weekly review are Next Action and Owner. Synced at the
 * workspace level, so the whole fleet team sees the same live tracker, with
 * CSV export for an outside backup or a shared spreadsheet.
 */

type Claim = {
  vehicle: string;
  trip: string;
  discovered: string;
  stage: string;
  appraisal: string;
  shopEst: string;
  idleDays: string;
  owner: string;
  lastContact: string;
  nextAction: string;
  nextActionDate: string;
  status: "open" | "closed";
};

const STAGES = [
  "Documenting",
  "Filed, awaiting contact",
  "Awaiting appraisal",
  "Supplement submitted",
  "In repair",
  "Awaiting payment",
  "Closed",
];

const BLANK: Claim = {
  vehicle: "",
  trip: "",
  discovered: "",
  stage: STAGES[0],
  appraisal: "",
  shopEst: "",
  idleDays: "",
  owner: "",
  lastContact: "",
  nextAction: "",
  nextActionDate: "",
  status: "open",
};

export default function FleetTracker() {
  // Workspace-scoped (null claim): the fleet tracker lists every vehicle's
  // claim, so it lives at the account level, not under one claim.
  const [ownClaims, setClaims] = useSyncedState<Claim[]>("fleet-claims", null, []);
  const [example, setExample] = useState(false);
  const claims = example ? EXAMPLE_FLEET_CLAIMS : ownClaims;

  const set = (i: number, f: keyof Claim, v: string) =>
    setClaims((p) => p.map((c, j) => (j === i ? { ...c, [f]: v } : c)));

  const open = claims.filter((c) => c.status === "open");
  const totalGap = open.reduce(
    (s, c) => s + Math.max(0, num(c.shopEst) - num(c.appraisal)),
    0,
  );

  const field =
    "w-full rounded-md border border-white/12 bg-white/[0.03] px-2.5 py-1.5 font-sans text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#E19C63]";
  const label = "mb-1 block font-sans text-[11px] text-white/50";

  return (
    <div className="space-y-5">
      <div className="cp-noprint flex justify-end">
        <ExampleToggle on={example} onToggle={setExample} />
      </div>
      {example && <ExampleBanner />}

      {/* fleet summary */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-2xl border border-white/12 bg-white/[0.02] px-5 py-4">
        {(
          [
            ["Open claims", String(open.length)],
            ["Combined valuation gap", money(totalGap)],
            [
              "Missing next action",
              String(open.filter((c) => !c.nextAction.trim()).length),
            ],
          ] as const
        ).map(([l, v]) => (
          <div key={l}>
            <p className="font-sans text-[11px] uppercase tracking-wider text-white/45">{l}</p>
            <p className="font-display text-xl font-semibold text-white tabular-nums">{v}</p>
          </div>
        ))}
        {!example && (
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setClaims((p) => [{ ...BLANK }, ...p])}
            className="rounded-full bg-[#E19C63] px-4 py-1.5 font-sans text-xs font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183]"
          >
            + New claim
          </button>
          <button
            onClick={() =>
              downloadCSV(
                "fleet-claim-tracker.csv",
                ["Vehicle", "Trip", "Discovered", "Stage", "Appraisal", "Shop estimate", "Gap", "Idle days", "Owner", "Last contact", "Next action", "Next action date", "Status"],
                claims.map((c) => [
                  c.vehicle, c.trip, c.discovered, c.stage,
                  num(c.appraisal), num(c.shopEst),
                  Math.max(0, num(c.shopEst) - num(c.appraisal)),
                  c.idleDays, c.owner, c.lastContact, c.nextAction, c.nextActionDate, c.status,
                ]),
              )
            }
            disabled={claims.length === 0}
            className="rounded-full border border-[#E19C63]/50 px-4 py-1.5 font-sans text-xs font-semibold text-[#E19C63] transition-colors hover:bg-[#E19C63] hover:text-[#27262E] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
        )}
      </div>

      {claims.length === 0 && (
        <p className="font-sans text-sm text-white/45">
          No claims tracked yet. Add one the moment a handoff form lands.
        </p>
      )}

      {claims.map((c, i) => {
        const gap = Math.max(0, num(c.shopEst) - num(c.appraisal));
        const missingAction = c.status === "open" && !c.nextAction.trim();
        return (
          <div
            key={i}
            className={
              "rounded-2xl border p-5 " +
              (c.status === "closed"
                ? "border-white/8 bg-white/[0.01] opacity-60"
                : missingAction
                  ? "border-[#E19C63]/40 bg-[#E19C63]/[0.05]"
                  : "border-white/12 bg-white/[0.02]")
            }
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-sans font-bold text-white">
                {c.vehicle || "Unnamed vehicle"}{" "}
                {gap > 0 && (
                  <span className="ml-2 font-sans text-xs font-semibold text-[#E19C63]">
                    gap {money(gap)}
                  </span>
                )}
                {missingAction && (
                  <span className="ml-2 font-sans text-[10px] font-bold uppercase tracking-wider text-[#E19C63]">
                    No next action
                  </span>
                )}
              </p>
              {!example && (
              <div className="flex gap-2">
                <button
                  onClick={() => set(i, "status", c.status === "open" ? "closed" : "open")}
                  className="rounded-full border border-white/20 px-3 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-white/60 transition-colors hover:text-white"
                >
                  {c.status === "open" ? "Close" : "Reopen"}
                </button>
                <button
                  onClick={() => setClaims((p) => p.filter((_, j) => j !== i))}
                  aria-label="Delete claim"
                  className="px-1 font-sans text-white/30 hover:text-[#E19C63]"
                >
                  ×
                </button>
              </div>
              )}
            </div>
            <fieldset disabled={example} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <label className="block"><span className={label}>Vehicle</span>
                <input value={c.vehicle} onChange={(e) => set(i, "vehicle", e.target.value)} placeholder="2022 Camry ABC1234" className={field} /></label>
              <label className="block"><span className={label}>Trip #</span>
                <input value={c.trip} onChange={(e) => set(i, "trip", e.target.value)} className={field} /></label>
              <label className="block"><span className={label}>Discovered</span>
                <input type="date" value={c.discovered} onChange={(e) => set(i, "discovered", e.target.value)} className={field} /></label>
              <label className="block"><span className={label}>Stage</span>
                <select value={c.stage} onChange={(e) => set(i, "stage", e.target.value)} className={field}>
                  {STAGES.map((s) => <option key={s} value={s} className="bg-[#27262E]">{s}</option>)}
                </select></label>
              <label className="block"><span className={label}>Appraisal ($)</span>
                <input inputMode="decimal" value={c.appraisal} onChange={(e) => set(i, "appraisal", e.target.value)} className={field} /></label>
              <label className="block"><span className={label}>Shop estimate ($)</span>
                <input inputMode="decimal" value={c.shopEst} onChange={(e) => set(i, "shopEst", e.target.value)} className={field} /></label>
              <label className="block"><span className={label}>Idle days</span>
                <input inputMode="numeric" value={c.idleDays} onChange={(e) => set(i, "idleDays", e.target.value)} className={field} /></label>
              <label className="block"><span className={label}>Owner</span>
                <input value={c.owner} onChange={(e) => set(i, "owner", e.target.value)} placeholder="Who works this" className={field} /></label>
              <label className="block"><span className={label}>Last contact</span>
                <input type="date" value={c.lastContact} onChange={(e) => set(i, "lastContact", e.target.value)} className={field} /></label>
              <label className="block sm:col-span-2"><span className={label}>Next action</span>
                <input value={c.nextAction} onChange={(e) => set(i, "nextAction", e.target.value)} placeholder="e.g. Script 5 if no reply by Fri" className={field} /></label>
              <label className="block"><span className={label}>Action date</span>
                <input type="date" value={c.nextActionDate} onChange={(e) => set(i, "nextActionDate", e.target.value)} className={field} /></label>
            </fieldset>
          </div>
        );
      })}
    </div>
  );
}
