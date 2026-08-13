import { type DataColumn } from "@/components/resources/DataTableTool";

// Tenant Tracker & Rent Collection Log columns. One row per tenant: who is in
// each room, their lease window, what they pay, the deposit held, and where this
// month's rent stands. "Balance" is computed from Rate minus Paid.
export const TENANT_COLUMNS: DataColumn[] = [
  { key: "room", label: "Room", type: "text", width: "8rem" },
  { key: "tenant", label: "Tenant", type: "text", width: "11rem" },
  { key: "moveIn", label: "Move-In", type: "date", width: "9rem" },
  { key: "moveOut", label: "Move-Out", type: "date", width: "9rem" },
  {
    key: "status",
    label: "Status",
    type: "select",
    width: "9rem",
    options: ["Upcoming", "Active", "On Notice", "Past"],
  },
  { key: "rate", label: "Monthly Rate", type: "number", width: "8rem" },
  { key: "deposit", label: "Deposit Held", type: "number", width: "8rem" },
  {
    key: "rentStatus",
    label: "This Month",
    type: "select",
    width: "8rem",
    options: ["Paid", "Due", "Partial", "Late"],
  },
  { key: "paid", label: "Amount Paid", type: "number", width: "8rem" },
  {
    key: "balance",
    label: "Balance",
    width: "7rem",
    compute: { op: "diffCurrency", a: "rate", b: "paid" },
  },
  { key: "notes", label: "Notes", type: "text", width: "12rem", wide: true },
];
