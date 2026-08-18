import {
  type DataColumn,
  type SummarySpec,
} from "@/components/resources/DataTableTool";

// Maintenance Tracker columns — digitized from Della's "Maintenance Tracker
// Template" handout.
export const MAINTENANCE_COLUMNS: DataColumn[] = [
  { key: "date", label: "Date of Report", type: "date", width: "9rem" },
  { key: "issue", label: "Issue Description", type: "text", width: "14rem", wide: true },
  { key: "location", label: "Location", type: "text", width: "9rem" },
  { key: "reportedBy", label: "Reported By", type: "text", width: "9rem" },
  { key: "cause", label: "Cause (if known)", type: "text", width: "11rem" },
  { key: "priority", label: "Priority Level", type: "select", options: ["Low", "Medium", "High"], width: "8rem" },
  { key: "action", label: "Action Taken", type: "text", width: "13rem", wide: true },
  { key: "assignedTo", label: "Assigned To", type: "text", width: "10rem" },
  { key: "resolvedDate", label: "Resolved Date", type: "date", width: "9rem" },
  { key: "resolutionTime", label: "Resolution Time (days)", type: "number", width: "7rem" },
  { key: "cost", label: "Cost of Repair", type: "text", width: "8rem" },
  { key: "paymentStatus", label: "Payment Status", type: "select", options: ["Paid", "Pending"], width: "8rem" },
  { key: "reoccurrence", label: "Reoccurrence", type: "select", options: ["First time", "Reoccurring"], width: "9rem" },
  { key: "preventative", label: "Preventative Measures", type: "text", width: "13rem", wide: true },
  { key: "notes", label: "Notes", type: "text", width: "12rem", wide: true },
];

/**
 * What a collapsed issue says about itself. Fifteen fields is a lot to scroll
 * past when you are looking for the one leak you logged in June, so a folded
 * card leads with the issue, flags its priority, and gives you where and who.
 *
 * Every value here is one the operator already typed. Nothing extra is stored.
 */
export const MAINTENANCE_SUMMARY: SummarySpec = {
  title: "issue",
  fallbackTitle: "New issue",
  badge: "priority",
  // High is the one that should catch an eye across a long list; Low is not a
  // problem worth colouring.
  badgeTone: { High: "bad", Medium: "warn", Low: "neutral" },
  meta: ["location", "date", "assignedTo"],
};
