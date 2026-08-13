"use client";

import { ReactNode, useId, useState } from "react";
import { AlertTriangle, HelpCircle, Info, Loader2, Plus } from "lucide-react";

// Shared UI for the planner.
//
// TYPE SCALE — four steps, nothing in between. Every size below is one of
// these, so the eye can rank anything at a glance:
//   11px  uppercase eyebrow / group legend   semibold, tracked
//   12px  hint, meta, source note            regular
//   14px  label, body, input                 semibold for labels, regular body
//   18px+ section title and result numbers   display face, semibold
//
// WEIGHT — semibold for anything you should read first (labels, titles,
// totals), regular for everything else. Nothing in between, and no bold body
// copy.
//
// COLOR IS SEMANTIC, not decorative. One meaning per colour, used nowhere else:
//   green      money coming IN, and "done"
//   terracotta money going OUT, and anything wrong
//   gold       our estimate, or something needing your attention
//   charcoal   neutral structure
// Every coloured signal also carries an icon or a word, so colour is never the
// only thing carrying the meaning (WCAG 1.4.1).
//
// COPY — hints are capped at roughly six words. Anything longer belongs in a
// `?` popover or in a code comment, not permanently on screen. An earlier pass
// put two full sentences under every field and the form became unreadable.

export type Tone = "revenue" | "cost" | "report" | "neutral";

export const TONE: Record<Tone, { text: string; bg: string; border: string; badge: string }> = {
  revenue: {
    text: "text-primary-green",
    bg: "bg-primary-green/8",
    border: "border-primary-green/30",
    badge: "bg-primary-green text-white",
  },
  cost: {
    text: "text-terracotta",
    bg: "bg-terracotta/8",
    border: "border-terracotta/30",
    badge: "bg-terracotta text-white",
  },
  report: {
    text: "text-near-black",
    bg: "bg-near-black/5",
    border: "border-near-black/20",
    badge: "bg-near-black text-white",
  },
  neutral: {
    text: "text-charcoal",
    bg: "bg-cream",
    border: "border-light-gray",
    badge: "bg-light-gray text-charcoal",
  },
};

