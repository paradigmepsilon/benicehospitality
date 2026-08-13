"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Search, ShoppingCart } from "lucide-react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
  parseCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  COMMON_ITEMS,
  CSV_COLUMNS,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  isFilled,
  stockStatus,
  suggestProduct,
  suggestionsForInventory,
  unitsToReorder,
  type InventoryItem,
  type StockStatus,
  type SuggestedProduct,
} from "@/lib/resources/supply-inventory-tracker/config";
import ItemRow, { STATUS_TONE } from "./ItemRow";
import { InlineSuggestion, SuggestionStrip } from "./AffiliateSuggestion";

const SLUG = "supply-inventory-tracker";
const TOOL_NAME = getResourceTool(SLUG)!.name;

interface State {
  rows: InventoryItem[];
}

type Filter = "all" | "attention" | "ok";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `r${performance.now()}${Math.floor(performance.now() % 9973)}`;
  }
}

function blankItem(): InventoryItem {
  return {
    _id: newId(),
    category: "",
    location: "",
    item: "",
    par: "",
    unit: "",
    current: "",
    lastRestocked: "",
    supplier: "",
    notes: "",
  };
}

/**
 * Today in the operator's own timezone. `toISOString()` would stamp tomorrow's
 * date for anyone restocking after 8pm Eastern.
 */
function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const EMPTY_DRAFT = {
  item: "",
  category: "",
  location: "",
  unit: "",
  par: "",
  current: "",
};

/**
 * Supply Inventory Tracker.
 *
 * Built around the walkthrough, not the spreadsheet: a summary bar and restock
 * panel answer "what needs attention" without reading a single row, quick-add
 * takes one line per new supply, and the list groups by category with +/-
 * steppers so counting a closet is tapping, not typing. The full detail set
 * (par, supplier, location, notes) stays one click away per item.
 *
 * The saved row shape is unchanged from the previous DataTableTool version, so
 * existing account data and old CSV exports load without migration.
 */
