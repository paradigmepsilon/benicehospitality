"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  COST_CATEGORIES,
  COST_ALL_ITEMS,
} from "@/lib/resources/startup-cost-calculator/config";

const SLUG = "startup-cost-calculator";
const TOOL_NAME = getResourceTool(SLUG)!.name;

interface State {
  costs: Record<string, string>; // unit cost per item
  qty: Record<string, string>; // quantity per item (blank = 1)
  purchased: Record<string, boolean>;
}

const INITIAL: State = { costs: {}, qty: {}, purchased: {} };

function currency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function num(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
}

/** Quantity treated as 1 when the field is left blank. */
function effQty(v: string | undefined): number {
  if (v === undefined || v.trim() === "") return 1;
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function StartupCostTool() {
  const { state, setState, reset } = useResourceTool<State>(SLUG, INITIAL);

  // Fall back to empty maps so state persisted before qty/unit-cost existed
  // (old shape: { costs, purchased }) hydrates without throwing.
  const costs = state.costs ?? {};
  const qty = state.qty ?? {};
  const purchased = state.purchased ?? {};

  const lineTotal = (id: string) => num(costs[id]) * effQty(qty[id]);

  const totals = useMemo(() => {
    let grand = 0;
    let secured = 0;
    const byCategory: Record<string, number> = {};
    for (const cat of COST_CATEGORIES) {
      let sub = 0;
      for (const item of cat.items) {
        const line = num(costs[item.id]) * effQty(qty[item.id]);
        sub += line;
        grand += line;
        if (purchased[item.id]) secured += line;
      }
      byCategory[cat.id] = sub;
    }
    const securedPct = grand > 0 ? Math.round((secured / grand) * 100) : 0;
    return { grand, secured, securedPct, byCategory };
  }, [costs, qty, purchased]);

  function setCost(id: string, value: string) {
    setState((p) => ({ ...p, costs: { ...(p.costs ?? {}), [id]: value } }));
  }
  function setQty(id: string, value: string) {
    setState((p) => ({ ...p, qty: { ...(p.qty ?? {}), [id]: value } }));
  }
  function togglePurchased(id: string) {
    setState((p) => ({
      ...p,
      purchased: { ...(p.purchased ?? {}), [id]: !(p.purchased ?? {})[id] },
    }));
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Category", "Item", "Qty", "Unit Cost", "Line Total", "Purchased"],
    ];
    for (const cat of COST_CATEGORIES) {
      for (const item of cat.items) {
        rows.push([
          cat.label,
          item.label,
          effQty(qty[item.id]),
          num(costs[item.id]),
          lineTotal(item.id),
          purchased[item.id] ? "Yes" : "No",
        ]);
      }
    }
    rows.push([]);
    rows.push(["", "Total projected start-up budget", "", "", totals.grand, ""]);
    rows.push(["", "Secured so far", "", "", totals.secured, `${totals.securedPct}%`]);
    downloadCsv("startup-cost-projection.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Total</span>
          <span className="font-semibold text-near-black">
            {currency(totals.grand)}
          </span>
        </span>
      }
    >
      {/* Summary */}
      <div className="bg-near-black rounded-lg p-6 mb-8 text-white grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
            Total projected start-up budget
          </p>
          <p className="font-display text-4xl font-semibold">
            {currency(totals.grand)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
            Secured
          </p>
          <p className="font-display text-2xl font-semibold">
            {totals.securedPct}%
          </p>
          <p className="font-sans text-sm text-white/60">
            {currency(totals.secured)} purchased
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {COST_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-light-gray rounded-lg p-5 sm:p-6"
          >
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h3 className="font-display text-lg font-semibold text-near-black">
                {cat.label}
              </h3>
              <span className="font-sans text-sm font-semibold text-charcoal/70 shrink-0">
                {currency(totals.byCategory[cat.id] || 0)}
              </span>
            </div>

            {/* Column headers */}
            <div className="hidden sm:flex items-center gap-3 pb-2 mb-1 border-b border-light-gray/70 font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/45">
              <span className="w-4 shrink-0" />
              <span className="flex-1 min-w-[12rem]">Item</span>
              <span className="w-16 shrink-0 text-center">Qty</span>
              <span className="w-28 shrink-0 text-center">Unit cost</span>
              <span className="w-24 shrink-0 text-right">Line total</span>
            </div>

            <div className="space-y-2 mt-2">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 flex-wrap sm:flex-nowrap"
                >
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={!!purchased[item.id]}
                      onChange={() => togglePurchased(item.id)}
                      className="h-4 w-4 accent-primary-green"
                      aria-label={`Purchased: ${item.label}`}
                    />
                  </label>
                  <span
                    className={[
                      "font-sans text-sm leading-snug flex-1 min-w-[12rem]",
                      purchased[item.id]
                        ? "text-charcoal/50"
                        : "text-near-black",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>

                  {/* Quantity */}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={qty[item.id] ?? ""}
                    onChange={(e) => setQty(item.id, e.target.value)}
                    placeholder="1"
                    aria-label={`Quantity: ${item.label}`}
                    className="w-16 shrink-0 border border-light-gray bg-white text-center px-2 py-1.5 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {/* Unit cost */}
                  <div className="relative w-28 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/50 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={costs[item.id] ?? ""}
                      onChange={(e) => setCost(item.id, e.target.value)}
                      placeholder="0"
                      aria-label={`Unit cost: ${item.label}`}
                      className="w-full border border-light-gray bg-white pl-6 pr-2 py-1.5 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green"
                    />
                  </div>

                  {/* Line total */}
                  <span className="w-24 shrink-0 text-right font-sans text-sm font-semibold text-near-black tabular-nums">
                    {currency(lineTotal(item.id))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="font-sans text-xs text-charcoal/55 mt-4">
        Tip: enter how many of each item you need and the cost per item. The
        line total updates automatically. The check box marks what you have
        already purchased, so the &ldquo;secured&rdquo; figure shows how much of
        your budget is already spent. {COST_ALL_ITEMS.length} line items across{" "}
        {COST_CATEGORIES.length} categories.
      </p>
    </ResourceToolShell>
  );
}
