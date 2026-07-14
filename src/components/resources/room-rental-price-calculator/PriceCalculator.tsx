"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  ROOM_FEATURES,
  PROPERTY_FEATURES,
  INCLUDED,
  ROOM_SIZE_OPTIONS,
  computePrice,
  type PriceInputs,
} from "@/lib/resources/room-rental-price-calculator/config";

const SLUG = "room-rental-price-calculator";
const TOOL_NAME = getResourceTool(SLUG)!.name;

interface State {
  fmv: string;
  walkability: string;
  sizeBand: string;
  features: Record<string, boolean>;
  amenities: Record<string, boolean>;
  room: Record<string, boolean>;
}

const INITIAL: State = {
  fmv: "",
  walkability: "",
  sizeBand: "",
  features: {},
  amenities: {},
  room: {},
};

function currency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function PriceCalculator() {
  const { state, setState, reset } = useResourceTool<State>(SLUG, INITIAL);

  const result = useMemo(() => {
    const inputs: PriceInputs = {
      fmv: parseFloat(state.fmv) || 0,
      walkability: parseFloat(state.walkability) || 0,
      sizeBand: state.sizeBand,
      features: state.features,
      amenities: state.amenities,
      room: state.room,
    };
    return computePrice(inputs);
  }, [state]);

  function toggleGroup(group: "features" | "amenities" | "room", id: string) {
    setState((prev) => ({
      ...prev,
      [group]: { ...prev[group], [id]: !prev[group][id] },
    }));
  }

  function exportCsv() {
    const rows: (string | number)[][] = [["Field", "Value"]];
    rows.push(["Comparable 1-BR fair-market rent", state.fmv || "0"]);
    rows.push(["Walkability score", state.walkability || "0"]);
    rows.push(["Room size", state.sizeBand || "-"]);
    rows.push([]);
    rows.push(["Feature", "Present", "Monthly value"]);
    for (const r of ROOM_FEATURES)
      rows.push([r.label, state.room[r.id] ? "Yes" : "No", state.room[r.id] ? r.dollars : 0]);
    for (const f of PROPERTY_FEATURES)
      rows.push([f.label, state.features[f.id] ? "Yes" : "No", state.features[f.id] ? f.dollars : 0]);
    for (const a of INCLUDED)
      rows.push([a.label, state.amenities[a.id] ? "Yes" : "No", state.amenities[a.id] ? a.dollars : 0]);
    rows.push([]);
    rows.push(["Base (65% of comp)", result.base]);
    rows.push(["Feature premium", result.premium]);
    rows.push(["Suggested monthly rent", result.price]);
    downloadCsv("room-rental-price.csv", buildCsv(TOOL_NAME, rows));
  }

  const checkboxRow = (
    group: "features" | "amenities" | "room",
    id: string,
    label: string,
    dollars: number,
  ) => (
    <label
      key={id}
      className="flex items-start gap-3 cursor-pointer rounded-md px-2 py-2 hover:bg-off-white transition-colors"
    >
      <input
        type="checkbox"
        checked={!!state[group][id]}
        onChange={() => toggleGroup(group, id)}
        className="mt-0.5 h-4 w-4 accent-primary-green shrink-0"
      />
      <span className="font-sans text-sm text-near-black leading-relaxed flex-1">
        {label}
      </span>
      <span className="font-sans text-xs text-charcoal/45 shrink-0 tabular-nums pt-0.5">
        +${dollars}
      </span>
    </label>
  );

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Suggested</span>
          <span className="font-semibold text-near-black">
            {currency(result.price)}/mo
          </span>
        </span>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comp + walkability + size */}
          <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-near-black mb-4">
              Start with a market comp
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fmv"
                  className="block font-sans text-sm font-semibold text-near-black mb-1.5"
                >
                  Fair-market rent of a comparable 1-bedroom
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50">
                    $
                  </span>
                  <input
                    id="fmv"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={state.fmv}
                    onChange={(e) =>
                      setState((p) => ({ ...p, fmv: e.target.value }))
                    }
                    placeholder="1400"
                    className="w-full border border-light-gray bg-white pl-7 pr-3 py-2.5 text-base text-near-black rounded-md focus:outline-none focus:border-primary-green"
                  />
                </div>
                <p className="text-xs text-charcoal/55 mt-1">
                  Try Zillow or Rentometer for your area.
                </p>
              </div>
              <div>
                <label
                  htmlFor="walk"
                  className="block font-sans text-sm font-semibold text-near-black mb-1.5"
                >
                  Walkability score (0 to 100)
                </label>
                <input
                  id="walk"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  value={state.walkability}
                  onChange={(e) =>
                    setState((p) => ({ ...p, walkability: e.target.value }))
                  }
                  placeholder="80"
                  className="w-full border border-light-gray bg-white px-3 py-2.5 text-base text-near-black rounded-md focus:outline-none focus:border-primary-green"
                />
                <p className="text-xs text-charcoal/55 mt-1">
                  From walkscore.com.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="size"
                className="block font-sans text-sm font-semibold text-near-black mb-1.5"
              >
                Room size
              </label>
              <select
                id="size"
                value={state.sizeBand}
                onChange={(e) =>
                  setState((p) => ({ ...p, sizeBand: e.target.value }))
                }
                className="w-full sm:w-72 border border-light-gray bg-white px-3 py-2.5 text-base text-near-black rounded-md focus:outline-none focus:border-primary-green"
              >
                <option value="">Select a size</option>
                {ROOM_SIZE_OPTIONS.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                    {s.dollars > 0 ? ` (+$${s.dollars})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room features */}
          <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-near-black mb-1">
              The room itself
            </h3>
            <p className="font-sans text-xs text-charcoal/55 mb-3">
              A private bathroom is the single biggest driver of room rent.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {ROOM_FEATURES.map((r) =>
                checkboxRow("room", r.id, r.label, r.dollars),
              )}
            </div>
          </div>

          {/* Property features */}
          <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-near-black mb-3">
              Property features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {PROPERTY_FEATURES.map((f) =>
                checkboxRow("features", f.id, f.label, f.dollars),
              )}
            </div>
          </div>

          {/* Included in rent */}
          <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-near-black mb-3">
              What is included in the rent
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {INCLUDED.map((a) =>
                checkboxRow("amenities", a.id, a.label, a.dollars),
              )}
            </div>
          </div>
        </div>

        {/* Result — base + suggested rent only */}
        <div className="lg:col-span-1">
          <div className="bg-near-black rounded-lg p-6 text-white lg:sticky lg:top-24">
            <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2">
              Suggested monthly rent
            </p>
            <p className="font-display text-5xl font-semibold mb-1">
              {currency(result.price)}
            </p>
            <p className="font-sans text-sm text-white/60 mb-6">
              per room / month
            </p>

            <div className="space-y-2 border-t border-white/15 pt-4 text-sm">
              <div className="flex justify-between text-white/75">
                <span>Base (65% of comp)</span>
                <span className="tabular-nums">{currency(result.base)}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Features &amp; amenities</span>
                <span className="tabular-nums">
                  {result.premium > 0 ? `+${currency(result.premium)}` : currency(0)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-white border-t border-white/15 pt-2.5 mt-1">
                <span>Suggested rent</span>
                <span className="tabular-nums">{currency(result.price)}</span>
              </div>
            </div>

            {!state.fmv && (
              <p className="font-sans text-xs text-warm-gold/90 mt-5">
                Enter a comparable 1-bedroom rent to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </ResourceToolShell>
  );
}
