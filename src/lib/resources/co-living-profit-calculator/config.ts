// Co-Living Profit Calculator (Income Statement / P&L) — data model.
//
// Digitized line-for-line from Della's "Income Statement" handout: a full
// twelve-month P&L for a co-living property. Revenue and expense lines are
// user-entered per month; the tool computes Total Revenue, Total Operating
// Expenses, NOI, Total Other Expenses, and Net Profit for each month plus an
// annual column.
//
// GROUPS ARE THE SOURCE OF TRUTH. The tool leads with one screen per month, and
// twenty-four operating lines in a flat list is more than a screen can hold
// legibly — so the lines are organised into named groups that each carry a
// running subtotal. `REVENUE_LINES` / `OPEX_LINES` / `OTHER_LINES` are derived
// from `PNL_GROUPS` below rather than declared alongside it, so a line can never
// appear in a group but be missing from its section (or vice versa).
//
// Note: the source sheet lists a "CapEx Reserve" line in BOTH Operating and
// Other expenses; both are preserved here to mirror the handout exactly. On a
// scrolling spreadsheet those two rows sat far apart, but on a single month
// screen the identical label appeared twice and read as a bug — hence the
// "below the line" qualifier on the Other one. Enter the reserve in whichever
// section you treat it as; leave the other at zero to avoid double-counting.

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type PnlSectionId = "revenue" | "opex" | "other";

export interface PnlLine {
  id: string;
  label: string;
  hint?: string;
}

export interface PnlGroup {
  id: string;
  label: string;
  /** Which P&L section this group's lines roll up into. */
  section: PnlSectionId;
  /** One line of orientation, shown under the group heading on a month screen. */
  hint?: string;
  lines: PnlLine[];
}

export interface PnlSection {
  id: PnlSectionId;
  label: string;
  lines: PnlLine[];
}

export const PNL_GROUPS: PnlGroup[] = [
  {
    id: "revenue",
    label: "Revenue",
    section: "revenue",
    hint: "Everything the property collected this month.",
    lines: [
      { id: "rev_rental", label: "Rental Income", hint: "Total rent from all rooms" },
      { id: "rev_additional", label: "Additional Income", hint: "Parking, pet, laundry fees" },
      { id: "rev_misc", label: "Miscellaneous Income", hint: "Vending, events, etc." },
    ],
  },
  {
    id: "housing",
    label: "Housing & Utilities",
    section: "opex",
    hint: "The bills that arrive whether the rooms are full or not.",
    lines: [
      { id: "op_mortgage", label: "Mortgage / Rent Payment", hint: "Loan + interest, or rent" },
      { id: "op_electricity", label: "Electricity" },
      { id: "op_water", label: "Water / Sewer" },
      { id: "op_gas", label: "Gas" },
      { id: "op_internet", label: "Internet" },
      { id: "op_streaming", label: "Streaming Services" },
      { id: "op_trash", label: "Trash Removal" },
    ],
  },
  {
    id: "care",
    label: "Property Care",
    section: "opex",
    hint: "Keeping the house standing and the rooms turned.",
    lines: [
      { id: "op_maintenance", label: "Maintenance & Repairs" },
      { id: "op_cleaning", label: "Cleaning Services" },
      { id: "op_pest", label: "Pest Control" },
      { id: "op_lawn", label: "Lawncare / Landscaping" },
      { id: "op_supplies", label: "Supplies" },
    ],
  },
  {
    id: "insurance",
    label: "Insurance & Taxes",
    section: "opex",
    hint: "Often billed once or twice a year. Put it in the month it's paid.",
    lines: [
      { id: "op_propins", label: "Property Insurance" },
      { id: "op_proptax", label: "Property Taxes" },
      { id: "op_biztax", label: "Business Taxes" },
      { id: "op_bizins", label: "Business Insurance" },
    ],
  },
  {
    id: "admin",
    label: "Admin & Growth",
    section: "opex",
    hint: "The cost of running it like a business rather than a hobby.",
    lines: [
      { id: "op_marketing", label: "Marketing & Advertising" },
      { id: "op_onboarding", label: "Tenant Onboarding Costs" },
      { id: "op_software", label: "Software Subscriptions" },
      { id: "op_bankfees", label: "Bank Fees & Payment Processing" },
      { id: "op_legal", label: "Legal & Admin Costs" },
      { id: "op_pmfees", label: "Property Management Fees" },
      { id: "op_misc", label: "Miscellaneous Expenses" },
    ],
  },
  {
    id: "reserves",
    label: "Reserves",
    section: "opex",
    hint: "Money set aside now for the thing that breaks later.",
    lines: [
      { id: "op_capex", label: "CapEx Reserve", hint: "Furniture, HVAC, etc." },
    ],
  },
  {
    id: "other",
    label: "Other Expenses",
    section: "other",
    hint: "Below the operating line. These sit under NOI, not inside it.",
    lines: [
      { id: "ot_depreciation", label: "Depreciation", hint: "Optional, non-cash" },
      { id: "ot_loaninterest", label: "Loan Interest", hint: "If financed" },
      {
        id: "ot_capex",
        label: "CapEx Reserve — below the line",
        hint: "Only if you track the reserve here instead of under Reserves above. Using both double-counts it.",
      },
    ],
  },
];

function linesForSection(section: PnlSectionId): PnlLine[] {
  return PNL_GROUPS.filter((g) => g.section === section).flatMap((g) => g.lines);
}

export const REVENUE_LINES: PnlLine[] = linesForSection("revenue");
export const OPEX_LINES: PnlLine[] = linesForSection("opex");
export const OTHER_LINES: PnlLine[] = linesForSection("other");

export const PNL_SECTIONS: PnlSection[] = [
  { id: "revenue", label: "Revenue", lines: REVENUE_LINES },
  { id: "opex", label: "Operating Expenses", lines: OPEX_LINES },
  { id: "other", label: "Other Expenses", lines: OTHER_LINES },
];

export const PNL_ALL_LINES = PNL_SECTIONS.flatMap((s) => s.lines);
