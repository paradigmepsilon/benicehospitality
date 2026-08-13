"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ResourceToolShell from "../ResourceToolShell";
import { buildCsv, downloadCsv } from "../useResourceTool";
import {
  useAnalysisList,
  useResourceAnalysis,
  type AnalysisSummary,
} from "../useResourceAnalysis";
import {
  computePlanner,
  hydratePlannerState,
  initialPlannerState,
  type CostLineState,
  type PlannerAssumptions,
  type PlannerState,
  type SectionId,
} from "@/lib/resources/breakeven-analysis-worksheet/projection";
import {
  formatAddress,
  type PropertyInputs,
  type Room,
} from "@/lib/resources/breakeven-analysis-worksheet/pricing";
import {
  buildCatalog,
  type CostOverride,
} from "@/lib/resources/breakeven-analysis-worksheet/catalog";
import AnalysisSwitcher from "./AnalysisSwitcher";
import SectionCosts from "./SectionCosts";
import SectionReport from "./SectionReport";
import SectionRooms from "./SectionRooms";
import { Note, StepNav, StepPanel, currency, signedCurrency } from "./ui";
import SectionProperty from "./SectionProperty";
import { importLegacyState, hasLegacyWorksheet, clearLegacy } from "./legacy-import";

export const SLUG = "breakeven-analysis-worksheet";
// Restated rather than read from RESOURCE_TOOLS: this is a client component,
// and importing the registry for one string would ship all nineteen tools'
// marketing copy in the bundle. Keep it in step with registry.ts.
const TOOL_NAME = "Co-Living Property Profitability Analysis Worksheet";

const SECTION_ANCHOR: Record<SectionId, string> = {
  property: "plp-property",
  rooms: "plp-rooms",
  "one-time": "plp-one-time",
  monthly: "plp-monthly",
  report: "plp-report",
};

/**
 * The five pages, in order. Drives the strip and the Back/Next pair; each panel
 * below declares its own title and tone.
 *
 * These labels are short because five of them share the ~640px this tool gets
 * inside ResourceToolLayout's 3/5 column, and below `sm` they are hidden
 * entirely and the numeral carries the strip on its own.
 */
const STEPS: { id: SectionId; shortLabel: string }[] = [
  { id: "property", shortLabel: "Property" },
  { id: "rooms", shortLabel: "Rooms" },
  { id: "one-time", shortLabel: "One-time" },
  { id: "monthly", shortLabel: "Recurring" },
  { id: "report", shortLabel: "Result" },
];

