// Market Underwriting Scorecard, the Module 3 six-factor filter. Score any
// candidate car 1 to 5 on each factor, total it out of 30, and read the band
// before a single dollar of calculator math is spent on it.
//
// The factors, the 1-to-5 scale, the level descriptors, the 30-point bands
// (24 to 30 strong, 18 to 23 investigate, below 18 pass), and the veto rule
// all come from Module 3.2 (The Underwriting Scorecard) verbatim; the lesson
// is the source of truth for this tool.
//
// Turo plan figures are imported from the Vehicle Profitability Calculator
// config, the single place those numbers live; nothing platform-specific is
// redeclared here.

import { EARNINGS_PLANS } from "@/lib/resources/vehicle-profitability-calculator/config";

export type ScoreValue = 1 | 2 | 3 | 4 | 5;

/** The lesson anchors 5, 3, and 1 with descriptors; 4 and 2 sit between. */
export type AnchorValue = 5 | 3 | 1;

export type FactorId =
  | "priceVsAdr"
  | "depreciation"
  | "maintenance"
  | "segmentFit"
  | "planFit"
  | "exitLiquidity";

export interface Factor {
  id: FactorId;
  /** 1-based display number. */
  num: number;
  name: string;
  /** Short name for table columns, CSV headers, and veto notes. */
  shortName: string;
  /** The underwriting question the factor answers. */
  question: string;
  /** Why the factor matters, shown inline while scoring. */
  why: string;
  /** Descriptors for the anchored score levels (5, 3, and 1). */
  anchors: Record<AnchorValue, string>;
}

