"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
  parseCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";
import {
  CSV_HEADER,
  DELISTING_WARNING,
  SCHEDULE_TIERS,
  SERVICE_TYPES,
  costPerMonth,
  isLogFilled,
  totalCost,
  type LogEntry,
  type MaintenanceState,
  type Vehicle,
} from "@/lib/resources/vehicle-maintenance-tracker/config";

const SLUG = "vehicle-maintenance-tracker";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `m${performance.now()}${Math.floor(performance.now() % 9973)}`;
  }
}

/** Today in the operator's own timezone, matching the inventory tracker. */
function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function blankLog(vehicle: string): LogEntry {
  return {
    _id: newId(),
    vehicle,
    date: todayLocal(),
    odometer: "",
    service: "",
    cost: "",
    notes: "",
  };
}

const DEFAULT_STATE: MaintenanceState = { vehicles: [], logs: [] };

export default function VehicleMaintenanceTracker({ canSync = false }: {
  /** access.canSync from getResourceAccess - see the exemplar for why this is
   *  not simply `loggedIn` (admin preview must not write to the admin's row). */
  canSync?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, setState, reset } = useResourceTool<MaintenanceState>(
    SLUG,
    DEFAULT_STATE,
    { sync: canSync },
  );

  /** "" means all vehicles. Screen-only; print shows everything. */
  const [selected, setSelected] = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [showSchedule, setShowSchedule] = useState(true);

  const logs = useMemo(() => state.logs.filter(isLogFilled), [state.logs]);

  /** Vehicle picker: the managed list plus any names that arrived via CSV. */
  const vehicleNames = useMemo(() => {
    const names = state.vehicles.map((v) => v.name);
    for (const l of logs) {
      const n = l.vehicle.trim();
      if (n && !names.includes(n)) names.push(n);
    }
    return names;
  }, [state.vehicles, logs]);

  const visible = useMemo(
    () =>
      (selected ? logs.filter((l) => l.vehicle === selected) : logs)
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [logs, selected],
  );

  const collapsedLogs = useMemo(
    () => new Set(state.collapsed ?? []),
    [state.collapsed],
  );

  const spend = totalCost(visible);
  const perMonth = costPerMonth(visible);
  const lastService = visible.find((l) => l.date)?.date ?? null;

  const perVehicle = useMemo(
    () =>
      vehicleNames.map((name) => {
        const entries = logs.filter((l) => l.vehicle === name);
        return {
          name,
          count: entries.length,
          total: totalCost(entries),
          perMonth: costPerMonth(entries),
        };
      }),
    [vehicleNames, logs],
  );

  // ---- mutations ----------------------------------------------------------

  function addVehicle() {
    const name = newVehicle.trim();
    if (!name || vehicleNames.includes(name)) return;
    const v: Vehicle = { _id: newId(), name };
    setState((p) => ({ ...p, vehicles: [...p.vehicles, v] }));
    setSelected(name);
    setNewVehicle("");
  }

  function removeVehicle(name: string) {
    setState((p) => ({
      ...p,
      vehicles: p.vehicles.filter((v) => v.name !== name),
      logs: p.logs.filter((l) => l.vehicle !== name),
    }));
    if (selected === name) setSelected("");
  }

  function addLog() {
    const vehicle = selected || vehicleNames[0] || "";
    setState((p) => ({ ...p, logs: [blankLog(vehicle), ...p.logs] }));
  }

  function setLog(id: string, patch: Partial<LogEntry>) {
    setState((p) => ({
      ...p,
      logs: p.logs.map((l) => (l._id === id ? { ...l, ...patch } : l)),
    }));
  }

  function deleteLog(id: string) {
    setState((p) => ({
      ...p,
      logs: p.logs.filter((l) => l._id !== id),
      collapsed: (p.collapsed ?? []).filter((c) => c !== id),
    }));
  }

  function toggleLog(id: string) {
    setState((p) => {
      const next = new Set(p.collapsed ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...p, collapsed: [...next] };
    });
  }

  function setAllLogsCollapsed(collapse: boolean) {
    setState((p) => ({
      ...p,
      collapsed: collapse ? p.logs.map((l) => l._id) : [],
    }));
  }

  // ---- CSV ----------------------------------------------------------------

  function exportCsv() {
    const body = logs
      .slice()
      .sort((a, b) =>
        a.vehicle === b.vehicle
          ? a.date < b.date
            ? -1
            : 1
          : a.vehicle.localeCompare(b.vehicle),
      )
      .map((l) => [l.vehicle, l.date, l.odometer, l.service, l.cost, l.notes]);
    downloadCsv(
      "vehicle-maintenance-log.csv",
      buildCsv(TOOL_NAME, [[...CSV_HEADER], ...body]),
    );
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const matrix = parseCsv(String(reader.result || "")).filter((r) =>
        r.some((c) => c.trim() !== ""),
      );
      if (!matrix.length) return;
      const labels = CSV_HEADER.map((h) => h.toLowerCase());
      let headerIdx = matrix.findIndex((r) =>
        r.some((cell) => labels.includes(cell.toLowerCase().trim())),
      );
      if (headerIdx < 0) headerIdx = 0;
      const fieldForColumn = matrix[headerIdx].map((h) => {
        const i = labels.indexOf(h.toLowerCase().trim());
        return i < 0
          ? null
          : (["vehicle", "date", "odometer", "service", "cost", "notes"][
              i
            ] as keyof Omit<LogEntry, "_id">);
      });
      const imported: LogEntry[] = [];
      const newNames = new Set<string>();
      for (let i = headerIdx + 1; i < matrix.length; i++) {
        const row = { ...blankLog(""), date: "" };
        let any = false;
        matrix[i].forEach((val, idx) => {
          const field = fieldForColumn[idx];
          if (field && val.trim()) {
            row[field] = val.trim();
            any = true;
          }
        });
        if (any) {
          imported.push(row);
          if (row.vehicle) newNames.add(row.vehicle);
        }
      }
      if (imported.length) {
        setState((p) => {
          const known = new Set([
            ...p.vehicles.map((v) => v.name),
            ...p.logs.map((l) => l.vehicle),
          ]);
          const addedVehicles = [...newNames]
            .filter((n) => !known.has(n))
            .map((name) => ({ _id: newId(), name }));
          return {
            ...p,
            vehicles: [...p.vehicles, ...addedVehicles],
            logs: [...p.logs.filter(isLogFilled), ...imported],
          };
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ---- render -------------------------------------------------------------

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="font-sans text-sm text-charcoal/60">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </span>
      }
    >
      {/* Delisting stakes */}
      <div className="rounded-lg border border-terracotta/40 bg-terracotta/5 p-4 sm:p-5 mb-6 break-inside-avoid">
        <p className="font-display text-base font-semibold text-near-black mb-1">
          {DELISTING_WARNING.headline}
        </p>
        <p className="font-sans text-sm text-charcoal/80 leading-relaxed">
          {DELISTING_WARNING.body}
        </p>
      </div>

      {/* KPI tiles for the current view */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Tile
          label={selected ? `${selected}: total spent` : "Total spent"}
          value={money(spend)}
        />
        <Tile
          label="Cost per month"
          value={perMonth === null ? "-" : money(perMonth)}
          sub="Total spend over the months this log spans."
        />
        <Tile
          label="Entries"
          value={String(visible.length)}
          sub={selected ? "For this vehicle." : "Across all vehicles."}
        />
        <Tile
          label="Last service"
          value={lastService ?? "-"}
          sub="Most recent dated entry."
        />
      </div>

      {/* Vehicle picker */}
      <div className="no-print flex flex-wrap items-center gap-2 mb-4">
        <Chip
          active={selected === ""}
          onClick={() => setSelected("")}
          label={`All vehicles (${logs.length})`}
        />
        {vehicleNames.map((name) => (
          <Chip
            key={name}
            active={selected === name}
            onClick={() => setSelected(name)}
            label={`${name} (${logs.filter((l) => l.vehicle === name).length})`}
            onRemove={() => {
              if (
                window.confirm(
                  `Remove ${name} and its log entries? Export a CSV first if you want a copy.`,
                )
              ) {
                removeVehicle(name);
              }
            }}
          />
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addVehicle();
          }}
          className="flex items-center gap-2 ml-auto"
        >
          <input
            type="text"
            value={newVehicle}
            onChange={(e) => setNewVehicle(e.target.value)}
            placeholder="Add vehicle nickname"
            aria-label="Add vehicle nickname"
            className="border border-light-gray rounded-md bg-white px-2.5 py-2 font-sans text-xs text-near-black w-44 focus:border-primary-green focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newVehicle.trim()}
            className="inline-flex items-center gap-1.5 bg-primary-green hover:bg-primary-green-dark disabled:bg-light-gray disabled:text-charcoal/45 text-white font-medium text-xs px-3 py-2 rounded-md transition-colors"
          >
            + Add vehicle
          </button>
        </form>
      </div>

      {/* The vehicle filter is a screen affordance. Print is the full service
          history for every vehicle, which is the artifact a resale buyer or an
          ASE inspector actually asks for. */}
      <style>{`@media screen { .vmt-filtered { display: none; } }`}</style>

      {/* Log */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-3">
        <button
          type="button"
          onClick={addLog}
          className="inline-flex items-center gap-1.5 bg-primary-green hover:bg-primary-green-dark text-white font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          + Log a service
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          Import CSV
        </button>
        {state.logs.length > 1 && (
          <button
            type="button"
            onClick={() =>
              setAllLogsCollapsed(collapsedLogs.size < state.logs.length)
            }
            className="inline-flex items-center font-sans text-sm font-medium text-primary-green hover:text-primary-green-dark px-2 py-2 rounded-md transition-colors"
          >
            {collapsedLogs.size < state.logs.length
              ? "Collapse all"
              : "Expand all"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onImportFile}
          className="hidden"
        />
        <span className="font-sans text-xs text-charcoal/55">
          Any CSV with these column names, including one exported here.
        </span>
      </div>

      {state.logs.length === 0 && logs.length === 0 ? (
        <div className="border border-dashed border-light-gray rounded-lg bg-off-white/50 px-6 py-10 text-center mb-6">
          <p className="font-display text-base font-semibold text-near-black mb-1.5">
            No services logged yet.
          </p>
          <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto">
            Add a vehicle, then log every service with the date, mileage, and
            cost. The habit takes a minute and it is the paper trail an ASE
            inspector or a resale buyer asks for.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {/* One accordion per service, superseding the six-column table this
              used to be. The table needed ~59rem and a stacked fallback below
              40rem; an accordion is the same idea at every width, and it is the
              idiom the other trackers now use.

              Every log is rendered, including ones the vehicle filter hides and
              ones that are collapsed. Both are hidden by screen-only rules, so
              a printed log is the whole service history — which is what the
              `selected` doc has always claimed and the old table quietly broke
              by filtering in the render. */}
          {state.logs.map((l) => {
            const open = !collapsedLogs.has(l._id);
            const filtered =
              Boolean(selected) && isLogFilled(l) && l.vehicle !== selected;
            const bodyId = `vmt-${l._id}`;
            const headline = l.service.trim() || "New service";
            const meta = [
              formatLogDate(l.date),
              l.odometer.trim() ? `${l.odometer.trim()} mi` : "",
              l.cost.trim() ? `$${l.cost.trim()}` : "",
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={l._id}
                className={`placeholders-are-examples bg-white border rounded-lg break-inside-avoid ${
                  filtered ? "vmt-filtered" : ""
                } ${open ? "border-primary-green/40" : "border-light-gray"}`}
              >
                <div className="flex items-start gap-2 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => toggleLog(l._id)}
                    aria-expanded={open}
                    aria-controls={bodyId}
                    className="flex-1 min-w-0 text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-base font-semibold text-near-black leading-snug wrap-break-word min-w-0">
                        {headline}
                      </span>
                      {l.vehicle.trim() && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-primary-green/10 text-primary-green px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap">
                          {l.vehicle.trim()}
                        </span>
                      )}
                    </div>
                    {meta && (
                      <p className="no-print mt-1 font-sans text-xs text-charcoal/60 wrap-break-word">
                        {meta}
                      </p>
                    )}
                  </button>

                  <div className="no-print flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => deleteLog(l._id)}
                      aria-label={`Delete ${headline}`}
                      className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-charcoal/40 hover:text-terracotta hover:bg-terracotta/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLog(l._id)}
                      aria-expanded={open}
                      aria-controls={bodyId}
                      aria-label={`${open ? "Collapse" : "Expand"} ${headline}`}
                      className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-charcoal/50 hover:text-near-black hover:bg-off-white transition-colors"
                    >
                      <ChevronDown
                        aria-hidden
                        className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                <div
                  id={bodyId}
                  className={`px-3 sm:px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 ${
                    open ? "" : "collapsed-on-screen"
                  }`}
                >
                  <LogField label="Vehicle">
                    <select
                      value={l.vehicle}
                      onChange={(e) => setLog(l._id, { vehicle: e.target.value })}
                      aria-label="Vehicle"
                      className={cellClass}
                    >
                      <option value=""></option>
                      {vehicleNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </LogField>
                  <LogField label="Date">
                    <input
                      type="date"
                      value={l.date}
                      onChange={(e) => setLog(l._id, { date: e.target.value })}
                      aria-label="Date"
                      className={cellClass}
                    />
                  </LogField>
                  <LogField label="Odometer">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={l.odometer}
                      onChange={(e) => setLog(l._id, { odometer: e.target.value })}
                      aria-label="Odometer"
                      placeholder="0"
                      className={cellClass}
                    />
                  </LogField>
                  <LogField label="Service">
                    <input
                      type="text"
                      list="vmt-services"
                      value={l.service}
                      onChange={(e) => setLog(l._id, { service: e.target.value })}
                      aria-label="Service type"
                      placeholder="Oil and filter change"
                      className={cellClass}
                    />
                  </LogField>
                  <LogField label="Cost">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={l.cost}
                      onChange={(e) => setLog(l._id, { cost: e.target.value })}
                      aria-label="Cost"
                      placeholder="0"
                      className={cellClass}
                    />
                  </LogField>
                  <LogField label="Notes" wide>
                    <input
                      type="text"
                      value={l.notes}
                      onChange={(e) => setLog(l._id, { notes: e.target.value })}
                      aria-label="Notes"
                      placeholder="Shop, receipt, what prompted it"
                      className={cellClass}
                    />
                  </LogField>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Per-vehicle totals */}
      {perVehicle.length > 0 && (
        <div className="bg-white border border-light-gray rounded-lg overflow-hidden mb-6 break-inside-avoid">
          <div className="px-4 py-3 bg-off-white border-b border-light-gray">
            <p className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
              Cost by vehicle
            </p>
          </div>
          <dl className="divide-y divide-light-gray/70">
            {perVehicle.map((v) => (
              <div
                key={v.name}
                className="flex items-baseline justify-between gap-4 px-4 py-2.5"
              >
                <dt className="font-sans text-sm text-charcoal/80">
                  {v.name}
                  <span className="text-charcoal/50">
                    {" "}
                    · {v.count} {v.count === 1 ? "entry" : "entries"}
                  </span>
                </dt>
                <dd className="font-sans text-sm font-medium tabular-nums text-near-black">
                  {money(v.total)}
                  {v.perMonth !== null && (
                    <span className="text-charcoal/50 font-normal">
                      {" "}
                      ({money(v.perMonth)}/mo)
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Preventive schedule reference */}
      <section className="bg-white border border-light-gray rounded-lg overflow-hidden mb-6 break-inside-avoid">
        <button
          type="button"
          onClick={() => setShowSchedule((s) => !s)}
          aria-expanded={showSchedule}
          className="no-print w-full flex items-center justify-between px-4 py-3 bg-off-white border-b border-light-gray text-left"
        >
          <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-charcoal/70">
            Preventive schedule reference
          </span>
          <span className="font-sans text-xs text-charcoal/50">
            {showSchedule ? "Hide" : "Show"}
          </span>
        </button>
        <div className={showSchedule ? "" : "hidden print:block"}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {SCHEDULE_TIERS.map((tier) => (
              <div key={tier.interval}>
                <p className="font-sans text-sm font-semibold text-near-black mb-1.5">
                  {tier.interval}
                </p>
                <ul className="space-y-1">
                  {tier.items.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-sm text-charcoal/75 leading-snug pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary-green/60"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                {tier.note && (
                  <p className="font-sans text-[11px] text-charcoal/50 mt-1.5 leading-snug">
                    {tier.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="font-sans text-[11px] leading-relaxed text-charcoal/50">
        {CALC_DISCLAIMER}
      </p>

      <datalist id="vmt-services">
        {SERVICE_TYPES.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </ResourceToolShell>
  );
}

const cellClass =
  "w-full border border-transparent hover:border-light-gray focus:border-primary-green bg-transparent px-2 py-1.5 text-sm text-near-black rounded focus:outline-none placeholder:text-charcoal/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

/** One labelled control inside an expanded service card. */
function LogField({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-3" : ""}>
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/55 mb-1">
        {label}
      </label>
      <div className="border border-light-gray rounded-md bg-white">
        {children}
      </div>
    </div>
  );
}

/** yyyy-mm-dd read back short, for the collapsed summary line. */
function formatLogDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return value.trim();
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return value.trim();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-near-black rounded-lg p-4">
      <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-warm-gold mb-1">
        {label}
      </p>
      <p className="font-display text-xl sm:text-2xl font-semibold leading-tight text-white truncate">
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

function Chip({
  active,
  onClick,
  label,
  onRemove,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  onRemove?: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans text-xs font-semibold rounded-full border transition-colors ${
        active
          ? "bg-near-black text-white border-near-black"
          : "bg-white text-charcoal border-light-gray hover:border-charcoal"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="pl-3 py-2 pr-1 rounded-full"
      >
        {label}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className={`pr-2.5 py-2 text-sm leading-none ${
            active
              ? "text-white/60 hover:text-white"
              : "text-charcoal/40 hover:text-terracotta"
          }`}
        >
          ×
        </button>
      )}
    </span>
  );
}
