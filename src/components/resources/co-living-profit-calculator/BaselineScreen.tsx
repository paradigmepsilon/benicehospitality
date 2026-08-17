"use client";

import { PNL_GROUPS } from "@/lib/resources/co-living-profit-calculator/config";
import {
  baselineKey,
  baselineOf,
  type PnlState,
} from "@/lib/resources/co-living-profit-calculator/model";
import { GroupCard, LineField, money } from "./Fields";

// Screen zero: one typical month. Optional, and it says so — an operator with
// twelve months of real statements should walk straight into January rather
// than invent an average first.

export default function BaselineScreen({
  state,
  onChange,
  onStart,
  onSkip,
}: {
  state: PnlState;
  onChange: (lineId: string, value: string) => void;
  onStart: () => void;
  onSkip: () => void;
}) {
  const groupTotal = (lineIds: string[]) =>
    lineIds.reduce((total, id) => total + (baselineOf(state, id) ?? 0), 0);

  const sectionTotal = (section: "revenue" | "opex" | "other") =>
    groupTotal(
      PNL_GROUPS.filter((g) => g.section === section).flatMap((g) =>
        g.lines.map((l) => l.id),
      ),
    );

  const revenue = sectionTotal("revenue");
  const spend = sectionTotal("opex") + sectionTotal("other");
  const net = revenue - spend;
  const touched = PNL_GROUPS.some((g) =>
    g.lines.some((l) => (state[baselineKey(l.id)] ?? "").trim() !== ""),
  );

  return (
    <div>
      <header className="mb-5">
        <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-charcoal/50">
          Start here · optional
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-near-black mt-1">
          Your baseline month
        </h2>
        <p className="font-sans text-sm text-charcoal/65 mt-2 max-w-2xl leading-relaxed">
          Enter one typical month. Every month that follows starts from these
          numbers, so you only type the months that differ — the insurance
          bill in June, the vacancy in September. Change a number here later and
          every month you have not edited updates with it.
        </p>
        <p className="font-sans text-sm text-charcoal/65 mt-2 max-w-2xl leading-relaxed">
          Tracking real statements instead of planning? Skip this and go
          straight to January.
        </p>
      </header>

      <div className="space-y-4">
        {PNL_GROUPS.map((group) => (
          <GroupCard
            key={group.id}
            label={group.label}
            hint={group.hint}
            subtotal={groupTotal(group.lines.map((l) => l.id))}
            subtotalLabel="Per month"
          >
            {group.lines.map((line) => (
              <LineField
                key={line.id}
                label={line.label}
                hint={line.hint}
                value={state[baselineKey(line.id)] ?? ""}
                // The baseline is the bottom of the fallback chain; there is
                // nothing underneath it to show through or revert to.
                baseline={null}
                onChange={(v) => onChange(line.id, v)}
              />
            ))}
          </GroupCard>
        ))}
      </div>

      <div className="mt-6 bg-near-black rounded-lg px-4 py-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-warm-gold">
            A typical month
          </p>
          <p className="font-sans text-xs text-white/50 mt-1">
            {money(revenue)} in, {money(spend)} out
          </p>
        </div>
        <p
          className={`font-display text-2xl font-semibold tabular-nums ${net < 0 ? "text-terracotta" : "text-white"}`}
        >
          {money(net)}
        </p>
      </div>

      <div className="no-print flex flex-wrap items-center justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-11 px-4 font-sans text-sm font-semibold text-charcoal/70 hover:text-near-black underline underline-offset-4 transition-colors"
        >
          Skip — I&rsquo;ll enter each month
        </button>
        <button
          type="button"
          onClick={onStart}
          className="min-h-11 px-5 rounded-md bg-primary-green font-sans text-sm font-semibold text-white hover:bg-primary-green/90 transition-colors"
        >
          {touched ? "Start with January" : "Go to January"} ›
        </button>
      </div>
    </div>
  );
}
