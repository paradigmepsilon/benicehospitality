/**
 * One shared example scenario used everywhere the product shows "what right
 * looks like": the same fictional claim (a 2022 Camry, trip #4821, an $8,800
 * shop estimate against a $5,700 initial appraisal) runs through every
 * template and worksheet, so example mode reads as one coherent claim being
 * worked correctly, not random filler. Matches the landing page's
 * illustrative numbers. Entirely fictional; never presented as a result.
 */

export const EXAMPLE_BANNER =
  "Example: a completed version using a fictional claim. Your own entries are saved and untouched.";

/** Keyword → sample value, checked in order against the [TOKEN] text. */
const TOKEN_EXAMPLES: Array<[RegExp, string]> = [
  [/yes\s*\/\s*no/i, "No"],
  [/count|how many/i, "19"],
  [/guest/i, "Jordan M."],
  [/trip/i, "#4821"],
  [/claim\s*(number|id|#)?/i, "CLM-208977"],
  [/vehicle|car|make|model/i, "2022 Toyota Camry, plate ABC1234"],
  [/plate|vin/i, "ABC1234"],
  [/shop\s*(name)?|body\s*shop/i, "Precision Auto Body, Douglasville GA"],
  [/estimate/i, "$8,800 (written, itemized)"],
  [/appraisal|valuation/i, "$5,700"],
  [/gap|difference|shortfall/i, "$3,100"],
  [/deductible/i, "$0"],
  [/amount|total|\$|cost|price/i, "$3,100"],
  [/deadline|due/i, "July 17, 2026"],
  [/date|day/i, "July 6, 2026"],
  [/time/i, "4:35 PM"],
  [/damage|issue|item s?/i, "rear bumper crease and a parking sensor that no longer reads"],
  [/photo|image/i, "48 timestamped photos, all four corners plus close-ups"],
  [/email/i, "alex@example.com"],
  [/phone/i, "(770) 555-0138"],
  [/name|host|owner/i, "Alex H."],
  [/\brep\b|associate|agent|adjuster/i, "Sam, claims associate"],
  [/link|url/i, "the claim thread"],
  [/city|location|address/i, "Douglasville, GA"],
  [/days?/i, "23"],
  [/hours?/i, "9"],
  [/script|number/i, "3"],
];

/** Sensible sample value for a [TOKEN], keyed off the token's own words. */
export function exampleFor(token: string): string {
  for (const [re, v] of TOKEN_EXAMPLES) {
    if (re.test(token)) return v;
  }
  return token.toLowerCase();
}

/* ---- Interactive-tool example datasets (all the same fictional claim) ---- */

/** ValuationWorksheet rows. Shop sums to $8,800, appraisal to $5,700. */
export const EXAMPLE_VALUATION_ROWS = [
  { item: "Rear bumper cover, replace + paint", shop: "1650", appraisal: "1180" },
  { item: "Parking sensors (2) + recalibration", shop: "940", appraisal: "0" },
  { item: "Quarter panel repair + blend", shop: "1730", appraisal: "1260" },
  { item: "Paint and materials", shop: "1180", appraisal: "940" },
  { item: "Body labor (11.5 hrs vs 8.0 allowed)", shop: "1955", appraisal: "1360" },
  { item: "Diagnostic scan, pre and post repair", shop: "390", appraisal: "190" },
  { item: "Hazmat, shop supplies, corrosion protect", shop: "955", appraisal: "770" },
];

/** CommsLog entries, newest first, one overdue promise on display. */
export const EXAMPLE_COMMS_ENTRIES = [
  {
    date: "2026-07-06",
    who: "Sam, claims associate",
    channel: "Claim thread",
    summary: "Confirmed supplement received; said valuation review takes 5 business days.",
    promised: "Supplement decision",
    promisedBy: "2026-07-01",
    nextFollowUp: "2026-07-11",
    status: "open" as const,
  },
  {
    date: "2026-06-28",
    who: "Priya, senior adjuster",
    channel: "Phone",
    summary: "Walked through the three largest line gaps; asked for the shop's labor-rate sheet.",
    promised: "I send labor-rate sheet",
    promisedBy: "2026-06-29",
    nextFollowUp: "2026-07-03",
    status: "done" as const,
  },
  {
    date: "2026-06-24",
    who: "Auto-reply",
    channel: "Email",
    summary: "Claim CLM-208977 acknowledged; appraisal of $5,700 attached, no line-item detail.",
    promised: "",
    promisedBy: "",
    nextFollowUp: "2026-06-27",
    status: "done" as const,
  },
];

/** DowntimeTracker: summary + stage log. */
export const EXAMPLE_DOWNTIME = {
  summary: { downDate: "2026-06-08", backDate: "2026-07-01", perDay: "62" },
  log: [
    { date: "2026-06-26", stage: "At the shop", note: "Repair started once supplement approved" },
    { date: "2026-06-17", stage: "Waiting on parts", note: "Bumper cover on backorder" },
    { date: "2026-06-10", stage: "Waiting on appraisal", note: "Photos submitted day one" },
  ],
};

/** EconomicsWorksheet inputs. */
export const EXAMPLE_ECONOMICS = {
  shop: "8800",
  appraisal: "5700",
  deductible: "0",
  perDay: "62",
  idleDays: "23",
  adminHours: "9",
  hourValue: "50",
};

// A believable single-month snapshot for a ~6-car fleet: 128 trips, 7 claims,
// most filed in time, a couple needing supplements, one repeat-incident car.
export const EXAMPLE_FLEET_KPI = {
  trips: "128",
  claims: "7",
  filedInWindow: "6",
  supplements: "3",
  gapTotal: "4200",
  recovered: "9100",
  absorbed: "1600",
  idleDaysTotal: "41",
  closedClaims: "5",
  closeDaysTotal: "96",
  responseDays: "0.6",
  repeatFailures: "1",
};

/** FleetTracker claims: one flagged (no next action), one mid-flow, one closed. */
export const EXAMPLE_FLEET_CLAIMS = [
  {
    vehicle: "2022 Camry ABC1234",
    trip: "#4821",
    discovered: "2026-06-08",
    stage: "Supplement submitted",
    appraisal: "5700",
    shopEst: "8800",
    idleDays: "23",
    owner: "Alex",
    lastContact: "2026-07-06",
    nextAction: "Script 5 if no decision by Fri",
    nextActionDate: "2026-07-11",
    status: "open" as const,
  },
  {
    vehicle: "2021 Altima XYZ7789",
    trip: "#4906",
    discovered: "2026-07-02",
    stage: "Awaiting appraisal",
    appraisal: "",
    shopEst: "2350",
    idleDays: "8",
    owner: "",
    lastContact: "2026-07-03",
    nextAction: "",
    nextActionDate: "",
    status: "open" as const,
  },
  {
    vehicle: "2023 Model 3 TES9921",
    trip: "#4655",
    discovered: "2026-05-19",
    stage: "Closed",
    appraisal: "1980",
    shopEst: "1980",
    idleDays: "6",
    owner: "Dee",
    lastContact: "2026-06-02",
    nextAction: "",
    nextActionDate: "",
    status: "closed" as const,
  },
];
