"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import {
  INVENTORY_CATEGORIES,
  STATUS_LABEL,
  formatCurrency,
  hasPrice,
  lineTotal,
  stockStatus,
  unitsToReorder,
  type InventoryItem,
  type StockStatus,
} from "@/lib/resources/supply-inventory-tracker/config";

/** Status pill + dot colours. One palette used by the row and the summary bar. */
export const STATUS_TONE: Record<StockStatus, { pill: string; dot: string }> = {
  out: { pill: "bg-terracotta/10 text-terracotta", dot: "bg-terracotta" },
  low: {
    pill: "bg-warm-gold/20 text-warm-gold-dark",
    dot: "bg-warm-gold",
  },
  ok: {
    pill: "bg-primary-green/10 text-primary-green",
    dot: "bg-primary-green",
  },
  unset: { pill: "bg-light-gray text-charcoal/60", dot: "bg-charcoal/30" },
};

const detailFieldClass =
  "w-full border border-light-gray rounded-md bg-white px-2.5 py-2 font-sans text-sm text-near-black focus:border-primary-green focus:outline-none";
const detailLabelClass =
  "block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/55 mb-1";

/**
 * One supply in the grouped list. Collapsed, it shows the only two things that
 * matter mid-walkthrough: how it is doing, and the count — with steppers,
 * because tapping +/- beats selecting a number field on a phone. Everything
 * else (par, supplier, location, notes) lives behind Details.
 */
