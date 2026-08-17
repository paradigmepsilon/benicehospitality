// Startup Budget Builder - everything car #1 costs before its first trip.
//
// Line items follow Lesson 2.3's six budget lines, folded into the four
// sections the course's launch documents use (H03 startup-cost table, H06
// week-by-week plan): acquisition, prep, operating float, cash reserve.
// Default amounts are placeholders to react against, not quotes; the lesson's
// rule is real quotes only, high end of every range.
//
// The reserve line is not typed in: it comes from the chosen 2026 earnings
// plan's damage responsibility, imported from the vehicle-profitability
// config so the platform numbers live in one place.

import {
  EARNINGS_PLANS,
  planById,
  type EarningsPlan,
} from "@/lib/resources/vehicle-profitability-calculator/config";

export { EARNINGS_PLANS, planById };
export type { EarningsPlan };

export interface BudgetItem {
  id: string;
  label: string;
  hint: string;
  /** Placeholder default, shown in the empty field. Estimates, not quotes. */
  placeholder: number;
  optional?: boolean;
}

export interface BudgetSection {
  id: string;
  title: string;
  blurb: string;
  items: BudgetItem[];
}

export const BUDGET_SECTIONS: BudgetSection[] = [
  {
    id: "acquisition",
    title: "Acquisition",
    blurb:
      "The car and the paperwork to own it. Financed? Use your down payment plus every payment you expect before the first booking; the payment clock starts at purchase.",
    items: [
      {
        id: "vehicle",
        label: "Vehicle: cash price, or down payment + pre-launch payments",
        hint: "Eligibility guardrails shape the shopping list: 12 years old or newer, under 130,000 miles, clean title only.",
        placeholder: 15000,
      },
      {
        id: "taxTitle",
        label: "Tax, title, and registration",
        hint: "State specific. Call your county tag office, not a forum thread.",
        placeholder: 500,
      },
      {
        id: "inspection",
        label: "Pre-purchase inspection",
        hint: "An independent mechanic's once-over even if your state does not require one. Walk away from a bad report.",
        placeholder: 150,
      },
      {
        id: "catchUp",
        label: "Catch-up maintenance",
        hint: "Fluids, brakes, tires, battery, wipers. A used car almost always needs something; a zero on this line means the budget is fiction.",
        placeholder: 500,
      },
    ],
  },
  {
    id: "prep",
    title: "Prep",
    blurb:
      "Getting the car guest-ready and listing-ready. Cheap lines that set the price your listing can command.",
    items: [
      {
        id: "detail",
        label: "Full professional detail",
        hint: "Before photo day. Guests rate cleanliness brutally and your listing photos last for years.",
        placeholder: 200,
      },
      {
        id: "photoDay",
        label: "Photo shoot",
        hint: "A phone, a clean location, and good evening light can work; a paid local photographer is the alternative. Either way, put a number on it.",
        placeholder: 100,
      },
      {
        id: "spareKey",
        label: "Spare key",
        hint: "Part of your handoff system. Modern keys are not cheap; price yours before you need it mid-trip.",
        placeholder: 250,
      },
      {
        id: "lockbox",
        label: "Lockbox",
        hint: "Optional. For remote handoffs; skip it if every handoff is in person.",
        placeholder: 75,
        optional: true,
      },
      {
        id: "gps",
        label: "GPS tracker",
        hint: "Optional at this vehicle value. Note Turo expects an activated OEM tracker on $125,000+ cars.",
        placeholder: 100,
        optional: true,
      },
    ],
  },
  {
    id: "float",
    title: "Operating float",
    blurb:
      "What the first month consumes before the first payout lands.",
    items: [
      {
        id: "insuranceMonth1",
        label: "Insurance decision, first month",
        hint: "Most personal policies exclude peer-to-peer car sharing (Turo's own statement). Placeholder until your agent call replaces it with a real quote or a documented decision to decline.",
        placeholder: 150,
      },
      {
        id: "cleaningKit",
        label: "Cleaning kit",
        hint: "A real vacuum, interior and glass cleaner, microfiber towels, trash kit, odor treatment, backup charger cables. Bought once, used every turnover.",
        placeholder: 150,
      },
    ],
  },
  {
    id: "reserve",
    title: "Cash reserve",
    blurb:
      "The line everyone skips and the one that saves you. Floor: one damage responsibility on your chosen plan, plus a maintenance cushion.",
    items: [
      {
        id: "maintenanceCushion",
        label: "Maintenance cushion",
        hint: "On top of the damage-responsibility floor. Tires and brakes do not ask permission.",
        placeholder: 500,
      },
    ],
  },
];

export const ALL_BUDGET_ITEMS: BudgetItem[] = BUDGET_SECTIONS.flatMap((s) => s.items);

export type InsuranceDecision = "undecided" | "quoted" | "declined-documented";

export interface BudgetState {
  /** Entered amounts by item id, as text-field strings. Empty = not quoted yet. */
  amounts: Record<string, string>;
  planId: EarningsPlan["id"];
  reserveFunded: boolean;
  insuranceDecision: InsuranceDecision;
}

export const DEFAULT_BUDGET_STATE: BudgetState = {
  amounts: {},
  planId: "balanced",
  reserveFunded: false,
  insuranceDecision: "undecided",
};

export interface BudgetTotals {
  bySection: Record<string, number>;
  /** Acquisition + prep + float. Lesson 2.3's first output figure. */
  cashToFirstTrip: number;
  damageResponsibility: number;
  /** Damage responsibility + maintenance cushion. */
  reserveTotal: number;
  /** Cash to first trip + reserve. The real startup number. */
  dayOneTotal: number;
  filledCount: number;
  /** Lines that need a real number (optional lines excluded). */
  requiredCount: number;
}

function num(v: string | undefined): number {
  if (v === undefined) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function computeTotals(state: BudgetState): BudgetTotals {
  const bySection: Record<string, number> = {};
  for (const section of BUDGET_SECTIONS) {
    bySection[section.id] = section.items.reduce(
      (sum, item) => sum + num(state.amounts[item.id]),
      0,
    );
  }
  const plan = planById(state.planId);
  const cashToFirstTrip =
    (bySection.acquisition ?? 0) + (bySection.prep ?? 0) + (bySection.float ?? 0);
  const reserveTotal = plan.damageResponsibility + (bySection.reserve ?? 0);

  const required = ALL_BUDGET_ITEMS.filter((i) => !i.optional);
  const filledCount = required.filter(
    (i) => (state.amounts[i.id] ?? "").trim() !== "",
  ).length;

  return {
    bySection,
    cashToFirstTrip,
    damageResponsibility: plan.damageResponsibility,
    reserveTotal,
    dayOneTotal: cashToFirstTrip + reserveTotal,
    filledCount,
    requiredCount: required.length,
  };
}
