"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import ResourceCard, { type Resource } from "./ResourceCard";
import BookPromoBand from "@/components/sections/books/BookPromoBand";
import { type FeaturedBook } from "@/lib/featured-books";
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
  /**
   * First-party books promoted at the top of this tab's panel, matched to the
   * tab's audience in page.tsx. Deliberately NOT part of `resources`: the books
   * are paid products, not free tools, so they sit above the grid and stay out
   * of the search and the tab count badge.
   */
  books?: FeaturedBook[];
}

interface ResourceCatalogProps {
  tabs: ResourceTab[];
}

export default function ResourceCatalog({ tabs }: ResourceCatalogProps) {
  const defaultId = tabs[0]?.id;
  const [active, setActive] = useState<ResourceTabId | undefined>(defaultId);
  const [query, setQuery] = useState("");

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  const filtered = useMemo(() => {
    if (!activeTab) return [];
    const q = query.trim().toLowerCase();
    return activeTab.resources.filter((r) => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) || r.body.toLowerCase().includes(q)
      );
    });
  }, [activeTab, query]);

  if (!activeTab) return null;

  const hasActiveFilters = query.trim().length > 0;
  const clearAll = () => setQuery("");

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
                Showing {filtered.length} of {activeTab.resources.length}
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

          {/* The paid companion to this tab's free tools, above the grid. Sits
              outside the filter pipeline on purpose — see ResourceTab.books —
              so it stays put while the reader searches. */}
          {activeTab.books && activeTab.books.length > 0 && (
            <BookPromoBand
              books={activeTab.books}
              eyebrow="The companion manual"
              headline="The tools are free. The system is $32."
              source="resources-promo"
              variant="inline"
            />
          )}

          {filtered.length === 0 ? (
            <div className="bg-cream border border-warm-gold/30 rounded-lg p-8 md:p-12 text-center">
              <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
                No matches
              </p>
              <p className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                Nothing in this tab matches your search.
              </p>
              <p className="font-sans text-base text-charcoal/80 leading-relaxed max-w-xl mx-auto mb-6">
                Try a different search term or switch tabs.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center justify-center rounded-lg font-sans text-sm font-semibold tracking-wide px-6 py-2.5 bg-warm-gold text-near-black hover:bg-warm-gold-dark transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className={gridCols}>
              {filtered.map((r) => (
                <ResourceCard key={r.name} r={r} variant="light" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
    </SavedToolsProvider>
  );
}
