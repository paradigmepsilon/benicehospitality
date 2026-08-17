// Vehicle Maintenance Tracker - a per-vehicle service log with a preventive
// schedule reference.
//
// Content sources:
//   - Module 6.3 "Maintenance as a System" spec (mileage tiers, weekly
//     walkaround, recall habit, delisting rule)
//   - H04 SOP Library (log every service: date, mileage, cost, receipt)
//   - Turo fact file: below a 30% five-star maintenance rating over the last
//     10 trips the vehicle is delisted; an ASE-certified inspection is
//     required to reinstate (2025 host updates, verified 2026-08).

export interface Vehicle {
  _id: string;
  name: string;
}

export interface LogEntry {
  _id: string;
  /** Vehicle nickname, matched by name so CSV import stays simple. */
  vehicle: string;
  date: string;
  odometer: string;
  service: string;
  cost: string;
  notes: string;
}

export interface MaintenanceState {
  vehicles: Vehicle[];
  logs: LogEntry[];
}

/** Preset service types; the field also accepts anything custom. */
export const SERVICE_TYPES = [
  "Oil and filter change",
  "Tire rotation",
  "Brake inspection",
  "Brake pads replaced",
  "Tire replacement",
  "Fluid top-off",
  "Engine air filter",
  "Cabin air filter",
  "Battery test or replacement",
  "Alignment",
  "Transmission service",
  "Coolant service",
  "Spark plugs",
  "Weekly walkaround",
  "Recall repair",
  "Wiper blades",
  "Other repair",
] as const;

export interface ScheduleTier {
  interval: string;
  items: string[];
  note?: string;
}

/**
 * The preventive schedule from Module 6.3. The owner's manual is the
 * authority; these are the course's working tiers.
 */
export const SCHEDULE_TIERS: ScheduleTier[] = [
  {
    interval: "Weekly, at turnover",
    items: [
      "Tires: pressure with a gauge, tread over time",
      "Brakes: listen and feel on a short drive",
      "Fluids: oil, coolant, washer",
      "Lights: every exterior bulb plus dash warnings",
      "Wipers and glass: streaks, chips, cracks",
      "Cabin systems: AC, heat, USB ports, infotainment",
    ],
    note: "Six checks, about ten minutes. Almost every delisting-path complaint gets caught here.",
  },
  {
    interval: "Every ~5,000 miles (or per your manual)",
    items: [
      "Oil and filter",
      "Tire rotation",
      "Brake visual check",
      "Fluid top-offs",
    ],
  },
  {
    interval: "Every 15,000 to 30,000 miles (per your manual)",
    items: [
      "Engine and cabin air filters",
      "Brake pads measured, not eyeballed",
      "Battery test",
      "Alignment check if the car pulls or tires wear unevenly",
    ],
  },
  {
    interval: "Per the manufacturer schedule",
    items: [
      "Transmission service",
      "Coolant",
      "Spark plugs",
      "Timing components",
    ],
    note: "The owner's manual is the authority, not a forum post and not this course. Log everything.",
  },
  {
    interval: "Monthly",
    items: ["Run your VIN through NHTSA.gov for open recalls and log the result"],
  },
];

/** The delisting stakes, from the Turo fact file (2025 host updates). */
export const DELISTING_WARNING = {
  headline: "The 30% rule is why this log exists",
  body: "Fall below a 30% five-star maintenance rating over your last 10 trips and Turo delists the car. Reinstating it requires an inspection by an ASE-certified mechanic, and a dated service log with mileage and costs is exactly what that inspector, and any damage dispute, wants to see.",
};

export const CSV_HEADER = [
  "Vehicle",
  "Date",
  "Odometer",
  "Service",
  "Cost",
  "Notes",
] as const;

export function isLogFilled(l: LogEntry): boolean {
  return (
    l.date.trim() !== "" ||
    l.odometer.trim() !== "" ||
    l.service.trim() !== "" ||
    l.cost.trim() !== "" ||
    l.notes.trim() !== ""
  );
}

/**
 * Cost per month across a set of entries: total cost divided by the number of
 * calendar months spanned by the dated entries, minimum one month.
 */
export function costPerMonth(entries: LogEntry[]): number | null {
  const dated = entries
    .map((e) => ({ t: Date.parse(e.date), cost: parseFloat(e.cost) }))
    .filter((x) => Number.isFinite(x.t));
  const total = entries.reduce((t, e) => {
    const c = parseFloat(e.cost);
    return t + (Number.isFinite(c) && c > 0 ? c : 0);
  }, 0);
  if (!dated.length) return null;
  const min = Math.min(...dated.map((x) => x.t));
  const max = Math.max(...dated.map((x) => x.t));
  const months = Math.max(1, (max - min) / (1000 * 60 * 60 * 24 * 30.4));
  return total / months;
}

export function totalCost(entries: LogEntry[]): number {
  return entries.reduce((t, e) => {
    const c = parseFloat(e.cost);
    return t + (Number.isFinite(c) && c > 0 ? c : 0);
  }, 0);
}
