"use client";

import { useMemo, useRef } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
  parseCsv,
} from "@/components/resources/useResourceTool";

/**
 * Declarative spec for a read-only computed column. Kept as data (not a
 * function) because column configs are defined in Server Component pages and
 * passed as props into this Client Component — functions can't cross that
 * boundary.
 */
export type ComputeSpec =
  | { op: "diff"; a: string; b: string; clampMin0?: boolean }
  | { op: "lessThan"; a: string; b: string; trueLabel: string; falseLabel: string }
  | { op: "diffCurrency"; a: string; b: string };

export interface DataColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: string[];
  /** CSS width for the column, e.g. "10rem". */
  width?: string;
  /** In the card layout, let this field span two grid columns (long text). */
  wide?: boolean;
  /** Read-only computed value derived from the row (e.g. "Restock needed?"). */
  compute?: ComputeSpec;
}

/**
 * How one entry summarises itself when its card is collapsed. Data, not
 * functions, for the same reason ComputeSpec is: these configs are written in
 * Server Components and passed as props into this Client Component.
 */
export interface SummarySpec {
  /** Column key whose value becomes the collapsed headline. */
  title: string;
  /** Shown when the title column is still empty, e.g. "Untitled issue". */
  fallbackTitle: string;
  /** Column key rendered as a tinted pill beside the headline. */
  badge?: string;
  /** Pill colour per value. Anything unlisted gets the neutral tone. */
  badgeTone?: Record<string, BadgeTone>;
  /** Column keys joined into the muted subtitle. Empty values are dropped. */
  meta?: string[];
}

export type BadgeTone = "good" | "warn" | "bad" | "neutral";

const BADGE_CLASS: Record<BadgeTone, string> = {
  good: "bg-primary-green/10 text-primary-green",
  warn: "bg-warm-gold/20 text-warm-gold-dark",
  bad: "bg-terracotta/10 text-terracotta",
  neutral: "bg-light-gray text-charcoal/70",
};

export type DataRow = { _id: string } & Record<string, string>;

/** A date input's yyyy-mm-dd, read back short. Anything else passes through. */
function formatMaybeDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return value.trim();
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return value.trim();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toNum(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : NaN;
}

function computeValue(row: Record<string, string>, spec: ComputeSpec): string {
  switch (spec.op) {
    case "diff": {
      const a = toNum(row[spec.a]);
      const b = toNum(row[spec.b]);
      if (Number.isNaN(a) || Number.isNaN(b)) return "";
      const diff = a - b;
      return String(spec.clampMin0 ? Math.max(0, diff) : diff);
    }
    case "lessThan": {
      const a = toNum(row[spec.a]);
      const b = toNum(row[spec.b]);
      if (Number.isNaN(a) || Number.isNaN(b)) return "";
      return a < b ? spec.trueLabel : spec.falseLabel;
    }
    case "diffCurrency": {
      const a = toNum(row[spec.a]);
      const b = toNum(row[spec.b]);
      if (Number.isNaN(a)) return "";
      const bal = a - (Number.isNaN(b) ? 0 : b);
      return bal > 0 ? `$${bal}` : "$0";
    }
  }
}

interface State {
  rows: DataRow[];
  /**
   * Ids of entries the member has folded shut. Collapsed rather than open ids
   * on purpose: state saved before this feature has no key at all, and a row
   * added later is not in the list — both of which read as "open", which is the
   * default we want. Nothing is ever hidden that the member did not hide.
   */
  collapsed?: string[];
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `r${performance.now()}${Math.floor(performance.now() % 9973)}`;
  }
}

function blankRow(columns: DataColumn[]): DataRow {
  const row: DataRow = { _id: newId() };
  for (const c of columns) if (!c.compute) row[c.key] = "";
  return row;
}

/**
 * Generic CRUD tracker: an editable table with add/delete rows, CSV export and
 * import, print, and (for logged-in users) server account-save. Powers the
 * Maintenance Tracker, Contractor Rolodex, and Supply Inventory Tracker.
 */
