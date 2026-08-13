"use client";

import { useState } from "react";
import { ExternalLink, Globe, Loader2, Search } from "lucide-react";
import type { AddressCandidate } from "@/lib/resources/address-lookup";
import {
  ALL_DETAIL_FIELDS,
  DETAIL_LABELS,
  DETAIL_TO_INPUT,
  type PropertyDetailField,
  type PropertyDetailsResponse,
} from "@/lib/resources/property-details";
import {
  MAX_ROOMS,
  formatAddress,
  PROPERTY_FEATURES,
  PROPERTY_INCLUDED,
  locationDollars,
  walkScoreUrl,
  type PricingSummary,
  type PropertyInputs,
} from "@/lib/resources/breakeven-analysis-worksheet/pricing";
import { CheckGroup, Field, GroupLabel, Warning, currency } from "./ui";

// Step 1: the property itself. Everything true of the building rather than of
// one bedroom — its name and address, its size, the comp rent every room price
// is derived from, the three location scores, and the amenities every tenant
// shares.
//
// This used to sit on top of the rooms on a single page. It was split out when
// the block grew an address, a web lookup and eight detail fields: the rooms,
// which are the part an operator actually iterates on, had been pushed below
// the fold on every visit.
//
// The division is physical, not arbitrary. A value belongs here when it is a
// fact about the house that no single room can change: one meter, one router,
// one roof, one neighbourhood. `parking` lives on the ROOM despite sounding
// property-wide, because a dedicated space is allocated per tenant.

