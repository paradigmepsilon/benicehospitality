"use client";

import { useMemo, useRef } from "react";
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

export type DataRow = { _id: string } & Record<string, string>;

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
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, setState, reset } = useResourceTool<State>(
    slug,
    { rows: [blankRow(columns)] },
    { sync: canSync },
  );

  const rows = state.rows.length ? state.rows : [blankRow(columns)];

  const valueOf = useMemo(
    () => (row: DataRow, col: DataColumn) =>
      col.compute ? computeValue(row, col.compute) : (row[col.key] ?? ""),
    [],
  );

  function addRow() {
    setState((p) => ({ rows: [...p.rows, blankRow(columns)] }));
  }
  function deleteRow(id: string) {
    setState((p) => {
      const next = p.rows.filter((r) => r._id !== id);
      return { rows: next.length ? next : [blankRow(columns)] };
    });
  }
  function setCell(id: string, key: string, value: string) {
    setState((p) => ({
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
          return { rows: [...existing, ...imported] };
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
        {canSync && (
          <span className="font-sans text-xs text-charcoal/50">
            Saved to your account
          </span>
        )}
      </div>

      {variant === "cards" ? (
        <div className="space-y-4">
          {rows.map((row, idx) => (
            <div
              key={row._id}
              className="bg-white border border-light-gray rounded-lg p-4 sm:p-5 break-inside-avoid"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="font-display text-sm font-semibold text-near-black capitalize">
                  {entryNoun} {idx + 1}
                </p>
                <button
                  type="button"
                  onClick={() => deleteRow(row._id)}
                  aria-label="Delete entry"
                  className="no-print font-sans text-xs text-charcoal/45 hover:text-terracotta"
                >
                  Remove
                </button>
              </div>
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
          ))}
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
