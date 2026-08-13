import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getViewerContext } from "@/lib/preview";
import {
  listAnalysesForUser,
  MAX_ANALYSES_PER_TOOL,
  type AnalysisSummary,
} from "@/lib/resources/analyses";
import { ANALYSIS_TOOL_SLUGS } from "@/lib/resources/analysis-schemas";
import { getResourceTool } from "@/lib/resources/registry";

// Every saved analysis across every analysis-capable tool, newest first.
//
// Route-shadowing note: a static sibling beats the [slug] segment next door,
// which resolves member_resources by slug. This segment is called "analyses"
// and NOT "planner" for exactly that reason — an admin publishing a member
// resource slugged "planner" is plausible; "analyses" is not.

export const metadata: Metadata = {
  title: "Your saved analyses",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function currency(n: number | null): string {
  return n === null ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;
}

function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AnalysesPage() {
  const ctx = await getViewerContext();
  if (!ctx) return null;

  // Same reasoning as the shelf: ctx.userId is the ADMIN's real id while
  // previewing, so a real query would surface their analyses under a member's
  // identity.
  const inPreview = ctx.previewMode !== null;
  const bySlug = inPreview
    ? new Map<string, AnalysisSummary[]>()
    : await listAnalysesForUser(ctx.userId, ANALYSIS_TOOL_SLUGS);

  const groups = ANALYSIS_TOOL_SLUGS.map((slug) => ({
    slug,
    tool: getResourceTool(slug),
    analyses: bySlug.get(slug) ?? [],
  })).filter((g) => g.tool !== null);

  const total = groups.reduce((n, g) => n + g.analyses.length, 0);

  return (
    <div className="max-w-5xl">
      <Link
        href="/account/resources"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← Your resources
      </Link>
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
        Saved analyses
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
        Every property you&apos;ve modelled.
      </h1>
      <p className="font-sans text-base text-charcoal/85 leading-relaxed max-w-2xl mb-10">
        Open any one to keep working on it. Renaming, duplicating, and deleting
        happen inside the tool itself, where you can see the numbers you&apos;re
        changing.
      </p>

      {inPreview && (
        <p className="font-sans text-sm text-charcoal/70 bg-warm-gold/10 border border-warm-gold/30 rounded-md px-4 py-3 mb-8">
          You&apos;re previewing a member tier. Saved analyses are hidden here
          because they belong to real accounts, not to the preview.
        </p>
      )}

      {!inPreview && total === 0 && (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
          <p className="font-display text-xl font-semibold text-deep-teal mb-2">
            No analyses yet.
          </p>
          <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto mb-5">
            Open the Co-Living Property Profitability Analysis Worksheet and
            your first one is created automatically.
          </p>
          <Link
            href="/resources/breakeven-analysis-worksheet"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
          >
            Open the planner
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      )}

      {groups.map(
        (g) =>
          g.analyses.length > 0 && (
            <section key={g.slug} className="mb-10">
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <h2 className="font-display text-xl font-semibold text-deep-teal">
                  {g.tool!.name}
                </h2>
                <span className="font-sans text-xs text-charcoal/55">
                  {g.analyses.length} of {MAX_ANALYSES_PER_TOOL}
                </span>
              </div>

              <ul className="space-y-2">
                {g.analyses.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/resources/${g.slug}?a=${a.id}`}
                      className="flex flex-wrap items-baseline gap-x-5 gap-y-1 bg-white border border-light-gray rounded-lg px-5 py-4 hover:border-primary-green/50 transition-colors group"
                    >
                      <span className="font-display text-lg font-semibold text-deep-teal group-hover:text-warm-gold transition-colors">
                        {a.name}
                      </span>
                      {a.location && (
                        <span className="font-sans text-sm text-charcoal/55">{a.location}</span>
                      )}
                      <span className="font-sans text-sm text-charcoal/70 tabular-nums">
                        {currency(a.monthlyNet)}/mo net
                      </span>
                      <span className="font-sans text-sm text-charcoal/70 tabular-nums">
                        {a.breakEvenMonth !== null
                          ? `break-even month ${a.breakEvenMonth}`
                          : "no break-even"}
                      </span>
                      <span className="font-sans text-sm text-charcoal/70 tabular-nums">
                        {currency(a.startupTotal)} to open
                      </span>
                      <span className="ml-auto font-sans text-xs text-charcoal/45">
                        edited {when(a.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}
