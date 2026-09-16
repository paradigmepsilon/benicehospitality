"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import SectionLabel from "@/components/ui/SectionLabel";
import {
  groupByCategory,
  type CategoryGroup,
  type MarketplaceCategory,
} from "@/lib/marketplace-categories";
import { compareByPrice } from "@/lib/marketplace-price";
import ProductCard, { type PlateSpec } from "./ProductCard";
import ProductModal from "./ProductModal";
import {
  type MarketplaceTab,
  type MarketplaceTabId,
  type Product,
} from "./types";

type SortOption = "featured" | "price-asc" | "price-desc" | "az" | "za";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  az: "A to Z",
  za: "Z to A",
};

/**
 * Featured order: our own books, then badges in this order, then everything
 * else. Reorder this list to change what leads the page. Ties keep room order
 * and admin position because Array.prototype.sort is stable.
 */
const FEATURED_BADGE_ORDER: readonly string[] = [
  "Editor's Pick",
  "Della Uses This",
  "Best Value",
  "New",
];

function featuredRank(p: Product): number {
  if (p.firstParty) return -1;
  const i = p.badge ? FEATURED_BADGE_ORDER.indexOf(p.badge) : -1;
  return i === -1 ? FEATURED_BADGE_ORDER.length : i;
}

interface MarketplaceCatalogProps {
  tabs: MarketplaceTab[];
}

function isTabId(
  value: string | null,
  tabs: MarketplaceTab[],
): value is MarketplaceTabId {
  return value !== null && tabs.some((t) => t.id === value);
}

