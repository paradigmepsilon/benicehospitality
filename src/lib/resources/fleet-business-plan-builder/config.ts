// Fleet Business Plan Builder, the interactive version of Handout H03
// (Business Plan Template). Section structure, prompts, helper text, and every
// platform fact below come from that handout; the handout's facts trace to the
// CRR fact base (verified 2026-08-15).
//
// Turo earnings-plan figures are imported from the Vehicle Profitability
// Calculator config, the single place those numbers live.

import { EARNINGS_PLANS } from "@/lib/resources/vehicle-profitability-calculator/config";

export { EARNINGS_PLANS };

export type FieldKind = "text" | "textarea" | "money";

export interface PlanField {
  id: string;
  label: string;
  kind: FieldKind;
  /** The handout's bracketed prompt, shown under the label. */
  helper?: string;
  placeholder?: string;
}

export interface FieldGroup {
  heading?: string;
  /** Short note under the group heading. */
  note?: string;
  fields: PlanField[];
}

export interface PlanSection {
  id: string;
  label: string;
  shortLabel: string;
  /** Lead-in shown at the top of the section panel. */
  intro?: string;
  groups: FieldGroup[];
}

const t = (
  id: string,
  label: string,
  helper?: string,
  placeholder?: string,
): PlanField => ({ id, label, kind: "textarea", helper, placeholder });
const s = (
  id: string,
  label: string,
  helper?: string,
  placeholder?: string,
): PlanField => ({ id, label, kind: "text", helper, placeholder });
const m = (id: string, label: string, helper?: string): PlanField => ({
  id,
  label,
  kind: "money",
  helper,
});

export const GROSS_VS_NET_RULE =
  "One rule for the whole plan: every earnings number is either gross (before costs) or true net (after operating costs AND depreciation). Label which one you mean, every time. Turo's published host average of $10,489 per year per car is a gross figure with ownership costs not deducted. Plans built on gross numbers fail quietly.";

export const CAR_TWO_RULE =
  "No car #2 until car #1 has posted three straight months of positive true net AND you hold one full damage responsibility in cash per car.";

export const TAX_NOTE =
  "Reporting thresholds are not taxability: all rental income is taxable regardless of whether you receive a 1099-K. For 2025 onward the federal 1099-K threshold is $20,000 AND 200 transactions (some states set lower thresholds). Get a tax professional; this plan is not tax advice.";

