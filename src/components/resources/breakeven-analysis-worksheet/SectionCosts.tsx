"use client";

import Link from "next/link";
import {
  PRICE_STALE_DAYS,
  type CostLine,
} from "@/lib/resources/breakeven-analysis-worksheet/costs";
import type { CostCatalog } from "@/lib/resources/breakeven-analysis-worksheet/catalog";
import type { AffiliateNetwork } from "@/lib/marketplace";
import type {
  CostLineState,
  ResolvedLine,
} from "@/lib/resources/breakeven-analysis-worksheet/projection";
import { Note, Warning, currency } from "./ui";

// The marketplace has its own copy of this in its _components/types.ts. Not
// imported from there: that is an app-private folder and a shared resource
// component reaching into a route's internals is the wrong direction. Small
// enough to restate; if a third caller appears, lift it into lib/marketplace.ts
// alongside the AffiliateNetwork type.
const BUY_CTA: Record<AffiliateNetwork, string> = {
  amazon: "View on Amazon",
  lowes: "View on Lowe's",
  wayfair: "View on Wayfair",
  direct: "Buy direct",
  other: "View product",
};

// Sections 2 and 3. One row component, two sections — a line that is genuinely
// both a launch cost and a monthly bill renders the SAME component in each,
// with the other bucket's field greyed and a link across.

type Bucket = "oneTime" | "monthly";

