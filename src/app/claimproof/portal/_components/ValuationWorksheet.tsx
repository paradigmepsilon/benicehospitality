"use client";

import { useState } from "react";
import { downloadCSV, money, num } from "./client-utils";
import { useSyncedState } from "./sync-client";
import { EXAMPLE_VALUATION_ROWS } from "./ExampleData";
import { ExampleToggle, ExampleBanner } from "./ExampleUI";

/**
 * The flagship Valuation Pack tool: shop estimate vs. initial appraisal,
 * line by line. Totals both columns, computes the gap, and flags the largest
 * differences (the order a supplement should present them in). Account-synced;
 * CSV export for the supplement packet. Example mode shows the shared
 * fictional claim completed correctly without touching the buyer's rows.
 */

type Row = { item: string; shop: string; appraisal: string };

const BLANK: Row = { item: "", shop: "", appraisal: "" };

export default function ValuationWorksheet({ claimId }: { claimId: number | null }) {
  const [ownRows, setRows] = useSyncedState<Row[]>("valuation-rows", claimId, [
    { ...BLANK },
    { ...BLANK },
    { ...BLANK },
  ]);
  const [example, setExample] = useState(false);
  const rows = example ? EXAMPLE_VALUATION_ROWS : ownRows;

  const set = (i: number, field: keyof Row, v: string) =>
    setRows((p) => p.map((r, j) => (j === i ? { ...r, [field]: v } : r)));

  const filled = rows.filter((r) => r.item.trim() !== "");
  const shopTotal = filled.reduce((s, r) => s + num(r.shop), 0);
  const apprTotal = filled.reduce((s, r) => s + num(r.appraisal), 0);
  const gap = shopTotal - apprTotal;

  // Top-3 largest positive differences, flagged in the table.
  const topGaps = new Set(
    filled
      .map((r) => ({ i: rows.indexOf(r), d: num(r.shop) - num(r.appraisal) }))
      .filter((x) => x.d > 0)
      .sort((a, b) => b.d - a.d)
      .slice(0, 3)
      .map((x) => x.i),
  );

  return (
    <div className="rounded-[1.4rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
      <div className="rounded-[calc(1.4rem-0.375rem)] bg-[#2A2932] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:p-6">
        <div className="cp-noprint mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {example ? "Completed example" : "Your comparison"}
          </p>
          <ExampleToggle on={example} onToggle={setExample} />
        </div>
        {example && <ExampleBanner />}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-white/15 font-sans text-[11px] uppercase tracking-wider text-white/45">
                <th className="py-2 pr-3 text-left font-semibold">Line item</th>
                <th className="w-28 py-2 pr-3 text-right font-semibold">Shop</th>
                <th className="w-28 py-2 pr-3 text-right font-semibold">Appraisal</th>
                <th className="w-28 py-2 text-right font-semibold">Difference</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const d = num(r.shop) - num(r.appraisal);
                const flagged = topGaps.has(i);
                return (
                  <tr key={i} className="border-b border-white/8">
                    <td className="py-1.5 pr-3">
                      <input
                        value={r.item}
                        onChange={(e) => set(i, "item", e.target.value)}
                        readOnly={example}
                        placeholder="e.g. Parking sensor calibration"
                        className={
                          "w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 font-sans text-sm outline-none transition-colors placeholder:text-white/25 " +
                          (example
                            ? "cursor-default text-[#9FB6CC]"
                            : "text-white focus:border-[#E19C63] focus:bg-white/[0.03]")
                        }
                      />
                    </td>
                    {(["shop", "appraisal"] as const).map((f) => (
                      <td key={f} className="py-1.5 pr-3">
                        <input
                          value={r[f]}
                          onChange={(e) => set(i, f, e.target.value)}
                          readOnly={example}
                          inputMode="decimal"
                          placeholder="0"
                          className={
                            "w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-right font-sans text-sm tabular-nums outline-none transition-colors placeholder:text-white/25 " +
                            (example
                              ? "cursor-default text-[#9FB6CC]"
                              : "text-white focus:border-[#E19C63] focus:bg-white/[0.03]")
                          }
                        />
                      </td>
                    ))}
                    <td
                      className={
                        "py-1.5 text-right font-sans text-sm font-semibold tabular-nums " +
                        (d > 0
                          ? flagged
                            ? "text-[#E19C63]"
                            : "text-white/85"
                          : "text-white/35")
                      }
                    >
                      {r.item.trim() ? money(d) : ""}
                      {flagged && (
                        <span className="ml-1 align-middle text-[10px] uppercase tracking-wider text-[#E19C63]">
                          ▲
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-right">
                      {!example && (
                        <button
                          onClick={() =>
                            setRows((p) => p.filter((_, j) => j !== i))
                          }
                          aria-label="Remove line"
                          className="cursor-pointer px-1 font-sans text-white/30 transition-colors hover:text-[#E19C63]"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!example && (
          <div className="cp-noprint mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRows((p) => [...p, { ...BLANK }])}
              className="cursor-pointer rounded-full border border-white/20 px-4 py-1.5 font-sans text-xs font-semibold text-white/70 transition-all duration-300 hover:border-[#E19C63] hover:text-[#E19C63] active:scale-[0.97]"
            >
              + Add line
            </button>
            <button
              onClick={() =>
                downloadCSV(
                  "valuation-gap-comparison.csv",
                  ["Line item", "Shop estimate", "Initial appraisal", "Difference"],
                  filled.map((r) => [
                    r.item,
                    num(r.shop),
                    num(r.appraisal),
                    num(r.shop) - num(r.appraisal),
                  ]),
                )
              }
              disabled={filled.length === 0}
              className="cursor-pointer rounded-full border border-[#E19C63]/50 px-4 py-1.5 font-sans text-xs font-semibold text-[#E19C63] transition-all duration-300 hover:bg-[#E19C63] hover:text-[#27262E] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export CSV
            </button>
            <span className="font-sans text-[11px] text-white/35">
              ▲ = your three largest gaps; lead your supplement with these
            </span>
          </div>
        )}

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/12 pt-5">
          {(
            [
              ["Shop total", shopTotal, "text-white"],
              ["Appraisal total", apprTotal, "text-white"],
              ["Valuation gap", gap, gap > 0 ? "text-[#E19C63]" : "text-white/60"],
            ] as const
          ).map(([label, v, cls]) => (
            <div key={label}>
              <dt className="font-sans text-[11px] uppercase tracking-wider text-white/45">
                {label}
              </dt>
              <dd className={`font-display text-xl md:text-2xl font-semibold tabular-nums ${cls}`}>
                {money(v)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