export default function SectionProperty({
  property,
  pricing,
  onProperty,
  analysisName,
  onAnalysisName,
}: {
  property: PropertyInputs;
  pricing: PricingSummary;
  onProperty: (patch: Partial<PropertyInputs>) => void;
  /**
   * The property's name. NOT part of PropertyInputs — it is the analysis's own
   * `name`, the same string the switcher at the top of the page shows and the
   * account dashboard lists. Editing it here renames the analysis, because a
   * property having two different names was the confusion this replaced.
   */
  analysisName: string;
  onAnalysisName: (next: string) => void;
}) {
  const locationPremium = locationDollars(property);
  /** Null until there is enough address to reach a real page. */
  const scoreUrl = walkScoreUrl(property);

  /**
   * Detail fields the member has not answered. These are the only ones the
   * lookup asks about — a value they typed is treated as true, never
   * second-guessed, and never re-searched.
   */
  const missingFields = ALL_DETAIL_FIELDS.filter(
    (f) => property[DETAIL_TO_INPUT[f]].trim() === "",
  );

  /** Which inputs are mid-search, so exactly those grey out. */
  const [busyFields, setBusyFields] = useState<PropertyDetailField[]>([]);
  const isBusy = (f: PropertyDetailField) => busyFields.includes(f);

  /**
   * Writes a web lookup into the form, but only into fields that are still
   * empty. Belt to the braces of only ASKING for the blank ones: if the member
   * fills something in during the twenty seconds the search takes, their value
   * still wins.
   */
  function applyWebDetails(r: PropertyDetailsResponse) {
    const d = r.details;
    const patch: Partial<PropertyInputs> = {};
    const setIfBlank = (
      key:
        | "totalRooms"
        | "bathrooms"
        | "squareFeet"
        | "fmv"
        | "wholeHouseRent"
        | "walkability"
        | "transitScore"
        | "bikeScore",
      value: number | null,
    ) => {
      if (value === null) return;
      if (property[key].trim() !== "") return;
      patch[key] = String(value);
    };
    setIfBlank("totalRooms", d.bedrooms);
    setIfBlank("bathrooms", d.bathrooms);
    setIfBlank("squareFeet", d.squareFeet);
    setIfBlank("fmv", d.oneBedroomRent);
    setIfBlank("wholeHouseRent", d.wholeHouseRent);
    setIfBlank("walkability", d.walkScore);
    setIfBlank("transitScore", d.transitScore);
    setIfBlank("bikeScore", d.bikeScore);
    if (Object.keys(patch).length > 0) onProperty(patch);
  }

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------- property */}
      {/* Identity first — name, then address, then the numbers. Someone
          opening a saved analysis needs to know WHICH property this is before
          any figure on the page means anything. */}
      <GroupLabel>About the property</GroupLabel>
      <div className="max-w-md">
        <Field
          label="Property name"
          type="text"
          value={analysisName}
          onChange={onAnalysisName}
          placeholder="Hutchens"
          hint="Shown in the picker above"
          explain={
            <>
              What you call this property. This is the same name as the picker at
              the top of the page and on your dashboard, so renaming it here
              renames it everywhere.
            </>
          }
        />
      </div>

      <AddressFields
        property={property}
        onProperty={onProperty}
        onDetails={applyWebDetails}
        missingFields={missingFields}
        onBusyFields={setBusyFields}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Bedrooms"
          value={property.totalRooms}
          onChange={(v) => onProperty({ totalRooms: v })}
          busy={isBusy("bedrooms")}
          placeholder="5"
          min={1}
          max={MAX_ROOMS}
          required
          hint="Including any you keep"
          explain={
            <>
              Every bedroom in the house, even ones you use yourself or as an
              office. This drives how many beds, desks, and dressers the launch
              budget buys — you still furnish the room you sleep in.
            </>
          }
        />
        {/* Recorded, not computed with. They label the property on the report
            and they are what the web lookup can fill; no formula reads them. */}
        <Field
          label="Bathrooms"
          value={property.bathrooms}
          onChange={(v) => onProperty({ bathrooms: v })}
          busy={isBusy("bathrooms")}
          placeholder="2.5"
          min={0}
          hint="For the record only"
        />
        <Field
          label="Square feet"
          value={property.squareFeet}
          onChange={(v) => onProperty({ squareFeet: v })}
          busy={isBusy("squareFeet")}
          placeholder="2400"
          min={0}
          hint="For the record only"
        />
        <Field
          label="Comparable 1-bedroom rent"
          prefix="$"
          value={property.fmv}
          onChange={(v) => onProperty({ fmv: v })}
          busy={isBusy("oneBedroomRent")}
          placeholder="1400"
          required
          hint="A whole 1-bed nearby"
          explain={
            <>
              Look up what an entire one-bedroom apartment rents for in this
              neighbourhood. Every room price starts at 65% of it, because a
              private bedroom with a shared bath goes for roughly two thirds of
              a place of your own.
            </>
          }
        />
        <Field
          label="Whole-house rent"
          prefix="$"
          value={property.wholeHouseRent}
          onChange={(v) => onProperty({ wholeHouseRent: v })}
          busy={isBusy("wholeHouseRent")}
          placeholder="2200"
          hint="Optional sanity check"
          explain={
            <>
              What the whole house would rent for on one ordinary lease. We use
              it to check your room prices are believable — co-living usually
              earns 1.3 to 1.8 times a single lease, so far above that is a
              warning sign.
            </>
          }
        />
      </div>


      {/* Three numbers, not one, because a room renter values them
          differently: walkability is about living here, transit is about
          getting to work without a car, biking is the nice-to-have. */}
      <div>
        <GroupLabel
          explain={
            <>
              All three come from walkscore.com, free, no account needed. Each
              is 0-100. Leave any blank and it adds nothing to your rent.
              Transit matters most for tenants who arrive without a car.
            </>
          }
        >
          Location scores
        </GroupLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label="Walk"
            value={property.walkability}
            onChange={(v) => onProperty({ walkability: v })}
            busy={isBusy("walkScore")}
            placeholder="80"
            min={0}
            max={100}
          />
          <Field
            label="Transit"
            value={property.transitScore}
            onChange={(v) => onProperty({ transitScore: v })}
            busy={isBusy("transitScore")}
            placeholder="55"
            min={0}
            max={100}
          />
          <Field
            label="Bike"
            value={property.bikeScore}
            onChange={(v) => onProperty({ bikeScore: v })}
            busy={isBusy("bikeScore")}
            placeholder="60"
            min={0}
            max={100}
          />
        </div>
        {/* The web lookup cannot fill these three — Walk Score's per-address
            pages are not indexed, so it returns the neighbourhood's numbers or
            nothing. This link opens the real page for this exact property, which
            is two clicks and an authoritative answer. See walkScoreUrl(). */}
        <div className="no-print mt-2.5">
          {scoreUrl ? (
            <a
              href={scoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold px-3 py-2 rounded-md border border-primary-green text-primary-green bg-primary-green/5 hover:bg-primary-green/10 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Get all three from Walk Score
            </a>
          ) : (
            <p className="font-sans text-xs text-charcoal/60">
              Fill in the address above and this jumps straight to your
              property&apos;s scores.
            </p>
          )}
        </div>
        <p className="font-sans text-xs text-charcoal/60 mt-1.5">
          {scoreUrl ? "Opens walkscore.com for this address" : "Free, no account needed"}
          {locationPremium > 0 && (
            <>
              {" · adds "}
              <span className="font-semibold text-primary-green tabular-nums">
                {currency(locationPremium)}
              </span>
              {" to every room"}
            </>
          )}
        </p>
      </div>

      {pricing.fmvAboveSanityCeiling && (
        <Warning title="High-rent market.">
          The 65% rule stretches badly up here. Check these against real room
          listings nearby.
        </Warning>
      )}

      <div className="space-y-4">
        <CheckGroup
          legend="The whole property"
          fields={PROPERTY_FEATURES}
          selected={property.features}
          onToggle={(id) =>
            onProperty({ features: { ...property.features, [id]: !property.features[id] } })
          }
          explain={
            <>
              Things every tenant in the house gets to use. These raise the
              price of every room, because each tenant values in-unit laundry
              independently of the others.
            </>
          }
        />
        <CheckGroup
          legend="Included in every rent"
          fields={PROPERTY_INCLUDED}
          selected={property.included}
          onToggle={(id) =>
            onProperty({ included: { ...property.included, [id]: !property.included[id] } })
          }
          explain={
            <>
              Bundled into rent and billed to you, not the tenant. Charging for
              these means you must also enter the matching cost in section 3 —
              we will flag it if you forget.
            </>
          }
        />
      </div>
    </div>
  );
}

