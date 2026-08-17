// 90-Day Launch Plan - data model. Digitized from the Car Rental Riches
// handout H06 (verified 2026-08-15): zero to first booking to steady state in
// twelve weeks. Each week is a section with its 3 to 6 tasks and the honest
// workload note from the handout. The car #2 readiness rule closes the plan.
//
// Every Turo platform figure traces to the CRR fact base
// (turo_platform_facts_2026.md, verified 2026-08-15).

export interface WeekItem {
  id: string;
  label: string;
}

export interface WeekSection {
  id: string;
  /** 1-12. */
  week: number;
  label: string;
  /** Phase heading from the handout, shown under the week label. */
  phase: string;
  /** The handout's honest workload note for this week. */
  note: string;
  items: WeekItem[];
}

const PHASE_1 = "Phase 1: Market analysis and underwriting";
const PHASE_2 = "Phase 2: Acquisition and setup";
const PHASE_3 = "Phase 3: Listing launch";
const PHASE_4 = "Phase 4: Operate, optimize, review";

/** Shared workload note for the weeks 7 to 12 operating phase. */
const PHASE_4_NOTE =
  "Expect 3 to 6 hours per week per car once the SOPs are worn in, spiking around back-to-back bookings and any claim.";

export const PLAN_WEEKS: WeekSection[] = [
  {
    id: "w1",
    week: 1,
    label: "Learn your market",
    phase: PHASE_1,
    note:
      "6 to 8 hours. Boring compared to car shopping. Do it anyway; this week decides whether the next eleven make money.",
    items: [
      { id: "w1a", label: "Work through the Module 3 market analysis method end to end" },
      {
        id: "w1b",
        label:
          "Pull market data with Turo's Carculator plus one market tool (Sharelytics, RentScout, or TurboPricing). No official ADR or utilization data exists; everything is an estimate, so triangulate",
      },
      {
        id: "w1c",
        label:
          "Study 10 to 15 active listings in your market: pricing, photos, reviews, calendars",
      },
      {
        id: "w1d",
        label:
          "Write down your market's saturation signals. Big-metro economy segments are consistently flagged as crowded; mid-size markets often out-earn them",
      },
      { id: "w1e", label: "Draft the Market Analysis section of your business plan (H03)" },
    ],
  },
  {
    id: "w2",
    week: 2,
    label: "Underwrite candidate vehicles",
    phase: PHASE_1,
    note:
      "5 to 7 hours plus phone calls. If no candidate survives the calculator, that is a result, not a failure. Widen the search; do not loosen the math.",
    items: [
      {
        id: "w2a",
        label:
          "Build a shortlist of 3 to 5 candidate vehicles that pass the eligibility gate: 12 years or newer, under 130,000 miles, clean title",
      },
      {
        id: "w2b",
        label:
          "Run every candidate through the CRR Vehicle Profitability Calculator using the Module 3 method. Kill any car that is not true-net positive under your conservative scenario",
      },
      {
        id: "w2c",
        label:
          "Pick your earnings plan using H05: could you pay the damage responsibility ($250, $1,500, or $2,750) in cash tomorrow?",
      },
      {
        id: "w2d",
        label:
          "Call your insurance agent. Ask whether your personal policy excludes peer-to-peer sharing (most do) and get gap coverage quotes (H05, section 4)",
      },
      {
        id: "w2e",
        label: "Set your cash reserve target: one full damage responsibility per car, minimum",
      },
    ],
  },
  {
    id: "w3",
    week: 3,
    label: "Money and structure",
    phase: PHASE_2,
    note:
      "This is where the project gets real and the outlays start. Expect paperwork friction. Build a week of slack into anything involving a lender.",
    items: [
      { id: "w3a", label: "Finalize financing or confirm your cash purchase budget" },
      {
        id: "w3b",
        label:
          "Set up your business structure and a separate bank account (H03; flag entity and tax questions to a professional)",
      },
      { id: "w3c", label: "Complete the Financial Plan section of H03 with Calculator outputs" },
      { id: "w3d", label: "Line up inspections for your top two candidates" },
      { id: "w3e", label: "Confirm where the car will live between trips" },
    ],
  },
  {
    id: "w4",
    week: 4,
    label: "Buy and baseline",
    phase: PHASE_2,
    note:
      "The heaviest week of the plan. Between shopping, inspection, purchase, and maintenance, expect 15+ hours and a few evenings gone.",
    items: [
      {
        id: "w4a",
        label:
          "Get a pre-purchase inspection on the winner. Walk away from a bad report; your shortlist exists so you can",
      },
      { id: "w4b", label: "Negotiate and complete the purchase" },
      {
        id: "w4c",
        label: "Do baseline maintenance: fluids, brakes, tires, anything the inspection flagged",
      },
      {
        id: "w4d",
        label: "Photograph the vehicle's condition thoroughly for your own records",
      },
      { id: "w4e", label: "Start your maintenance log (H04 template)" },
    ],
  },
  {
    id: "w5",
    week: 5,
    label: "Operational setup",
    phase: PHASE_2,
    note:
      "8 to 10 hours. The dry run feels silly. It also means your first real guest gets a host who has done this before.",
    items: [
      {
        id: "w5a",
        label: "Put insurance and gap coverage in force before the first trip, not after",
      },
      {
        id: "w5b",
        label:
          "Set up your handoff system: lockbox or in-person plan, spare key, GPS tracker if you are using one",
      },
      {
        id: "w5c",
        label: "Assemble your cleaning kit and run the cleaning SOP once for practice (H04)",
      },
      {
        id: "w5d",
        label:
          "Walk the check-in/check-out SOP once with a friend as the guest, including the full photo sequence with location services on (H04)",
      },
      {
        id: "w5e",
        label:
          "Do the listing photo shoot: clean car, good light, 20+ shots (H01 photography section)",
      },
      {
        id: "w5f",
        label: "Load the guest message templates into the Turo app's saved responses (H02)",
      },
    ],
  },
  {
    id: "w6",
    week: 6,
    label: "Publish",
    phase: PHASE_3,
    note:
      "4 to 6 hours. Then the uncomfortable part: waiting. New listings can take days to get traction. Do not panic-discount in the first 48 hours.",
    items: [
      { id: "w6a", label: "Run the full H01 Listing Optimization Checklist top to bottom" },
      {
        id: "w6b",
        label:
          "Set pricing from your week 1 research: base rate, weekend and seasonal adjustments, and deliberate long-trip discounts (Turo already applies baseline discounts on longer trips; know what stacks)",
      },
      {
        id: "w6c",
        label:
          "Make your non-refundable option decision, and if you are in a variable-share pilot market, price to attract advance bookings (28+ days out can pay up to 100% host share on More earnings)",
      },
      {
        id: "w6d",
        label:
          "Select your earnings plan in settings and confirm the calendar only shows availability you will honor. Host cancellations cost $25 to $50 plus an automated review and ranking penalties",
      },
      { id: "w6e", label: "Publish the listing" },
      {
        id: "w6f",
        label:
          "Consider a slightly-below-market launch rate for the first few bookings to build reviews, with a date set to raise it",
      },
    ],
  },
  {
    id: "w7",
    week: 7,
    label: "First bookings",
    phase: PHASE_4,
    note:
      "The first booking takes triple the time the tenth will. That is the SOPs getting worn in, and it is normal.",
    items: [
      {
        id: "w7a",
        label:
          "Respond to every inquiry fast; response speed is a lever you fully control",
      },
      {
        id: "w7b",
        label:
          "Run the check-in SOP on your first trip: photos within 24 hours before start, uploaded on time, metadata on (H04)",
      },
      { id: "w7c", label: "Send lifecycle messages from your H02 templates" },
      {
        id: "w7d",
        label:
          "Run the post-trip photo sequence within 24 hours of return, then the cleaning SOP",
      },
      { id: "w7e", label: "Log every expense and every hour spent" },
    ],
  },
  {
    id: "w8",
    week: 8,
    label: "Reps",
    phase: PHASE_4,
    note: PHASE_4_NOTE,
    items: [
      { id: "w8a", label: "Keep running trips through the SOPs without shortcuts" },
      { id: "w8b", label: "Ask for reviews with the H02 thank-you template" },
      {
        id: "w8c",
        label:
          "Note every guest question, and patch the listing or templates so it does not recur",
      },
      {
        id: "w8d",
        label: "Track calendar utilization against your Calculator assumptions",
      },
    ],
  },
  {
    id: "w9",
    week: 9,
    label: "First pricing review",
    phase: PHASE_4,
    note: PHASE_4_NOTE,
    items: [
      {
        id: "w9a",
        label:
          "Compare actual bookings, rates, and utilization against your Calculator scenario",
      },
      {
        id: "w9b",
        label:
          "Check your search position and views-to-booking conversion (H01 monthly review section)",
      },
      {
        id: "w9c",
        label:
          "Adjust base rate, discounts, or minimum trip length based on data, not mood",
      },
      { id: "w9d", label: "Re-check competitor pricing; markets move" },
    ],
  },
  {
    id: "w10",
    week: 10,
    label: "Optimize the listing",
    phase: PHASE_4,
    note: PHASE_4_NOTE,
    items: [
      {
        id: "w10a",
        label: "Reorder photos based on what is performing; refresh weak shots",
      },
      {
        id: "w10b",
        label: "Rewrite the description using real guest questions and review language",
      },
      {
        id: "w10c",
        label: "Review extras: add what guests asked for, cut what nobody uses",
      },
      {
        id: "w10d",
        label:
          "Tighten message automation with saved responses; stay on Turo-native tools plus external telematics (Turo has blocked some third-party fleet tools)",
      },
    ],
  },
  {
    id: "w11",
    week: 11,
    label: "First monthly close",
    phase: PHASE_4,
    note: PHASE_4_NOTE,
    items: [
      {
        id: "w11a",
        label:
          "Calculate month one true net: gross revenue minus operating costs minus depreciation",
      },
      {
        id: "w11b",
        label: "Reconcile every expense into your books, business account only",
      },
      {
        id: "w11c",
        label:
          "Check your maintenance standing: keep the five-star maintenance rating well above the 30% delisting threshold over your last 10 trips",
      },
      {
        id: "w11d",
        label: "Confirm your cash reserve still holds one full damage responsibility",
      },
      {
        id: "w11e",
        label:
          "Set aside your estimated tax portion; all rental income is taxable regardless of 1099-K thresholds. Flag specifics to a tax professional",
      },
    ],
  },
  {
    id: "w12",
    week: 12,
    label: "Steady state and the car #2 decision",
    phase: PHASE_4,
    note: PHASE_4_NOTE,
    items: [
      { id: "w12a", label: "Run the full H01 monthly review" },
      {
        id: "w12b",
        label:
          "Update your H03 business plan with 90 days of real numbers in place of projections",
      },
      {
        id: "w12c",
        label: "Write or update SOPs for anything you did three times this quarter (H04)",
      },
      {
        id: "w12d",
        label:
          "Set your recurring rhythm going forward: daily message checks, weekly pricing look, monthly true-net close and listing review",
      },
      {
        id: "w12e",
        label:
          "Score yourself against the car #2 readiness rule. No shame in not yet; the rule exists to keep car #1 from financing a mistake",
      },
    ],
  },
];

export const PLAN_ALL_ITEMS = PLAN_WEEKS.flatMap((w) => w.items);
export const PLAN_ITEM_COUNT = PLAN_ALL_ITEMS.length;

/** Two ground rules from the handout, shown before week one. */
export const GROUND_RULES = [
  "Do not buy a car before week 3. The most expensive mistake in this business is buying the car first and doing the math second.",
  "Every projection you write down is either gross or true net (after operating costs AND depreciation). Label it. Turo's $10,489 per year host average is gross; your plan runs on true net.",
];

/** The end-state rule: both must be true before car #2. */
export const CAR2_RULE = [
  {
    id: "r1",
    label:
      "Three straight months of positive true net on car #1. Not gross. Not positive if you ignore depreciation. True net, three months in a row.",
  },
  {
    id: "r2",
    label:
      "One full damage responsibility held in cash for every car you would then own. On Balanced, two cars means $3,000 sitting in reserve before you sign anything.",
  },
];

export const CAR2_TAGLINE =
  "One profitable month is weather. Three is a climate. Scale on climate.";