export default function ItemRow({
  item,
  onChange,
  onDelete,
  onRestock,
}: {
  item: InventoryItem;
  onChange: (field: keyof Omit<InventoryItem, "_id">, value: string) => void;
  onDelete: () => void;
  onRestock: () => void;
}) {
  const [open, setOpen] = useState(false);
  const status = stockStatus(item);
  const tone = STATUS_TONE[status];
  const reorder = unitsToReorder(item);
  const current = parseFloat(item.current);
  const hasCurrent = Number.isFinite(current);

  function step(by: number) {
    const next = Math.max(0, (hasCurrent ? current : 0) + by);
    onChange("current", String(next));
  }

  const priced = hasPrice(item);
  const subtotal = lineTotal(item);

  const meta = [
    item.location,
    item.par ? `Par ${item.par}` : "",
    item.supplier,
    priced ? `${formatCurrency(subtotal)} on hand` : "",
  ].filter(Boolean);

  return (
    <div className="border-b border-light-gray/70 last:border-b-0 break-inside-avoid">
      {/* Grid at sm+ so the status pills, counts, and units line up as columns
          down the list — the whole point of the redesign is scanning, and
          ragged rows defeat it. Wraps to flex on a phone. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-4 py-3 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_8.5rem_auto_3.5rem_auto_auto] sm:gap-y-0">
        <span
          aria-hidden
          className={`w-2 h-2 rounded-full shrink-0 ${tone.dot}`}
        />

        <div className="min-w-0 flex-1 basis-40">
          <p className="font-sans text-sm font-semibold text-near-black leading-tight truncate">
            {item.item || "Untitled item"}
          </p>
          {meta.length > 0 && (
            <p className="font-sans text-xs text-charcoal/60 leading-tight truncate mt-0.5">
              {meta.join(" · ")}
            </p>
          )}
        </div>

        <span
          className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap sm:w-full ${tone.pill}`}
        >
          {status === "low" || status === "out"
            ? `Buy ${reorder} ${item.unit || "more"}`.trim()
            : STATUS_LABEL[status]}
        </span>

        {/* Quantity stepper. The number input stays usable in print; the
            buttons do not, so they are excluded from the printed sheet. */}
        <div className="flex items-center rounded-md border border-light-gray overflow-hidden">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={`Decrease ${item.item || "item"} quantity`}
            className="no-print px-2.5 py-2 text-charcoal/60 hover:text-near-black hover:bg-off-white transition-colors min-h-11 sm:min-h-0"
          >
            <Minus className="w-3.5 h-3.5" aria-hidden />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={item.current}
            onChange={(e) => onChange("current", e.target.value)}
            aria-label={`${item.item || "Item"} quantity on hand`}
            className="w-14 text-center border-x border-light-gray bg-white px-1 py-2 font-sans text-sm font-semibold text-near-black tabular-nums focus:outline-none focus:bg-primary-green/5"
          />
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={`Increase ${item.item || "item"} quantity`}
            className="no-print px-2.5 py-2 text-charcoal/60 hover:text-near-black hover:bg-off-white transition-colors min-h-11 sm:min-h-0"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden />
          </button>
        </div>

        <span className="font-sans text-xs text-charcoal/55 w-14 shrink-0 truncate">
          {item.unit}
        </span>

        {/* Kept in the layout even when there is nothing to restock, so the
            Details control does not shuffle left on stocked rows. */}
        <button
          type="button"
          onClick={onRestock}
          disabled={reorder <= 0}
          title="Set the count back to par and stamp today's date"
          className={`no-print font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark whitespace-nowrap px-2 py-1.5 rounded-md hover:bg-primary-green/5 transition-colors ${
            reorder > 0 ? "" : "hidden sm:block sm:invisible"
          }`}
        >
          Restocked
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="no-print inline-flex items-center gap-1 font-sans text-xs text-charcoal/60 hover:text-near-black px-2 py-1.5 rounded-md hover:bg-off-white transition-colors"
        >
          Details
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div className="no-print px-3 sm:px-4 pb-4 pt-1 bg-off-white/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={detailLabelClass}>Item name</label>
              <input
                type="text"
                value={item.item}
                onChange={(e) => onChange("item", e.target.value)}
                className={detailFieldClass}
              />
            </div>
            <div>
              <label className={detailLabelClass}>Category</label>
              <select
                value={item.category}
                onChange={(e) => onChange("category", e.target.value)}
                className={detailFieldClass}
              >
                <option value="">Uncategorized</option>
                {INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {item.category &&
                  !INVENTORY_CATEGORIES.includes(
                    item.category as (typeof INVENTORY_CATEGORIES)[number],
                  ) && <option value={item.category}>{item.category}</option>}
              </select>
            </div>
            <div>
              <label className={detailLabelClass}>Par level</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={item.par}
                onChange={(e) => onChange("par", e.target.value)}
                className={detailFieldClass}
              />
            </div>
            <div>
              <label className={detailLabelClass}>Unit</label>
              <input
                type="text"
                list="sit-units"
                value={item.unit}
                onChange={(e) => onChange("unit", e.target.value)}
                placeholder="Rolls, Bottles…"
                className={detailFieldClass}
              />
            </div>
            <div>
              <label className={detailLabelClass}>Location</label>
              <input
                type="text"
                value={item.location}
                onChange={(e) => onChange("location", e.target.value)}
                placeholder="Hall closet, Unit 2…"
                className={detailFieldClass}
              />
            </div>
            <div>
              <label className={detailLabelClass}>Price per unit</label>
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-sm text-charcoal/45"
                >
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={item.pricePerUnit}
                  onChange={(e) => onChange("pricePerUnit", e.target.value)}
                  placeholder="0.00"
                  className={`${detailFieldClass} pl-6`}
                />
              </div>
            </div>
            <div>
              <label className={detailLabelClass}>Subtotal</label>
              <p
                className={`${detailFieldClass} flex items-center bg-off-white/70 text-near-black font-semibold tabular-nums`}
                title="Price per unit times quantity on hand"
              >
                {priced ? formatCurrency(subtotal) : "—"}
              </p>
            </div>
            <div>
              <label className={detailLabelClass}>Supplier / brand</label>
              <input
                type="text"
                value={item.supplier}
                onChange={(e) => onChange("supplier", e.target.value)}
                className={detailFieldClass}
              />
            </div>
            <div>
              <label className={detailLabelClass}>Last restocked</label>
              <input
                type="date"
                value={item.lastRestocked}
                onChange={(e) => onChange("lastRestocked", e.target.value)}
                className={detailFieldClass}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={detailLabelClass}>Notes</label>
              <input
                type="text"
                value={item.notes}
                onChange={(e) => onChange("notes", e.target.value)}
                className={detailFieldClass}
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-charcoal/55 hover:text-terracotta px-2 py-1.5 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden />
              Remove item
            </button>
          </div>
        </div>
      )}

      {/* Print-only detail line: the collapsed row hides par/supplier/notes on
          screen, but a printed inventory sheet needs them. */}
      <p className="print-only px-3 pb-2 font-sans text-xs text-charcoal/70">
        {[
          item.category,
          item.location,
          item.par ? `Par ${item.par}` : "",
          priced ? `${formatCurrency(subtotal)} on hand` : "",
          item.supplier,
          item.lastRestocked ? `Restocked ${item.lastRestocked}` : "",
          item.notes,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </div>
  );
}
