"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";
import {
  BANDS,
  BAND_COPY,
  DEFAULT_STATE,
  FACTORS,
  MAX_TOTAL,
  SCORING_RULE,
  VETO_RULE,
  bandFor,
  isFullyScored,
  scoredCount,
  totalFor,
  vetoFactors,
  type Band,
  type CandidateCar,
  type Factor,
  type FactorId,
  type ScoreValue,
  type ScorecardState,
} from "@/lib/resources/market-underwriting-scorecard/config";

const SLUG = "market-underwriting-scorecard";
const TOOL_NAME = getResourceTool(SLUG)!.name;

const BAND_STYLE: Record<Band, string> = {
  STRONG: "bg-primary-green text-white",
  INVESTIGATE: "bg-warm-gold text-near-black",
  PASS: "bg-terracotta text-white",
};

const LEVEL_TITLE: Record<ScoreValue, string> = {
  5: "5 · Strong",
  4: "4",
  3: "3 · Fair",
  2: "2",
  1: "1 · Weak",
};

/** The lesson anchors 5, 3, and 1; the in-between scores split the difference. */
function levelDescriptor(f: Factor, v: ScoreValue): string {
  if (v === 5 || v === 3 || v === 1) return f.anchors[v];
  return v === 4 ? "Between strong and fair." : "Between fair and weak.";
}

