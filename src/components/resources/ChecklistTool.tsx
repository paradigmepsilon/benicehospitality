"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";

// Generic, config-driven checklist: sections of checkable items with a live
// completion score, a "what is still left" recap, CSV export and print. Driven
// by a `sections` prop the same way DataTableTool is driven by `columns`.

export interface CheckItem {
  id: string;
  label: string;
  optional?: boolean;
}

export interface CheckSection {
  label: string;
  items: CheckItem[];
}

export default function ChecklistTool({
  slug,
  title,
  sections,
  csvFilename,
  unit = "complete",
}: {
  slug: string;
  title: string;
  sections: CheckSection[];
  csvFilename: string;
  /** Word after the percentage in the action bar, e.g. "complete" or "ready". */
  unit?: string;
}) {
  const { state, setState, reset, hydrated } = useResourceTool<
    Record<string, boolean>
  >(slug, {});

  const allItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const requiredCount = useMemo(
    () => allItems.filter((i) => !i.optional).length,
    [allItems],
  );
  const requiredDone = useMemo(
    () => allItems.filter((i) => !i.optional && state[i.id]).length,
    [allItems, state],
  );
  const percent = requiredCount
    ? Math.round((requiredDone / requiredCount) * 100)
    : 0;

  const remaining = useMemo(
    () =>
      sections
        .map((s) => ({
          label: s.label,
          items: s.items.filter((i) => !state[i.id]),
        }))
        .filter((g) => g.items.length > 0),
    [sections, state],
  );

  function toggle(id: string) {
    setState((p) => ({ ...p, [id]: !p[id] }));
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Section", "Item", "Done", "Optional"],
    ];
    for (const s of sections)
      for (const it of s.items)
        rows.push([
          s.label,
          it.label,
          state[it.id] ? "Yes" : "No",
          it.optional ? "Yes" : "No",
        ]);
    downloadCsv(csvFilename, buildCsv(title, rows));
  }

  return (
    <ResourceToolShell
      title={title}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="font-semibold text-near-black">{percent}%</span>
          <span className="text-charcoal/60">{unit}</span>
        </span>
      }
    >
      {/* Progress header */}
      <div className="bg-near-black rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-warm-gold">
            Progress
          </p>
          <p className="font-sans text-sm text-white/80">
            {requiredDone} of {requiredCount} done
          </p>
        </div>
        <div className="h-2 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-green rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((s) => {
          const done = s.items.filter((i) => state[i.id]).length;
          return (
            <div
              key={s.label}
              className="bg-white border border-light-gray rounded-lg p-5 sm:p-6 break-inside-avoid"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-display text-lg font-semibold text-near-black">
                  {s.label}
                </h3>
                <span className="font-sans text-xs text-charcoal/50 shrink-0">
                  {done}/{s.items.length}
                </span>
              </div>
              <div className="space-y-1">
                {s.items.map((it) => (
                  <label
                    key={it.id}
                    className="flex items-start gap-3 cursor-pointer rounded-md px-2 py-1.5 hover:bg-off-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!state[it.id]}
                      onChange={() => toggle(it.id)}
                      className="mt-0.5 h-4 w-4 accent-primary-green shrink-0"
                    />
                    <span
                      className={`font-sans text-sm leading-relaxed flex-1 ${
                        state[it.id]
                          ? "text-charcoal/45 line-through"
                          : "text-near-black"
                      }`}
                    >
                      {it.label}
                      {it.optional && (
                        <span className="text-charcoal/40 text-xs">
                          {" "}
                          (optional)
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {hydrated && remaining.length > 0 && (
        <div className="mt-6 bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5 no-print">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-warm-gold mb-2">
            What is still left
          </p>
          <ul className="space-y-1">
            {remaining.map((g) => (
              <li key={g.label} className="font-sans text-sm text-charcoal/80">
                {g.label}: {g.items.length} item{g.items.length === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ResourceToolShell>
  );
}
