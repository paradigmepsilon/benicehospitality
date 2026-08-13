"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import ResourceCard, { type Resource } from "./ResourceCard";
import { SavedToolsProvider } from "@/components/resources/SavedToolsProvider";

export type ResourceTabId = "property" | "hotel" | "auto";

export interface ResourceTabImage {
  src: string;
  alt: string;
}

export interface ResourceTab {
  id: ResourceTabId;
  label: string;
  sectionLabel: string;
  headline: string;
  body: string;
  image: ResourceTabImage;
  resources: Resource[];
}

const PAGE_SIZE = 9;

type SortOption = "default" | "az" | "za";

interface ResourceCatalogProps {
  tabs: ResourceTab[];
}

export default function ResourceCatalog({ tabs }: ResourceCatalogProps) {
  const defaultId = tabs[0]?.id;
  const [active, setActive] = useState<ResourceTabId | undefined>(defaultId);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("default");
  const [hideSoon, setHideSoon] = useState(false);
  const [page, setPage] = useState(1);

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  const filtered = useMemo(() => {
    if (!activeTab) return [];
    const q = query.trim().toLowerCase();
    let list = activeTab.resources.filter((r) => {
      if (hideSoon && r.status === "soon") return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) || r.body.toLowerCase().includes(q)
      );
    });
    if (sort === "az") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "za") {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    }
    return list;
  }, [activeTab, query, sort, hideSoon]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Reset to page 1 when filters or tab change.
  useEffect(() => {
    setPage(1);
  }, [active, query, sort, hideSoon]);

  if (!activeTab) return null;

  const hasActiveFilters = query.trim().length > 0 || hideSoon || sort !== "default";
  const clearAll = () => {
    setQuery("");
    setSort("default");
    setHideSoon(false);
  };

  const gridCols =
    activeTab.resources.length <= 3
      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    // One /api/resources/saved fetch here resolves the save state for every
    // card in every tab, rather than one request per card.
    <SavedToolsProvider>
    <section className="bg-off-white py-14 md:py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Tab strip */}
        <div
          role="tablist"
          aria-label="Resources by audience"
          className="flex flex-wrap justify-center items-end gap-x-1 gap-y-1 border-b border-warm-gold/40 mb-8 md:mb-10"
        >
          {tabs.map((t) => {
            const count = t.resources.length;
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`resource-panel-${t.id}`}
                id={`resource-tab-${t.id}`}
                onClick={() => setActive(t.id)}
                className={[
                  "relative -mb-px px-5 sm:px-7 py-3 md:py-4 rounded-t-lg transition-colors duration-200",
                  "font-sans text-xs md:text-sm font-semibold tracking-[0.22em] uppercase",
                  isActive
                    ? "bg-warm-gold text-near-black border border-warm-gold border-b-warm-gold"
                    : "bg-transparent text-charcoal/60 hover:text-deep-teal hover:bg-warm-gold/10 border border-transparent",
                ].join(" ")}
              >
                {t.label}
                <span
                  aria-hidden
                  className={[
                    "ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold tracking-normal",
                    isActive
                      ? "bg-near-black/15 text-near-black"
                      : "bg-charcoal/10 text-charcoal/55",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Control bar */}
        <div className="bg-cream border border-warm-gold/30 rounded-lg p-4 md:p-5 mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <label htmlFor="resource-search" className="sr-only">
                Search resources
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
                id="resource-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resources"
                className="w-full bg-white border border-warm-gold/40 rounded-md pl-9 pr-3 py-2.5 font-sans text-sm text-charcoal placeholder:text-charcoal/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold focus:border-warm-gold transition-colors"
              />
            </div>

            {/* Status toggle */}
            <button
              type="button"
              onClick={() => setHideSoon((v) => !v)}
              aria-pressed={hideSoon}
              className={[
                "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-sans text-xs font-semibold tracking-[0.16em] uppercase transition-colors whitespace-nowrap",
                hideSoon
                  ? "bg-deep-teal text-white border border-deep-teal hover:bg-deep-teal/90"
                  : "bg-white text-charcoal border border-warm-gold/40 hover:border-warm-gold hover:text-deep-teal",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "inline-block w-2 h-2 rounded-full",
                  hideSoon ? "bg-warm-gold" : "bg-charcoal/40",
                ].join(" ")}
              />
              {hideSoon ? "Hiding coming soon" : "Hide coming soon"}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="resource-sort"
                className="font-sans text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase text-charcoal/60"
              >
                Sort
              </label>
              <select
                id="resource-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-white border border-warm-gold/40 rounded-md pl-3 pr-8 py-2.5 font-sans text-sm text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold focus:border-warm-gold transition-colors appearance-none bg-no-repeat"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 20 20' fill='none' stroke='%23807868' stroke-width='2'%3E%3Cpath d='M5 8l5 5 5-5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                  backgroundPosition: "right 0.65rem center",
                  backgroundSize: "0.75rem",
                }}
              >
                <option value="default">Default</option>
                <option value="az">A to Z</option>
                <option value="za">Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active panel */}
        <div
          role="tabpanel"
          id={`resource-panel-${activeTab.id}`}
          aria-labelledby={`resource-tab-${activeTab.id}`}
        >
          <div className="mb-10 md:mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <SectionLabel>{activeTab.sectionLabel}</SectionLabel>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-4">
                {activeTab.headline}
              </h2>
              <p className="font-sans text-base text-charcoal/85 leading-relaxed mb-5">
                {activeTab.body}
              </p>
              <p className="font-sans text-xs text-charcoal/60 italic">
                Showing {visible.length} of {filtered.length}
                {filtered.length !== activeTab.resources.length && (
                  <> (filtered from {activeTab.resources.length})</>
                )}
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={activeTab.image.src}
                alt={activeTab.image.alt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="bg-cream border border-warm-gold/30 rounded-lg p-8 md:p-12 text-center">
              <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
                No matches
              </p>
              <p className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                Nothing in this tab matches your filters.
              </p>
              <p className="font-sans text-base text-charcoal/80 leading-relaxed max-w-xl mx-auto mb-6">
                Try a different search term, switch tabs, or clear the filters.
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
            <>
              <div className={gridCols}>
                {visible.map((r) => (
                  <ResourceCard key={r.name} r={r} variant="light" />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
    </SavedToolsProvider>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (n: number) => void;
}) {
  const pages = pageList(page, totalPages);

  const go = (n: number) => {
    if (n < 1 || n > totalPages || n === page) return;
    onChange(n);
  };

  return (
    <nav
      aria-label="Resource pages"
      className="mt-10 md:mt-12 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-warm-gold/40 bg-white text-charcoal hover:border-warm-gold hover:text-deep-teal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M12 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1.5 font-sans text-sm text-charcoal/50"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={[
              "inline-flex items-center justify-center w-9 h-9 rounded-md font-sans text-sm font-semibold transition-colors",
              p === page
                ? "bg-warm-gold text-near-black border border-warm-gold"
                : "bg-white text-charcoal border border-warm-gold/40 hover:border-warm-gold hover:text-deep-teal",
            ].join(" ")}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-warm-gold/40 bg-white text-charcoal hover:border-warm-gold hover:text-deep-teal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}

// Compact 1 … 4 5 6 … N pager. Always shows first, last, current, and
// neighbors; collapses everything else into a single ellipsis on each side.
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}