function money(v: string): string {
  const n = parseFloat(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Ranked shortlist order: fully scored first by total, then partials, then new. */
function rankCars(cars: CandidateCar[]): CandidateCar[] {
  return [...cars].sort((a, b) => {
    const fullDiff = Number(isFullyScored(b)) - Number(isFullyScored(a));
    if (fullDiff !== 0) return fullDiff;
    const totalDiff = totalFor(b) - totalFor(a);
    if (totalDiff !== 0) return totalDiff;
    return scoredCount(b) - scoredCount(a);
  });
}

export default function MarketUnderwritingScorecard({ canSync = false }: {
  /** access.canSync from getResourceAccess, same contract as the calculator. */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<ScorecardState>(
    SLUG,
    DEFAULT_STATE,
    { sync: canSync },
  );

  /** Which car the scoring panel shows. Chrome, not underwriting, so local. */
  const [activeId, setActiveId] = useState<string | null>(null);

  // Add-car form fields, local until "Add candidate" commits them.
  const [draftNickname, setDraftNickname] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  const ranked = useMemo(() => rankCars(state.cars), [state.cars]);
  const activeCar = state.cars.find((c) => c.id === activeId) ?? null;
  const finalists = ranked.filter(
    (c) => isFullyScored(c) && bandFor(totalFor(c)) === "STRONG",
  );

  function addCar() {
    const nickname = draftNickname.trim();
    if (!nickname) return;
    const car: CandidateCar = {
      id: crypto.randomUUID(),
      nickname,
      price: draftPrice.trim(),
      notes: draftNotes.trim(),
      scores: {},
    };
    setState((p) => ({ ...p, cars: [...p.cars, car] }));
    setActiveId(car.id);
    setDraftNickname("");
    setDraftPrice("");
    setDraftNotes("");
  }

  function updateCar(id: string, patch: Partial<CandidateCar>) {
    setState((p) => ({
      ...p,
      cars: p.cars.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function setScore(id: string, factorId: FactorId, value: ScoreValue) {
    setState((p) => ({
      ...p,
      cars: p.cars.map((c) =>
        c.id === id ? { ...c, scores: { ...c.scores, [factorId]: value } } : c,
      ),
    }));
  }

  function removeCar(id: string) {
    if (!window.confirm("Remove this candidate and its scores?")) return;
    setState((p) => ({ ...p, cars: p.cars.filter((c) => c.id !== id) }));
    if (activeId === id) setActiveId(null);
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      [
        "Rank",
        "Candidate",
        "Price",
        "Notes",
        ...FACTORS.map((f) => f.shortName),
        `Total (of ${MAX_TOTAL})`,
        "Band",
        "Veto factors (scored 0)",
      ],
      ...ranked.map((c, i) => [
        i + 1,
        c.nickname,
        c.price || "",
        c.notes || "",
        ...FACTORS.map((f) => c.scores[f.id] ?? ""),
        totalFor(c),
        isFullyScored(c)
          ? bandFor(totalFor(c))
          : `${scoredCount(c)}/${FACTORS.length} scored`,
        vetoFactors(c).map((f) => f.shortName).join("; "),
      ]),
      [],
      [
        `Bands: STRONG ${BANDS.strongAt} to ${MAX_TOTAL} (run the full calculator), INVESTIGATE ${BANDS.investigateAt} to ${BANDS.strongAt - 1} (investigate the weak factors first), PASS below ${BANDS.investigateAt}.`,
      ],
      [VETO_RULE],
      [],
      [CALC_DISCLAIMER],
    ];
    downloadCsv("market-underwriting-shortlist.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={state.cars.length > 0 ? exportCsv : undefined}
      onReset={reset}
      actionsRight={
        <span className="font-sans text-sm text-charcoal/60">
          {state.cars.length === 0
            ? "No candidates yet"
            : `${state.cars.length} candidate${state.cars.length === 1 ? "" : "s"} · ${state.cars.filter(isFullyScored).length} fully scored`}
        </span>
      }
    >
      {/* Method banner */}
      <div className="bg-near-black text-white rounded-lg p-5 mb-6">
        <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold">
          The six-factor filter
        </p>
        <p className="font-sans text-sm leading-relaxed mt-1.5">
          You are not buying a car. You are buying a deal. Score each candidate
          1 to 5 on all six factors for a total out of {MAX_TOTAL}:{" "}
          <span className="font-semibold">Strong</span> at {BANDS.strongAt} or
          better goes straight to the calculator,{" "}
          <span className="font-semibold">Investigate</span> at{" "}
          {BANDS.investigateAt} to {BANDS.strongAt - 1} means find the weak
          factors first, and below {BANDS.investigateAt} is a{" "}
          <span className="font-semibold">Pass</span>. {SCORING_RULE}
        </p>
      </div>

      {/* Shortlist */}
      <section className="bg-white border border-light-gray rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 bg-off-white border-b border-light-gray flex items-center justify-between gap-3">
          <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
            Ranked shortlist
          </p>
          <p className="font-sans text-[11px] text-charcoal/50">
            Best deal first. Click a row to score it.
          </p>
        </div>

        {ranked.length === 0 ? (
          <p className="px-4 py-8 text-center font-sans text-sm text-charcoal/60">
            Add your first candidate below. Every car you are considering goes
            on this list, gets scored, and earns its rank.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-light-gray">
                  <Th>#</Th>
                  <Th>Candidate</Th>
                  <Th>Price</Th>
                  <Th>Scored</Th>
                  <Th>Total</Th>
                  <Th>Band</Th>
                  <Th><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/70">
                {ranked.map((c, i) => {
                  const total = totalFor(c);
                  const full = isFullyScored(c);
                  const vetoes = vetoFactors(c);
                  const isActive = c.id === activeId;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`cursor-pointer transition-colors ${isActive ? "bg-primary-green/5" : "hover:bg-off-white"}`}
                    >
                      <Td className="font-display font-semibold text-charcoal/60">
                        {i + 1}
                      </Td>
                      <Td>
                        <span className="font-sans text-sm font-semibold text-near-black">
                          {c.nickname}
                        </span>
                        {c.notes && (
                          <span className="block font-sans text-[11px] text-charcoal/50 max-w-56 truncate">
                            {c.notes}
                          </span>
                        )}
                        {vetoes.length > 0 && (
                          <span className="block font-sans text-[11px] font-semibold text-terracotta">
                            Veto: {vetoes.map((f) => f.shortName).join(", ")}
                          </span>
                        )}
                      </Td>
                      <Td className="font-sans text-sm tabular-nums text-charcoal/80 whitespace-nowrap">
                        {money(c.price) || " "}
                      </Td>
                      <Td className="font-sans text-sm tabular-nums text-charcoal/60 whitespace-nowrap">
                        {scoredCount(c)}/{FACTORS.length}
                      </Td>
                      <Td className="font-sans text-sm font-bold tabular-nums text-near-black whitespace-nowrap">
                        {total}/{MAX_TOTAL}
                      </Td>
                      <Td>
                        {full ? (
                          <span
                            className={`inline-block font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full ${BAND_STYLE[bandFor(total)]}`}
                          >
                            {bandFor(total)}
                          </span>
                        ) : (
                          <span className="inline-block font-sans text-[11px] font-medium px-2 py-0.5 rounded-full bg-light-gray/60 text-charcoal/60">
                            In progress
                          </span>
                        )}
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCar(c.id);
                          }}
                          className="no-print font-sans text-xs text-charcoal/50 hover:text-terracotta transition-colors"
                        >
                          Remove
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Next step: the finalists earn full math */}
      {finalists.length > 0 && (
        <div className="bg-cream border border-warm-gold/40 rounded-lg p-4 mb-6">
          <p className="font-sans text-sm text-near-black leading-relaxed">
            <span className="font-semibold">
              {finalists.length === 1
                ? `${finalists[0].nickname} made the Strong band.`
                : `${finalists.length} candidates made the Strong band.`}
            </span>{" "}
            The scorecard is a filter, not a verdict. Run the finalists through
            the{" "}
            <Link
              href="/resources/vehicle-profitability-calculator"
              className="font-semibold text-primary-green underline underline-offset-2 hover:text-near-black transition-colors"
            >
              Vehicle Profitability Calculator
            </Link>{" "}
            for the full gross-to-true-net math. That is what makes the final
            call.
          </p>
        </div>
      )}

      {/* Add a candidate */}
      <section className="bg-white border border-light-gray rounded-lg p-4 sm:p-5 mb-6 no-print">
        <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70 mb-3">
          Add a candidate
        </p>
        <div className="grid sm:grid-cols-[1fr_150px] gap-3">
          <TextInput
            label="Nickname"
            value={draftNickname}
            onChange={setDraftNickname}
            placeholder="e.g. Silver 2020 commuter, 70k mi"
          />
          <TextInput
            label="Price"
            value={draftPrice}
            onChange={setDraftPrice}
            placeholder="15000"
            prefix="$"
            numeric
          />
        </div>
        <div className="mt-3">
          <TextInput
            label="Notes"
            value={draftNotes}
            onChange={setDraftNotes}
            placeholder="Listing link, mileage, seller, first impressions"
          />
        </div>
        <button
          type="button"
          onClick={addCar}
          disabled={!draftNickname.trim()}
          className="mt-3 inline-flex items-center gap-2 bg-primary-green text-white hover:bg-primary-green/90 disabled:opacity-40 disabled:cursor-not-allowed font-sans font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          Add candidate
        </button>
      </section>

      {/* Scoring panel */}
      {activeCar ? (
        <section className="bg-white border border-light-gray rounded-lg overflow-hidden">
          <div className="px-4 sm:px-5 py-4 bg-off-white border-b border-light-gray">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                  Scoring
                </p>
                <div className="grid sm:grid-cols-[1fr_150px] gap-3 mt-2">
                  <TextInput
                    label="Nickname"
                    value={activeCar.nickname}
                    onChange={(v) => updateCar(activeCar.id, { nickname: v })}
                  />
                  <TextInput
                    label="Price"
                    value={activeCar.price}
                    onChange={(v) => updateCar(activeCar.id, { price: v })}
                    prefix="$"
                    numeric
                  />
                </div>
                <div className="mt-2">
                  <TextInput
                    label="Notes"
                    value={activeCar.notes}
                    onChange={(v) => updateCar(activeCar.id, { notes: v })}
                    placeholder="Listing link, mileage, seller, first impressions"
                  />
                </div>
              </div>
              <ScoreMeter car={activeCar} />
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {FACTORS.map((f) => {
              const current = activeCar.scores[f.id];
              return (
                <div
                  key={f.id}
                  className="border border-light-gray rounded-lg p-4"
                >
                  <p className="font-sans text-sm font-semibold text-near-black">
                    {f.num}. {f.name}
                  </p>
                  <p className="font-sans text-sm text-charcoal/80 mt-0.5">
                    {f.question}
                  </p>
                  <p className="font-sans text-xs text-charcoal/55 mt-1 leading-relaxed">
                    {f.why}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-3">
                    {([5, 4, 3, 2, 1] as ScoreValue[]).map((v) => {
                      const selected = current === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setScore(activeCar.id, f.id, v)}
                          aria-pressed={selected}
                          className={[
                            "text-left rounded-lg border-2 px-3 py-2.5 transition-colors",
                            selected
                              ? v === 1
                                ? "border-terracotta bg-terracotta/10"
                                : "border-primary-green bg-primary-green/10"
                              : "border-light-gray bg-white hover:border-charcoal/30",
                          ].join(" ")}
                        >
                          <span className="block font-sans text-xs font-bold text-near-black">
                            {LEVEL_TITLE[v]}
                          </span>
                          <span className="block font-sans text-[11px] text-charcoal/60 leading-snug mt-0.5">
                            {levelDescriptor(f, v)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {current === 1 && (
                    <p className="font-sans text-[11px] font-semibold text-terracotta mt-2">
                      Scored 1: treat this factor as a veto until you have
                      investigated it.
                    </p>
                  )}
                </div>
              );
            })}

            {/* Read on the total */}
            <div
              className={[
                "rounded-lg p-4",
                isFullyScored(activeCar)
                  ? BAND_STYLE[bandFor(totalFor(activeCar))]
                  : "bg-off-white border border-light-gray",
              ].join(" ")}
            >
              {isFullyScored(activeCar) ? (
                <>
                  <p className="font-display text-2xl font-semibold leading-none">
                    {totalFor(activeCar)}/{MAX_TOTAL} ·{" "}
                    {bandFor(totalFor(activeCar))}
                  </p>
                  <p className="font-sans text-sm leading-relaxed mt-1.5">
                    {BAND_COPY[bandFor(totalFor(activeCar))]}
                    {vetoFactors(activeCar).length > 0 && ` ${VETO_RULE}`}
                  </p>
                </>
              ) : (
                <p className="font-sans text-sm text-charcoal/70">
                  {FACTORS.length - scoredCount(activeCar)} factor
                  {FACTORS.length - scoredCount(activeCar) === 1 ? "" : "s"}{" "}
                  left to score before this candidate gets a band.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        state.cars.length > 0 && (
          <p className="font-sans text-sm text-charcoal/60 text-center py-4">
            Select a candidate in the shortlist to score it factor by factor.
          </p>
        )
      )}

      <p className="font-sans text-[11px] leading-relaxed text-charcoal/50 mt-6">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}

function ScoreMeter({ car }: { car: CandidateCar }) {
  const total = totalFor(car);
  return (
    <div className="shrink-0 text-right">
      <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-charcoal/60">
        Running total
      </p>
      <p className="font-display text-3xl font-semibold text-near-black leading-none mt-1">
        {total}
        <span className="text-charcoal/40 text-xl">/{MAX_TOTAL}</span>
      </p>
      <div className="w-28 h-1.5 bg-light-gray rounded-full mt-2 overflow-hidden ml-auto">
        <div
          className="h-full bg-primary-green rounded-full transition-all"
          style={{ width: `${(total / MAX_TOTAL) * 100}%` }}
        />
      </div>
      <p className="font-sans text-[11px] text-charcoal/50 mt-1">
        {scoredCount(car)}/{FACTORS.length} factors scored
      </p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <label className="font-sans text-xs font-semibold text-near-black block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1.5 border border-light-gray rounded-md bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-primary-green/50 focus-within:border-primary-green/50">
        {prefix && (
          <span className="font-sans text-sm text-charcoal/50">{prefix}</span>
        )}
        <input
          type={numeric ? "number" : "text"}
          inputMode={numeric ? "decimal" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="w-full bg-transparent font-sans text-sm text-near-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-charcoal/60 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2.5 align-top ${className}`}>{children}</td>;
}
