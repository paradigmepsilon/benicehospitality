import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getViewerContext } from "@/lib/preview";
import { listScorecardsForMember } from "@/lib/scorecard/saved";
import ScorecardShelf from "./ScorecardShelf";

// Every property a member has run through the Co-living Viability Calculator,
// newest first — the scorecard counterpart to /account/resources/analyses.
//
// Route-shadowing note: the same rule as the analyses segment applies. A static
// sibling beats the [slug] segment next door, which resolves member_resources by
// slug, so this segment is named "scorecards" rather than anything an admin
// might plausibly publish a member resource under.

export const metadata: Metadata = {
  title: "Your property scorecards",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ScorecardsPage() {
  const ctx = await getViewerContext();
  if (!ctx) return null;

  // Same reasoning as the shelf and the analyses page: ctx.userId is the
  // ADMIN's real id while previewing, so a real query would surface their
  // scorecards under a member's identity.
  const inPreview = ctx.previewMode !== null;
  const scorecards = inPreview
    ? []
    : await listScorecardsForMember(ctx.userId, ctx.userEmail);

  return (
    <div className="max-w-5xl">
      <Link
        href="/account/resources"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← Your resources
      </Link>
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
        Property scorecards
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
        Every property you&apos;ve scored.
      </h1>
      <p className="font-sans text-base text-charcoal/85 leading-relaxed max-w-2xl mb-10">
        Each one is a finished report, so the score is fixed at the day you ran
        it. Rename them to tell two deals apart, and score the same property
        again after you close a gap to see the number move.
      </p>

      {inPreview ? (
        <p className="font-sans text-sm text-charcoal/70 bg-warm-gold/10 border border-warm-gold/30 rounded-md px-4 py-3 mb-8">
          You&apos;re previewing a member tier. Saved scorecards are hidden here
          because they belong to real accounts, not to the preview.
        </p>
      ) : scorecards.length === 0 ? (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
          <p className="font-display text-xl font-semibold text-deep-teal mb-2">
            No scorecards yet.
          </p>
          <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto mb-5">
            Run a property through the Co-living Viability Calculator and the
            report lands here automatically.
          </p>
          <Link
            href="/resources/co-living-viability-calculator"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
          >
            Score a property
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          <ScorecardShelf initial={scorecards} />
          <Link
            href="/resources/co-living-viability-calculator"
            className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
          >
            Score another property
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}
