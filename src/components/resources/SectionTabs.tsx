"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Shared numbered-pill tab strip for resource tools with sectioned content —
// checklists, reference guides, worksheets. One visual language across the
// whole resources shelf: it originated in breakeven-analysis-worksheet/ui.tsx
// (StepNav/TabStrip), was copied once for room-rental-setup-checklist, and
// lives here now that a third-plus copy would just be drift waiting to happen.
//
// Pairs with the "mount every panel, toggle `hidden`, force `display:block`
// for print" rule in globals.css (`.resource-tool [role="tabpanel"]`) — every
// TabPanel below carries that role, so Print/Save-as-PDF always emits every
// section regardless of which tab is open on screen.

export interface TabDef {
  id: string;
  label: string;
  /** Pill text. Falls back to `label` when omitted — keep this short, it has to fit a ~90px pill. */
  shortLabel?: string;
  /** e.g. "6/8" for a checklist's live count, "20" for a flat item count. Omitted entirely when there's nothing to show. */
  badge?: string;
}

function tabClass(isCurrent: boolean): string {
  return [
    // 44px min target, per the touch rule.
    "flex flex-col items-center justify-start gap-1 rounded-md py-2 px-1 sm:px-2 min-h-11 w-full text-center cursor-pointer transition-colors",
    isCurrent
      ? "bg-near-black text-white"
      : "bg-primary-green/5 text-near-black hover:bg-primary-green/10",
  ].join(" ");
}
function tabNumeralClass(isCurrent: boolean): string {
  return [
    "font-display font-semibold leading-none text-base sm:text-lg",
    isCurrent ? "text-white" : "text-near-black",
  ].join(" ");
}
function tabLabelClass(isCurrent: boolean): string {
  return [
    "font-sans text-[10px] font-medium tracking-wide leading-tight truncate w-full",
    isCurrent ? "text-white/80" : "text-charcoal/70",
  ].join(" ");
}
function tabBadgeClass(isCurrent: boolean): string {
  return [
    "font-sans text-[10px] font-semibold tabular-nums leading-none px-1.5 py-0.5 rounded-full",
    isCurrent ? "bg-warm-gold text-near-black" : "bg-primary-green/15 text-primary-green",
  ].join(" ");
}

/** Scrolls a panel into view after its tab has been selected. */
export function scrollToPanel(anchorId: string) {
  requestAnimationFrame(() => {
    document
      .getElementById(anchorId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function panelAnchor(prefix: string, id: string): string {
  return `${prefix}-${id}`;
}

/**
 * The numbered pill strip. `gridClassName` lets a 2-tab tool (2 columns) and
 * an 8-tab tool (2/4 columns) each pick a sensible wrap without one tool's
 * tabs going too wide or another's going too narrow.
 */
export function SectionTabStrip({
  tabs,
  activeId,
  onSelect,
  ariaLabel,
  gridClassName = "grid-cols-2 sm:grid-cols-4",
}: {
  tabs: TabDef[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  gridClassName?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`no-print bg-white border border-light-gray rounded-lg p-3 grid ${gridClassName} gap-1.5 sm:gap-2 mb-6`}
    >
      {tabs.map((t, i) => {
        const isCurrent = t.id === activeId;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            onClick={() => onSelect(t.id)}
            title={t.label}
            className={tabClass(isCurrent)}
          >
            <span aria-hidden="true" className={tabNumeralClass(isCurrent)}>
              {i + 1}
            </span>
            <span className={tabLabelClass(isCurrent)}>
              {t.shortLabel ?? t.label}
            </span>
            {t.badge && <span className={tabBadgeClass(isCurrent)}>{t.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * One tab's content. Always mounted — `current` only toggles Tailwind's
 * `hidden` — so print can force every panel back to `display: block`.
 */
export function TabPanel({
  anchorId,
  current,
  children,
  className = "",
}: {
  anchorId: string;
  current: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      id={anchorId}
      role="tabpanel"
      aria-hidden={current ? undefined : true}
      className={["scroll-mt-24", current ? "" : "hidden", className].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * Back/Next pair for paging through tabs in order. Rendered once, below every
 * (always-mounted) panel — not locked navigation, just a convenience for
 * anyone who would rather click through than jump around the strip.
 */
export function TabPager({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: TabDef[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const idx = tabs.findIndex((t) => t.id === activeId);
  if (idx === -1) return null;
  return (
    <div className="no-print flex items-center justify-between gap-3">
      {idx > 0 ? (
        <button
          type="button"
          onClick={() => onSelect(tabs[idx - 1].id)}
          className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold px-3 py-2 rounded-md border border-light-gray text-charcoal hover:border-charcoal hover:text-near-black cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
          {tabs[idx - 1].shortLabel ?? tabs[idx - 1].label}
        </button>
      ) : (
        <span />
      )}
      {idx < tabs.length - 1 && (
        <button
          type="button"
          onClick={() => onSelect(tabs[idx + 1].id)}
          className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold px-4 py-2 rounded-md bg-primary-green text-white hover:bg-primary-green/90 cursor-pointer transition-colors"
        >
          Next: {tabs[idx + 1].shortLabel ?? tabs[idx + 1].label}
          <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
        </button>
      )}
    </div>
  );
}
