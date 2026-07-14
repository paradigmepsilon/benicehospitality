"use client";

import { useState } from "react";
import { money, num } from "./client-utils";
import { useSyncedState } from "./sync-client";
import { EXAMPLE_ECONOMICS } from "./ExampleData";
import { ExampleToggle, ExampleBanner } from "./ExampleUI";

/**
 * Claim Economics Worksheet: the full business cost of the claim, including
 * the input most hosts forget to price, their own hours. The verdict line
 * frames the fight-or-fold call without making it for them.
 */

type Inputs = {
  shop: string;
  appraisal: string;
  deductible: string;
  perDay: string;
  idleDays: string;
  adminHours: string;
  hourValue: string;
};

const FIELDS: Array<{ id: keyof Inputs; label: string; hint: string }> = [
  { id: "shop", label: "Body-shop estimate ($)", hint: "What the repair actually costs" },
  { id: "appraisal", label: "Initial appraisal ($)", hint: "What the valuation came back at" },
  { id: "deductible", label: "Deductible ($)", hint: "Your out-of-pocket for this claim" },
  { id: "perDay", label: "Net revenue per day ($)", hint: "What this car clears daily" },
  { id: "idleDays", label: "Idle days", hint: "Actual or expected days out of service" },
  { id: "adminHours", label: "Your hours on this claim", hint: "Honest estimate, so far + expected" },
  { id: "hourValue", label: "Your hour is worth ($)", hint: "What an hour of your time trades at" },
];

export default function EconomicsWorksheet({ claimId }: { claimId: number | null }) {
  const [own, setV] = useSyncedState<Inputs>("economics", claimId, {
    shop: "",
    appraisal: "",
    deductible: "0",
    perDay: "60",
    idleDays: "",
    adminHours: "",
    hourValue: "50",
  });
  const [example, setExample] = useState(false);
  const v = example ? EXAMPLE_ECONOMICS : own;

  const shortfall = Math.max(0, num(v.shop) - num(v.appraisal));
  const lostIncome = num(v.perDay) * num(v.idleDays);
  const adminCost = num(v.adminHours) * num(v.hourValue);
  const total = shortfall + num(v.deductible) + lostIncome + adminCost;

  return (
    <div>
      <div className="cp-noprint mb-4 flex justify-end">
        <ExampleToggle on={example} onToggle={setExample} />
      </div>
      {example && <ExampleBanner />}
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
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

      <div className="rounded-2xl border border-[#E19C63]/30 bg-[#E19C63]/[0.05] p-5 md:p-7 lg:sticky lg:top-24">
        <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#E19C63]">
          True claim cost
        </p>
        <dl className="space-y-3">
          {(
            [
              ["Repair shortfall", shortfall],
              ["Deductible", num(v.deductible)],
              ["Lost rental income", lostIncome],
              ["Your time", adminCost],
            ] as const
          ).map(([label, amt]) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <dt className="font-sans text-sm text-white/70">{label}</dt>
              <dd className="font-display text-lg font-semibold text-white tabular-nums">{money(amt)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-white/15 pt-5">
          <span className="font-sans text-sm font-semibold uppercase tracking-wider text-[#E19C63]">Total exposure</span>
          <span className="font-display text-3xl md:text-4xl font-semibold text-[#E19C63] tabular-nums">{money(total)}</span>
        </div>
        {shortfall > 0 && adminCost > 0 && (
          <p className="mt-4 font-sans text-sm leading-relaxed text-white/70">
            {shortfall > adminCost * 2
              ? "The gap is well above the cost of your time. The supplement process is worth running properly."
              : shortfall < adminCost
                ? "Your time is currently pricing higher than the gap. Cap the hours: one clean supplement, one follow-up cadence, then the Decision Matrix call."
                : "Gap and time cost are close. Run one clean supplement, but set the hours cap now, before frustration sets it for you."}
          </p>
        )}
        <p className="mt-4 font-sans text-[11px] leading-relaxed text-white/35">
          Illustrative, from your inputs. Estimates a cost of the situation, not a recovery amount.
        </p>
      </div>
    </div>
    </div>
  );
}
