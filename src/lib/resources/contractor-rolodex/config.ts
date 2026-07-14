import { type DataColumn } from "@/components/resources/DataTableTool";

// Contractor Rolodex columns — digitized from Della's "Contractor Rolodex
// Template" handout.
export const CONTRACTOR_COLUMNS: DataColumn[] = [
  { key: "company", label: "Company Name", type: "text", width: "12rem" },
  { key: "specialty", label: "Specialty", type: "text", width: "10rem" },
  { key: "poc", label: "POC", type: "text", width: "9rem" },
  { key: "phone", label: "Phone Number", type: "text", width: "9rem" },
  { key: "email", label: "Email Address", type: "text", width: "12rem" },
  { key: "address", label: "Business Address", type: "text", width: "13rem" },
  { key: "availability", label: "Availability", type: "text", width: "10rem" },
  { key: "rating", label: "Rating", type: "select", options: ["1", "2", "3", "4", "5"], width: "6rem" },
  { key: "lastUsed", label: "Last Used", type: "date", width: "9rem" },
  { key: "lastCost", label: "Cost of Last Job", type: "text", width: "8rem" },
  { key: "lastJob", label: "Type of Last Job", type: "text", width: "12rem" },
  { key: "serviceArea", label: "Service Area", type: "text", width: "10rem" },
  { key: "notes", label: "Notes", type: "text", width: "12rem" },
];
