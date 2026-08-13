"use client";

// "Your resources" — four tabs over two genuinely different collections.
//
// The three lane tabs hold free tools the member saved from /resources. The
// fourth holds the tier-gated course deliverables that used to be the entire
// contents of this page; that grid moved here verbatim so nothing regressed
// for enrolled members.

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";
import { LANES, laneVars, type LaneId } from "@/lib/lanes";
import type { MemberResource } from "@/lib/resources";
import SaveToolButton from "@/components/resources/SaveToolButton";
import type { TabId } from "./tabs";

/** Trimmed on the server — the registry meta is bigger than the UI needs. */
export interface SavedToolCard {
  slug: string;
  name: string;
  blurb: string;
  archetype: string;
  lane: LaneId;
  /**
   * Only tools in ANALYSIS_TOOLS carry this. Optional so the other nineteen
   * cards are byte-identical and every existing construction site still
   * compiles — a per-tool tab would have been the wrong level of abstraction
   * for a tab strip that is otherwise three lanes plus a collection type.
   */
  analyses?: SavedAnalysis[];
  /**
   * Deep link into the tool's completed, read-only example
   * (/resources/<slug>?example=1). Only tools with `hasExample` in the
   * registry carry it; optional for the same byte-identical reason as
   * `analyses`.
   */
  exampleHref?: string;
}

export interface SavedAnalysis {
  id: number;
  name: string;
  /** "Douglasville, GA". Tells two same-named properties apart. */
  location: string | null;
  monthlyNet: number | null;
  breakEvenMonth: number | null;
  updatedAt: string;
}

/** Beyond this the card stops being a card. */
const ANALYSES_PREVIEW = 3;

const LANE_TABS: { id: LaneId; label: string }[] = [
  { id: "coliving", label: "Co-living" },
  { id: "boutique", label: "Boutique Stays" },
  { id: "fleet", label: "Autos" },
];

const TIER_BADGE: Record<string, string> = {
  any: "All members",
  cohort: "Cohort+",
  operator: "Operator only",
};

interface SavedResourcesTabsProps {
  defaultTab: TabId;
  savedByLane: Record<LaneId, SavedToolCard[]>;
  memberResources: MemberResource[];
  readOnly: boolean;
  inPreview: boolean;
}

export default function SavedResourcesTabs({
  defaultTab,
  savedByLane,
  memberResources,
  readOnly,
  inPreview,
}: SavedResourcesTabsProps) {
  const [active, setActive] = useState<TabId>(defaultTab);

  const countFor = (id: TabId) =>
    id === "courses" ? memberResources.length : savedByLane[id].length;

  return (
    <div>
      {inPreview && (
        <p className="mb-6 bg-warm-gold/10 border border-warm-gold/40 rounded-lg px-4 py-3 font-sans text-sm text-charcoal/80">
          Preview mode. Saved tools belong to the real member&apos;s account,
          so they are not shown here.
        </p>
      )}

      <div
        role="tablist"
        aria-label="Your resources by category"
        className="flex flex-wrap items-end gap-x-1 gap-y-1 border-b border-warm-gold/40 mb-8 md:mb-10"
      >
        {[...LANE_TABS, { id: "courses" as const, label: "From your courses" }].map(
          (t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`saved-panel-${t.id}`}
                id={`saved-tab-${t.id}`}
                onClick={() => setActive(t.id)}
                className={[
                  "relative -mb-px px-4 sm:px-6 py-3 rounded-t-lg transition-colors duration-200",
                  "font-sans text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase",
                  isActive
                    ? "bg-warm-gold text-near-black border border-warm-gold"
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
                  {countFor(t.id)}
                </span>
              </button>
            );
          },
        )}
      </div>

      {LANE_TABS.map(
        (t) =>
          active === t.id && (
            <div
              key={t.id}
              role="tabpanel"
              id={`saved-panel-${t.id}`}
              aria-labelledby={`saved-tab-${t.id}`}
              // laneVars is pure, so the lane accent works inside this client
              // tree without pulling in the server-side LaneSection wrapper.
              style={laneVars(t.id)}
            >
              <SavedToolGrid
                tools={savedByLane[t.id]}
                laneName={LANES[t.id].name}
                readOnly={readOnly}
              />
            </div>
          ),
      )}

      {active === "courses" && (
        <div
          role="tabpanel"
          id="saved-panel-courses"
          aria-labelledby="saved-tab-courses"
        >
          <MemberResourceGrid resources={memberResources} />
        </div>
      )}
    </div>
  );
}