function money(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

const [peace, balanced, earnings] = EARNINGS_PLANS;

export const FACTORS: Factor[] = [
  {
    id: "priceVsAdr",
    num: 1,
    name: "Acquisition price vs. class ADR",
    shortName: "Price vs. class ADR",
    question:
      "How many booked days does it take this car to pay back its own purchase price at its class's proven daily rate?",
    why:
      "Every car belongs to a class in your market, and your market scan told you what that class rents for. A cheaper car earning the same class rate pays itself back faster. That ratio is just division, and it is the closest thing this business has to an edge.",
    anchors: {
      5: "Purchase price is low for the class, and the class ADR is proven in your scan.",
      3: "Fair price, average rate. Nothing special either way.",
      1: "You would be paying up for a class your market is discounting.",
    },
  },
  {
    id: "depreciation",
    num: 2,
    name: "Depreciation curve",
    shortName: "Depreciation",
    question: "How much value will this specific car shed while it earns for you?",
    why:
      "Every mile a guest drives burns a little of the asset. New cars fall hardest in their first years; older cars have already taken that hit, and rental miles accelerate whatever is left.",
    anchors: {
      5: "Past the steep part of its curve, and known to hold value from here.",
      3: "Normal used-car fade, at a normal pace.",
      1: "New or nearly new, with the steep first-years drop still ahead, on your watch.",
    },
  },
  {
    id: "maintenance",
    num: 3,
    name: "Maintenance and parts risk",
    shortName: "Maintenance risk",
    question:
      "What does it cost to keep this specific car on the road through hard rental miles?",
    why:
      "Some cars are famously cheap to keep alive, with parts everywhere and any shop able to service them. Others have dealer-only parts or community-documented failure points; ten minutes on owner forums for the exact generation tells you which. Remember the platform's eligibility floor while you shop: generally 12 years old or newer, under 130,000 miles, clean title. A car aging out soon has a shorter earning runway, and that belongs in your score.",
    anchors: {
      5: "Famously durable, cheap common parts, any shop can service it.",
      3: "Average costs, no known failure points.",
      1: "Dealer-only parts, complex drivetrain, or known expensive failures.",
    },
  },
  {
    id: "segmentFit",
    num: 4,
    name: "Demand segment fit",
    shortName: "Segment fit",
    question: "Does a segment your market scan found actually want this car?",
    why:
      "A minivan in a market full of traveling families is a fit. A two-seater in a gig-driver market is a mismatch at any price. If no active local segment wants it, nothing else on the scorecard can save it. Hope is not a segment.",
    anchors: {
      5: "Squarely wanted by an active, under-supplied segment from your scan.",
      3: "Fits a segment with average competition.",
      1: "No active local segment wants it.",
    },
  },
  {
    id: "planFit",
    num: 5,
    name: "Earnings-plan fit vs. damage exposure",
    shortName: "Plan fit",
    question:
      "Can this car's likely gross carry the plan you would realistically pick, and could you absorb that plan's damage responsibility tomorrow?",
    why:
      `Turo's three earnings plans trade income for exposure: ${Math.round(peace.share * 100)}% of gross with ${money(peace.damageResponsibility)} damage responsibility per claim, ${Math.round(balanced.share * 100)}% with ${money(balanced.damageResponsibility)}, or ${Math.round(earnings.share * 100)}% with ${money(earnings.damageResponsibility)}. This factor scores you as much as the car: the same deal reads differently at different cash reserves.`,
    anchors: {
      5: `Economics work even on the ${Math.round(peace.share * 100)}% plan, and any plan's damage responsibility is absorbable.`,
      3: `Needs the ${Math.round(balanced.share * 100)}% plan to pencil, and the ${money(balanced.damageResponsibility)} exposure is manageable.`,
      1: `Only pencils at ${Math.round(earnings.share * 100)}% while ${money(earnings.damageResponsibility)} per claim would genuinely hurt.`,
    },
  },
  {
    id: "exitLiquidity",
    num: 6,
    name: "Exit liquidity",
    shortName: "Exit liquidity",
    question:
      "When this car stops earning, how fast can you turn it back into cash, and who buys it?",
    why:
      "Every car in your fleet leaves your fleet someday. Check how many similar cars are listed for sale locally and how long they sit; that is your liquidity preview. Buying is optional. Selling never is.",
    anchors: {
      5: "High-volume model, deep buyer pool, sells in days.",
      3: "Normal used-market demand.",
      1: "Niche trim or configuration that sits for months.",
    },
  },
];

export const MAX_TOTAL = FACTORS.length * 5;

/** Band thresholds on the 30-point total, from the lesson's slide 8. */
export const BANDS = { strongAt: 24, investigateAt: 18 } as const;

export type Band = "STRONG" | "INVESTIGATE" | "PASS";

export function bandFor(total: number): Band {
  if (total >= BANDS.strongAt) return "STRONG";
  if (total >= BANDS.investigateAt) return "INVESTIGATE";
  return "PASS";
}

export const BAND_COPY: Record<Band, string> = {
  STRONG:
    "Strong candidate. It has earned full math: run it through the Vehicle Profitability Calculator.",
  INVESTIGATE:
    "Investigate before you commit. Find the weak factors and ask whether they are fixable: a weak price score might be negotiable, a weak parts-risk score is not.",
  PASS:
    "Pass and move on. Do not argue with it, do not romance it. Most candidates should die at this stage, and the discipline to pass is the whole method.",
};

export interface CandidateCar {
  id: string;
  nickname: string;
  /** Asking or expected purchase price, kept as a text-field string. */
  price: string;
  notes: string;
  /** Factor scores; a missing key means not yet scored. */
  scores: Partial<Record<FactorId, ScoreValue>>;
}

export interface ScorecardState {
  cars: CandidateCar[];
}

export const DEFAULT_STATE: ScorecardState = { cars: [] };

export function totalFor(car: CandidateCar): number {
  return FACTORS.reduce((sum, f) => sum + (car.scores[f.id] ?? 0), 0);
}

export function scoredCount(car: CandidateCar): number {
  return FACTORS.filter((f) => car.scores[f.id] !== undefined).length;
}

export function isFullyScored(car: CandidateCar): boolean {
  return scoredCount(car) === FACTORS.length;
}

/** Factors scored 1. Any of these is a veto until investigated. */
export function vetoFactors(car: CandidateCar): Factor[] {
  return FACTORS.filter((f) => car.scores[f.id] === 1);
}

export const SCORING_RULE =
  "Score with evidence from your market scan and real listings, not vibes. When you are not sure, score lower. Underwriters round down.";

export const VETO_RULE =
  "Treat any factor scored 1 as a veto until you have investigated it. A deal with five straight fives and one catastrophic weakness is not a 26; it is a trap with a good average.";
