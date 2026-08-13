"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  ExampleToggle,
  ExampleBanner,
} from "@/components/resources/ExampleMode";
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
  DEMAND_SECTIONS,
  DEMAND_ALL_INDICATORS,
} from "@/lib/resources/market-demand-worksheet/config";
import {
  EXAMPLE_STATE,
  EXAMPLE_BANNER,
} from "@/lib/resources/market-demand-worksheet/example";

const SLUG = "market-demand-worksheet";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "mdw";

const SHORT_LABEL: Record<string, string> = {
  demographic: "Demographic",
  housing: "Housing",
  demand: "Demand Signals",
  lifestyle: "Lifestyle",
  competition: "Competition",
};

interface State {
  address: string;
  findings: Record<string, string>;
  summary: string;
}

const INITIAL: State = { address: "", findings: {}, summary: "" };

export default function MarketDemandTool({ canSync = false }: { canSync?: boolean }) {
  const { state, setState, reset } = useResourceTool<State>(SLUG, INITIAL, {
    sync: canSync,
  });

  /**
   * Example mode: swaps the read source to Della's completed Charlotte, NC
   * analysis, read-only. The member's own state is never written while it's
   * on. ?example=1 (the dashboard's "See a completed example" link) opens the
   * tool with it already on; the page wraps this component in Suspense for
   * useSearchParams, same as the breakeven planner's ?a= deep link.
   */
  const params = useSearchParams();
  const [example, setExample] = useState(params.get("example") === "1");

  /**
   * Which tab is open. Local, not saved state: chrome, not research —
   * every visit opens on the first dimension.
   */
  const [activeSection, setActiveSection] = useState<string>(
    DEMAND_SECTIONS[0].id,
  );

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  // Everything below renders from `view`: the example dataset when example
  // mode is on, the member's own state otherwise. Writes always target state.
  const view = example ? EXAMPLE_STATE : state;

  const filled = DEMAND_ALL_INDICATORS.filter(
    (i) => (view.findings[i.id] ?? "").trim().length > 0,
  ).length;

  // Filled count per section, for the tab badges.
  const sectionFilled = useMemo(
    () =>
      Object.fromEntries(
        DEMAND_SECTIONS.map((s) => [
          s.id,
          s.indicators.filter((i) => (view.findings[i.id] ?? "").trim().length > 0)
            .length,
        ]),
      ) as Record<string, number>,
    [view.findings],
  );

  const tabs: TabDef[] = useMemo(
    () =>
      DEMAND_SECTIONS.map((s) => ({
        id: s.id,
        label: s.label,
        shortLabel: SHORT_LABEL[s.id] ?? s.label,
        badge: `${sectionFilled[s.id]}/${s.indicators.length}`,
      })),
    [sectionFilled],
  );

  function setFinding(id: string, value: string) {
    setState((p) => ({ ...p, findings: { ...p.findings, [id]: value } }));
  }

  function exportCsv() {
    const rows: (string | number)[][] = [];
    rows.push(["Market area", view.address || "-"]);
    rows.push([]);
    rows.push(["Section", "Indicator", "Guiding Question", "Your Findings"]);
    for (const section of DEMAND_SECTIONS) {
      for (const ind of section.indicators) {
        rows.push([section.label, ind.indicator, ind.question, view.findings[ind.id] ?? ""]);
      }
    }
    rows.push([]);
    rows.push(["Demand Analysis Summary", view.summary || ""]);
    downloadCsv(
      example ? "market-demand-worksheet-example.csv" : "market-demand-worksheet.csv",
      buildCsv(TOOL_NAME, rows),
    );
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={example ? undefined : reset}
      actionsRight={
        <span className="inline-flex items-center gap-3">
          <ExampleToggle on={example} onToggle={setExample} />
          <span className="font-sans text-sm text-charcoal/60">
            {filled}/{DEMAND_ALL_INDICATORS.length} filled
          </span>
        </span>
      }
    >
      {example && <ExampleBanner>{EXAMPLE_BANNER}</ExampleBanner>}

      {/* Market area */}
      <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6 mb-6">
        <label
          htmlFor="market-address"
          className="block font-sans text-sm font-semibold text-near-black mb-1.5"
        >
          Market area you are evaluating
        </label>
        <input
          id="market-address"
          type="text"
          value={view.address}
          readOnly={example}
          onChange={(e) => {
            if (example) return;
            setState((p) => ({ ...p, address: e.target.value }));
          }}
          placeholder="City, neighborhood, or ZIP"
          className={`w-full sm:max-w-md border border-light-gray px-3 py-2.5 text-base rounded-md focus:outline-none focus:border-primary-green ${
            example ? "bg-cream/50 text-charcoal/80" : "bg-white text-near-black"
          }`}
        />
      </div>

      <SectionTabStrip
        tabs={tabs}
        activeId={activeSection}
        onSelect={goTo}
        ariaLabel="Market demand dimensions"
        gridClassName="grid-cols-2 sm:grid-cols-5"
      />

      {/* Sections — all mounted (for Print/Save-as-PDF), only the active one
          visible on screen. */}
      <div className="space-y-6">
        {DEMAND_SECTIONS.map((section) => (
          <TabPanel
            key={section.id}
            anchorId={panelAnchor(ANCHOR_PREFIX, section.id)}
            current={section.id === activeSection}
            className="bg-white border border-light-gray rounded-lg p-5 sm:p-6"
          >
            <h3 className="font-display text-lg font-semibold text-near-black mb-4">
              {section.label}
            </h3>
            <div className="space-y-5">
              {section.indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="border-t border-light-gray/70 pt-4 first:border-t-0 first:pt-0"
                >
                  <p className="font-sans text-sm font-semibold text-near-black">
                    {ind.indicator}
                  </p>
                  <p className="font-sans text-sm text-charcoal/80 mt-0.5">
                    {ind.question}
                  </p>
                  <p className="font-sans text-xs text-charcoal/55 mt-1">
                    Why it matters: {ind.why}{" "}
                    <span className="text-charcoal/45">
                      · Data: {ind.sources}
                    </span>
                  </p>
                  <textarea
                    value={view.findings[ind.id] ?? ""}
                    readOnly={example}
                    onChange={(e) => {
                      if (example) return;
                      setFinding(ind.id, e.target.value);
                    }}
                    placeholder="Your findings"
                    rows={example ? 3 : 2}
                    className={`mt-2 w-full border border-light-gray px-3 py-2 text-sm rounded-md focus:outline-none focus:border-primary-green resize-y ${
                      example ? "bg-cream/50 text-charcoal/80" : "bg-white text-near-black"
                    }`}
                  />
                </div>
              ))}
            </div>
          </TabPanel>
        ))}

        <TabPager tabs={tabs} activeId={activeSection} onSelect={goTo} />
      </div>

      {/* Summary */}
      <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5 sm:p-6 mt-6">
        <h3 className="font-display text-lg font-semibold text-near-black mb-2">
          Demand analysis summary
        </h3>
        <p className="font-sans text-sm text-charcoal/70 mb-3">
          Based on everything above, will this market support your co-living
          property? Write your go / no-go call.
        </p>
        <textarea
          value={view.summary}
          readOnly={example}
          onChange={(e) => {
            if (example) return;
            setState((p) => ({ ...p, summary: e.target.value }));
          }}
          placeholder="Your conclusion and recommended next step"
          rows={example ? 9 : 5}
          className={`w-full border border-light-gray px-3 py-2.5 text-sm rounded-md focus:outline-none focus:border-primary-green resize-y ${
            example ? "bg-cream/50 text-charcoal/80" : "bg-white text-near-black"
          }`}
        />
      </div>
    </ResourceToolShell>
  );
}
