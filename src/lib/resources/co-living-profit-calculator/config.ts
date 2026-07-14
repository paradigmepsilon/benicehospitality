// Co-Living Profit Calculator (Income Statement / P&L) — data model.
//
// Digitized line-for-line from Della's "Income Statement" handout: a full
// twelve-month P&L for a co-living property. Revenue and expense lines are
// user-entered per month; the tool computes Total Revenue, Total Operating
// Expenses, NOI, Total Other Expenses, and Net Profit for each month plus an
// annual column.
//
// Note: the source sheet lists a "CapEx Reserve" line in BOTH Operating and
// Other expenses; both are preserved here to mirror the handout exactly. Enter
// the reserve in whichever section you treat it as — leave the other at zero to
// avoid double-counting.

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export interface PnlLine {
  id: string;
  label: string;
  hint?: string;
}

export interface PnlSection {
  id: "revenue" | "opex" | "other";
  label: string;
  lines: PnlLine[];
}

export const REVENUE_LINES: PnlLine[] = [
  { id: "rev_rental", label: "Rental Income", hint: "Total rent from all rooms" },
  { id: "rev_additional", label: "Additional Income", hint: "Parking, pet, laundry fees" },
  { id: "rev_misc", label: "Miscellaneous Income", hint: "Vending, events, etc." },
];

export const OPEX_LINES: PnlLine[] = [
  { id: "op_mortgage", label: "Mortgage / Rent Payment", hint: "Loan + interest, or rent" },
  { id: "op_electricity", label: "Electricity" },
  { id: "op_water", label: "Water / Sewer" },
  { id: "op_gas", label: "Gas" },
  { id: "op_internet", label: "Internet" },
  { id: "op_streaming", label: "Streaming Services" },
  { id: "op_maintenance", label: "Maintenance & Repairs" },
  { id: "op_cleaning", label: "Cleaning Services" },
  { id: "op_trash", label: "Trash Removal" },
  { id: "op_pest", label: "Pest Control" },
  { id: "op_lawn", label: "Lawncare / Landscaping" },
  { id: "op_supplies", label: "Supplies" },
  { id: "op_propins", label: "Property Insurance" },
  { id: "op_proptax", label: "Property Taxes" },
  { id: "op_marketing", label: "Marketing & Advertising" },
  { id: "op_onboarding", label: "Tenant Onboarding Costs" },
  { id: "op_software", label: "Software Subscriptions" },
  { id: "op_bankfees", label: "Bank Fees & Payment Processing" },
  { id: "op_legal", label: "Legal & Admin Costs" },
  { id: "op_biztax", label: "Business Taxes" },
  { id: "op_bizins", label: "Business Insurance" },
  { id: "op_capex", label: "CapEx Reserve", hint: "Furniture, HVAC, etc." },
  { id: "op_pmfees", label: "Property Management Fees" },
  { id: "op_misc", label: "Miscellaneous Expenses" },
];

export const OTHER_LINES: PnlLine[] = [
  { id: "ot_depreciation", label: "Depreciation", hint: "Optional, non-cash" },
  { id: "ot_loaninterest", label: "Loan Interest", hint: "If financed" },
  { id: "ot_capex", label: "CapEx Reserve", hint: "If tracked here instead" },
];

export const PNL_SECTIONS: PnlSection[] = [
  { id: "revenue", label: "Revenue", lines: REVENUE_LINES },
  { id: "opex", label: "Operating Expenses", lines: OPEX_LINES },
  { id: "other", label: "Other Expenses", lines: OTHER_LINES },
];

export const PNL_ALL_LINES = PNL_SECTIONS.flatMap((s) => s.lines);