function daysSince(iso: string): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 0;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function formatChecked(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Sends the click to the marketplace's existing tracker, namespaced. */
function trackBuy(line: CostLine) {
  if (!line.product) return;
  try {
    fetch("/api/marketplace/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // "plp:" so planner clicks stay separable from /marketplace clicks in the
      // same table. The route takes free-text and has no FK, so this needs no
      // schema change.
      body: JSON.stringify({
        productId: `plp:${line.id}`,
        network: line.product.network,
        referrer: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking is best-effort. Never block the navigation.
  }
}

function CostRow({
  resolved,
  bucket,
  otherBucketHref,
  onChange,
}: {
  resolved: ResolvedLine;
  bucket: Bucket;
  otherBucketHref: string | null;
  onChange: (patch: Partial<CostLineState>) => void;
}) {
  const { line, state, amount, qty, total, source, usingDefault } = resolved;
  const on = state.on;
  const perRoom = line.scope === "per-room";
  const isPercent = resolved.bucket.defaultMode === "percent-of-revenue";
  const label = resolved.bucket.label ?? line.label;
  const typed = bucket === "oneTime" ? state.oneTime : state.monthly;
  const stale = line.product ? daysSince(line.product.priceCheckedAt) > PRICE_STALE_DAYS : false;

  return (
    // plp-row-off drops the row from the printout. On screen an unticked line
    // is the menu you pick from; on paper it is a row of em-dashes, and there
    // are ~55 of them.
    <div className={["py-2", on ? "" : "opacity-55 plp-row-off"].join(" ")}>
      <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
        <input
          type="checkbox"
          checked={on}
          onChange={() => onChange({ on: !on })}
          aria-label={label}
          className="h-4 w-4 accent-primary-green shrink-0 mt-1.5"
        />

        <div className="flex-1 min-w-44">
          <span className="font-sans text-sm leading-snug text-near-black">{label}</span>
          {/* Marks a line whose absence would make the headline net wrong.
              These used to start pre-checked with money in them; a marker that
              prompts is honest where a pre-filled number was not. */}
          {resolved.bucket.required && !on && (
            <span className="ml-1.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-terracotta">
              needed
            </span>
          )}
          {perRoom && on && (
            <span className="font-sans text-xs text-charcoal/50"> · × {qty} rooms</span>
          )}
          {/* Metadata only appears once the line is ON. An unticked row is
              just a label and a checkbox, which is what keeps a 40-row section
              scannable instead of a wall. */}
          {on && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
              {usingDefault && (
                <span className="inline-block font-sans text-[10px] font-semibold uppercase tracking-wide text-warm-gold bg-warm-gold/15 rounded px-1.5 py-0.5">
                  {isPercent ? "auto" : "our estimate"}
                </span>
              )}
              {stale && (
                <span className="inline-block font-sans text-[10px] font-semibold uppercase tracking-wide text-terracotta bg-terracotta/10 rounded px-1.5 py-0.5">
                  price may be old
                </span>
              )}
              {line.hint && (
                // w-full forces the hint onto its own line, which is right on
                // screen and costs a whole extra line per ticked row on paper.
                // The print rule drops it back inline beside the badges.
                <span className="plp-hint font-sans text-xs text-charcoal/60 leading-snug w-full">
                  {line.hint}
                </span>
              )}
              {line.product && line.product.affiliateUrl && (
                <a
                  href={line.product.affiliateUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => trackBuy(line)}
                  title={`${line.product.productName} · price checked ${formatChecked(line.product.priceCheckedAt)}`}
                  className="plp-buy no-print font-sans text-xs font-medium text-primary-green hover:underline"
                >
                  {BUY_CTA[line.product.network]} ↗
                </a>
              )}
              {line.product && (
                <span className="font-sans text-xs text-charcoal/50">
                  {line.product.productName}
                </span>
              )}
              {!line.product && line.sourceNote && (
                <span className="font-sans text-xs text-charcoal/50">{line.sourceNote}</span>
              )}
              {line.internalHref && (
                <Link
                  href={line.internalHref}
                  className="no-print font-sans text-xs font-medium text-primary-green hover:underline"
                >
                  Free template ↗
                </Link>
              )}
              {otherBucketHref && (
                <a
                  href={otherBucketHref}
                  className="no-print font-sans text-xs text-charcoal/55 hover:text-primary-green"
                >
                  also {bucket === "oneTime" ? "monthly" : "one-time"} ↗
                </a>
              )}
            </div>
          )}
        </div>

        {/* Quantity is hidden entirely for property-scope lines. Nobody should
            be asked how many LLC registrations they need. */}
        {perRoom ? (
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            disabled={!on}
            value={state.qty}
            onChange={(e) => onChange({ qty: e.target.value })}
            placeholder={String(qty)}
            aria-label={`Quantity: ${label}`}
            className="w-16 shrink-0 border border-light-gray bg-white text-center px-2 py-1.5 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green disabled:bg-cream/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : (
          <span className="w-16 shrink-0 text-center font-sans text-sm text-charcoal/35 pt-1.5">
            1
          </span>
        )}

        <div className="relative w-28 shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/50 text-sm">
            $
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            disabled={!on}
            value={typed}
            onChange={(e) => onChange(bucket === "oneTime" ? { oneTime: e.target.value } : { monthly: e.target.value })}
            /* The default is a PLACEHOLDER, never written into the field.
               Clearing the input IS the reset, grey text honestly reads as our
               estimate, and there is no "touched" flag to fall out of sync. */
            placeholder={on ? String(amount) : "0"}
            aria-label={`${bucket === "oneTime" ? "One-time" : "Monthly"} cost: ${label}`}
            className="w-full border border-light-gray bg-white pl-6 pr-2 py-1.5 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green disabled:bg-cream/60"
          />
        </div>

        <div className="w-24 shrink-0 text-right pt-1.5">
          {/* Full-strength black even when default-derived, so a grey
              placeholder never reads as "not counted". */}
          <span className="font-sans text-sm font-semibold text-near-black tabular-nums">
            {on ? currency(total) : "—"}
          </span>
          {on && source === "user" && (
            <button
              type="button"
              onClick={() => onChange(bucket === "oneTime" ? { oneTime: "" } : { monthly: "" })}
              title="Back to our estimate"
              aria-label={`Reset ${label} to the default`}
              className="no-print block ml-auto font-sans text-[11px] text-charcoal/45 hover:text-primary-green"
            >
              ↺ reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SectionCosts({
  bucket,
  catalog,
  resolved,
  subtotal,
  defaultCount,
  activeCount,
  contingency,
  contingencyPct,
  onContingencyPct,
  onLine,
  warnings,
  missingRequired,
}: {
  bucket: Bucket;
  /** Config plus the admin's overrides. Never import the raw config here. */
  catalog: CostCatalog;
  resolved: ResolvedLine[];
  subtotal: number;
  defaultCount: number;
  activeCount: number;
  /** One-time only. */
  contingency?: number;
  contingencyPct?: string;
  onContingencyPct?: (v: string) => void;
  onLine: (id: string, patch: Partial<CostLineState>) => void;
  warnings?: string[];
  missingRequired?: { id: string; label: string }[];
}) {
  const categories =
    bucket === "oneTime" ? catalog.oneTimeCategories : catalog.monthlyCategories;
  const byId = new Map(resolved.map((r) => [r.line.id, r]));
  const total = bucket === "oneTime" ? subtotal + (contingency ?? 0) : subtotal;

  return (
    <div className="space-y-5">
      {/* One instruction line, shown only until the first line is ticked.
          Everything a first-timer needs to operate this section, and it gets
          out of the way the moment they demonstrate they understood. */}
      {activeCount === 0 && (
        // no-print: an instruction for operating the form, not a fact about
        // the property. It has no business on a printed budget.
        <div className="no-print">
          <Note>
            Tick what applies. Each one fills in our estimate — type over it
            with your own number whenever you know it.
          </Note>
        </div>
      )}

      {bucket === "monthly" && missingRequired && missingRequired.length > 0 && (
        <Warning title="Add these to get a real number:">
          {missingRequired.map((m) => m.label).join(", ")}.
        </Warning>
      )}

      {warnings?.map((w) => (
        <Warning key={w}>{w}</Warning>
      ))}

      {categories.map((cat) => {
        const lines = cat.lineIds.map((id) => byId.get(id)).filter(Boolean) as ResolvedLine[];
        if (lines.length === 0) return null;
        const catTotal = lines.reduce((t, r) => t + (r.state.on ? r.total : 0), 0);
        // Every row in this category is unticked, so print would show a heading,
        // a $0, and nothing else. Judged on `on`, not on catTotal: a ticked line
        // legitimately worth $0 (op_biztax, op_misc) is still a decision the
        // operator made and belongs on the printout.
        const anyOn = lines.some((r) => r.state.on);

        return (
          <div key={cat.id} className={anyOn ? undefined : "plp-cat-empty"}>
            <div className="flex items-baseline justify-between gap-3 pb-1.5 border-b border-light-gray">
              <h4 className="font-display text-base font-semibold text-near-black">
                {cat.label}
              </h4>
              <span className="font-sans text-sm font-semibold text-charcoal/70 tabular-nums shrink-0">
                {currency(catTotal)}
                {bucket === "monthly" ? "/mo" : ""}
              </span>
            </div>
            <div className="divide-y divide-light-gray/60">
              {lines.map((r) => {
                const other = bucket === "oneTime" ? "monthly" : "oneTime";
                const hasOther = Boolean(catalog.byId[r.line.id]?.[other]);
                return (
                  <CostRow
                    key={r.line.id}
                    resolved={r}
                    bucket={bucket}
                    otherBucketHref={hasOther ? (bucket === "oneTime" ? "#plp-monthly" : "#plp-one-time") : null}
                    onChange={(patch) => onLine(r.line.id, patch)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* --------------------------------------------------- totals block */}
      <div className="border-t-2 border-terracotta/25 pt-3 space-y-1.5">
        <div className="flex items-baseline justify-between gap-3 font-sans text-sm">
          <span className="text-charcoal/70">
            Subtotal, {activeCount} {activeCount === 1 ? "line" : "lines"}
            {defaultCount > 0 && (
              <span className="text-charcoal/55">
                {" "}
                · {defaultCount} still our estimate
              </span>
            )}
          </span>
          <span className="font-semibold text-near-black tabular-nums">
            {currency(subtotal)}
          </span>
        </div>

        {bucket === "oneTime" && onContingencyPct && (
          <div className="flex items-center justify-between gap-3 font-sans text-sm">
            <span className="flex items-center gap-2 text-charcoal/70">
              Contingency
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={30}
                value={contingencyPct ?? ""}
                onChange={(e) => onContingencyPct(e.target.value)}
                aria-label="Contingency percentage"
                className="w-14 border border-light-gray bg-white text-center px-1.5 py-1 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              %
              <span className="text-charcoal/55 text-xs hidden sm:inline">
                Della suggests 10-15
              </span>
            </span>
            <span className="font-semibold text-near-black tabular-nums">
              {currency(contingency ?? 0)}
            </span>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-3 pt-2 border-t border-light-gray">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/70">
            {bucket === "oneTime" ? "Cost to open" : "Cost every month"}
          </span>
          <span className="font-display text-2xl font-semibold text-terracotta tabular-nums">
            {currency(total)}
            {bucket === "monthly" ? "/mo" : ""}
          </span>
        </div>
      </div>

      {bucket === "oneTime" && (
        <p className="font-sans text-xs text-charcoal/60">
          Some links are affiliate links; prices are what we last saw, not live
          quotes.{" "}
          <Link
            href="/affiliate-disclosure"
            className="text-primary-green font-medium hover:underline"
          >
            How this works
          </Link>
        </p>
      )}
    </div>
  );
}