/**
 * Address, with a lookup that fills in the rest.
 *
 * Nothing here feeds the math. It exists so a printed report says which
 * building it is about, and so the picker, the dashboard, and the CSV can tell
 * two analyses apart when both are called "the duplex".
 *
 * A street on its own is enough to search. The route picks the provider: a
 * street alone goes to OpenStreetMap, which searches the whole US and returns
 * every match for the picker; anything narrower goes to the Census geocoder,
 * which is authoritative but cannot search on a street alone.
 *
 * Either way it only ever normalizes an ADDRESS. It cannot tell you how many
 * bedrooms the house has or what it rents for, and neither can any source we
 * can legally read: Zillow retired its public API and forbids scraping. So the
 * button promises exactly what it delivers, "Find address", and the fields it
 * cannot fill stay in the member's hands.
 */
function AddressFields({
  property,
  onProperty,
  onDetails,
  missingFields,
  onBusyFields,
}: {
  property: PropertyInputs;
  onProperty: (patch: Partial<PropertyInputs>) => void;
  /** Fires once a web lookup returns, so the parent can fill the empty fields. */
  onDetails: (r: PropertyDetailsResponse) => void;
  /** The only fields worth asking about — everything else is already answered. */
  missingFields: PropertyDetailField[];
  /** Tells the parent which inputs to grey out while the search runs. */
  onBusyFields: (f: PropertyDetailField[]) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [candidates, setCandidates] = useState<AddressCandidate[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [detailState, setDetailState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [details, setDetails] = useState<PropertyDetailsResponse | null>(null);
  const [detailError, setDetailError] = useState("");

  // A street on its own is enough. The route sends street-only queries to
  // OpenStreetMap, which searches nationwide and hands back every match, and
  // only uses the Census geocoder once a city or ZIP has narrowed it.
  const hasStreet = property.street.trim().length >= 3;
  const hasNarrowing =
    property.zip.trim() !== "" || property.city.trim() !== "" || property.state.trim() !== "";
  const canLookUp = hasStreet && status !== "loading";

  async function lookUp() {
    setStatus("loading");
    setMessage("");
    setCandidates([]);
    setTruncated(false);
    try {
      const res = await fetch("/api/resources/address-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street: property.street,
          city: property.city,
          state: property.state,
          zip: property.zip,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Lookup failed. Fill the fields in by hand.");
        return;
      }
      if (!json.candidates?.length) {
        setStatus("error");
        // A street-only miss is a coverage gap, not a typo: the nationwide map
        // only knows addresses someone has mapped. Adding a ZIP moves the query
        // onto the complete Census address data, so it is a real next step
        // rather than a retry of the same failed question.
        setMessage(
          json.source === "osm"
            ? "Not found on the map. Add a ZIP or city and try again — that searches the full address database."
            : "No match. Check the street and ZIP, or fill the fields in by hand.",
        );
        return;
      }
      setStatus("idle");
      setCandidates(json.candidates);
      setTruncated(Boolean(json.truncated));
    } catch {
      setStatus("error");
      setMessage("Lookup is unavailable. Fill the fields in by hand.");
    }
  }

  function apply(c: AddressCandidate) {
    onProperty({ street: c.street, city: c.city, state: c.state, zip: c.zip });
    setCandidates([]);
    setMessage("Address filled in.");
    setStatus("idle");
    // Deliberately does NOT start the details search. That is a separate,
    // optional step the member chooses — it costs money, takes ~20 seconds, and
    // plenty of operators already know their own bedroom count.
  }

  async function loadDetails() {
    const fields = missingFields;
    if (fields.length === 0) return;
    setDetailState("loading");
    setDetails(null);
    setDetailError("");
    onBusyFields(fields);
    try {
      const res = await fetch("/api/resources/property-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formatAddress(property), fields }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDetailState("error");
        setDetailError(json.error || "Could not look up property details.");
        return;
      }
      setDetails(json as PropertyDetailsResponse);
      setDetailState("done");
      onDetails(json as PropertyDetailsResponse);
    } catch {
      setDetailState("error");
      setDetailError("Could not look up property details.");
    } finally {
      // Always releases the fields, so a failed search never leaves the form
      // locked behind a spinner that will not stop.
      onBusyFields([]);
    }
  }

  return (
    <div>
      <GroupLabel
        explain={
          <>
            None of this changes the numbers. It labels the property everywhere
            it appears: the picker above, your dashboard, the CSV, and the
            printed report. Type the street and press Find address — a ZIP or
            city only helps if several places share that street.
          </>
        }
      >
        Address
      </GroupLabel>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        <div className="sm:col-span-6">
          <Field
            label="Street"
            type="text"
            value={property.street}
            onChange={(v) => onProperty({ street: v })}
            placeholder="123 Maple St"
          />
        </div>
        <div className="sm:col-span-3">
          <Field
            label="City"
            type="text"
            value={property.city}
            onChange={(v) => onProperty({ city: v })}
            placeholder="Douglasville"
          />
        </div>
        <div className="sm:col-span-1">
          <Field
            label="State"
            type="text"
            value={property.state}
            onChange={(v) => onProperty({ state: v })}
            placeholder="GA"
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="ZIP"
            type="text"
            value={property.zip}
            onChange={(v) => onProperty({ zip: v })}
            placeholder="30135"
          />
        </div>
      </div>

      <div className="no-print mt-3 flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={lookUp}
          disabled={!canLookUp}
          className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold px-3 py-2 rounded-md border border-primary-green text-primary-green bg-primary-green/5 hover:bg-primary-green/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {status === "loading" ? "Looking up…" : "Find address"}
        </button>
        {!hasStreet && (
          <span className="font-sans text-xs text-charcoal/55">Enter a street to look it up.</span>
        )}
        {hasStreet && !hasNarrowing && !message && candidates.length === 0 && (
          <span className="font-sans text-xs text-charcoal/55">
            Searches nationwide. A ZIP narrows it.
          </span>
        )}
        {message && (
          <span
            role="status"
            aria-live="polite"
            className={[
              "font-sans text-xs",
              status === "error" ? "text-terracotta" : "text-primary-green",
            ].join(" ")}
          >
            {message}
          </span>
        )}
      </div>

      {candidates.length > 0 && (
        <div className="no-print mt-2 rounded-md border border-light-gray bg-cream/60 p-2">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/60 px-1 pb-1">
            {candidates.length === 1 ? "Is this it?" : "Pick the right one"}
          </p>
          <ul className="space-y-1">
            {candidates.map((c) => (
              <li key={`${c.street}-${c.zip}`}>
                <button
                  type="button"
                  onClick={() => apply(c)}
                  className="w-full text-left font-sans text-sm text-near-black bg-white border border-light-gray rounded px-2.5 py-2 hover:border-primary-green hover:text-primary-green cursor-pointer transition-colors"
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          {truncated && (
            <p className="font-sans text-[11px] text-charcoal/55 px-1 pt-1.5">
              More matched than shown. Add a ZIP or city to narrow it down.
            </p>
          )}
          <button
            type="button"
            onClick={() => setCandidates([])}
            className="mt-1.5 ml-1 font-sans text-[11px] text-charcoal/55 hover:text-terracotta cursor-pointer"
          >
            None of these
          </button>
        </div>
      )}

      {/* The optional second step. Separate from the address lookup because it
          costs money, takes about twenty seconds, and an operator who already
          knows their property should never be made to wait for it. */}
      {hasStreet && (property.city.trim() !== "" || property.zip.trim() !== "") && (
        <div className="no-print mt-3 border-t border-light-gray pt-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => void loadDetails()}
              disabled={detailState === "loading" || missingFields.length === 0}
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold px-3 py-2 rounded-md border border-warm-gold text-warm-gold-dark bg-warm-gold/10 hover:bg-warm-gold/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {detailState === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden />
              )}
              {detailState === "loading"
                ? "Searching the web…"
                : missingFields.length === 0
                  ? "Nothing left to look up"
                  : `Look up ${missingFields.length} missing ${missingFields.length === 1 ? "detail" : "details"}`}
            </button>
            <span className="font-sans text-xs text-charcoal/55">
              {detailState === "loading"
                ? "About 20 seconds. The greyed fields are the ones being searched."
                : missingFields.length === 0
                  ? "You have filled everything in yourself."
                  : "Optional — skip it and type your own numbers."}
            </span>
          </div>
          {detailState === "loading" && (
            <p
              role="status"
              aria-live="polite"
              className="font-sans text-[11px] text-charcoal/55 mt-1.5"
            >
              Looking for {missingFields.map((f) => DETAIL_LABELS[f]).join(", ")}.
            </p>
          )}
        </div>
      )}

      {detailState === "error" && (
        <p className="no-print font-sans text-xs text-charcoal/60 mt-2">
          {detailError} <span className="text-charcoal/45">Enter what you know below.</span>
        </p>
      )}

      {/* What the web lookup found. Values are already in the fields by now;
          this is the receipt. Every number was read off a page by a model, so
          the sources are listed rather than summarized — that is the difference
          between an estimate a member can check and one they take on faith.

          KEPT DELIBERATELY SHORT. This panel used to also print the model's own
          prose summary, which restated the fill line at four times the length
          and was sometimes flatly wrong: on a run that filled one field of eight
          it reported "all requested property data was located in public listing
          records." The prose now appears only when nothing was found, which is
          the one case where the reason is the only useful thing on screen.

          NO GOOGLE SEARCH SUGGESTION HERE, AND THAT IS A DECISION, NOT AN
          OVERSIGHT. Gemini's Additional Terms of Service, under Grounding with
          Google Search, permit displaying Grounded Results only "with the
          associated Search Suggestion(s)". Alex was shown that clause on
          2026-08-11 and chose to drop the widget and accept the exposure. Do
          not re-add it as a fix without asking him; do not remove this note. */}
      {detailState === "done" && details && (
        <div className="no-print mt-2 rounded-md border border-warm-gold/35 bg-warm-gold/8 p-3">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-warm-gold-dark">
            From the web · estimates, not records
          </p>
          {(() => {
            const found = (Object.keys(DETAIL_LABELS) as PropertyDetailField[]).filter(
              (k) => details.details[k] !== null,
            );
            if (found.length === 0) {
              return (
                <>
                  <p className="font-sans text-xs text-charcoal/75 mt-1 leading-snug">
                    Nothing published we could verify. Enter the numbers yourself.
                  </p>
                  {/* The only place the model's prose earns its space: when
                      there is no result, the reason is all there is to say. */}
                  {details.notes && (
                    <p className="font-sans text-[11px] text-charcoal/60 mt-1 leading-snug">
                      {details.notes}
                    </p>
                  )}
                </>
              );
            }
            return (
              <p className="font-sans text-xs text-charcoal/85 mt-1 leading-snug">
                Filled in{" "}
                <span className="font-semibold">
                  {found.map((k) => DETAIL_LABELS[k]).join(", ")}
                </span>
                . Check before you rely on it.
              </p>
            );
          })()}
          {details.sources.length > 0 && (
            <p className="font-sans text-[11px] text-charcoal/60 mt-1.5 leading-snug">
              Sources:{" "}
              {details.sources.map((s, i) => (
                <span key={s.uri}>
                  {i > 0 && ", "}
                  <a
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-primary-green hover:underline"
                  >
                    {s.title}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