function SavedToolGrid({
  tools,
  laneName,
  readOnly,
}: {
  tools: SavedToolCard[];
  laneName: string;
  readOnly: boolean;
}) {
  /**
   * Slugs removed in this session.
   *
   * The button had no onChange and there is no SavedToolsProvider on this page,
   * so a successful DELETE left the card sitting there — and because the remove
   * variant's label is unconditionally "Remove", a second click fired a POST
   * and silently put the tool back. Only a refresh cleared it.
   */
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const visible = tools.filter((t) => !removed.has(t.slug));

  if (tools.length === 0) {
    return (
      <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
        <p className="font-display text-xl font-semibold text-deep-teal mb-2">
          Nothing saved in {laneName} yet.
        </p>
        <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto mb-5">
          Start filling in any free tool and it lands here automatically, or
          use &ldquo;Add to my dashboard&rdquo; on a card in the library.
        </p>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
        >
          Browse the library
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <>
      {removed.size > 0 && (
        <p
          role="status"
          aria-live="polite"
          className="font-sans text-xs text-charcoal/60 mb-3"
        >
          Removed {removed.size} {removed.size === 1 ? "tool" : "tools"}. Using
          one again puts it back here.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {visible.map((t) => (
        <article
          key={t.slug}
          className="bg-white border border-light-gray rounded-lg p-6 hover:border-(--lane-accent,var(--color-primary-green))/40 transition-colors flex flex-col"
        >
          <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-2">
            {t.archetype}
          </p>
          {/* The tool itself lives on the public marketing route; there is no
              member-side copy of it, so this deliberately links out. */}
          <Link
            href={`/resources/${t.slug}`}
            className="font-display text-lg font-semibold text-deep-teal leading-tight mb-2 hover:text-warm-gold transition-colors inline-flex items-start gap-1.5"
          >
            {t.name}
            <ArrowUpRight className="w-4 h-4 mt-1 shrink-0" aria-hidden />
          </Link>
          <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-4">
            {t.blurb}
          </p>

          {/* Tools that ship a completed example link it here, so a member can
              see what "done right" looks like before (or while) filling in
              their own. */}
          {t.exampleHref && (
            <Link
              href={t.exampleHref}
              className="inline-block font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark mb-4 -mt-1"
            >
              See a completed example →
            </Link>
          )}

          {/* Tools that keep named analyses list them here, because someone
              hunting for "123 Maple St" looks under the tool they made it in. */}
          {t.analyses && t.analyses.length > 0 && (
            <div className="border-t border-light-gray pt-3 mb-4">
              <p className="font-sans text-[11px] font-semibold tracking-[0.16em] uppercase text-charcoal/45 mb-2">
                Your analyses
              </p>
              <ul className="space-y-1.5">
                {t.analyses.slice(0, ANALYSES_PREVIEW).map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/resources/${t.slug}?a=${a.id}`}
                      className="group flex items-baseline gap-2 font-sans text-sm hover:text-primary-green"
                    >
                      <span className="min-w-0 truncate">
                        <span className="text-near-black group-hover:text-primary-green">
                          {a.name}
                        </span>
                        {a.location && (
                          <span className="text-charcoal/50 text-xs"> · {a.location}</span>
                        )}
                      </span>
                      <span className="ml-auto shrink-0 text-charcoal/55 tabular-nums text-xs">
                        {a.monthlyNet !== null
                          ? `$${Math.round(a.monthlyNet).toLocaleString("en-US")}/mo`
                          : "—"}
                        {a.breakEvenMonth !== null && ` · mo. ${a.breakEvenMonth}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {t.analyses.length > ANALYSES_PREVIEW && (
                <Link
                  href="/account/resources/analyses"
                  className="inline-block mt-2 font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark"
                >
                  View all {t.analyses.length} →
                </Link>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            {/* "Saved when you opened it" used to live here. Opening a tool no
                longer adds it, so the only way a card reaches this shelf now is
                a deliberate click and the caveat would be false. */}
            <span />

            {!readOnly && (
              <SaveToolButton
                slug={t.slug}
                toolName={t.name}
                variant="remove"
                loggedIn
                initialSaved
                onChange={(saved) => {
                  if (saved) return;
                  setRemoved((prev) => new Set(prev).add(t.slug));
                }}
              />
            )}
          </div>
        </article>
      ))}
      </div>
    </>
  );
}

function MemberResourceGrid({ resources }: { resources: MemberResource[] }) {
  if (resources.length === 0) {
    return (
      <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
        <FileText
          className="w-6 h-6 text-charcoal/40 mx-auto mb-3"
          aria-hidden
        />
        <p className="font-display text-xl font-semibold text-deep-teal mb-2">
          Nothing here yet.
        </p>
        <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto">
          Course resources are added as the curriculum advances. Check back
          after the next cohort week.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {resources.map((r) => (
        <Link
          key={r.id}
          href={`/account/resources/${r.slug}`}
          className="block bg-white border border-light-gray rounded-lg p-6 hover:border-primary-green/40 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <FileText
              className="w-5 h-5 text-primary-green flex-shrink-0"
              aria-hidden
            />
            <span className="font-sans text-xs font-semibold tracking-wide uppercase text-warm-gold-dark bg-warm-gold/15 rounded-full px-2.5 py-0.5">
              {TIER_BADGE[r.requiredTier] ?? r.requiredTier}
            </span>
          </div>
          <h2 className="font-display text-lg md:text-xl font-semibold text-deep-teal leading-tight mb-2 group-hover:text-warm-gold transition-colors">
            {r.title}
          </h2>
          <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-4">
            {r.summary}
          </p>
          <div className="flex items-center gap-3 font-sans text-sm">
            {r.fileUrl && (
              <span className="inline-flex items-center gap-1.5 text-primary-green font-semibold">
                <Download className="w-4 h-4" aria-hidden /> File
              </span>
            )}
            {r.externalUrl && (
              <span className="inline-flex items-center gap-1.5 text-primary-green font-semibold">
                <ExternalLink className="w-4 h-4" aria-hidden /> Link
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-charcoal/55 group-hover:text-primary-green transition-colors">
              Open
              <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