export default function PlannerTool({
  canSync,
  isPreview = false,
  costOverrides = [],
}: {
  canSync: boolean;
  /**
   * An admin looking at a member's view. canSync is false for them, same as a
   * logged-out visitor, but telling an admin to create an account would be
   * nonsense — so they get their own note.
   */
  isPreview?: boolean;
  /**
   * Admin edits to the cost defaults and affiliate links, read server-side and
   * handed down rather than fetched here — the numbers must be right on the
   * first paint, not after a hydration round trip.
   *
   * Only the overrides cross the wire, not the merged catalog: the static
   * config is already in this bundle, so sending it back down would duplicate
   * ~40 lines of metadata on every page load. Usually this array is empty.
   */
  costOverrides?: CostOverride[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const list = useAnalysisList(SLUG, canSync);
  const catalog = useMemo(() => buildCatalog(costOverrides), [costOverrides]);

  const urlId = Number(params.get("a"));
  // The member's explicit pick. Null means "whatever is newest" — derived
  // below rather than written by an effect, so landing on the page does not
  // cost a render just to choose a default.
  const [selectedId, setSelectedId] = useState<number | null>(
    Number.isInteger(urlId) && urlId > 0 ? urlId : null,
  );
  const [legacyOffer, setLegacyOffer] = useState(false);
  const bootstrapped = useRef(false);

  const activeId =
    selectedId !== null && list.analyses.some((a) => a.id === selectedId)
      ? selectedId
      : (list.analyses[0]?.id ?? null);

  const setActiveId = setSelectedId;

  // The property's name lives on the analysis row, not in the payload, so the
  // switcher and the "Property name" field in section 1 are two views of one
  // string. Renaming from either updates both.
  const activeName = list.analyses.find((a) => a.id === activeId)?.name ?? "";
  const renameActive = useCallback(
    (next: string) => {
      if (activeId === null) return;
      list.rename(activeId, next);
    },
    [activeId, list],
  );

  // A member with no analyses at all gets their first one created rather than
  // an empty tool and a button. Only this genuinely needs an effect, and the
  // state write lands after an await, not synchronously during the effect.
  useEffect(() => {
    if (!canSync || list.loading || bootstrapped.current) return;
    if (list.analyses.length > 0) return;
    bootstrapped.current = true;

    (async () => {
      const created = await list.create();
      if (created) {
        setSelectedId(created.id);
        if (hasLegacyWorksheet()) setLegacyOffer(true);
      }
    })();
  }, [canSync, list]);

  // Keep the URL in step so an analysis is linkable from the account shelf.
  useEffect(() => {
    if (activeId === null) return;
    const current = Number(params.get("a"));
    if (current === activeId) return;
    router.replace(`/resources/${SLUG}?a=${activeId}`, { scroll: false });
  }, [activeId, params, router]);

  const onSaved = useCallback(
    (summary: AnalysisSummary) => list.applySummary(summary),
    [list],
  );

  const analysis = useResourceAnalysis<PlannerState>(SLUG, activeId, {
    initialState: initialPlannerState(),
    hydrate: hydratePlannerState,
    enabled: canSync,
    onSaved,
  });

  const { state, setState, hydrated } = analysis;
  const c = useMemo(() => computePlanner(state, catalog), [state, catalog]);

  // ------------------------------------------------------------- mutators
  const patchProperty = useCallback(
    (patch: Partial<PropertyInputs>) =>
      setState((s) => ({ ...s, property: { ...s.property, ...patch } })),
    [setState],
  );
  const setRooms = useCallback(
    (rooms: Room[]) => setState((s) => ({ ...s, rooms })),
    [setState],
  );
  const patchLine = useCallback(
    (id: string, patch: Partial<CostLineState>) =>
      setState((s) => ({
        ...s,
        lines: {
          ...s.lines,
          [id]: { ...(s.lines[id] ?? { on: false, qty: "", oneTime: "", monthly: "" }), ...patch },
        },
      })),
    [setState],
  );
  const patchAssumptions = useCallback(
    (patch: Partial<PlannerAssumptions>) =>
      setState((s) => ({ ...s, assumptions: { ...s.assumptions, ...patch } })),
    [setState],
  );
  /**
   * Which of the five pages is showing.
   *
   * Deliberately local, not part of PlannerState. Which page you had open is
   * chrome, not analysis: persisting it would write UI position into the saved
   * document, sync it between two tabs of the same analysis, and count as a
   * change worth autosaving. Every analysis opens on page one.
   */
  const [step, setStep] = useState<SectionId>("property");
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  /**
   * Live counts on the strip, the same way the viability calculator shows how
   * many boxes each section has ticked. Turns the nav into a progress read, so
   * "I have not touched the recurring costs yet" is visible without paging
   * there. Absent rather than "0" when there is nothing to report — a zero
   * badge on every step is noise.
   */
  const stepsWithBadges = useMemo(
    () =>
      STEPS.map((s) => {
        const badge =
          s.id === "rooms"
            ? state.rooms.length || undefined
            : s.id === "one-time"
              ? c.oneTime.activeCount || undefined
              : s.id === "monthly"
                ? c.monthly.activeCount || undefined
                : undefined;
        return { ...s, badge: badge === undefined ? undefined : String(badge) };
      }),
    [state.rooms.length, c.oneTime.activeCount, c.monthly.activeCount],
  );
  const goTo = useCallback((id: SectionId) => {
    setStep(id);
    // The page changes above the fold; without this you land mid-form on a
    // long page having scrolled nowhere.
    requestAnimationFrame(() => {
      document.getElementById(SECTION_ANCHOR[id])?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // ---------------------------------------------------------------- export
  function exportCsv() {
    const rows: (string | number | boolean)[][] = [];
    const p = state.property;

    rows.push(["PROPERTY"], ["Field", "Value"]);
    rows.push(["Property name", activeName]);
    rows.push(["Address", formatAddress(p)]);
    rows.push(["Bedrooms in the property", c.pricing.roomCount]);
    rows.push(["Bathrooms", p.bathrooms]);
    rows.push(["Square feet", p.squareFeet]);
    rows.push(["Comparable 1-BR fair-market rent", p.fmv]);
    rows.push(["Walk Score", p.walkability]);
    rows.push(["Transit Score", p.transitScore]);
    rows.push(["Bike Score", p.bikeScore]);
    rows.push(["Whole-house market rent", p.wholeHouseRent]);
    rows.push([]);

    rows.push(["SECTION 1 - ROOM RENTAL PRICING"]);
    rows.push(["Room", "Status", "Size band", "Base", "Room premium", "Property premium", "Manual override", "Monthly rent"]);
    for (const r of c.pricing.rooms) {
      rows.push([
        r.name,
        r.status,
        r.sizeBand,
        r.result.base,
        r.result.roomPremium,
        r.result.propertyPremium,
        r.result.overridden ? r.priceOverride : "",
        r.status === "renting" ? r.result.price : 0,
      ]);
    }
    rows.push(["", "", "", "", "", "", "Gross scheduled rent", c.pricing.grossScheduledRent]);
    rows.push(["", "", "", "", "", "", "Effective monthly revenue", Math.round(c.projection.effectiveMonthlyRevenue)]);
    rows.push([]);

    const costBlock = (
      title: string,
      resolved: typeof c.oneTime.resolved,
      amountHeader: string,
    ) => {
      rows.push([title]);
      rows.push(["Item", "Included", "Qty", amountHeader, "Source", "Line total"]);
      for (const r of resolved) {
        if (!r.state.on) continue;
        rows.push([
          r.bucket.label ?? r.line.label,
          "Yes",
          r.qty,
          r.amount,
          // Makes an exported budget auditable: a lender can see which numbers
          // the operator actually researched and which they accepted from us.
          r.source === "user" ? "User entered" : r.source === "percent" ? "% of collected rent" : "Default estimate",
          r.total,
        ]);
      }
    };

    costBlock("SECTION 2 - ONE-TIME LAUNCH COSTS", c.oneTime.resolved, "Unit cost");
    rows.push(["", "Subtotal", "", "", "", c.oneTimeSubtotal]);
    rows.push(["", `Contingency (${state.assumptions.contingencyPct}%)`, "", "", "", c.contingency]);
    rows.push(["", "TOTAL ONE-TIME", "", "", "", c.totalOneTime]);
    rows.push([]);

    costBlock("SECTION 3 - MONTHLY RECURRING COSTS", c.monthly.resolved, "Monthly cost");
    rows.push(["", "TOTAL MONTHLY", "", "", "", c.monthlyRecurring]);
    rows.push([]);

    rows.push(["SECTION 4 - PROJECTION"], ["Assumption", "Value"]);
    rows.push(["Rent growth", `${state.assumptions.rentGrowthPct}%`]);
    rows.push(["Expense inflation", `${state.assumptions.expenseInflationPct}%`]);
    rows.push(["Vacancy & collection loss", `${state.assumptions.vacancyPct}%`]);
    rows.push(["Months to fill all rooms", state.assumptions.leaseUpMonths]);
    rows.push(["Contingency", `${state.assumptions.contingencyPct}%`]);
    rows.push(["Operating reserve", `${state.assumptions.reserveMonths} months`]);
    rows.push([]);

    rows.push(["Line", "Year 1", "Year 2", "Year 3"]);
    const y = c.projection.years;
    const yr = (label: string, pick: (r: (typeof y)[number]) => number) =>
      rows.push([label, ...y.map((r) => Math.round(pick(r)))]);
    yr("Gross scheduled rent", (r) => r.gross);
    yr("Vacancy & collection loss", (r) => -r.vacancyLoss);
    yr("Lease-up ramp", (r) => -r.rampLoss);
    yr("Collected revenue", (r) => r.revenue);
    yr("Monthly costs x 12", (r) => -r.expense);
    yr("Net operating cash flow", (r) => r.net);
    yr("Launch costs", (r) => -r.launch);
    yr("Net after launch costs", (r) => r.netAfterLaunch);
    yr("Cumulative position", (r) => r.cumulative);
    rows.push([]);

    const be = c.projection.breakEven;
    rows.push(["Result", "Value"]);
    rows.push(["Operating break-even", be.operatingBreakEvenMonth ? `Month ${be.operatingBreakEvenMonth}` : "Never"]);
    rows.push(["Launch cost paid back", be.capitalPaybackMonth ? `Month ${be.capitalPaybackMonth}` : "Never"]);
    rows.push([
      "Break-even range",
      c.band.optimistic && c.band.pessimistic
        ? `Month ${c.band.optimistic} to month ${c.band.pessimistic}`
        : "n/a",
    ]);
    rows.push(["Cash to open", c.totalOneTime]);
    rows.push(["Cash at the door", Math.round(c.projection.cashAtTheDoor)]);
    rows.push([]);

    // Last, because it is 36 rows and must not push the readable summary down.
    rows.push(["MONTH-BY-MONTH"]);
    rows.push(["Month", "Collected revenue", "Monthly costs", "Net", "Cumulative"]);
    for (const m of c.projection.months) {
      rows.push([m.m, Math.round(m.collected), Math.round(m.expense), Math.round(m.net), Math.round(m.cumulative)]);
    }

    const name = activeName.trim() || "breakeven-analysis";
    downloadCsv(`${name.replace(/[^\w-]+/g, "-").toLowerCase()}.csv`, buildCsv(TOOL_NAME, rows));
  }

  // ------------------------------------------------------------- rendering
  if (!canSync) {
    return isPreview ? (
      <Note>
        Preview mode is read-only. Analyses belong to the member, so nothing
        loads or saves here.
      </Note>
    ) : (
      <Note>
        Create a free account to use the planner and keep an analysis for every
        property you are looking at.
      </Note>
    );
  }

  if (list.loading || (activeId !== null && !hydrated)) {
    return (
      <p className="font-sans text-sm text-charcoal/60 py-8 text-center">
        Loading your analyses…
      </p>
    );
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="text-charcoal/60">Net</span>
          <span className="font-semibold text-near-black tabular-nums">
            {signedCurrency(c.projection.monthlyNet)}/mo
          </span>
        </span>
      }
      footerNote={
        <>
          Every analysis is saved to your account, so it is here next time you
          sign in on any device. Export to CSV for a copy you can share.
        </>
      }
    >
      <AnalysisSwitcher
        list={list}
        activeId={activeId}
        onSelect={setActiveId}
        saveStatus={analysis.saveStatus}
        lastSavedAt={analysis.lastSavedAt}
      />

      {/* Two-tab conflict: stop autosaving and let the member choose, rather
          than silently overwriting an hour of someone's work. */}
      {analysis.conflict && (
        <div className="no-print mb-5 border border-terracotta/40 bg-terracotta/10 rounded-lg p-4">
          <p className="font-sans text-sm text-near-black mb-3">
            This analysis was changed somewhere else — another tab, or another
            device. Saving is paused so nothing gets overwritten.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => analysis.resolveConflict("theirs")}
              className="border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-3 py-1.5 rounded-md"
            >
              Load the other version
            </button>
            <button
              type="button"
              onClick={() => analysis.resolveConflict("mine")}
              className="border border-light-gray bg-white hover:border-terracotta text-near-black font-medium text-sm px-3 py-1.5 rounded-md"
            >
              Keep mine and overwrite
            </button>
          </div>
        </div>
      )}

      {analysis.unsavedTail && (
        <div className="no-print mb-5 border border-warm-gold/40 bg-warm-gold/10 rounded-lg p-4">
          <p className="font-sans text-sm text-near-black mb-3">
            You have changes from an earlier session that never finished saving.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => analysis.resolveUnsavedTail("restore")}
              className="border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-3 py-1.5 rounded-md"
            >
              Restore them
            </button>
            <button
              type="button"
              onClick={() => analysis.resolveUnsavedTail("discard")}
              className="border border-light-gray bg-white hover:border-terracotta text-near-black font-medium text-sm px-3 py-1.5 rounded-md"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {legacyOffer && (
        <div className="no-print mb-5 border border-primary-green/40 bg-primary-green/8 rounded-lg p-4">
          <p className="font-sans text-sm text-near-black mb-3">
            We found line items from the old Start-Up Cost worksheet in this
            browser. Bring them into this analysis?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setState((s) => importLegacyState(s));
                clearLegacy();
                setLegacyOffer(false);
              }}
              className="border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-3 py-1.5 rounded-md"
            >
              Import them
            </button>
            <button
              type="button"
              onClick={() => {
                clearLegacy();
                setLegacyOffer(false);
              }}
              className="border border-light-gray bg-white hover:border-terracotta text-near-black font-medium text-sm px-3 py-1.5 rounded-md"
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      <StepNav steps={stepsWithBadges} current={step} onSelect={goTo} />

      {/* plp-steps is a print hook: the stylesheet zeroes this pb-20 so the
          empty space below the report cannot claim a fourth sheet. */}
      <div className="plp-steps space-y-4 pb-20">
        <StepPanel
          index={1}
          anchorId={SECTION_ANCHOR.property}
          title="The property"
          tone="revenue"
          current={step === "property"}
          summary={
            c.pricing.roomCount > 0 ? (
              <span className="text-charcoal/70">
                {c.pricing.roomCount} bed{c.pricing.roomCount === 1 ? "" : "s"}
              </span>
            ) : undefined
          }
        >
          <SectionProperty
            property={state.property}
            pricing={c.pricing}
            onProperty={patchProperty}
            analysisName={activeName}
            onAnalysisName={renameActive}
          />
        </StepPanel>

        <StepPanel
          index={2}
          anchorId={SECTION_ANCHOR.rooms}
          title="The rooms"
          tone="revenue"
          current={step === "rooms"}
          summary={
            <span className="text-primary-green font-semibold">
              +{currency(c.pricing.grossScheduledRent)}/mo
            </span>
          }
        >
          <SectionRooms
            property={state.property}
            rooms={state.rooms}
            pricing={c.pricing}
            onRooms={setRooms}
          />
        </StepPanel>

        <StepPanel
          index={3}
          anchorId={SECTION_ANCHOR["one-time"]}
          title="One-time cost"
          tone="cost"
          current={step === "one-time"}
          summary={
            <span className="text-terracotta font-semibold">
              −{currency(c.totalOneTime)}
            </span>
          }
        >
          <SectionCosts
            bucket="oneTime"
            catalog={catalog}
            resolved={c.oneTime.resolved}
            subtotal={c.oneTimeSubtotal}
            defaultCount={c.oneTime.defaultCount}
            activeCount={c.oneTime.activeCount}
            contingency={c.contingency}
            contingencyPct={state.assumptions.contingencyPct}
            onContingencyPct={(v) => patchAssumptions({ contingencyPct: v })}
            onLine={patchLine}
          />
        </StepPanel>

        <StepPanel
          index={4}
          anchorId={SECTION_ANCHOR.monthly}
          title="Recurring cost"
          tone="cost"
          current={step === "monthly"}
          summary={
            <span className="text-terracotta font-semibold">
              −{currency(c.monthlyRecurring)}/mo
            </span>
          }
        >
          <SectionCosts
            bucket="monthly"
            catalog={catalog}
            resolved={c.monthly.resolved}
            subtotal={c.monthlyRecurring}
            defaultCount={c.monthly.defaultCount}
            activeCount={c.monthly.activeCount}
            onLine={patchLine}
            warnings={c.couplingWarnings}
            missingRequired={c.missingRequired}
          />
        </StepPanel>

        <StepPanel
          index={5}
          anchorId={SECTION_ANCHOR.report}
          title="The result"
          tone="report"
          current={step === "report"}
          summary={
            c.readiness.rooms ? (
              <span
                className={
                  c.projection.monthlyNet < 0
                    ? "text-terracotta font-semibold"
                    : "text-primary-green font-semibold"
                }
              >
                {signedCurrency(c.projection.monthlyNet)}/mo
              </span>
            ) : (
              <span className="text-charcoal/50">Fill in 1-4 first</span>
            )
          }
        >
          <SectionReport
            c={c}
            assumptions={state.assumptions}
            onAssumption={patchAssumptions}
            onJumpTo={goTo}
            propertyName={activeName}
            address={formatAddress(state.property)}
          />
        </StepPanel>

        {/* Page nav. Repeated at the foot of every page because the strip at
            the top is out of sight by the time you have filled one in, and the
            natural move after the last field is forward, not scroll-up. */}
        <div className="no-print flex items-center justify-between gap-3">
          {stepIdx > 0 ? (
            <button
              type="button"
              onClick={() => goTo(STEPS[stepIdx - 1].id)}
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold px-3 py-2 rounded-md border border-light-gray text-charcoal hover:border-charcoal hover:text-near-black cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
              {STEPS[stepIdx - 1].shortLabel}
            </button>
          ) : (
            <span />
          )}
          {stepIdx < STEPS.length - 1 && (
            <button
              type="button"
              onClick={() => goTo(STEPS[stepIdx + 1].id)}
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold px-4 py-2 rounded-md bg-primary-green text-white hover:bg-primary-green/90 cursor-pointer transition-colors"
            >
              Next: {STEPS[stepIdx + 1].shortLabel}
              <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Live result bar. Borrowed from ScorecardForm's sticky progress bar,
          but a model needs persistent feedback where a quiz needs progress. */}
      {/* Live result bar. The one element that makes this feel like a model
          rather than a form: every keystroke moves a number you can see
          without scrolling. Colour-coded so a negative net is unmissable. */}
      <div className="no-print sticky bottom-4 z-10 mt-4">
        <div className="bg-near-black text-white rounded-lg shadow-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex flex-col">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Monthly net
            </span>
            <span
              className={[
                "font-display text-xl font-semibold tabular-nums leading-tight",
                c.projection.monthlyNet < 0 ? "text-terracotta" : "text-white",
              ].join(" ")}
            >
              {signedCurrency(c.projection.monthlyNet)}
            </span>
          </span>
          <span className="flex flex-col">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Break-even
            </span>
            <span className="font-display text-xl font-semibold tabular-nums leading-tight">
              {c.projection.breakEven.capitalPaybackMonth
                ? `Mo. ${c.projection.breakEven.capitalPaybackMonth}`
                : "—"}
            </span>
          </span>
          <span className="flex flex-col">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Cash to open
            </span>
            <span className="font-display text-xl font-semibold tabular-nums leading-tight">
              {currency(c.totalOneTime)}
            </span>
          </span>
        </div>
      </div>
    </ResourceToolShell>
  );
}