export function currency(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Signed currency where the sign carries meaning, e.g. a report row. */
export function signedCurrency(n: number): string {
  const v = currency(Math.abs(n));
  return n < 0 ? `−${v}` : v;
}

export function monthLabel(m: number | null): string {
  return m === null ? "—" : `Month ${m}`;
}

/**
 * The long explanation, on demand.
 *
 * This is what keeps the form short. Anything that needs a paragraph to explain
 * lives behind this `?` instead of sitting under the field forever — which is
 * the progressive-disclosure rule, and the fix for the wall of prose the first
 * version shipped with.
 */
export function Explain({ children, label }: { children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`What is ${label}?`}
        className="no-print text-charcoal/40 hover:text-primary-green transition-colors cursor-pointer align-middle"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden />
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className="absolute left-0 top-full z-20 mt-1 block w-64 rounded-md border border-light-gray bg-white p-3 font-sans text-xs leading-relaxed text-charcoal/85 shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  );
}

/**
 * One page of the four-page walk-through.
 *
 * The three pages you are not on stay MOUNTED and toggle `hidden` rather than
 * unmounting. Three things depend on that: printing stays a two-line CSS rule
 * instead of "render all four, print, put them back", every page's live
 * subtotal keeps computing so the sticky result bar is correct on page one, and
 * scroll position and focus survive paging back and forth. `display: none` also
 * takes the hidden inputs out of the tab order for free.
 *
 * The numbered badge is colour-coded by tone, so the shape of the whole tool
 * reads before a single word does — green money in, two terracotta money out,
 * dark the answer.
 */
export function StepPanel({
  index,
  title,
  summary,
  tone = "neutral",
  current,
  anchorId,
  children,
}: {
  index: number;
  title: string;
  /** Right-aligned live subtotal for this page. */
  summary?: ReactNode;
  tone?: Tone;
  current: boolean;
  anchorId: string;
  children: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <section
      id={anchorId}
      aria-hidden={current ? undefined : true}
      className={[
        "plp-step bg-white border border-light-gray rounded-lg overflow-hidden scroll-mt-24",
        current ? "" : "hidden",
      ].join(" ")}
    >
      <h3 className="flex items-center gap-3 p-4 sm:p-5 pb-3">
        <span
          aria-hidden="true"
          className={`shrink-0 grid place-items-center w-7 h-7 rounded-full font-sans text-sm font-semibold ${t.badge}`}
        >
          {index}
        </span>
        <span className="flex-1 min-w-0 font-display text-lg sm:text-xl font-semibold text-near-black leading-tight">
          {title}
        </span>
        {summary && (
          <span className="shrink-0 text-right font-sans text-sm text-charcoal/70 tabular-nums">
            {summary}
          </span>
        )}
      </h3>
      <div className="plp-section-body px-4 sm:px-5 pb-5">{children}</div>
    </section>
  );
}

// TABS — one visual language, two uses.
//
// Both of these deliberately copy the Co-Living Viability Calculator's section
// nav (`ScorecardForm.tsx`): white card, tinted grid cells, big display numeral
// over a small label, count badge. The two tools sit next to each other on the
// resources shelf and an operator will often run both on the same property, so
// they should not look like they came from different products.
//
// The one thing NOT copied is the scorecard's forward lock. That exists to stop
// an incomplete quiz being submitted. This is a model whose defining move is
// "what if I add a sixth room", which means bouncing between the rooms page and
// the report constantly, and nothing here is ever submitted. Every tab is
// always reachable.

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

/**
 * The five-step strip across the top of the worksheet.
 *
 * `badge` carries each step's live count — rooms priced, cost lines switched
 * on — so the strip doubles as a progress read without a "Step 2 of 5" caption.
 */
export function StepNav<T extends string>({
  steps,
  current,
  onSelect,
}: {
  steps: { id: T; shortLabel: string; badge?: string }[];
  current: T;
  onSelect: (id: T) => void;
}) {
  return (
    <nav
      aria-label="Worksheet steps"
      className="no-print bg-white border border-light-gray rounded-lg p-3 sm:p-4 mb-4"
    >
      <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {steps.map((s, i) => {
          const isCurrent = s.id === current;
          return (
            <li key={s.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={isCurrent ? "step" : undefined}
                title={s.shortLabel}
                className={tabClass(isCurrent)}
              >
                <span aria-hidden="true" className={tabNumeralClass(isCurrent)}>
                  {i + 1}
                </span>
                <span className={`hidden sm:block ${tabLabelClass(isCurrent)}`}>
                  {s.shortLabel}
                </span>
                {s.badge && <span className={tabBadgeClass(isCurrent)}>{s.badge}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * A tab per room, plus an Add cell.
 *
 * Wraps rather than squeezing: rooms run from one to twelve, and twelve columns
 * in a 640px card would be unreadable. Four across on a phone, six on anything
 * wider, as many rows as it takes.
 */
export function TabStrip({
  tabs,
  activeId,
  onSelect,
  onAdd,
  addLabel = "Add",
}: {
  tabs: { id: string; index: number; label: string; badge?: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Omitted at the cap, which is what hides the cell. */
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Rooms"
      className="no-print bg-white border border-light-gray rounded-lg p-3 grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2"
    >
      {tabs.map((t) => {
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
              {t.index}
            </span>
            <span className={tabLabelClass(isCurrent)}>{t.label}</span>
            {t.badge && <span className={tabBadgeClass(isCurrent)}>{t.badge}</span>}
          </button>
        );
      })}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex flex-col items-center justify-center gap-1 rounded-md py-2 px-1 sm:px-2 min-h-11 w-full text-center cursor-pointer transition-colors border border-dashed border-light-gray text-charcoal/60 hover:border-primary-green hover:text-primary-green"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden />
          <span className="font-sans text-[10px] font-medium tracking-wide leading-tight">
            {addLabel}
          </span>
        </button>
      )}
    </div>
  );
}

/** Something is wrong or missing. Icon + short bold lead + short body. */
export function Warning({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div
      role="note"
      className="flex gap-2.5 rounded-md border border-terracotta/30 bg-terracotta/8 px-3 py-2.5"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-terracotta" aria-hidden />
      <p className="font-sans text-sm leading-snug text-charcoal/90">
        {title && <span className="font-semibold text-terracotta">{title} </span>}
        {children}
      </p>
    </div>
  );
}

/** Neutral "here is how this works" note. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-md border border-warm-gold/35 bg-warm-gold/10 px-3 py-2.5">
      <Info className="w-4 h-4 shrink-0 mt-0.5 text-warm-gold" aria-hidden />
      <p className="font-sans text-sm leading-snug text-charcoal/90">{children}</p>
    </div>
  );
}

export function Field({
  label,
  hint,
  explain,
  prefix,
  suffix,
  value,
  onChange,
  placeholder,
  type = "number",
  min,
  max,
  required,
  busy,
}: {
  label: string;
  /**
   * A lookup is currently searching for THIS field. The input greys out and
   * locks so nobody types into a box that is about to be overwritten, and the
   * hint is replaced by a live "Searching…" — the field says what is happening
   * to it, rather than one spinner elsewhere standing in for eight fields.
   */
  busy?: boolean;
  /** Six words or fewer. Longer belongs in `explain`. */
  hint?: string;
  explain?: ReactNode;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "number" | "text";
  min?: number;
  max?: number;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 font-sans text-sm font-semibold text-near-black mb-1"
      >
        {label}
        {required && (
          <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-terracotta">
            required
          </span>
        )}
        {explain && <Explain label={label}>{explain}</Explain>}
      </label>
      <div className="relative">
        {prefix && (
          <span
            aria-hidden="true"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-sm text-charcoal/45"
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          min={min}
          max={max}
          value={value}
          placeholder={busy ? "" : placeholder}
          disabled={busy}
          aria-busy={busy || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={[
            // 44px min height, per the touch-target rule.
            "w-full min-h-11 border border-light-gray bg-white py-2 font-sans text-sm text-near-black rounded-md tabular-nums",
            "transition-colors focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20",
            busy ? "bg-cream/70 text-charcoal/40 cursor-progress animate-pulse" : "",
            prefix ? "pl-6" : "pl-3",
            suffix ? "pr-8" : "pr-3",
          ].join(" ")}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 font-sans text-sm text-charcoal/45"
          >
            {suffix}
          </span>
        )}
      </div>
      {busy ? (
        <p className="flex items-center gap-1 font-sans text-xs text-warm-gold-dark mt-1 leading-snug">
          <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden />
          Searching…
        </p>
      ) : (
        hint && <p className="font-sans text-xs text-charcoal/60 mt-1 leading-snug">{hint}</p>
      )}
    </div>
  );
}

/** Uppercase group heading. Darker than the old charcoal/45, which was too faint to anchor a group. */
export function GroupLabel({ children, explain }: { children: ReactNode; explain?: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/70 mb-2">
      {children}
      {explain && <Explain label={String(children)}>{explain}</Explain>}
    </p>
  );
}

export function CheckGroup({
  legend,
  fields,
  selected,
  onToggle,
  explain,
}: {
  legend: string;
  fields: { id: string; label: string; dollars: number }[];
  selected: Record<string, boolean>;
  onToggle: (id: string) => void;
  explain?: ReactNode;
}) {
  const count = fields.filter((f) => selected[f.id]).length;
  return (
    <fieldset>
      <legend className="flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/70 mb-2">
        {legend}
        {count > 0 && (
          <span className="font-sans text-[10px] font-semibold text-primary-green normal-case tracking-normal">
            {count} selected
          </span>
        )}
        {explain && <Explain label={legend}>{explain}</Explain>}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
        {fields.map((f) => {
          const on = !!selected[f.id];
          return (
            <label
              key={f.id}
              className={[
                "flex items-start gap-2 cursor-pointer rounded px-1.5 py-1.5 -mx-1.5 font-sans text-sm transition-colors",
                on ? "text-near-black font-medium" : "text-charcoal/75 hover:bg-cream/70",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onToggle(f.id)}
                className="h-4 w-4 accent-primary-green shrink-0 mt-0.5 cursor-pointer"
              />
              <span className="flex-1 leading-snug">{f.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
