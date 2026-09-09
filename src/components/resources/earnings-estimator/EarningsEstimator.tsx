"use client";

import { useMemo } from "react";
import Link from "next/link";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import { useResourceTool } from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import { estimate } from "@/lib/estimate/model";
import { listMetros, type EstimateAsset } from "@/lib/estimate/rates";
import { MANAGEMENT_OFFERS, SERVICE_AREA_LABEL } from "@/lib/management/constants";
import { CRR } from "@/lib/car-rental-riches";
import { RRR_PATHS } from "@/lib/room-rental-riches";

interface EstimatorState {
  metro: string;
  /** Car only. */
  daysAvailable: string;
  /** Car only. */
  condition: "excellent" | "good" | "fair";
  /** Rooms only. */
  bedrooms: string;
  /** Rooms only. */
  furnished: boolean;
}

const DEFAULT_STATE: EstimatorState = {
  metro: "",
  daysAvailable: "30",
  condition: "good",
  bedrooms: "1",
  furnished: true,
};

const SLUGS: Record<EstimateAsset, string> = {
  car: "car-earnings-estimator",
  rooms: "room-earnings-estimator",
};

const ASSET_NOUN: Record<EstimateAsset, string> = {
  car: "car",
  rooms: "rooms",
};

const CONDITIONS: { value: EstimatorState["condition"]; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/**
 * One component for both estimator tools. The `asset` prop picks the slug,
 * the metro list, and which secondary inputs render; everything downstream
 * (the call to estimate(), the result states, the two paths forward) is
 * shared.
 */
export default function EarningsEstimator({
  asset,
  canSync = false,
  feePct,
}: {
  asset: EstimateAsset;
  /** access.canSync from getResourceAccess: see other tools for why this is
   *  not simply `loggedIn` (admin preview must not write to the admin's row). */
  canSync?: boolean;
  /**
   * A decimal fraction (0 < feePct < 1), already converted from
   * getManagementFeeModel(asset)?.grossPct by the page (a Server Component)
   * via managementFeeAsDecimal, before being passed down. grossPct itself is
   * a whole percent, the unit ManagementOffer.tsx renders directly, so do
   * not pass it here unconverted, that is the bug managementFeeAsDecimal
   * exists to prevent. getManagementFeeModel cannot be called from here: this
   * is a client component, and Next only inlines NEXT_PUBLIC_-prefixed vars
   * into client bundles. Undefined until Alex configures every fee env var,
   * which is exactly when estimate() should stop returning a net figure.
   */
  feePct?: number;
}) {
  const slug = SLUGS[asset];
  const toolName = getResourceTool(slug)!.name;
  const offer = MANAGEMENT_OFFERS[asset];
  const metros = useMemo(() => listMetros(asset), [asset]);

  const { state, setState, reset } = useResourceTool<EstimatorState>(
    slug,
    DEFAULT_STATE,
    { sync: canSync },
  );

  function set<K extends keyof EstimatorState>(key: K, value: EstimatorState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  const result = useMemo(() => {
    if (!state.metro) return null;
    if (asset === "car") {
      return estimate({
        asset,
        metro: state.metro,
        daysAvailable: Number(state.daysAvailable) || undefined,
        condition: state.condition,
        feePct,
      });
    }
    return estimate({
      asset,
      metro: state.metro,
      bedrooms: Number(state.bedrooms) || undefined,
      furnished: state.furnished,
      feePct,
    });
  }, [asset, state, feePct]);

  const applyHref = `/management/apply?asset=${asset}`;
  const courseHref = asset === "car" ? CRR.path : RRR_PATHS.hub;
  const courseName = asset === "car" ? "Car Rental Riches" : "Room Rental Riches";

  return (
    <ResourceToolShell title={toolName} onReset={reset}>
      <div className="space-y-6">
        <section className="bg-white border border-light-gray rounded-lg p-4 sm:p-5 space-y-4">
          <div>
            <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
              Market
            </label>
            <select
              value={state.metro}
              onChange={(e) => set("metro", e.target.value)}
              aria-label="Market"
              className="w-full border border-light-gray rounded-lg bg-white px-3 py-2.5 font-sans text-sm text-near-black focus:outline-none focus:ring-1 focus:ring-primary-green/50 focus:border-primary-green/50"
            >
              <option value="">
                {metros.length > 0 ? "Choose a market" : "No markets configured yet"}
              </option>
              {metros.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="font-sans text-[11px] text-charcoal/50 mt-1.5">
              Service area: {SERVICE_AREA_LABEL}
            </p>
          </div>

          {asset === "car" ? (
            <>
              <div>
                <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
                  Days available per month
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={31}
                  value={state.daysAvailable}
                  onChange={(e) => set("daysAvailable", e.target.value)}
                  aria-label="Days available per month"
                  className="w-full border border-light-gray rounded-lg bg-white px-3 py-2.5 font-sans text-sm text-near-black focus:outline-none focus:ring-1 focus:ring-primary-green/50 focus:border-primary-green/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="font-sans text-[11px] text-charcoal/50 mt-1.5">
                  How many days a month the vehicle is actually free to rent, not sitting in your driveway or in the shop.
                </p>
              </div>
              <div>
                <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
                  Condition
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => set("condition", c.value)}
                      className={[
                        "rounded-lg border-2 px-2 py-2.5 text-center font-sans text-sm font-semibold transition-colors",
                        state.condition === c.value
                          ? "border-primary-green bg-primary-green/10 text-near-black"
                          : "border-light-gray bg-white text-charcoal/70 hover:border-charcoal/30",
                      ].join(" ")}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
                  Bedrooms
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={state.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                  aria-label="Bedrooms"
                  className="w-full border border-light-gray rounded-lg bg-white px-3 py-2.5 font-sans text-sm text-near-black focus:outline-none focus:ring-1 focus:ring-primary-green/50 focus:border-primary-green/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="font-sans text-[11px] text-charcoal/50 mt-1.5">
                  Rooms you would rent out individually, not the total bedroom count if you plan to keep one for yourself.
                </p>
              </div>
              <div>
                <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
                  Furnished
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => set("furnished", true)}
                    className={[
                      "rounded-lg border-2 px-2 py-2.5 text-center font-sans text-sm font-semibold transition-colors",
                      state.furnished
                        ? "border-primary-green bg-primary-green/10 text-near-black"
                        : "border-light-gray bg-white text-charcoal/70 hover:border-charcoal/30",
                    ].join(" ")}
                  >
                    Furnished
                  </button>
                  <button
                    type="button"
                    onClick={() => set("furnished", false)}
                    className={[
                      "rounded-lg border-2 px-2 py-2.5 text-center font-sans text-sm font-semibold transition-colors",
                      !state.furnished
                        ? "border-primary-green bg-primary-green/10 text-near-black"
                        : "border-light-gray bg-white text-charcoal/70 hover:border-charcoal/30",
                    ].join(" ")}
                  >
                    Unfurnished
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {!state.metro && (
          <p className="font-sans text-sm text-charcoal/60 text-center py-6">
            Choose a market above to see your range.
          </p>
        )}

        {state.metro && result && "unavailable" in result && (
          <div className="bg-cream border border-warm-gold/40 rounded-lg p-5 sm:p-6">
            <p className="font-sans text-base text-near-black leading-relaxed mb-4">
              We do not have a number for that market yet. Tell us about the
              asset and we will give you a real one.
            </p>
            <Link
              href={applyHref}
              className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green-dark text-white font-sans font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
            >
              Tell us about your {ASSET_NOUN[asset]}
            </Link>
          </div>
        )}

        {state.metro && result && !("unavailable" in result) && (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary-green text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10">
              <div>
                <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-white/75">
                  Monthly gross
                </p>
                <p className="font-display text-3xl sm:text-4xl font-semibold leading-tight mt-1">
                  {money(result.grossLow)} to {money(result.grossHigh)}
                </p>
              </div>
              {result.netLow !== null && result.netHigh !== null && (
                <div className="sm:border-l sm:border-white/25 sm:pl-10">
                  <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-white/75">
                    Monthly net
                  </p>
                  <p className="font-display text-3xl sm:text-4xl font-semibold leading-tight mt-1">
                    {money(result.netLow)} to {money(result.netHigh)}
                  </p>
                </div>
              )}
            </div>
            <p className="font-sans text-xs text-charcoal/50">
              {result.metro}, {result.state}. Estimates for education only,
              not a promise of results. They come from BNHG&apos;s metro
              rate data and what you entered above, not a valuation of your
              specific {ASSET_NOUN[asset]}.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-light-gray rounded-lg p-5 flex flex-col">
                <h3 className="font-sans text-xs font-semibold tracking-[0.14em] uppercase text-charcoal/60 mb-2">
                  Run it yourself
                </h3>
                <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-5 flex-1">
                  {courseName} teaches the operator method behind this
                  number: how to price it, list it, and run it, written down
                  so you can do it without hiring anyone.
                </p>
                <Link
                  href={courseHref}
                  className="inline-flex items-center justify-center border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white font-sans font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
                >
                  See {courseName}
                </Link>
              </div>
              <div className="bg-white border border-light-gray rounded-lg p-5 flex flex-col">
                <h3 className="font-sans text-xs font-semibold tracking-[0.14em] uppercase text-charcoal/60 mb-2">
                  Let BNHG run it
                </h3>
                <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-5 flex-1">
                  {offer.promise} {offer.operator.blurb}
                </p>
                <Link
                  href={applyHref}
                  className="inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark text-white font-sans font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
                >
                  Apply for management
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResourceToolShell>
  );
}
