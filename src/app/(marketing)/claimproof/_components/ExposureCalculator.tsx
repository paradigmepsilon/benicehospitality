"use client";

import { useState } from "react";

/**
 * ExposureCalculator — the "repair gap is only half the loss" tool from the v2
 * brief. Visitor enters the shop estimate, the initial appraisal, their
 * deductible, average net revenue per rental day, and idle days. We show:
 *   - repair shortfall  (shop - appraisal, floored at 0)
 *   - lost rental income (net/day * idle days)
 *   - total exposure     (shortfall + deductible + lost income)
 *
 * Purely illustrative. It models the host's OWN inputs; it does not promise a
 * recovery amount and does not claim the product controls repair timelines.
 * The disclaimer under the result says so plainly.
 */

function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

type Field = "shop" | "appraisal" | "deductible" | "perDay" | "idleDays";

const FIELDS: Array<{ id: Field; label: string; hint: string; prefix?: string }> = [
  { id: "shop", label: "Body-shop estimate", hint: "What the repair actually costs", prefix: "$" },
  { id: "appraisal", label: "Initial appraisal", hint: "What Turo's valuation came back at", prefix: "$" },
  { id: "deductible", label: "Your deductible", hint: "Out of pocket per claim", prefix: "$" },
  { id: "perDay", label: "Net revenue / day", hint: "What this car clears on an average day", prefix: "$" },
  { id: "idleDays", label: "Idle days", hint: "Days the car sits during the claim" },
];

export default function ExposureCalculator() {
  // Pre-filled with the documented illustrative example so the tool reads as
  // populated on load. Visitors overwrite with their own numbers.
  const [v, setV] = useState<Record<Field, string>>({
    shop: "8800",
    appraisal: "5700",
    deductible: "0",
    perDay: "60",
    idleDays: "45",
  });

  const num = (f: Field) => {
    const n = parseFloat(v[f]);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const shortfall = Math.max(0, num("shop") - num("appraisal"));
  const lostIncome = num("perDay") * num("idleDays");
  const total = shortfall + num("deductible") + lostIncome;

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* inputs */}
      <div className="space-y-4">
        {FIELDS.map((f) => (
          <label key={f.id} className="block">
            <span className="font-sans text-sm font-semibold text-white/85">
              {f.label}
            </span>
            <span className="block font-sans text-xs text-white/45 mb-2">
              {f.hint}
            </span>
            <div className="relative">
              {f.prefix && (
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-sans text-white/40">
                  {f.prefix}
                </span>
              )}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={v[f.id]}
                onChange={(e) => setV((p) => ({ ...p, [f.id]: e.target.value }))}
                className={
                  "w-full rounded-lg border border-white/12 bg-white/[0.03] py-3 font-sans text-white outline-none transition-colors focus:border-warm-gold " +
                  (f.prefix ? "pl-8 pr-4" : "px-4")
                }
              />
            </div>
          </label>
        ))}
      </div>

      {/* result */}
      <div className="rounded-2xl border border-warm-gold/30 bg-warm-gold/[0.05] p-6 md:p-8 lg:sticky lg:top-24">
        <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-warm-gold mb-6">
          Your estimated exposure
        </p>
        <dl className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-sans text-sm text-white/70">Repair shortfall</dt>
            <dd className="font-display text-xl font-semibold text-white tabular-nums">
              {money(shortfall)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-sans text-sm text-white/70">Deductible</dt>
            <dd className="font-display text-xl font-semibold text-white tabular-nums">
              {money(num("deductible"))}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-sans text-sm text-white/70">
              Lost rental income
            </dt>
            <dd className="font-display text-xl font-semibold text-white tabular-nums">
              {money(lostIncome)}
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-white/15 pt-6 flex items-baseline justify-between gap-4">
          <span className="font-sans text-sm font-semibold uppercase tracking-wider text-warm-gold">
            Total exposure
          </span>
          <span className="font-display text-4xl md:text-5xl font-semibold text-warm-gold tabular-nums">
            {money(total)}
          </span>
        </div>
        {/* post-result conversion beat: exposure → action */}
        <div className="mt-6 border-t border-white/15 pt-6">
          <p className="font-sans text-sm font-semibold text-white mb-4">
            Build the file before this gap becomes yours.
          </p>
          <a
            href="#pricing"
            className="inline-flex w-full items-center justify-center rounded-full bg-warm-gold px-6 py-3.5 font-sans text-sm font-semibold text-near-black transition-all duration-300 hover:bg-gold-light active:scale-[0.98]"
          >
            Get Complete Claim Defense
          </a>
        </div>
        <p className="mt-5 font-sans text-xs leading-relaxed text-white/40">
          Illustrative only, based on the numbers you enter. It does not predict
          a recovery amount, and no system controls how long a repair or claim
          takes. The kit helps you document, compare, and follow up more
          systematically, so avoidable losses are smaller.
        </p>
      </div>
    </div>
  );
}