export const PLAN_SECTIONS: PlanSection[] = [
  {
    id: "summary",
    label: "Executive summary",
    shortLabel: "Summary",
    intro:
      "Write this last if you prefer, but do not skip it. If you cannot fill a section, that is the section telling you what you do not know yet.",
    groups: [
      {
        heading: "The basics",
        fields: [
          s("businessName", "Business name", undefined, "Your business name"),
          s("preparedBy", "Prepared by", undefined, "Your name"),
          s("contact", "Contact", undefined, "Email and phone"),
        ],
      },
      {
        heading: "Concept",
        fields: [
          t(
            "concept",
            "Business concept",
            "One or two paragraphs: your target market, vehicle niche, and what makes your operation different. If the honest answer is 'nothing yet', write that and come back after Market analysis.",
            "Target market, vehicle niche, and what makes you different",
          ),
          t(
            "mission",
            "Mission statement",
            "Why this business exists and the value it provides. One or two sentences.",
            "Why this business exists",
          ),
          t(
            "structure",
            "Business structure",
            "Sole proprietorship, LLC, or corporation, plus ownership details. Flag entity and tax questions for a professional; do not guess.",
            "Entity type and ownership",
          ),
        ],
      },
      {
        heading: "Financial highlights (Year 1)",
        note: "Pull these from the Financial plan section once it is built. Cash reserve target: one full damage responsibility per car, held in cash.",
        fields: [
          m("hlInvestment", "Initial investment"),
          m("hlGross", "Projected monthly gross revenue"),
          m("hlOpex", "Projected monthly operating expenses"),
          m("hlDep", "Projected monthly depreciation"),
          m(
            "hlTrueNet",
            "Projected monthly true net",
            "Gross minus operating costs minus depreciation. The only profit number this plan recognizes.",
          ),
          s("hlBreakEven", "Projected break-even point", undefined, "e.g. month 9"),
        ],
      },
      {
        fields: [
          t(
            "growthStrategy",
            "Growth strategy",
            "Fleet expansion timeline and targets. Tie expansion to the readiness rule in Milestones & growth, not to a calendar date.",
            "How and when the fleet grows",
          ),
        ],
      },
    ],
  },
  {
    id: "market",
    label: "Market analysis",
    shortLabel: "Market",
    groups: [
      {
        fields: [
          t(
            "industry",
            "Industry overview",
            "Current state of peer-to-peer car sharing in your market. Getaround shut down all US operations in February 2025, which leaves Turo as effectively the only national US P2P platform. That is both your opportunity and your platform-dependency risk: write down what happens to this business if platform terms change.",
            "The P2P landscape in your market, and your platform-dependency answer",
          ),
          t(
            "targetMarket",
            "Target market",
            "Your primary customer segments: demographics, trip purposes, booking patterns.",
            "Who rents from you, and why",
          ),
        ],
      },
      {
        heading: "Primary customer segments",
        fields: [
          s("seg1", "Segment 1", undefined, "Segment and brief description"),
          s("seg2", "Segment 2", undefined, "Segment and brief description"),
          s("seg3", "Segment 3", undefined, "Segment and brief description"),
        ],
      },
      {
        fields: [
          t(
            "localMarket",
            "Local market assessment",
            "Your specific geographic market: tourism, business travel, seasonality. No official Turo ADR or utilization data exists, so build this from Turo's Carculator plus a market tool (Sharelytics, RentScout, or TurboPricing), and label everything an estimate. Watch for saturation: big-metro economy segments are consistently flagged as crowded, and mid-size markets often out-earn them.",
            "Demand drivers, seasonality, saturation read",
          ),
        ],
      },
      {
        heading: "Direct competitors",
        note: "Other hosts in your market, traditional rental companies, and alternatives.",
        fields: [
          s("comp1", "Competitor 1", undefined, "Who they are: strengths / weaknesses"),
          s("comp2", "Competitor 2", undefined, "Who they are: strengths / weaknesses"),
          s("comp3", "Competitor 3", undefined, "Who they are: strengths / weaknesses"),
        ],
      },
      {
        fields: [
          t(
            "advantage",
            "Competitive advantage",
            "What you'll do differently, and why it's durable rather than easy to copy.",
            "Your edge, and why it holds",
          ),
        ],
      },
    ],
  },
  {
    id: "vehicles",
    label: "Vehicles & acquisition",
    shortLabel: "Vehicles",
    intro:
      "Run every candidate vehicle through the Vehicle Profitability Calculator before it goes in this section. The calculator forces the true-net math; this section records the result.",
    groups: [
      {
        fields: [
          t(
            "criteria",
            "Vehicle selection criteria",
            "Start with the platform's eligibility gate: 12 years old or newer, under 130,000 miles, clean title. Then demand, parts cost, reliability record, and depreciation curve.",
            "Your criteria, starting from the eligibility gate",
          ),
        ],
      },
      {
        fields: [
          t(
            "acquisition",
            "Acquisition strategy",
            "Purchase, finance, or lease, and your sourcing approach.",
            "How you'll buy, and where you'll source",
          ),
          t(
            "expansion",
            "Fleet expansion plan",
            `Timeline and criteria. The readiness rule: ${CAR_TWO_RULE}`,
            "When car #2 happens, and what has to be true first",
          ),
          t(
            "maintPlan",
            "Vehicle maintenance strategy",
            "Preventive maintenance schedule, service providers, budget. Maintenance is a platform survival issue, not just a cost line: a five-star maintenance rating below 30% over your last 10 trips gets the vehicle delisted, with an ASE-certified inspection required to reinstate.",
            "Schedule, providers, budget",
          ),
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations plan",
    shortLabel: "Operations",
    groups: [
      {
        fields: [
          t(
            "location",
            "Business location",
            "Where the business is based and where vehicles live between trips.",
            "Home base and vehicle staging",
          ),
          t(
            "checkin",
            "Check-in and check-out procedures",
            "Your handoff process. Use the worked SOP in the Operations handout, including the 24-hour photo windows and metadata requirements.",
            "The handoff, step by step",
          ),
          t(
            "prep",
            "Vehicle preparation standards",
            "Cleaning and prep protocols between bookings.",
            "Your between-trips standard",
          ),
          t(
            "maintMgmt",
            "Maintenance management",
            "How you track and schedule maintenance per vehicle.",
            "Tracking and scheduling per vehicle",
          ),
          t(
            "comms",
            "Guest communication protocols",
            "Your communication plan across the trip lifecycle. Use the message templates handout.",
            "Before, during, and after each trip",
          ),
          t(
            "quality",
            "Quality control measures",
            "How you keep quality consistent, especially once you delegate.",
            "Consistency, especially once you delegate",
          ),
          t(
            "tech",
            "Technology and tools",
            "Software and tools you'll use. Turo has blocked some third-party fleet tools (CarSync, Fleetwire): build your stack on Turo-native features plus external telematics, not banned integrations.",
            "Your stack",
          ),
          t(
            "platformPlan",
            "Platform and direct-channel plan",
            "Your plan for visibility and conversion on Turo (listing quality, pricing, response speed, reviews), plus the website, social, and local partnerships you'll build off-platform. Direct channels reduce your platform dependency; treat this as risk management, not just marketing.",
            "On-platform optimization plus off-platform channels",
          ),
        ],
      },
    ],
  },
  {
    id: "risk",
    label: "Risk & insurance",
    shortLabel: "Risk",
    groups: [
      {
        fields: [
          t(
            "planWhy",
            "Why this plan, plus any gap coverage",
            "Work from the Risk and Insurance handout. Two anchors: pick the plan whose damage responsibility you could pay in cash tomorrow, and assume your personal auto policy excludes peer-to-peer sharing until an agent tells you otherwise in writing.",
            "Your reasoning, and any gap coverage",
          ),
          t(
            "mitigation",
            "Risk mitigation measures",
            "Guest screening, vehicle security, documentation discipline, photo protocol.",
            "How you reduce the odds and the cost of a bad trip",
          ),
          t(
            "contingency",
            "Contingency planning",
            "Accidents, breakdowns, seasonal downturns, platform policy changes. What's the plan when revenue drops 30% for a quarter?",
            "The bad-quarter plan",
          ),
        ],
      },
    ],
  },
  {
    id: "financial",
    label: "Financial plan",
    shortLabel: "Financials",
    intro:
      "Build every number in this section with the Vehicle Profitability Calculator first, then transfer results here. The calculator's true-net line (gross revenue minus operating costs minus depreciation) is the only profit number this plan recognizes. A car that cash flows $400 a month while depreciating $450 a month is losing money, even though the bank account grows.",
    groups: [
      {
        heading: "Startup costs",
        fields: [
          m("suVehicle", "Vehicle acquisition (down payment or purchase)"),
          m("suRegistration", "Business registration"),
          m("suInsurance", "Insurance / gap coverage"),
          m("suMarketing", "Initial marketing"),
          m("suEquipment", "Equipment and supplies"),
          m("suSoftware", "Software and subscriptions"),
          m(
            "suReserve",
            "Cash reserve",
            "One damage responsibility per car, minimum.",
          ),
          m("suOther", "Other"),
        ],
      },
      {
        heading: "Monthly operating expenses",
        fields: [
          m("oxPayment", "Vehicle payment(s)"),
          m("oxInsurance", "Insurance / gap coverage"),
          m("oxMaintenance", "Maintenance reserve"),
          m("oxCleaning", "Cleaning supplies"),
          m("oxParking", "Parking / storage"),
          m("oxMarketing", "Marketing"),
          m("oxSoftware", "Software / subscriptions"),
          m("oxProfessional", "Professional services"),
          m("oxMisc", "Miscellaneous"),
        ],
      },
      {
        heading: "Revenue and depreciation",
        fields: [
          m(
            "finGross",
            "Projected monthly gross revenue",
            "From the calculator, at your honest utilization. Gross, not net.",
          ),
          m(
            "finDep",
            "Projected monthly depreciation",
            "e.g. the market value curve from the calculator. Not a bill, but real, and it shows up the day you sell.",
          ),
        ],
      },
      {
        fields: [
          t(
            "breakeven",
            "Break-even analysis",
            "When the business turns true-net positive, and the assumptions behind that date.",
            "The date, and what has to be true for it",
          ),
          t(
            "funding",
            "Funding requirements",
            "If seeking funding: how much, for what, on what terms.",
            "Leave blank if self-funded",
          ),
        ],
      },
    ],
  },
  {
    id: "milestones",
    label: "Milestones & growth",
    shortLabel: "Milestones",
    groups: [
      {
        fields: [
          t(
            "vision3",
            "Three-year vision",
            "Fleet size, true-net targets, market position.",
            "Where this is in three years",
          ),
          t(
            "vision5",
            "Five-year vision",
            "Longer-term direction, including exit options if relevant.",
            "Where this is in five years",
          ),
        ],
      },
      {
        heading: "Implementation timeline",
        note: "Use the 90-Day Launch Plan handout as your week-by-week execution layer; summarize the phases here.",
        fields: [
          t("tlPre", "Pre-launch (weeks 1 to 5)", undefined, "Key tasks"),
          t("tlLaunch", "Launch (weeks 6 to 8)", undefined, "Key tasks"),
          t("tlOptimize", "Optimize (weeks 9 to 12)", undefined, "Key tasks"),
          t("tlGrowth", "Growth (months 4 to 12)", undefined, "Key tasks"),
        ],
      },
    ],
  },
];

/** The earnings-plan choice lives in `fields.planId` and counts toward the
 *  Risk section's completion; it renders as a picker, not a text field. */
export const PLAN_CHOICE_FIELD_ID = "planId";

export interface PlanVehicle {
  id: string;
  details: string;
  price: string;
  financing: string;
  rate: string;
  gross: string;
  opex: string;
  dep: string;
  trueNet: string;
  scenario: string;
  rationale: string;
}

export interface PlanMilestone {
  id: string;
  milestone: string;
  trigger: string;
  action: string;
}

export interface PlanState {
  fields: Record<string, string>;
  vehicles: PlanVehicle[];
  milestones: PlanMilestone[];
}

/** Seeded with the car #2 readiness milestone from the handout. */
export const DEFAULT_STATE: PlanState = {
  fields: {},
  vehicles: [],
  milestones: [
    {
      id: "m-car-2",
      milestone: "Car #2 ready",
      trigger:
        "Three straight months of positive true net on car #1 AND one full damage responsibility held in cash per car",
      action: "Begin acquisition process for vehicle 2",
    },
  ],
};

export function blankVehicle(): PlanVehicle {
  return {
    id: crypto.randomUUID(),
    details: "",
    price: "",
    financing: "",
    rate: "",
    gross: "",
    opex: "",
    dep: "",
    trueNet: "",
    scenario: "",
    rationale: "",
  };
}

export function blankMilestone(): PlanMilestone {
  return { id: crypto.randomUUID(), milestone: "", trigger: "", action: "" };
}

/** Field ids counted for a section's completion meter. */
export function sectionFieldIds(section: PlanSection): string[] {
  const ids = section.groups.flatMap((g) => g.fields.map((f) => f.id));
  if (section.id === "risk") ids.unshift(PLAN_CHOICE_FIELD_ID);
  return ids;
}

export function num(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export const STARTUP_IDS = [
  "suVehicle",
  "suRegistration",
  "suInsurance",
  "suMarketing",
  "suEquipment",
  "suSoftware",
  "suReserve",
  "suOther",
];

export const OPEX_IDS = [
  "oxPayment",
  "oxInsurance",
  "oxMaintenance",
  "oxCleaning",
  "oxParking",
  "oxMarketing",
  "oxSoftware",
  "oxProfessional",
  "oxMisc",
];

export function startupTotal(fields: Record<string, string>): number {
  return STARTUP_IDS.reduce((sum, id) => sum + num(fields[id]), 0);
}

export function opexTotal(fields: Record<string, string>): number {
  return OPEX_IDS.reduce((sum, id) => sum + num(fields[id]), 0);
}

/** The plan's true-net line: gross minus operating expenses minus depreciation. */
export function trueNetMonthly(fields: Record<string, string>): number {
  return num(fields.finGross) - opexTotal(fields) - num(fields.finDep);
}
