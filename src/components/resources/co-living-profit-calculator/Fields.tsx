"use client";

import { ReactNode, useId } from "react";

// Shared field chrome for the profit calculator. The baseline screen and the
// twelve month screens render the same lines, so they render the same controls;
// only what the control is bound to differs.

export function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Bare number, no currency symbol — for dense table cells and placeholders. */
export function compact(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * One P&L line. `baseline` is the value behind this line from the baseline
 * screen; when the field is empty it shows through as the placeholder and is
 * what the totals actually use, so the "from baseline" tag below the input is
 * load-bearing, not decoration — without it a member cannot tell a number they
 * recorded from one the tool assumed.
 */
export function LineField({
  label,
  hint,
  value,
  baseline,
  onChange,
  onClearToBaseline,
}: {
  label: string;
  hint?: string;
  /** The raw string for this month only. Never the baseline. */
  value: string;
  /** Baseline behind this line, or null if the member skipped/left it blank. */
  baseline: number | null;
  onChange: (v: string) => void;
  /** Omitted on the baseline screen itself, which has nothing to fall back to. */
  onClearToBaseline?: () => void;
}) {
  const id = useId();
  const entered = value.trim() !== "";
  const showingBaseline = !entered && baseline !== null;

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 border-b border-light-gray/60 last:border-b-0 hover:bg-off-white/40 transition-colors">
      <label htmlFor={id} className="flex-1 min-w-0">
        <span className="block font-sans text-sm text-near-black">{label}</span>
        {hint && (
          <span className="block font-sans text-[11px] text-charcoal/45 leading-snug mt-0.5">
            {hint}
          </span>
        )}
      </label>

      {/* Provenance sits BESIDE the input, not under it. Thirty of these stack
          up on one month screen, and a reserved caption line under each one
          added most of a screen height to every month. Below `sm` it drops out
          and the washed field background carries the signal alone. */}
      <div className="hidden sm:block shrink-0 text-right w-24">
        {showingBaseline && (
          <span className="font-sans text-[10px] uppercase tracking-wide text-charcoal/40">
            from baseline
          </span>
        )}
        {entered && baseline !== null && onClearToBaseline && (
          <button
            type="button"
            onClick={onClearToBaseline}
            className="no-print font-sans text-[10px] uppercase tracking-wide text-charcoal/45 hover:text-primary-green transition-colors"
          >
            ↺ use baseline
          </button>
        )}
      </div>

      <div className="relative w-28 sm:w-32 shrink-0">
        <span
          aria-hidden="true"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-sm text-charcoal/45"
        >
          $
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          placeholder={baseline !== null ? compact(baseline) : "0"}
          onChange={(e) => onChange(e.target.value)}
          className={[
            // 44px min height, per the touch-target rule.
            "w-full min-h-11 border border-light-gray pl-6 pr-2.5 py-2 rounded-md text-right",
            "font-sans text-sm text-near-black tabular-nums",
            "transition-colors focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            showingBaseline ? "bg-cream/50" : "bg-white",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/** A named run of lines with its own running subtotal. */
export function GroupCard({
  label,
  hint,
  subtotal,
  subtotalLabel,
  children,
}: {
  label: string;
  hint?: string;
  subtotal: number;
  subtotalLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-light-gray rounded-lg bg-white overflow-hidden">
      <header className="bg-off-white px-3 sm:px-4 py-3 border-b border-light-gray flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-near-black">
            {label}
          </h3>
          {hint && (
            <p className="font-sans text-[11px] text-charcoal/50 mt-1 leading-snug">
              {hint}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-sans text-[10px] uppercase tracking-wide text-charcoal/45">
            {subtotalLabel}
          </p>
          <p className="font-sans text-sm font-semibold text-near-black tabular-nums">
            {money(subtotal)}
          </p>
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}
