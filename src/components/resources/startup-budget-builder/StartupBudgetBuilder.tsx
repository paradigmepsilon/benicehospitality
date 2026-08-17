"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";
import {
  ALL_BUDGET_ITEMS,
  BUDGET_SECTIONS,
  DEFAULT_BUDGET_STATE,
  EARNINGS_PLANS,
  computeTotals,
  planById,
  type BudgetState,
  type InsuranceDecision,
} from "@/lib/resources/startup-budget-builder/config";

const SLUG = "startup-budget-builder";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  BUDGET_SECTIONS.map((s) => [s.id, s.title]),
);

const INSURANCE_OPTIONS: { id: InsuranceDecision; label: string }[] = [
  { id: "undecided", label: "Undecided" },
  { id: "quoted", label: "Quoted coverage" },
  { id: "declined-documented", label: "Declined, documented" },
];

export default function StartupBudgetBuilder({ canSync = false }: {
  /** access.canSync from getResourceAccess - see the exemplar for why this is
   *  not simply `loggedIn` (admin preview must not write to the admin's row). */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<BudgetState>(
    SLUG,
    DEFAULT_BUDGET_STATE,
    { sync: canSync },
  );

  const t = useMemo(() => computeTotals(state), [state]);
  const plan = planById(state.planId);
  const insuranceDecided = state.insuranceDecision !== "undecided";
  const allQuoted = t.filledCount === t.requiredCount;
  const ready = allQuoted && insuranceDecided && state.reserveFunded;

  function setAmount(id: string, v: string) {
    setState((p) => ({ ...p, amounts: { ...p.amounts, [id]: v } }));
  }

  function fillBlanksWithDefaults() {
    setState((p) => {
      const amounts = { ...p.amounts };
      for (const item of ALL_BUDGET_ITEMS) {
        if ((amounts[item.id] ?? "").trim() === "") {
          amounts[item.id] = String(item.placeholder);
        }
      }
      return { ...p, amounts };
    });
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Section", "Item", "Your amount", "Default placeholder"],
      ...BUDGET_SECTIONS.flatMap((section) =>
        section.items.map((item) => [
          section.title,
          item.label + (item.optional ? " (optional)" : ""),
          (state.amounts[item.id] ?? "").trim() === ""
            ? ""
            : Math.round(parseFloat(state.amounts[item.id]) || 0),
          item.placeholder,
        ]),
      ),
      [
        "Cash reserve",
        `Damage responsibility floor (${plan.label})`,
        t.damageResponsibility,
        t.damageResponsibility,
      ],
      [],
      ["TOTALS"],
      ["Cash to first trip", Math.round(t.cashToFirstTrip)],
      ["Cash reserve (floor + cushion)", Math.round(t.reserveTotal)],
      ["Cash needed on day one", Math.round(t.dayOneTotal)],
      [],
      ["READINESS"],
      ["Lines with a real number", `${t.filledCount} of ${t.requiredCount}`],
      ["Reserve funded", state.reserveFunded ? "Yes" : "No"],
      [
        "Insurance decision",
        INSURANCE_OPTIONS.find((o) => o.id === state.insuranceDecision)!.label,
      ],
      [],
      [CALC_DISCLAIMER],
    ];
    downloadCsv("startup-budget.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Day one</span>
          <span className="font-semibold text-near-black">{money(t.dayOneTotal)}</span>
        </span>
      }
    >
      {/* Readiness strip */}
      <div className="rounded-lg bg-near-black text-white p-4 mb-6 grid sm:grid-cols-3 gap-3">
        <ReadinessCheck
          done={allQuoted}
          label="Real quotes on every line"
          detail={`${t.filledCount} of ${t.requiredCount} lines have a number. Rule: real quotes only, high end of every range.`}
        />
        <ReadinessCheck
          done={state.reserveFunded}
          label="Reserve funded"
          detail={
            state.reserveFunded
              ? `${money(t.reserveTotal)} sitting in business checking, waiting for a bad day.`
              : "If funding it delays launch, delay launch. Tap to mark it funded."
          }
          onClick={() => setState((p) => ({ ...p, reserveFunded: !p.reserveFunded }))}
        />
        <ReadinessCheck
          done={insuranceDecided}
          label="Insurance decided"
          detail={
            insuranceDecided
              ? "A quote or a documented decision. Chosen on purpose, not discovered later."
              : "Make the agent call before you list. Set the decision below the float section."
          }
        />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Line items */}
        <div className="space-y-5">
          {BUDGET_SECTIONS.map((section) => (
            <section key={section.id} className="bg-white border border-light-gray rounded-lg p-4 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                  {section.title}
                </p>
                <p className="font-sans text-sm font-semibold tabular-nums text-near-black">
                  {money(
                    (t.bySection[section.id] ?? 0) +
                      (section.id === "reserve" ? t.damageResponsibility : 0),
                  )}
                </p>
              </div>
              <p className="font-sans text-[11px] text-charcoal/50 leading-relaxed -mt-2">
                {section.blurb}
              </p>

              {section.id === "reserve" && (
                <div>
                  <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
                    Earnings plan (sets the reserve floor)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {EARNINGS_PLANS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setState((prev) => ({ ...prev, planId: p.id }))}
                        className={[
                          "rounded-lg border-2 px-2 py-2.5 text-center transition-colors",
                          state.planId === p.id
                            ? "border-primary-green bg-primary-green/10"
                            : "border-light-gray bg-white hover:border-charcoal/30",
                        ].join(" ")}
                      >
                        <span className="block font-display text-xl font-semibold text-near-black">
                          {Math.round(p.share * 100)}%
                        </span>
                        <span className="block font-sans text-[10px] text-charcoal/60 leading-tight mt-0.5">
                          {money(p.damageResponsibility)} / claim
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between rounded-lg bg-off-white border border-light-gray px-3 py-2">
                    <span className="font-sans text-sm text-charcoal/80">
                      Damage responsibility floor
                    </span>
                    <span className="font-sans text-sm font-bold tabular-nums text-near-black">
                      {money(t.damageResponsibility)}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-charcoal/50 mt-1">
                    One full damage responsibility per car, minimum, held in
                    cash before the first trip. Undecided on the plan? Budget
                    the biggest number until Module 7 helps you choose.
                  </p>
                </div>
              )}

              {section.items.map((item) => (
                <LineItem
                  key={item.id}
                  label={item.label + (item.optional ? " (optional)" : "")}
                  hint={item.hint}
                  placeholder={String(item.placeholder)}
                  value={state.amounts[item.id] ?? ""}
                  onChange={(v) => setAmount(item.id, v)}
                />
              ))}

              {section.id === "float" && (
                <div>
                  <label className="font-sans text-sm font-semibold text-near-black block mb-1.5">
                    Where does the insurance decision stand?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {INSURANCE_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setState((p) => ({ ...p, insuranceDecision: o.id }))}
                        className={[
                          "rounded-lg border-2 px-2 py-2 text-center font-sans text-xs transition-colors leading-tight",
                          state.insuranceDecision === o.id
                            ? "border-primary-green bg-primary-green/10 text-near-black font-medium"
                            : "border-light-gray bg-white text-charcoal/70 hover:border-charcoal/30",
                        ].join(" ")}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-4">
          <div className="bg-near-black rounded-lg p-5">
            <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-warm-gold mb-1">
              Cash needed on day one
            </p>
            <p className="font-display text-4xl font-semibold text-white leading-none">
              {money(t.dayOneTotal)}
            </p>
            <p className="font-sans text-[11px] text-white/60 mt-2 leading-relaxed">
              Cash to first trip plus the funded reserve. This is your real
              startup number. If it is bigger than you hoped, good: better to
              learn that from a worksheet today than from an empty account in
              month two.
            </p>
          </div>

          <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-off-white border-b border-light-gray">
              <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                The two totals
              </p>
            </div>
            <dl className="divide-y divide-light-gray/70">
              {BUDGET_SECTIONS.filter((s) => s.id !== "reserve").map((s) => (
                <TotalRow key={s.id} label={SECTION_LABELS[s.id]} value={t.bySection[s.id] ?? 0} />
              ))}
              <TotalRow label="Cash to first trip" value={t.cashToFirstTrip} strong hint="Every dollar out the door before the first booking." />
              <TotalRow label={`Reserve (${money(t.damageResponsibility)} floor + cushion)`} value={t.reserveTotal} />
              <TotalRow label="Cash needed on day one" value={t.dayOneTotal} strong hint="The number to compare against your available capital." />
            </dl>
          </div>

          {/* Progress + defaults helper */}
          <div className="bg-white border border-light-gray rounded-lg p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
                Quotes collected
              </p>
              <p className="font-sans text-sm font-semibold tabular-nums text-near-black">
                {t.filledCount} / {t.requiredCount}
              </p>
            </div>
            <div className="h-2 rounded-full bg-light-gray overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-green transition-all"
                style={{ width: `${(t.filledCount / Math.max(t.requiredCount, 1)) * 100}%` }}
              />
            </div>
            <p className="font-sans text-[11px] text-charcoal/50 leading-relaxed">
              Empty lines count as zero, so the totals only reflect numbers you
              have actually entered. The gray placeholder in each field is our
              default, an estimate to react against while you collect quotes.
            </p>
            {!allQuoted && (
              <button
                type="button"
                onClick={fillBlanksWithDefaults}
                className="w-full border border-light-gray bg-off-white hover:border-primary-green text-near-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
              >
                Fill blank lines with the defaults for now
              </button>
            )}
          </div>

          {ready && (
            <div className="bg-cream border border-primary-green/40 rounded-lg p-4">
              <p className="font-sans text-sm text-near-black leading-relaxed">
                <span className="font-semibold">Budget survives the pressure test.</span>{" "}
                Every line quoted, reserve funded, insurance decided on
                purpose. Write down the capital path this number implies: cash,
                financed, or save first. There is no wrong answer on that line,
                only an honest one.
              </p>
            </div>
          )}

          <p className="font-sans text-[11px] leading-relaxed text-charcoal/50">
            {CALC_DISCLAIMER} Coverage availability and terms vary by carrier
            and state; consult a licensed insurance professional.
          </p>
        </div>
      </div>
    </ResourceToolShell>
  );
}

function ReadinessCheck({
  done,
  label,
  detail,
  onClick,
}: {
  done: boolean;
  label: string;
  detail: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span
        className={[
          "shrink-0 w-5 h-5 rounded-full border-2 inline-flex items-center justify-center font-sans text-[11px] font-bold",
          done ? "bg-primary-green border-primary-green text-white" : "border-white/40 text-transparent",
        ].join(" ")}
        aria-hidden
      >
        ✓
      </span>
      <span className="min-w-0">
        <span className="block font-sans text-sm font-semibold text-white">{label}</span>
        <span className="block font-sans text-[11px] text-white/60 leading-tight mt-0.5">
          {detail}
        </span>
      </span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={done}
        className="flex items-start gap-2.5 text-left rounded-md p-1 -m-1 hover:bg-white/5 transition-colors"
      >
        {body}
      </button>
    );
  }
  return <div className="flex items-start gap-2.5 p-1 -m-1">{body}</div>;
}

function LineItem({
  label,
  hint,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_120px] gap-3 items-start">
      <div>
        <label className="font-sans text-sm font-semibold text-near-black block">
          {label}
        </label>
        <p className="font-sans text-[11px] text-charcoal/50 mt-0.5 leading-snug">{hint}</p>
      </div>
      <div className="flex items-center gap-1.5 border border-light-gray rounded-lg bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-primary-green/50 focus-within:border-primary-green/50">
        <span className="font-sans text-sm text-charcoal/50">$</span>
        <input
          type="number"
          inputMode="decimal"
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

function TotalRow({
  label,
  value,
  strong,
  hint,
}: {
  label: string;
  value: number;
  strong?: boolean;
  hint?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 px-4 py-2.5 ${strong ? "bg-warm-gold/10" : ""}`}>
      <dt>
        <span className={`font-sans text-sm ${strong ? "font-semibold text-near-black" : "text-charcoal/80"}`}>
          {label}
        </span>
        {hint && (
          <span className="block font-sans text-[11px] text-charcoal/45 leading-tight">
            {hint}
          </span>
        )}
      </dt>
      <dd className={`font-sans text-sm tabular-nums ${strong ? "font-bold" : "font-medium"} text-near-black`}>
        {money(value)}
      </dd>
    </div>
  );
}
