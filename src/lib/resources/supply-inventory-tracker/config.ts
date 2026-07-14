import { type DataColumn } from "@/components/resources/DataTableTool";

function toNum(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : NaN;
}

// Supply Inventory Tracker columns — digitized from Della's "Product/Supply
// Inventory Tracker" handout. "Units to Reorder" and "Restock Needed?" are
// computed from Par Level vs. Current Quantity.
export const INVENTORY_COLUMNS: DataColumn[] = [
  { key: "category", label: "Category", type: "text", width: "10rem" },
  { key: "location", label: "Location", type: "text", width: "10rem" },
  { key: "item", label: "Item Name", type: "text", width: "11rem" },
  { key: "par", label: "Par Level", type: "number", width: "6rem" },
  { key: "unit", label: "Type", type: "text", width: "7rem" },
  { key: "current", label: "Current Quantity", type: "number", width: "7rem" },
  {
    key: "reorder",
    label: "Units to Reorder",
    width: "7rem",
    compute: (r) => {
      const par = toNum(r.par);
      const cur = toNum(r.current);
      if (Number.isNaN(par) || Number.isNaN(cur)) return "";
      const diff = Math.max(0, par - cur);
      return String(diff);
    },
  },
  {
    key: "restock",
    label: "Restock Needed?",
    width: "8rem",
    compute: (r) => {
      const par = toNum(r.par);
      const cur = toNum(r.current);
      if (Number.isNaN(par) || Number.isNaN(cur)) return "";
      return cur < par ? "Yes" : "No";
    },
  },
  { key: "lastRestocked", label: "Last Restocked", type: "date", width: "9rem" },
  { key: "supplier", label: "Supplier / Brand", type: "text", width: "11rem" },
  { key: "notes", label: "Notes", type: "text", width: "11rem" },
];
