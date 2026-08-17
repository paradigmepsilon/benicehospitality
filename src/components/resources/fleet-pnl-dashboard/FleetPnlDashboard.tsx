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
  CAR_DEFAULTS,
  EARNINGS_PLANS,
  MAX_CARS,
  READINESS_RULE,
  computeCar,
  computeFleet,
  isCarFilled,
  planById,
  type CarInput,
  type FleetState,
} from "@/lib/resources/fleet-pnl-dashboard/config";

const SLUG = "fleet-pnl-dashboard";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `c${performance.now()}${Math.floor(performance.now() % 9973)}`;
  }
}

function blankCar(): CarInput {
  return { _id: newId(), nickname: "", ...CAR_DEFAULTS };
}

export default function FleetPnlDashboard({ canSync = false }: {
  /** access.canSync from getResourceAccess - see the exemplar for why this is
   *  not simply `loggedIn` (admin preview must not write to the admin's row). */
  canSync?: boolean;
}) {
  // Seeded with one blank car, like DataTableTool - random ids per mount are
  // expected by useResourceTool (see its touchedRef note).
  const { state, setState, reset } = useResourceTool<FleetState>(
    SLUG,
    { cars: [blankCar()], attestThreeMonths: false, attestCashReserve: false },
    { sync: canSync },
  );

  const cars = state.cars;
  const fleet = useMemo(() => computeFleet(cars), [cars]);

  function setCar(id: string, patch: Partial<CarInput>) {
    setState((p) => ({
      ...p,
      cars: p.cars.map((c) => (c._id === id ? { ...c, ...patch } : c)),
    }));
  }
  function addCar() {
    setState((p) =>
      p.cars.length >= MAX_CARS ? p : { ...p, cars: [...p.cars, blankCar()] },
    );
  }
  function removeCar(id: string) {
    setState((p) => {
      const next = p.cars.filter((c) => c._id !== id);
      return { ...p, cars: next.length ? next : [blankCar()] };
    });
  }

  const readinessCleared =
    fleet.trueNetMonthly > 0 &&
    fleet.carCount > 0 &&
    state.attestThreeMonths &&
    state.attestCashReserve;

  function exportCsv() {
    const header = [
      "Car",
      "Purchase price",
      "Cash invested",
      "Loan payment /mo",
      "ADR",
      "Utilization %",
      "Earnings plan",
      "Cleaning+ops /mo",
      "Insurance+parking /mo",
      "Maintenance % of gross",
      "Depreciation % /yr",
      "Gross /mo",
      "Host share /mo",
      "Total costs /mo",
      "Depreciation /mo",
      "Cash net /mo",
      "True net /mo",
      "Annual true net",
      "ROI on cash",
    ];
    const body = cars.filter(isCarFilled).map((c, i) => {
      const r = computeCar(c);
      return [
        c.nickname.trim() || `Car ${i + 1}`,
        c.price || "0",
        c.cashInvested || "0",
        c.loanMonthly || "0",
        c.adr || "0",
        c.utilizationPct || "0",
        planById(c.planId).label,
        c.cleaningOpsMonthly || "0",
        c.insParkingMonthly || "0",
        c.maintenancePct || "0",
        c.depreciationPct || "0",
        Math.round(r.grossMonthly),
        Math.round(r.hostShareMonthly),
        Math.round(r.totalCostsMonthly),
        Math.round(r.depreciationMonthly),
        Math.round(r.cashNetMonthly),
        Math.round(r.trueNetMonthly),
        Math.round(r.trueNetAnnual),
        r.roi === null ? "-" : pct(r.roi),
      ];
    });
    const fleetRow = [
      "FLEET",
      "",
      fleet.cashInvested,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      Math.round(fleet.grossMonthly),
      Math.round(fleet.hostShareMonthly),
      Math.round(fleet.totalCostsMonthly),
      Math.round(fleet.depreciationMonthly),
      Math.round(fleet.cashNetMonthly),
      Math.round(fleet.trueNetMonthly),
      Math.round(fleet.trueNetAnnual),
      fleet.roi === null ? "-" : pct(fleet.roi),
    ];
    const rows: (string | number)[][] = [
      header,
      ...body,
      fleetRow,
      [],
      ["READINESS RULE", READINESS_RULE],
      [
        "Cash reserve required (one damage responsibility per car)",
        fleet.reserveRequired,
      ],
      [],
      [CALC_DISCLAIMER],
    ];
    downloadCsv("fleet-pnl-dashboard.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="font-sans text-sm text-charcoal/60">
          {fleet.carCount} of {MAX_CARS} {fleet.carCount === 1 ? "car" : "cars"}
        </span>
      }
    >
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiTile
          label="Fleet true net / mo"
          value={money(fleet.trueNetMonthly)}
          negative={fleet.trueNetMonthly < 0}
          sub="After every cost and depreciation."
        />
        <KpiTile
          label="Fleet ROI on cash"
          value={fleet.roi === null ? "-" : pct(fleet.roi)}
          negative={fleet.roi !== null && fleet.roi < 0}
          sub={`On ${money(fleet.cashInvested)} invested.`}
        />
        <KpiTile
          label="Best car"
          value={
            fleet.best
              ? fleet.best.car.nickname.trim() || "Unnamed car"
              : "-"
          }
          sub={
            fleet.best
              ? `${money(fleet.best.results.trueNetMonthly)} true net / mo`
              : "Add a car to see it."
          }
        />
        <KpiTile
          label="Worst car"
          value={
            fleet.worst
              ? fleet.worst.car.nickname.trim() || "Unnamed car"
              : "-"
          }
          negative={
            fleet.worst !== null && fleet.worst.results.trueNetMonthly < 0
          }
          sub={
            fleet.worst
              ? `${money(fleet.worst.results.trueNetMonthly)} true net / mo`
              : "Needs two or more cars."
          }
        />
      </div>

      {/* Car #2 readiness strip */}
      <section
        className={[
          "rounded-lg border p-4 sm:p-5 mb-6",
          readinessCleared
            ? "border-primary-green/50 bg-primary-green/5"
            : "border-warm-gold/50 bg-warm-gold/5",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-charcoal/60">
            Next-car readiness
          </p>
          <p
            className={`font-display text-lg font-semibold leading-none ${
              readinessCleared ? "text-primary-green" : "text-warm-gold-dark"
            }`}
          >
            {readinessCleared
              ? "Cleared to add the next car"
              : "Hold at the current fleet"}
          </p>
        </div>
        <p className="font-sans text-sm text-charcoal/80 mb-3">
          The course rule: {READINESS_RULE.charAt(0).toLowerCase()}
          {READINESS_RULE.slice(1)}
        </p>
        <div className="space-y-2">
          <ReadinessCheck
            checked={fleet.trueNetMonthly > 0 && fleet.carCount > 0}
            auto
            label={`Fleet true net is positive this month (${money(fleet.trueNetMonthly)})`}
          />
          <ReadinessCheck
            checked={state.attestThreeMonths}
            onToggle={() =>
              setState((p) => ({ ...p, attestThreeMonths: !p.attestThreeMonths }))
            }
            label="Fleet true net has been positive for three straight months"
          />
          <ReadinessCheck
            checked={state.attestCashReserve}
            onToggle={() =>
              setState((p) => ({ ...p, attestCashReserve: !p.attestCashReserve }))
            }
            label={`I hold one full damage responsibility in cash per car${
              fleet.reserveRequired > 0
                ? ` (${money(fleet.reserveRequired)} for this fleet)`
                : ""
            }`}
          />
        </div>
      </section>

      {/* Car cards */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={addCar}
          disabled={cars.length >= MAX_CARS}
          className="inline-flex items-center gap-1.5 bg-primary-green hover:bg-primary-green-dark disabled:bg-light-gray disabled:text-charcoal/45 text-white font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          + Add car
        </button>
        {cars.length >= MAX_CARS && (
          <span className="font-sans text-xs text-charcoal/55">
            This dashboard tracks up to {MAX_CARS} cars.
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {cars.map((car, idx) => (
          <CarCard
            key={car._id}
            car={car}
            index={idx}
            onChange={(patch) => setCar(car._id, patch)}
            onRemove={() => removeCar(car._id)}
          />
        ))}
      </div>

      {/* Fleet totals row */}
      <div className="bg-white border border-light-gray rounded-lg overflow-hidden mb-4 break-inside-avoid">
        <div className="px-4 py-3 bg-near-black">
          <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-warm-gold">
            Fleet totals ({fleet.carCount}{" "}
            {fleet.carCount === 1 ? "car" : "cars"})
          </p>
        </div>
        <dl className="divide-y divide-light-gray/70">
          <TotalRow label="Gross revenue / mo" value={fleet.grossMonthly} />
          <TotalRow label="Host share / mo" value={fleet.hostShareMonthly} />
          <TotalRow label="Total costs / mo" value={-fleet.totalCostsMonthly} />
          <TotalRow
            label="Cash net / mo"
            value={fleet.cashNetMonthly}
            strong
            hint="What actually hits the bank across the fleet."
          />
          <TotalRow label="Depreciation / mo" value={-fleet.depreciationMonthly} />
          <TotalRow
            label="True net / mo"
            value={fleet.trueNetMonthly}
            strong
            hint="Judge the fleet on this number, nothing else."
          />
          <TotalRow label="Annual true net" value={fleet.trueNetAnnual} strong />
        </dl>
      </div>

      <p className="font-sans text-[11px] leading-relaxed text-charcoal/50">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}

// ---- car card ---------------------------------------------------------------

function CarCard({
  car,
  index,
  onChange,
  onRemove,
}: {
  car: CarInput;
  index: number;
  onChange: (patch: Partial<CarInput>) => void;
  onRemove: () => void;
}) {
  const r = computeCar(car);
  const filled = isCarFilled(car);

  return (
    <div className="bg-white border border-light-gray rounded-lg p-4 sm:p-5 break-inside-avoid">
      <div className="flex items-center gap-3 mb-3">
        <input
          type="text"
          value={car.nickname}
          onChange={(e) => onChange({ nickname: e.target.value })}
          placeholder={`Car ${index + 1} nickname, e.g. 2019 Corolla`}
          aria-label={`Car ${index + 1} nickname`}
          className="flex-1 font-display text-base font-semibold text-near-black bg-transparent border-b border-transparent hover:border-light-gray focus:border-primary-green focus:outline-none py-1 placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-charcoal/40"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove car ${index + 1}`}
          className="no-print font-sans text-xs text-charcoal/45 hover:text-terracotta shrink-0"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mb-3">
        <CarField label="Purchase price" prefix="$" value={car.price} onChange={(v) => onChange({ price: v })} />
        <CarField label="Cash invested" prefix="$" value={car.cashInvested} onChange={(v) => onChange({ cashInvested: v })} />
        <CarField label="Loan payment / mo" prefix="$" value={car.loanMonthly} onChange={(v) => onChange({ loanMonthly: v })} />
        <CarField label="Average daily rate" prefix="$" value={car.adr} onChange={(v) => onChange({ adr: v })} />
        <CarField label="Utilization" suffix="%" value={car.utilizationPct} onChange={(v) => onChange({ utilizationPct: v })} />
        <div>
          <label className="block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/55 mb-1">
            Earnings plan
          </label>
          <select
            value={car.planId}
            onChange={(e) =>
              onChange({ planId: e.target.value as CarInput["planId"] })
            }
            aria-label="Earnings plan"
            className="w-full border border-light-gray rounded-md bg-white px-2 py-1.5 font-sans text-sm text-near-black focus:border-primary-green focus:outline-none"
          >
            {EARNINGS_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <CarField label="Cleaning + ops / mo" prefix="$" value={car.cleaningOpsMonthly} onChange={(v) => onChange({ cleaningOpsMonthly: v })} />
        <CarField label="Insurance + parking / mo" prefix="$" value={car.insParkingMonthly} onChange={(v) => onChange({ insParkingMonthly: v })} />
        <CarField label="Maintenance" suffix="% of gross" value={car.maintenancePct} onChange={(v) => onChange({ maintenancePct: v })} />
        <CarField label="Depreciation" suffix="% / yr" value={car.depreciationPct} onChange={(v) => onChange({ depreciationPct: v })} />
      </div>

      {filled ? (
        <div className="rounded-md bg-off-white border border-light-gray/70 px-3 py-2.5 grid grid-cols-3 gap-x-3 gap-y-2">
          <MiniStat label="Gross / mo" value={money(r.grossMonthly)} />
          <MiniStat label="Host share" value={money(r.hostShareMonthly)} />
          <MiniStat label="Cash net" value={money(r.cashNetMonthly)} negative={r.cashNetMonthly < 0} />
          <MiniStat label="True net / mo" value={money(r.trueNetMonthly)} negative={r.trueNetMonthly < 0} strong />
          <MiniStat label="Annual true net" value={money(r.trueNetAnnual)} negative={r.trueNetAnnual < 0} />
          <MiniStat label="ROI on cash" value={r.roi === null ? "-" : pct(r.roi)} negative={r.roi !== null && r.roi < 0} strong />
        </div>
      ) : (
        <p className="font-sans text-xs text-charcoal/50 px-1">
          Enter a nickname, price, or daily rate and this card starts computing.
        </p>
      )}
    </div>
  );
}

function CarField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/55 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1 border border-light-gray rounded-md bg-white px-2 py-1.5 focus-within:border-primary-green">
        {prefix && <span className="font-sans text-xs text-charcoal/50">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          aria-label={label}
          className="w-full bg-transparent font-sans text-sm text-near-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="font-sans text-[10px] text-charcoal/50 whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  negative,
  strong,
}: {
  label: string;
  value: string;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
        {label}
      </p>
      <p
        className={[
          "font-sans text-sm tabular-nums",
          strong ? "font-bold" : "font-medium",
          negative ? "text-terracotta" : "text-near-black",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function KpiTile({
  label,
  value,
  sub,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  negative?: boolean;
}) {
  return (
    <div className="bg-near-black rounded-lg p-4">
      <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-warm-gold mb-1">
        {label}
      </p>
      <p
        className={`font-display text-xl sm:text-2xl font-semibold leading-tight truncate ${
          negative ? "text-terracotta" : "text-white"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="font-sans text-[11px] text-white/60 mt-1 leading-tight">
          {sub}
        </p>
      )}
    </div>
  );
}

function ReadinessCheck({
  checked,
  label,
  onToggle,
  auto,
}: {
  checked: boolean;
  label: string;
  onToggle?: () => void;
  auto?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-2.5 font-sans text-sm text-near-black ${
        auto ? "" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={auto}
        className="mt-0.5 h-4 w-4 rounded border-light-gray accent-[#5b9a2f]"
      />
      <span className={checked ? "" : "text-charcoal/75"}>
        {label}
        {auto && (
          <span className="block font-sans text-[11px] text-charcoal/50">
            Computed from this dashboard; the two below are on your honor.
          </span>
        )}
      </span>
    </label>
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
    <div
      className={`flex items-baseline justify-between gap-4 px-4 py-2.5 ${
        strong ? "bg-warm-gold/10" : ""
      }`}
    >
      <dt>
        <span
          className={`font-sans text-sm ${
            strong ? "font-semibold text-near-black" : "text-charcoal/80"
          }`}
        >
          {label}
        </span>
        {hint && (
          <span className="block font-sans text-[11px] text-charcoal/45 leading-tight">
            {hint}
          </span>
        )}
      </dt>
      <dd
        className={[
          "font-sans text-sm tabular-nums",
          strong ? "font-bold" : "font-medium",
          value < 0 ? "text-terracotta" : "text-near-black",
        ].join(" ")}
      >
        {money(value)}
      </dd>
    </div>
  );
}