export default function SupplyInventoryTool({
  canSync = false,
  products = [],
}: {
  /** access.canSync — a logged-in member who is not an admin previewing a tier. */
  canSync?: boolean;
  /** Published marketplace products, for restock suggestions. */
  products?: SuggestedProduct[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, setState, reset } = useResourceTool<State>(
    SLUG,
    { rows: [] },
    { sync: canSync },
  );

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [filter, setFilter] = useState<Filter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [query, setQuery] = useState("");

  // Legacy state from the table version could hold an all-blank seed row.
  const items = useMemo(() => state.rows.filter(isFilled), [state.rows]);

  const counts = useMemo(() => {
    let out = 0;
    let low = 0;
    let ok = 0;
    for (const i of items) {
      const s = stockStatus(i);
      if (s === "out") out++;
      else if (s === "low") low++;
      else if (s === "ok") ok++;
    }
    return { out, low, ok, total: items.length, attention: out + low };
  }, [items]);

  const attentionItems = useMemo(
    () =>
      items
        .filter((i) => {
          const s = stockStatus(i);
          return s === "out" || s === "low";
        })
        .sort((a, b) => unitsToReorder(b) - unitsToReorder(a)),
    [items],
  );

  /** Category order: our list first, then anything typed or imported. */
  const groups = useMemo(() => {
    const byCategory = new Map<string, InventoryItem[]>();
    for (const i of items) {
      const key = i.category.trim() || "Uncategorized";
      const list = byCategory.get(key);
      if (list) list.push(i);
      else byCategory.set(key, [i]);
    }
    const known = INVENTORY_CATEGORIES.filter((c) => byCategory.has(c));
    const custom = [...byCategory.keys()]
      .filter(
        (c) =>
          c !== "Uncategorized" &&
          !INVENTORY_CATEGORIES.includes(
            c as (typeof INVENTORY_CATEGORIES)[number],
          ),
      )
      .sort((a, b) => a.localeCompare(b));
    const order = [
      ...known,
      ...custom,
      ...(byCategory.has("Uncategorized") ? ["Uncategorized"] : []),
    ];
    return order.map((name) => ({ name, items: byCategory.get(name) ?? [] }));
  }, [items]);

  const matchesFilters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (item: InventoryItem, groupName: string) => {
      if (categoryFilter && groupName !== categoryFilter) return false;
      if (q && !`${item.item} ${item.supplier} ${item.location}`.toLowerCase().includes(q))
        return false;
      const s: StockStatus = stockStatus(item);
      if (filter === "attention") return s === "out" || s === "low";
      if (filter === "ok") return s === "ok";
      return true;
    };
  }, [filter, categoryFilter, query]);

  const visibleCount = useMemo(
    () =>
      groups.reduce(
        (n, g) => n + g.items.filter((i) => matchesFilters(i, g.name)).length,
        0,
      ),
    [groups, matchesFilters],
  );

  const strip = useMemo(
    () => suggestionsForInventory(items, products, 3),
    [items, products],
  );

  // ---- mutations ----------------------------------------------------------

  function addFromDraft() {
    const name = draft.item.trim();
    if (!name) return;
    const created: InventoryItem = {
      ...blankItem(),
      item: name,
      category: draft.category,
      location: draft.location.trim(),
      unit: draft.unit.trim(),
      par: draft.par.trim(),
      current: draft.current.trim(),
    };
    setState((p) => ({ rows: [...p.rows.filter(isFilled), created] }));
    // Keep category, location, and unit: the next supply is usually from the
    // same closet. Only the item-specific fields reset.
    setDraft((d) => ({ ...d, item: "", par: "", current: "" }));
  }

  function updateItem(
    id: string,
    field: keyof Omit<InventoryItem, "_id">,
    value: string,
  ) {
    setState((p) => ({
      rows: p.rows.map((r) => (r._id === id ? { ...r, [field]: value } : r)),
    }));
  }

  function deleteItem(id: string) {
    setState((p) => ({ rows: p.rows.filter((r) => r._id !== id) }));
  }

  /** Count back to par, dated today — the one-tap end of a reorder run. */
  function markRestocked(id: string) {
    setState((p) => ({
      rows: p.rows.map((r) =>
        r._id === id
          ? { ...r, current: r.par || r.current, lastRestocked: todayLocal() }
          : r,
      ),
    }));
  }

  // ---- CSV ----------------------------------------------------------------

  function exportCsv() {
    const header = CSV_COLUMNS.map((c) => c.label);
    const body = items.map((i) =>
      CSV_COLUMNS.map((c) => {
        if (c.key === "reorder") return String(unitsToReorder(i));
        if (c.key === "restock") {
          const s = stockStatus(i);
          if (s === "unset") return "";
          return s === "ok" ? "No" : "Yes";
        }
        return i[c.key] ?? "";
      }),
    );
    downloadCsv(
      "supply-inventory-tracker.csv",
      buildCsv(TOOL_NAME, [header, ...body]),
    );
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const matrix = parseCsv(String(reader.result || "")).filter((r) =>
        r.some((c) => c.trim() !== ""),
      );
      if (!matrix.length) return;

      // Accept both the current labels and the older/alternate headers.
      const headerFor = new Map<string, keyof Omit<InventoryItem, "_id">>();
      for (const c of CSV_COLUMNS) {
        if (c.computed) continue;
        const key = c.key as keyof Omit<InventoryItem, "_id">;
        headerFor.set(c.label.toLowerCase(), key);
        for (const a of c.aliases ?? []) headerFor.set(a.toLowerCase(), key);
      }

      let headerIdx = matrix.findIndex((r) =>
        r.some((cell) => headerFor.has(cell.toLowerCase().trim())),
      );
      if (headerIdx < 0) headerIdx = 0;
      const fieldForColumn = matrix[headerIdx].map((h) =>
        headerFor.get(h.toLowerCase().trim()),
      );

      const imported: InventoryItem[] = [];
      for (let i = headerIdx + 1; i < matrix.length; i++) {
        const row = blankItem();
        let any = false;
        matrix[i].forEach((val, idx) => {
          const field = fieldForColumn[idx];
          if (field && val.trim()) {
            row[field] = val.trim();
            any = true;
          }
        });
        if (any) imported.push(row);
      }
      if (imported.length) {
        setState((p) => ({ rows: [...p.rows.filter(isFilled), ...imported] }));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ---- render -------------------------------------------------------------

  const itemSuggestions = draft.category
    ? (COMMON_ITEMS[draft.category] ?? [])
    : [...new Set(Object.values(COMMON_ITEMS).flat())].sort();

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="font-sans text-sm text-charcoal/60">
          {counts.total} {counts.total === 1 ? "item" : "items"}
        </span>
      }
    >
      {/* Screen-only filtering. Print always emits the full inventory, so a
          printed sheet is never silently missing whatever the filter hid. */}
      <style>{`@media screen { .sit-hidden { display: none; } }`}</style>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryTile
          value={counts.total}
          label="Items tracked"
          tone="bg-white border-light-gray text-near-black"
        />
        <SummaryTile
          value={counts.attention}
          label="Need restocking"
          tone={
            counts.attention
              ? "bg-warm-gold/10 border-warm-gold/50 text-warm-gold-dark"
              : "bg-white border-light-gray text-charcoal/60"
          }
        />
        <SummaryTile
          value={counts.out}
          label="Out of stock"
          tone={
            counts.out
              ? "bg-terracotta/10 border-terracotta/40 text-terracotta"
              : "bg-white border-light-gray text-charcoal/60"
          }
        />
      </div>

      {/* Restock panel — the shopping list, with matched picks */}
      {attentionItems.length > 0 && (
        <section className="mb-6 border border-warm-gold/50 bg-warm-gold/5 rounded-lg overflow-hidden break-inside-avoid">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-warm-gold/40">
            <ShoppingCart
              className="w-4 h-4 text-warm-gold-dark shrink-0"
              aria-hidden
            />
            <h3 className="font-display text-base font-semibold text-near-black">
              Restock list
            </h3>
            <span className="font-sans text-xs text-charcoal/65">
              {attentionItems.length}{" "}
              {attentionItems.length === 1 ? "item" : "items"} below par
            </span>
          </div>
          <ul>
            {attentionItems.map((i) => {
              const pick = suggestProduct(i, products);
              const status = stockStatus(i);
              return (
                <li
                  key={i._id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 border-b border-warm-gold/25 last:border-b-0 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_7rem_20rem_auto] lg:gap-y-0"
                >
                  <span
                    aria-hidden
                    className={`w-2 h-2 rounded-full shrink-0 ${STATUS_TONE[status].dot}`}
                  />
                  <div className="min-w-0 flex-1 basis-44">
                    <p className="font-sans text-sm font-semibold text-near-black leading-tight truncate">
                      {i.item}
                    </p>
                    <p className="font-sans text-xs text-charcoal/60 leading-tight truncate mt-0.5">
                      {[i.category, i.location, `${i.current || 0} of ${i.par} on hand`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="font-sans text-sm font-semibold text-near-black whitespace-nowrap tabular-nums lg:text-right">
                    Buy {unitsToReorder(i)}{" "}
                    <span className="font-normal text-charcoal/70">
                      {i.unit}
                    </span>
                  </span>
                  {/* The pick column holds its width whether or not this item
                      matched a product, so the rows stay in line. */}
                  <div className="min-w-0 lg:justify-self-stretch">
                    {pick && <InlineSuggestion product={pick} />}
                  </div>
                  <button
                    type="button"
                    onClick={() => markRestocked(i._id)}
                    className="no-print font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark whitespace-nowrap px-2.5 py-1.5 rounded-md border border-primary-green/40 hover:bg-primary-green/5 transition-colors"
                  >
                    Mark restocked
                  </button>
                </li>
              );
            })}
          </ul>
          {attentionItems.some((i) => suggestProduct(i, products)) && (
            <p className="no-print px-4 py-2.5 font-sans text-[11px] text-charcoal/60 border-t border-warm-gold/25">
              Picks are products we use ourselves. We earn a commission on some
              of these links, at no cost to you.{" "}
              <Link
                href="/affiliate-disclosure"
                className="text-warm-gold-dark hover:underline"
              >
                How this works
              </Link>
              .
            </p>
          )}
        </section>
      )}

      {/* Quick add */}
      <section className="no-print bg-white border border-light-gray rounded-lg p-4 mb-6">
        <h3 className="font-sans text-[11px] font-semibold tracking-[0.16em] uppercase text-charcoal/60 mb-3">
          Add a supply
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addFromDraft();
          }}
          className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 items-end"
        >
          <div className="col-span-2 lg:col-span-3">
            <label className={quickLabelClass} htmlFor="sit-add-item">
              Item
            </label>
            <input
              id="sit-add-item"
              type="text"
              list="sit-items"
              value={draft.item}
              onChange={(e) => setDraft((d) => ({ ...d, item: e.target.value }))}
              placeholder="Toilet paper"
              className={quickFieldClass}
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <label className={quickLabelClass} htmlFor="sit-add-category">
              Category
            </label>
            <select
              id="sit-add-category"
              value={draft.category}
              onChange={(e) =>
                setDraft((d) => ({ ...d, category: e.target.value }))
              }
              className={quickFieldClass}
            >
              <option value="">Uncategorized</option>
              {INVENTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1 lg:col-span-2">
            <label className={quickLabelClass} htmlFor="sit-add-location">
              Location
            </label>
            <input
              id="sit-add-location"
              type="text"
              value={draft.location}
              onChange={(e) =>
                setDraft((d) => ({ ...d, location: e.target.value }))
              }
              placeholder="Hall closet"
              className={quickFieldClass}
            />
          </div>
          <div className="col-span-1 lg:col-span-1">
            <label className={quickLabelClass} htmlFor="sit-add-par">
              Par
            </label>
            <input
              id="sit-add-par"
              type="number"
              inputMode="numeric"
              min={0}
              value={draft.par}
              onChange={(e) => setDraft((d) => ({ ...d, par: e.target.value }))}
              className={quickFieldClass}
            />
          </div>
          <div className="col-span-1 lg:col-span-1">
            <label className={quickLabelClass} htmlFor="sit-add-current">
              On hand
            </label>
            <input
              id="sit-add-current"
              type="number"
              inputMode="numeric"
              min={0}
              value={draft.current}
              onChange={(e) =>
                setDraft((d) => ({ ...d, current: e.target.value }))
              }
              className={quickFieldClass}
            />
          </div>
          <div className="col-span-1 lg:col-span-1">
            <label className={quickLabelClass} htmlFor="sit-add-unit">
              Unit
            </label>
            <input
              id="sit-add-unit"
              type="text"
              list="sit-units"
              value={draft.unit}
              onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
              placeholder="Rolls"
              className={quickFieldClass}
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <button
              type="submit"
              disabled={!draft.item.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-primary-green hover:bg-primary-green-dark disabled:bg-light-gray disabled:text-charcoal/45 text-white font-medium text-sm px-4 py-2.5 rounded-md transition-colors min-h-11"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden />
              Add item
            </button>
          </div>
        </form>
        <p className="font-sans text-[11px] text-charcoal/55 mt-2.5">
          Par level is what you want on hand. Category, location, and unit stay
          filled in so you can add a whole closet in a row.
        </p>
      </section>

      {/* Filters */}
      {counts.total > 0 && (
        <div className="no-print flex flex-wrap items-center gap-2 mb-4">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label={`All (${counts.total})`}
          />
          <FilterChip
            active={filter === "attention"}
            onClick={() => setFilter("attention")}
            label={`Needs restocking (${counts.attention})`}
          />
          <FilterChip
            active={filter === "ok"}
            onClick={() => setFilter("ok")}
            label={`Stocked (${counts.ok})`}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="ml-auto border border-light-gray rounded-md bg-white px-2.5 py-2 font-sans text-xs text-near-black focus:border-primary-green focus:outline-none"
          >
            <option value="">All categories</option>
            {groups.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search
              className="w-3.5 h-3.5 text-charcoal/45 absolute left-2.5 top-1/2 -translate-y-1/2"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items"
              aria-label="Search items"
              className="border border-light-gray rounded-md bg-white pl-8 pr-2.5 py-2 font-sans text-xs text-near-black w-40 focus:border-primary-green focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Grouped list */}
      {counts.total === 0 ? (
        <div className="border border-dashed border-light-gray rounded-lg bg-off-white/50 px-6 py-10 text-center">
          <p className="font-display text-base font-semibold text-near-black mb-1.5">
            Nothing tracked yet.
          </p>
          <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto">
            Add your first supply above, or import a CSV. Start with the things
            that hurt when they run out: toilet paper, paper towels, laundry
            detergent, HVAC filters.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => {
            const shown = new Set(
              g.items.filter((i) => matchesFilters(i, g.name)).map((i) => i._id),
            );
            const groupAttention = g.items.filter((i) => {
              const s = stockStatus(i);
              return s === "out" || s === "low";
            }).length;
            return (
              <section
                key={g.name}
                className={`border border-light-gray rounded-lg bg-white overflow-hidden break-inside-avoid ${
                  shown.size ? "" : "sit-hidden"
                }`}
              >
                <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 bg-off-white border-b border-light-gray">
                  <h3 className="font-display text-sm font-semibold text-near-black">
                    {g.name}
                  </h3>
                  <span className="font-sans text-xs text-charcoal/55">
                    {g.items.length}
                  </span>
                  {groupAttention > 0 && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-warm-gold/20 text-warm-gold-dark px-2 py-0.5 font-sans text-[10px] font-semibold tracking-[0.12em] uppercase">
                      {groupAttention} low
                    </span>
                  )}
                </div>
                {g.items.map((i) => (
                  <div
                    key={i._id}
                    className={shown.has(i._id) ? "" : "sit-hidden"}
                  >
                    <ItemRow
                      item={i}
                      onChange={(field, value) =>
                        updateItem(i._id, field, value)
                      }
                      onDelete={() => deleteItem(i._id)}
                      onRestock={() => markRestocked(i._id)}
                    />
                  </div>
                ))}
              </section>
            );
          })}

          {visibleCount === 0 && (
            <p className="no-print font-sans text-sm text-charcoal/60 text-center py-6">
              No items match these filters.
            </p>
          )}
        </div>
      )}

      {/* Import */}
      <div className="no-print flex flex-wrap items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          Import CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onImportFile}
          className="hidden"
        />
        <span className="font-sans text-xs text-charcoal/55">
          Any CSV with these column names, including one exported from this
          tracker.
        </span>
      </div>

      <SuggestionStrip products={strip} />

      <datalist id="sit-units">
        {INVENTORY_UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <datalist id="sit-items">
        {itemSuggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </ResourceToolShell>
  );
}

const quickFieldClass =
  "w-full border border-light-gray rounded-md bg-white px-2.5 py-2 font-sans text-sm text-near-black focus:border-primary-green focus:outline-none min-h-11";
const quickLabelClass =
  "block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/55 mb-1";

function SummaryTile({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div className={`border rounded-lg px-3 py-3 text-center ${tone}`}>
      <p className="font-display text-2xl sm:text-3xl font-semibold leading-none tabular-nums">
        {value}
      </p>
      <p className="font-sans text-[11px] font-medium tracking-wide text-charcoal/65 mt-1.5">
        {label}
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-sans text-xs font-semibold px-3 py-2 rounded-full border transition-colors ${
        active
          ? "bg-near-black text-white border-near-black"
          : "bg-white text-charcoal border-light-gray hover:border-charcoal"
      }`}
    >
      {label}
    </button>
  );
}
