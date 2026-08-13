import type { Metadata } from "next";
import Link from "next/link";
import { getViewerContext } from "@/lib/preview";
import {
  listResourcesForTier,
  getEffectiveTierForUser,
  effectiveTierFromEnrollmentTier,
  type EffectiveTier,
} from "@/lib/resources";
import { listSavedResourceToolsByLane } from "@/lib/resources/saved";
import { listAnalysesForUser, type AnalysisSummary } from "@/lib/resources/analyses";
import { ANALYSIS_TOOL_SLUGS } from "@/lib/resources/analysis-schemas";
import type { LaneId } from "@/lib/lanes";
import SavedResourcesTabs, {
  type SavedToolCard,
} from "./_components/SavedResourcesTabs";
import { parseTab } from "./_components/tabs";

export const metadata: Metadata = {
  title: "Your resources",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const EMPTY_BY_LANE: Record<LaneId, SavedToolCard[]> = {
  coliving: [],
  boutique: [],
  fleet: [],
};

export default async function ResourcesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await getViewerContext();
  // Layout already gated.
  if (!ctx) return null;

  // Tier preview maps to a member-level tier; god view stays as "admin"
  // (sees everything including unpublished); real members compute from their
  // enrollments.
  const effective: EffectiveTier | "admin" = ctx.effectiveIsAdmin
    ? "admin"
    : ctx.effectiveTier !== null
      ? effectiveTierFromEnrollmentTier(ctx.effectiveTier)
      : await getEffectiveTierForUser(ctx.userId);

  // ctx.userId is the ADMIN's real id while previewing, so their own saved
  // tools would surface under a member's identity. Show an empty shelf and say
  // so rather than misrepresent the previewed member.
  const inPreview = ctx.previewMode !== null;

  // Analyses ride the same Promise.all and the same inPreview short-circuit, so
  // the nested lists cost no extra round trip and preview safety comes free.
  const [savedByLane, memberResources, analysesBySlug] = await Promise.all([
    inPreview
      ? Promise.resolve(EMPTY_BY_LANE)
      : listSavedResourceToolsByLane(ctx.userId).then((byLane) => ({
          coliving: byLane.coliving.map(toCard),
          boutique: byLane.boutique.map(toCard),
          fleet: byLane.fleet.map(toCard),
        })),
    listResourcesForTier(effective),
    inPreview
      ? Promise.resolve(new Map<string, AnalysisSummary[]>())
      : listAnalysesForUser(ctx.userId, ANALYSIS_TOOL_SLUGS),
  ]);

  // Attach after the fetch so toCard stays a pure projection of the registry.
  for (const lane of Object.values(savedByLane)) {
    for (const card of lane) {
      const found = analysesBySlug.get(card.slug);
      if (found && found.length > 0) card.analyses = found;
    }
  }

  const { tab } = await searchParams;

  return (
    <div className="max-w-5xl">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← Your account
      </Link>
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
        Your resources
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
        Everything you&apos;ve saved.
      </h1>
      <p className="font-sans text-base text-charcoal/85 leading-relaxed max-w-2xl mb-10">
        The free tools you&apos;ve added from the resource library, sorted by
        what they&apos;re for, plus the SOPs, P&amp;L sheets, and templates that
        come with your courses.
      </p>

      <SavedResourcesTabs
        defaultTab={parseTab(tab)}
        savedByLane={savedByLane}
        memberResources={memberResources}
        readOnly={ctx.isReadOnlyPreview}
        inPreview={inPreview}
      />
    </div>
  );
}

/** Trim the registry meta down to what the client tab component renders. */
function toCard(t: {
  toolSlug: string;
  source: string;
  lane: LaneId;
  tool: { name: string; blurb: string; archetype: string; hasExample?: boolean };
}): SavedToolCard {
  return {
    slug: t.toolSlug,
    name: t.tool.name,
    blurb: t.tool.blurb,
    archetype: t.tool.archetype,
    lane: t.lane,
    ...(t.tool.hasExample
      ? { exampleHref: `/resources/${t.toolSlug}?example=1` }
      : {}),
  };
}
