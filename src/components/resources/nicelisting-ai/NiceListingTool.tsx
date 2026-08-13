"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";
import { useResourceTool } from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  AMENITIES,
  AUDIENCES,
  EMOTION_WORDS,
  generateListing,
  type ListingInputs,
} from "@/lib/resources/nicelisting-ai/config";

const SLUG = "nicelisting-ai";
const TOOL_NAME = getResourceTool(SLUG)!.name;

interface State extends Omit<ListingInputs, "amenities"> {
  amenities: Record<string, boolean>;
}

const INITIAL: State = {
  emotion: "Sunny",
  feature: "",
  location: "",
  benefit: "",
  audience: "any",
  roomDetails: "",
  amenities: {},
  neighborhood: "",
  rent: "",
  term: "",
};

const inputClass =
  "w-full border border-light-gray focus:border-primary-green bg-white px-3 py-2 text-sm text-near-black rounded-md focus:outline-none placeholder:text-charcoal/30";
const labelClass =
  "block font-sans text-xs font-semibold uppercase tracking-wide text-charcoal/60 mb-1.5";

export default function NiceListingTool({ canSync = false }: {
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess — true only for a logged-in member who is not an admin
   * previewing a member tier. Not `loggedIn`: that is true for a previewing
   * admin too, and their keystrokes would land on their own row.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<State>(SLUG, INITIAL, {
    sync: canSync,
  });

  const result = useMemo(
    () =>
      generateListing({
        ...state,
        amenities: AMENITIES.filter((a) => state.amenities[a]),
      }),
    [state],
  );

  function set<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }
  function toggleAmenity(a: string) {
    setState((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [a]: !prev.amenities[a] },
    }));
  }

  const fullListing = `${result.title}\n\n${result.description}`;
  const titleOk = result.titleLength > 0 && result.titleLength <= 65;

  return (
    <ResourceToolShell title={TOOL_NAME} onReset={reset}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Vibe word</label>
              <select
                value={state.emotion}
                onChange={(e) => set("emotion", e.target.value)}
                className={inputClass}
              >
                {EMOTION_WORDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Ideal tenant</label>
              <select
                value={state.audience}
                onChange={(e) => set("audience", e.target.value)}
                className={inputClass}
              >
                {AUDIENCES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Key feature</label>
            <input
              value={state.feature}
              onChange={(e) => set("feature", e.target.value)}
              placeholder="Private suite, furnished room with ensuite..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Location</label>
              <input
                value={state.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Midtown, near Emory..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Standout benefit</label>
              <input
                value={state.benefit}
                onChange={(e) => set("benefit", e.target.value)}
                placeholder="walk to the hospital"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Room details</label>
            <textarea
              value={state.roomDetails}
              onChange={(e) => set("roomDetails", e.target.value)}
              placeholder="Queen bed, large closet, desk by a bright window, blackout curtains."
              rows={2}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Amenities included</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {AMENITIES.map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-2 cursor-pointer rounded px-1.5 py-1 hover:bg-off-white"
                >
                  <input
                    type="checkbox"
                    checked={!!state.amenities[a]}
                    onChange={() => toggleAmenity(a)}
                    className="h-4 w-4 accent-primary-green shrink-0"
                  />
                  <span className="font-sans text-sm text-near-black">{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Neighborhood highlights</label>
            <input
              value={state.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)}
              placeholder="10 min to the hospital, walkable coffee, quiet street"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Rent (monthly)</label>
              <input
                value={state.rent}
                onChange={(e) => set("rent", e.target.value)}
                inputMode="numeric"
                placeholder="1200"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Minimum stay</label>
              <input
                value={state.term}
                onChange={(e) => set("term", e.target.value)}
                placeholder="30 days"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-warm-gold">
                Listing title
              </h3>
              <div className="no-print shrink-0">
                <CopyButton text={result.title} label="Copy title" />
              </div>
            </div>
            <p className="font-display text-lg font-semibold text-near-black leading-snug">
              {result.title || "Your title will appear here"}
            </p>
            <p
              className={`font-sans text-xs mt-2 ${
                titleOk ? "text-primary-green" : "text-charcoal/45"
              }`}
            >
              {result.titleLength}/65 characters
              {result.titleLength > 65 ? " (trim for full display)" : ""}
            </p>
          </div>

          <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-warm-gold">
                Description
              </h3>
              <div className="no-print shrink-0 flex gap-2">
                <CopyButton text={result.description} label="Copy" />
                <CopyButton text={fullListing} label="Copy all" />
              </div>
            </div>
            <div className="bg-off-white border border-light-gray/70 rounded-md p-4">
              <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap">
                {result.description ||
                  "Fill in a few details and your four-part description will build itself here."}
              </p>
            </div>
            <p className="no-print font-sans text-xs text-charcoal/55 mt-3">
              This is your strong first draft in the framework that converts.
              Personalize the voice, then post it. You know your home better than
              any tool does.
            </p>
          </div>
        </div>
      </div>
    </ResourceToolShell>
  );
}
