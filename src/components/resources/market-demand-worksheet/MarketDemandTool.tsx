"use client";

import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  DEMAND_SECTIONS,
  DEMAND_ALL_INDICATORS,
} from "@/lib/resources/market-demand-worksheet/config";

const SLUG = "market-demand-worksheet";
const TOOL_NAME = getResourceTool(SLUG)!.name;

interface State {
  address: string;
  findings: Record<string, string>;
  summary: string;
}

const INITIAL: State = { address: "", findings: {}, summary: "" };

export default function MarketDemandTool({ loggedIn = false }: { loggedIn?: boolean }) {
  const { state, setState, reset } = useResourceTool<State>(SLUG, INITIAL, {
    sync: loggedIn,
  });

  const filled = DEMAND_ALL_INDICATORS.filter(
    (i) => (state.findings[i.id] ?? "").trim().length > 0,
  ).length;

  function setFinding(id: string, value: string) {
    setState((p) => ({ ...p, findings: { ...p.findings, [id]: value } }));
  }

  function exportCsv() {
    const rows: (string | number)[][] = [];
    rows.push(["Market area", state.address || "-"]);
    rows.push([]);
    rows.push(["Section", "Indicator", "Guiding Question", "Your Findings"]);
    for (const section of DEMAND_SECTIONS) {
      for (const ind of section.indicators) {
        rows.push([section.label, ind.indicator, ind.question, state.findings[ind.id] ?? ""]);
      }
    }
    rows.push([]);
    rows.push(["Demand Analysis Summary", state.summary || ""]);
    downloadCsv("market-demand-worksheet.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="font-sans text-sm text-charcoal/60">
          {filled}/{DEMAND_ALL_INDICATORS.length} filled
        </span>
      }
    >
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
          value={state.address}
          onChange={(e) => setState((p) => ({ ...p, address: e.target.value }))}
          placeholder="City, neighborhood, or ZIP"
          className="w-full sm:max-w-md border border-light-gray bg-white px-3 py-2.5 text-base text-near-black rounded-md focus:outline-none focus:border-primary-green"
        />
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {DEMAND_SECTIONS.map((section) => (
          <div
            key={section.id}
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
                    value={state.findings[ind.id] ?? ""}
                    onChange={(e) => setFinding(ind.id, e.target.value)}
                    placeholder="Your findings"
                    rows={2}
                    className="mt-2 w-full border border-light-gray bg-white px-3 py-2 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green resize-y"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
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
          value={state.summary}
          onChange={(e) => setState((p) => ({ ...p, summary: e.target.value }))}
          placeholder="Your conclusion and recommended next step"
          rows={5}
          className="w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green resize-y"
        />
      </div>
    </ResourceToolShell>
  );
}