/** Tinted fallback for a room tile with no photograph yet. */
function RoomPlate({ category }: { category: MarketplaceCategory | null }) {
  const tint = category?.tint ?? "#4B5563";
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{ backgroundColor: `color-mix(in srgb, ${tint} 14%, #FAF8F3)` }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, ${tint}1f 0px, ${tint}1f 1px, transparent 1px, transparent 13px)`,
        }}
      />
    </div>
  );
}

/**
 * The hub. IKEA's /rooms/ is thirteen tiles and zero products; Schoolhouse
 * gives each category tile a sentence of intro copy rather than a bare label.
 * Both are doing the same thing: turning a long catalog into a small number of
 * decisions. A tile narrows the grid to that one room rather than navigating,
 * so the page keeps one URL and the reader keeps their search and sort.
 */
function RoomHub({
  groups,
  heading,
  onSelect,
}: {
  groups: CategoryGroup<Product>[];
  heading: string;
  onSelect: (anchor: string) => void;
}) {
  if (groups.length < 2) return null;
  return (
    <div className="mb-10 md:mb-12">
      <SectionLabel>{heading}</SectionLabel>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {groups.map((g) => (
          <button
            key={g.anchor}
            type="button"
            onClick={() => onSelect(g.anchor)}
            className="group relative flex flex-col overflow-hidden rounded-card border border-warm-gold/25 bg-white text-left transition-all duration-200 hover:border-warm-gold hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-gold"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-cream">
              {g.category?.image ? (
                <Image
                  src={g.category.image.src}
                  // Decorative here: the room name below labels the button.
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{ filter: "saturate(0.9) contrast(1.05)" }}
                />
              ) : (
                <RoomPlate category={g.category} />
              )}
              <span
                className="absolute bottom-2 right-2 inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-near-black/80 backdrop-blur-sm text-white font-sans text-[11px] font-semibold"
                aria-hidden
              >
                {g.items.length}
              </span>
            </div>
            <div className="flex flex-col flex-1 p-4">
              <h3 className="font-display text-base md:text-lg font-semibold text-deep-teal leading-tight">
                {g.label}
                <span className="sr-only">, {g.items.length} products</span>
              </h3>
              {g.category?.blurb && (
                <p className="mt-1.5 font-sans text-xs text-charcoal/70 leading-relaxed">
                  {g.category.blurb}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const SELECT_CHEVRON = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 20 20' fill='none' stroke='%23807868' stroke-width='2'%3E%3Cpath d='M5 8l5 5 5-5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundPosition: "right 0.65rem center",
  backgroundSize: "0.75rem",
} as const;

function pillClass(active: boolean) {
  return [
    "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors",
    active
      ? "border-warm-gold bg-warm-gold text-near-black"
      : "border-warm-gold/40 bg-white text-charcoal/75 hover:border-warm-gold hover:text-deep-teal",
  ].join(" ");
}

function CatalogInner({ tabs }: MarketplaceCatalogProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultId = isTabId(tabParam, tabs) ? tabParam : tabs[0]?.id;

  const [active, setActive] = useState<MarketplaceTabId | undefined>(defaultId);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  // Selected room anchors (e.g. "shop-bedroom"). Empty means every room.
  const [rooms, setRooms] = useState<ReadonlySet<string>>(() => new Set());
  const barRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [openItem, setOpenItem] = useState<{ p: Product; plate: PlateSpec } | null>(
    null,
  );
  const triggerRef = useRef<HTMLElement | null>(null);

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  // The search, before the room filter. The room pills are built from this
  // list so their counts track the search, and choosing a room never makes the
  // other pills disappear.
  const filtered = useMemo(() => {
    if (!activeTab) return [];
    const q = query.trim().toLowerCase();
    return activeTab.products.filter((p) => {
      if (!q) return true;
      const hay = [p.name, p.body, ...(p.tags ?? []), ...p.bullets]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [activeTab, query]);

  const groups = useMemo(
    () => (activeTab ? groupByCategory(filtered, activeTab.id) : []),
    [filtered, activeTab],
  );

  // The hub reads the unfiltered tab so tiles don't vanish mid-search.
  const hubGroups = useMemo(
    () => (activeTab ? groupByCategory(activeTab.products, activeTab.id) : []),
    [activeTab],
  );

  // Flat list in room order (or A–Z / Z–A), each product carrying the plate
  // spec of the room it came from.
  const visible = useMemo(() => {
    let list = groups
      .filter((g) => rooms.size === 0 || rooms.has(g.anchor))
      .flatMap((g) =>
        g.items.map((p, i) => ({
          p,
          plate: {
            tint: g.category?.tint ?? "#4B5563",
            label: g.label,
            index: i + 1,
          },
        })),
      );
    if (sort === "featured") {
      list = [...list].sort((a, b) => featuredRank(a.p) - featuredRank(b.p));
    } else if (sort === "price-asc" || sort === "price-desc") {
      const dir = sort === "price-asc" ? "asc" : "desc";
      list = [...list].sort((a, b) =>
        compareByPrice(a.p.priceRange, b.p.priceRange, dir),
      );
    } else if (sort === "az") {
      list = [...list].sort((a, b) => a.p.name.localeCompare(b.p.name));
    } else {
      list = [...list].sort((a, b) => b.p.name.localeCompare(a.p.name));
    }
    return list;
  }, [groups, rooms, sort]);

  // Each tab has its own rooms, so switching clears the selection.
  const selectTab = (id: MarketplaceTabId) => {
    setActive(id);
    setRooms(new Set());
  };

  // Focus goes back to the card that opened the modal, so keyboard users land
  // where they were.
  const closeModal = useCallback(() => {
    setOpenItem(null);
    triggerRef.current?.focus();
  }, []);

  if (!activeTab) return null;

  // Rooms selected before a search narrowed them to nothing still get a pill
  // (in room order), so the reader can see why the grid is empty.
  const pills: Array<{ anchor: string; label: string; count: number }> =
    hubGroups
      .map((hub) => ({
        anchor: hub.anchor,
        label: hub.label,
        count: groups.find((g) => g.anchor === hub.anchor)?.items.length ?? 0,
      }))
      .filter((pill) => pill.count > 0 || rooms.has(pill.anchor));

  const hasActiveFilters =
    query.trim().length > 0 || sort !== "featured" || rooms.size > 0;

  const clearAll = () => {
    setQuery("");
    setSort("featured");
    setRooms(new Set());
  };

  // Brings the top of the results to just under the stuck control bar. The
  // bar's height changes with viewport and pill wrapping, so it is measured
  // rather than hard-coded as a scroll-margin.
  const scrollToResults = (onlyIfPast: boolean) => {
    const bar = barRef.current;
    const results = resultsRef.current;
    if (!bar || !results) return;
    const stuckBottom =
      parseFloat(getComputedStyle(bar).top) + bar.offsetHeight + 16;
    const top = results.getBoundingClientRect().top;
    if (onlyIfPast && top >= stuckBottom) return;
    window.scrollTo({ top: window.scrollY + top - stuckBottom, behavior: "smooth" });
  };

  // A tile is a shortcut: just that room, then down to the products.
  const selectFromHub = (anchor: string) => {
    setRooms(new Set([anchor]));
    scrollToResults(false);
  };

  // Pills combine. Scroll only when the reader is already past the top of the
  // results, otherwise a shorter grid can leave them below it.
  const toggleRoom = (anchor: string) => {
    setRooms((prev) => {
      const next = new Set(prev);
      if (next.has(anchor)) next.delete(anchor);
      else next.add(anchor);
      return next;
    });
    scrollToResults(true);
  };

  const showAllRooms = () => {
    setRooms(new Set());
    scrollToResults(true);
  };

  return (
    <section className="bg-off-white py-10 md:py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Controls. First thing under the hero, and sticky so departments,
            search, and the room filters stay reachable down a long page.
            top-20/24 clears the fixed header pill. */}
        <div
          ref={barRef}
          className="sticky top-20 md:top-24 z-30 -mx-6 px-6 py-3 mb-8 md:mb-10 bg-off-white/95 backdrop-blur-sm border-b border-warm-gold/25"
        >
          {/* Departments. A co-living operator and a Turo host are different
              shoppers, so these stay separate rather than becoming rows in one
              grid — the same reason Faire splits by store type. */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
            <div
              role="tablist"
              aria-label="Marketplace departments"
              className="flex shrink-0 rounded-md border border-warm-gold/40 bg-white p-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((t) => {
                const isActive = t.id === active;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`marketplace-panel-${t.id}`}
                    id={`marketplace-tab-${t.id}`}
                    onClick={() => selectTab(t.id)}
                    className={[
                      "flex-1 lg:flex-none shrink-0 inline-flex items-center justify-center rounded px-2 sm:px-4 py-1.5 transition-colors duration-200",
                      "font-sans text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.08em] sm:tracking-[0.16em] uppercase whitespace-nowrap",
                      isActive
                        ? "bg-warm-gold text-near-black"
                        : "text-charcoal/60 hover:text-deep-teal hover:bg-warm-gold/10",
                    ].join(" ")}
                  >
                    {t.label}
                    <span
                      aria-hidden
                      className={[
                        "ml-1 sm:ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold tracking-normal",
                        isActive
                          ? "bg-near-black/15 text-near-black"
                          : "bg-charcoal/10 text-charcoal/55",
                      ].join(" ")}
                    >
                      {t.products.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="relative flex-1 min-w-0">
                <label htmlFor="marketplace-search" className="sr-only">
                  Search products
                </label>
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/45"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="9" r="6" />
                    <path d="M14 14l4 4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="marketplace-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${activeTab.products.length} products`}
                  className="w-full bg-white border border-warm-gold/40 rounded-md pl-9 pr-3 py-2 md:py-2.5 font-sans text-sm text-charcoal placeholder:text-charcoal/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold focus:border-warm-gold transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor="marketplace-sort"
                    className="sr-only md:not-sr-only font-sans text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase text-charcoal/60"
                  >
                    Sort
                  </label>
                  <select
                    id="marketplace-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="bg-white border border-warm-gold/40 rounded-md pl-3 pr-8 py-2 md:py-2.5 font-sans text-sm text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold focus:border-warm-gold transition-colors appearance-none bg-no-repeat"
                    style={SELECT_CHEVRON}
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                      <option key={key} value={key}>
                        {SORT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Room filter */}
          {(groups.length > 1 || rooms.size > 0) && (
            <div
              role="group"
              aria-label="Filter by room. Select as many as you like."
              className="mt-2 md:mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                aria-pressed={rooms.size === 0}
                onClick={showAllRooms}
                className={pillClass(rooms.size === 0)}
              >
                All
                <span aria-hidden className={rooms.size === 0 ? "text-near-black/60" : "text-charcoal/45"}>
                  {filtered.length}
                </span>
              </button>
              {pills.map((g) => {
                const isActive = rooms.has(g.anchor);
                return (
                  <button
                    key={g.anchor}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => toggleRoom(g.anchor)}
                    className={pillClass(isActive)}
                  >
                    {g.label}
                    <span aria-hidden className={isActive ? "text-near-black/60" : "text-charcoal/45"}>
                      {g.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {hasActiveFilters && visible.length > 0 && (
            <p className="mt-2 font-sans text-xs text-charcoal/60" aria-live="polite">
              Showing {visible.length} of {activeTab.products.length} products.
            </p>
          )}
        </div>

        <div
          role="tabpanel"
          id={`marketplace-panel-${activeTab.id}`}
          aria-labelledby={`marketplace-tab-${activeTab.id}`}
        >
          <RoomHub
            groups={hubGroups}
            heading={activeTab.id === "property" ? "Shop by room" : "Shop by job"}
            onSelect={selectFromHub}
          />

          {/* Scroll target for room selection: the products, so picking a room
              lands on what it filtered. */}
          <div ref={resultsRef}>
            {visible.length === 0 ? (
              <div className="bg-cream border border-warm-gold/30 rounded-card p-8 md:p-12 text-center">
                <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
                  No matches
                </p>
                <p className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  Nothing here matches your filters.
                </p>
                <p className="font-sans text-base text-charcoal/80 leading-relaxed max-w-xl mx-auto mb-6">
                  Try a different search term, pick another room, or clear the
                  filters.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center justify-center rounded-lg font-sans text-sm font-semibold tracking-wide px-6 py-2.5 bg-warm-gold text-near-black hover:bg-warm-gold-dark transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map(({ p, plate }) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    plate={plate}
                    onOpen={(product, trigger) => {
                      triggerRef.current = trigger;
                      setOpenItem({ p: product, plate });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductModal
        product={openItem?.p ?? null}
        plate={openItem?.plate ?? null}
        onClose={closeModal}
      />
    </section>
  );
}

export default function MarketplaceCatalog({ tabs }: MarketplaceCatalogProps) {
  return (
    <Suspense
      fallback={
        <section className="bg-off-white py-10 md:py-12 px-6">
          <div className="max-w-7xl mx-auto h-32" />
        </section>
      }
    >
      <CatalogInner tabs={tabs} />
    </Suspense>
  );
}
