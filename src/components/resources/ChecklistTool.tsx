"use client";

import { useMemo, useState } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import {
  SectionTabStrip,
  TabPanel,
  TabPager,
  scrollToPanel,
  panelAnchor,
  type TabDef,
} from "@/components/resources/SectionTabs";

// Generic, config-driven checklist: sections of checkable items with a live
// completion score, a "what is still left" recap, CSV export and print. Driven
// by a `sections` prop the same way DataTableTool is driven by `columns`. Every
// consumer's sections render as tabs — the current consumer (photo-shot-list)
// wants that, so it isn't behind a flag.

export interface CheckItem {
  id: string;
  label: string;
  optional?: boolean;
}

export interface CheckSection {
  id: string;
  label: string;
  /** Tab-strip pill text. Falls back to `label` when omitted. */
  shortLabel?: string;
  items: CheckItem[];
}

export default function ChecklistTool({
  slug,
  title,
  sections,
  csvFilename,
  unit = "complete",
  canSync = false,
}: {
  slug: string;
  title: string;
  sections: CheckSection[];
  csvFilename: string;
  /** Word after the percentage in the action bar, e.g. "complete" or "ready". */
  unit?: string;
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess — true only for a logged-in member who is not an admin
   * previewing a member tier. Not `loggedIn`: that is true for a previewing
   * admin too, and their keystrokes would land on their own row.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset, hydrated } = useResourceTool<
    Record<string, boolean>
  >(slug, {}, { sync: canSync });

  /**
   * Which tab is open. Local, not saved state: chrome, not progress — every
   * visit opens on the first section.
   */
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(slug, id));
  }

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

  // Done count per section, for the tab badges.
  const sectionDone = useMemo(
    () =>
      Object.fromEntries(
        sections.map((s) => [s.id, s.items.filter((i) => state[i.id]).length]),
      ) as Record<string, number>,
    [sections, state],
  );

  const tabs: TabDef[] = useMemo(
    () =>
      sections.map((s) => ({
        id: s.id,
        label: s.label,
        shortLabel: s.shortLabel,
        badge: `${sectionDone[s.id]}/${s.items.length}`,
      })),
    [sections, sectionDone],
  );

  const remaining = useMemo(
    () =>
      sections
        .map((s) => ({
          id: s.id,
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

      <SectionTabStrip
        tabs={tabs}
        activeId={activeSection}
        onSelect={goTo}
        ariaLabel={`${title} sections`}
      />

      {/* Sections — all mounted (for Print/Save-as-PDF), only the active one
          visible on screen. */}
      <div className="space-y-5">
        {sections.map((s) => {
          const isCurrent = s.id === activeSection;
          const done = s.items.filter((i) => state[i.id]).length;
          return (
            <TabPanel
              key={s.id}
              anchorId={panelAnchor(slug, s.id)}
              current={isCurrent}
              className="bg-white border border-light-gray rounded-lg p-5 sm:p-6"
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
            </TabPanel>
          );
        })}

        <TabPager tabs={tabs} activeId={activeSection} onSelect={goTo} />
      </div>

      {hydrated && remaining.length > 0 && (
        <div className="mt-6 bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5 no-print">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-warm-gold mb-2">
            What is still left
          </p>
          <ul className="space-y-1">
            {remaining.map((g) => (
              <li key={g.id} className="font-sans text-sm text-charcoal/80">
                <button
                  type="button"
                  onClick={() => goTo(g.id)}
                  className="hover:text-primary-green cursor-pointer underline decoration-dotted underline-offset-2"
                >
                  {g.label}
                </button>
                : {g.items.length} item{g.items.length === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ResourceToolShell>
  );
}