export default function DataTableTool({
  slug,
  title,
  columns,
  csvFilename,
  addLabel = "Add row",
  canSync = false,
  variant = "table",
  entryNoun = "entry",
  summary,
}: {
  slug: string;
  title: string;
  columns: DataColumn[];
  csvFilename: string;
  addLabel?: string;
  canSync?: boolean;
  /**
   * "table" (default): one wide row per entry, horizontal scroll.
   * "cards": one stacked block per entry, vertical scroll only. Better for
   * many-column trackers on narrow screens.
   */
  variant?: "table" | "cards";
  /** Word used in the per-card header, e.g. "issue" → "Issue 1". */
  entryNoun?: string;
  /**
   * Opts the card variant into accordions: each entry collapses to a one-line
   * summary built from its own values. Omit it and cards render exactly as
   * before, always open.
   */
  summary?: SummarySpec;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, setState, reset } = useResourceTool<State>(
    slug,
    { rows: [blankRow(columns)] },
    { sync: canSync },
  );

  const rows = state.rows.length ? state.rows : [blankRow(columns)];

  /** Accordion is opt-in, and only ever in the card variant. */
  const accordion = Boolean(summary) && variant === "cards";
  const collapsedIds = useMemo(
    () => new Set(state.collapsed ?? []),
    [state.collapsed],
  );

  const editableColumns = useMemo(
    () => columns.filter((c) => !c.compute),
    [columns],
  );

  function toggleRow(id: string) {
    setState((p) => {
      const next = new Set(p.collapsed ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...p, collapsed: [...next] };
    });
  }

  function setAllCollapsed(collapse: boolean) {
    setState((p) => ({
      ...p,
      collapsed: collapse ? p.rows.map((r) => r._id) : [],
    }));
  }

  const valueOf = useMemo(
    () => (row: DataRow, col: DataColumn) =>
      col.compute ? computeValue(row, col.compute) : (row[col.key] ?? ""),
    [],
  );

  function addRow() {
    // A new entry is never in `collapsed`, so it opens ready to type into.
    setState((p) => ({ ...p, rows: [...p.rows, blankRow(columns)] }));
  }
  function deleteRow(id: string) {
    setState((p) => {
      const next = p.rows.filter((r) => r._id !== id);
      return {
        ...p,
        rows: next.length ? next : [blankRow(columns)],
        collapsed: (p.collapsed ?? []).filter((c) => c !== id),
      };
    });
  }
  function setCell(id: string, key: string, value: string) {
    setState((p) => ({
      ...p,
      rows: p.rows.map((r) => (r._id === id ? { ...r, [key]: value } : r)),
    }));
  }

  // A single editable control for one cell, shared by the table and card views.
  function fieldControl(row: DataRow, c: DataColumn, fullWidth = false) {
    if (c.compute) {
      return (
        <span className="block px-2 py-1.5 text-sm text-charcoal/70">
          {valueOf(row, c)}
        </span>
      );
    }
    if (c.type === "select") {
      return (
        <select
          value={row[c.key] ?? ""}
          onChange={(e) => setCell(row._id, c.key, e.target.value)}
          className={`${fullWidth ? "w-full" : "w-full min-w-[8rem]"} border border-transparent hover:border-light-gray focus:border-primary-green bg-transparent px-2 py-1.5 text-sm text-near-black rounded focus:outline-none`}
        >
          <option value=""></option>
          {c.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"}
        value={row[c.key] ?? ""}
        onChange={(e) => setCell(row._id, c.key, e.target.value)}
        style={!fullWidth && c.width ? { minWidth: c.width } : undefined}
        className="w-full border border-transparent hover:border-light-gray focus:border-primary-green bg-transparent px-2 py-1.5 text-sm text-near-black rounded focus:outline-none placeholder:text-charcoal/30"
      />
    );
  }

  function exportCsv() {
    const header = columns.map((c) => c.label);
    const body = rows
      .filter((r) => columns.some((c) => !c.compute && (r[c.key] ?? "").trim()))
      .map((r) => columns.map((c) => valueOf(r, c)));
    downloadCsv(csvFilename, buildCsv(title, [header, ...body]));
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const matrix = parseCsv(text).filter((r) =>
        r.some((c) => c.trim() !== ""),
      );
      if (!matrix.length) return;
      // Find the header row: the first row whose cells match our column labels.
      const labelLower = columns.map((c) => c.label.toLowerCase().trim());
      let headerIdx = matrix.findIndex((r) =>
        r.some((cell) => labelLower.includes(cell.toLowerCase().trim())),
      );
      if (headerIdx < 0) headerIdx = 0;
      const header = matrix[headerIdx].map((h) => h.toLowerCase().trim());
      const colForIndex = header.map((h) =>
        columns.find((c) => c.label.toLowerCase().trim() === h),
      );
      const imported: DataRow[] = [];
      for (let i = headerIdx + 1; i < matrix.length; i++) {
        const cells = matrix[i];
        const row = blankRow(columns);
        let any = false;
        cells.forEach((val, idx) => {
          const col = colForIndex[idx];
          if (col && !col.compute && val.trim()) {
            row[col.key] = val;
            any = true;
          }
        });
        if (any) imported.push(row);
      }
      if (imported.length) {
        setState((p) => {
          const existing = p.rows.filter((r) =>
            columns.some((c) => !c.compute && (r[c.key] ?? "").trim()),
          );
          return { ...p, rows: [...existing, ...imported] };
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const filledCount = rows.filter((r) =>
    columns.some((c) => !c.compute && (r[c.key] ?? "").trim()),
  ).length;

  return (
    <ResourceToolShell
      title={title}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="font-sans text-sm text-charcoal/60">
          {filledCount} {filledCount === 1 ? "entry" : "entries"}
        </span>
      }
    >
      {/* Table variant is wide; print it in landscape so columns aren't clipped.
          Card variant stacks vertically and prints portrait. */}
      {variant === "table" && (
        <style>{`@media print { @page { size: A4 landscape; } }`}</style>
      )}

      {/* Add / import controls */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 bg-primary-green hover:bg-primary-green-dark text-white font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          + {addLabel}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          Import CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onImportFile}
          className="hidden"
        />
        {accordion && rows.length > 1 && (
          <button
            type="button"
            onClick={() => setAllCollapsed(collapsedIds.size < rows.length)}
            className="inline-flex items-center font-sans text-sm font-medium text-primary-green hover:text-primary-green-dark px-2 py-2 rounded-md transition-colors"
          >
            {collapsedIds.size < rows.length ? "Collapse all" : "Expand all"}
          </button>
        )}
        {canSync && (
          <span className="font-sans text-xs text-charcoal/50">
            Saved to your account
          </span>
        )}
      </div>

      {variant === "cards" ? (
        <div className="space-y-3">
          {rows.map((row, idx) => {
            const open = !accordion || !collapsedIds.has(row._id);
            const bodyId = `dt-${row._id}`;
            const filled = editableColumns.filter((c) =>
              (row[c.key] ?? "").trim(),
            ).length;

            const headline = summary
              ? (row[summary.title] ?? "").trim() || summary.fallbackTitle
              : `${entryNoun} ${idx + 1}`;
            const badgeValue = summary?.badge
              ? (row[summary.badge] ?? "").trim()
              : "";
            const metaLine = (summary?.meta ?? [])
              .map((k) => {
                const col = columns.find((cc) => cc.key === k);
                const raw = col?.compute
                  ? valueOf(row, col)
                  : (row[k] ?? "").trim();
                return col?.type === "date" ? formatMaybeDate(raw) : raw;
              })
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={row._id}
                className={`placeholders-are-examples bg-white border rounded-lg break-inside-avoid ${
                  open && accordion
                    ? "border-primary-green/40"
                    : "border-light-gray"
                }`}
              >
                <div className="flex items-start gap-2 p-3 sm:p-4">
                  {accordion ? (
                    <button
                      type="button"
                      onClick={() => toggleRow(row._id)}
                      aria-expanded={open}
                      aria-controls={bodyId}
                      className="flex-1 min-w-0 text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-base font-semibold text-near-black leading-snug wrap-break-word min-w-0">
                          {headline}
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          {badgeValue && (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap ${
                                BADGE_CLASS[
                                  summary?.badgeTone?.[badgeValue] ?? "neutral"
                                ]
                              }`}
                            >
                              {badgeValue}
                            </span>
                          )}
                          <span className="font-sans text-[11px] text-charcoal/50 tabular-nums whitespace-nowrap">
                            {filled}/{editableColumns.length}
                          </span>
                        </span>
                      </div>
                      {metaLine && (
                        <p className="no-print mt-1 font-sans text-xs text-charcoal/60 wrap-break-word">
                          {metaLine}
                        </p>
                      )}
                    </button>
                  ) : (
                    <p className="flex-1 min-w-0 font-display text-sm font-semibold text-near-black capitalize">
                      {entryNoun} {idx + 1}
                    </p>
                  )}

                  <div className="no-print flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => deleteRow(row._id)}
                      aria-label={`Delete ${headline}`}
                      className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-charcoal/40 hover:text-terracotta hover:bg-terracotta/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                    {accordion && (
                      <button
                        type="button"
                        onClick={() => toggleRow(row._id)}
                        aria-expanded={open}
                        aria-controls={bodyId}
                        aria-label={`${open ? "Collapse" : "Expand"} ${headline}`}
                        className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-charcoal/50 hover:text-near-black hover:bg-off-white transition-colors"
                      >
                        <ChevronDown
                          aria-hidden
                          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Always rendered. A collapsed body is hidden by a screen-only
                    rule, so a printed log is every entry in full. */}
                <div
                  id={bodyId}
                  className={`px-3 sm:px-4 pb-4 ${accordion && !open ? "collapsed-on-screen" : ""}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                    {columns.map((c) => (
                      <div key={c.key} className={c.wide ? "sm:col-span-2" : ""}>
                        <label className="block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/55 mb-1">
                          {c.label}
                        </label>
                        <div className="border border-light-gray rounded-md bg-white">
                          {fieldControl(row, c, true)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto border border-light-gray rounded-lg bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-off-white">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={c.width ? { minWidth: c.width } : undefined}
                    className="text-left font-sans text-xs font-semibold text-charcoal/70 px-3 py-2.5 border-b border-light-gray whitespace-nowrap"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="no-print w-10 border-b border-light-gray" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-off-white/50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-1.5 py-1 border-b border-light-gray/70 align-top"
                    >
                      {fieldControl(row, c)}
                    </td>
                  ))}
                  <td className="no-print px-1 py-1 border-b border-light-gray/70 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => deleteRow(row._id)}
                      aria-label="Delete row"
                      className="text-charcoal/35 hover:text-terracotta text-lg leading-none px-1.5"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="no-print font-sans text-xs text-charcoal/55 mt-3">
        Add rows as you go. Export to CSV any time, or import a CSV that matches
        these columns.
        {canSync
          ? " Your entries are saved to your account and this browser."
          : " Your entries autosave in this browser. Log in to save them to your account across devices."}
      </p>
    </ResourceToolShell>
  );
}
