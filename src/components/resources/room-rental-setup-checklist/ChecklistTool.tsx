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
import { getResourceTool } from "@/lib/resources/registry";
import {
  CHECKLIST_SECTIONS,
  CHECKLIST_ALL_ITEMS,
  CHECKLIST_REQUIRED_COUNT,
} from "@/lib/resources/room-rental-setup-checklist/config";

const SLUG = "room-rental-setup-checklist";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "rrc";

type Checked = Record<string, boolean>;

/**
 * Short tab labels for the strip. The full `section.label` still heads each
 * panel; these only need to fit a ~90px pill.
 */
const SHORT_LABEL: Record<string, string> = {
  general: "General",
  bedroom: "Bedroom",
  common: "Common Area",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  laundry: "Laundry",
  operations: "Operations",
  prelisting: "Pre-Listing",
};

export default function ChecklistTool({ canSync = false }: {
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess — true only for a logged-in member who is not an admin
   * previewing a member tier. Not `loggedIn`: that is true for a previewing
   * admin too, and their keystrokes would land on their own row.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset, hydrated } = useResourceTool<Checked>(
    SLUG,
    {},
    { sync: canSync },
  );

  /**
   * Which tab is open. Deliberately local, not part of the saved state: this
   * is chrome, not checklist progress, and every visit should open on the
   * first section rather than wherever a prior session left off.
   */
  const [activeSection, setActiveSection] = useState<string>(
    CHECKLIST_SECTIONS[0].id,
  );

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  const requiredDone = useMemo(
    () =>
      CHECKLIST_ALL_ITEMS.filter((i) => !i.optional && state[i.id]).length,
    [state],
  );
  const percent = Math.round((requiredDone / CHECKLIST_REQUIRED_COUNT) * 100);

  // Done count per section, for the tab badges and each panel's header.
  const sectionDone = useMemo(
    () =>
      Object.fromEntries(
        CHECKLIST_SECTIONS.map((section) => [
          section.id,
          section.items.filter((i) => state[i.id]).length,
        ]),
      ) as Record<string, number>,
    [state],
  );

  const tabs: TabDef[] = useMemo(
    () =>
      CHECKLIST_SECTIONS.map((section) => ({
        id: section.id,
        label: section.label,
        shortLabel: SHORT_LABEL[section.id] ?? section.label,
        badge: `${sectionDone[section.id]}/${section.items.length}`,
      })),
    [sectionDone],
  );

  const remaining = useMemo(
    () =>
      CHECKLIST_SECTIONS.map((section) => ({
        section,
        items: section.items.filter((i) => !state[i.id]),
      })).filter((g) => g.items.length > 0),
    [state],
  );

  function toggle(id: string) {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function exportCsv() {
    const rows = [["Section", "Item", "Done", "Optional"]];
    for (const section of CHECKLIST_SECTIONS) {
      for (const item of section.items) {
        rows.push([
          section.label,
          item.label,
          state[item.id] ? "Yes" : "No",
          item.optional ? "Yes" : "No",
        ]);
      }
    }
    downloadCsv(
      "room-rental-setup-checklist.csv",
      buildCsv(TOOL_NAME, rows),
    );
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="font-semibold text-near-black">{percent}%</span>
          <span className="text-charcoal/60">ready</span>
        </span>
      }
    >
      {/* Readiness header */}
      <div className="bg-near-black rounded-lg p-6 mb-8 text-white">
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold">
            Launch readiness
          </p>
          <p className="font-display text-3xl font-semibold">
            {percent}
            <span className="text-lg text-white/60">%</span>
          </p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-green transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="font-sans text-sm text-white/70 mt-3">
          {requiredDone} of {CHECKLIST_REQUIRED_COUNT} required items done
          {percent === 100
            ? ". You are ready to shoot photos and list."
            : `. ${CHECKLIST_REQUIRED_COUNT - requiredDone} to go.`}
        </p>
      </div>

      <SectionTabStrip
        tabs={tabs}
        activeId={activeSection}
        onSelect={goTo}
        ariaLabel="Checklist sections"
      />

      {/* Sections — all mounted (for Print/Save-as-PDF), only the active one
          visible on screen. */}
      <div className="space-y-6">
        {CHECKLIST_SECTIONS.map((section) => {
          const isCurrent = section.id === activeSection;
          const done = sectionDone[section.id];
          return (
            <TabPanel
              key={section.id}
              anchorId={panelAnchor(ANCHOR_PREFIX, section.id)}
              current={isCurrent}
              className="bg-white border border-light-gray rounded-lg p-5 sm:p-6"
            >
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-near-black">
                    {section.label}
                  </h3>
                  {section.blurb && (
                    <p className="font-sans text-xs text-charcoal/60 mt-0.5">
                      {section.blurb}
                    </p>
                  )}
                </div>
                <span className="font-sans text-sm text-charcoal/60 shrink-0">
                  {done}/{section.items.length}
                </span>
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const checked = !!state[item.id];
                  return (
                    <li key={item.id}>
                      <label className="flex items-start gap-3 cursor-pointer rounded-md px-2 py-2 hover:bg-off-white transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 h-4 w-4 accent-primary-green shrink-0"
                        />
                        <span
                          className={[
                            "font-sans text-sm leading-relaxed",
                            checked
                              ? "text-charcoal/45 line-through"
                              : "text-near-black",
                          ].join(" ")}
                        >
                          {item.label}
                          {item.optional && (
                            <span className="ml-2 text-[11px] uppercase tracking-wide text-charcoal/40">
                              optional
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </TabPanel>
          );
        })}

        <TabPager tabs={tabs} activeId={activeSection} onSelect={goTo} />
      </div>

      {/* What's left */}
      {hydrated && remaining.length > 0 && (
        <div className="mt-8 bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-near-black mb-3">
            What is still left
          </h3>
          <div className="space-y-3">
            {remaining.map(({ section, items }) => (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => goTo(section.id)}
                  className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal/60 mb-1 hover:text-primary-green cursor-pointer underline decoration-dotted underline-offset-2"
                >
                  {section.label}
                </button>
                <ul className="list-disc pl-5 space-y-0.5">
                  {items.map((i) => (
                    <li
                      key={i.id}
                      className="font-sans text-sm text-charcoal leading-relaxed"
                    >
                      {i.label}
                      {i.optional && (
                        <span className="ml-2 text-[11px] uppercase tracking-wide text-charcoal/40">
                          optional
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </ResourceToolShell>
  );
}
