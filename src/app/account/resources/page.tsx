import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, FileText, ExternalLink } from "lucide-react";
import { getViewerContext } from "@/lib/preview";
import {
  listResourcesForTier,
  getEffectiveTierForUser,
  effectiveTierFromEnrollmentTier,
  type EffectiveTier,
} from "@/lib/resources";

export const metadata: Metadata = {
  title: "Member resources",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TIER_BADGE: Record<string, string> = {
  any: "All members",
  cohort: "Cohort+",
  operator: "Operator only",
};

export default async function ResourcesIndexPage() {
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

  const resources = await listResourcesForTier(effective);

  return (
    <>
      <div className="max-w-5xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
        >
          ← Your account
        </Link>
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
          Member resources
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
          Templates and references.
        </h1>
        <p className="font-sans text-base text-charcoal/85 leading-relaxed max-w-2xl mb-10">
          SOPs, P&amp;L sheets, hiring scorecards, pricing rule sets: the
          documents the curriculum points at. New uploads land here as
          modules ship.
        </p>

        <div>
          {resources.length === 0 ? (
            <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
              <FileText
                className="w-6 h-6 text-charcoal/40 mx-auto mb-3"
                aria-hidden
              />
              <p className="font-display text-xl font-semibold text-deep-teal mb-2">
                Nothing here yet.
              </p>
              <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto">
                Resources are added as the curriculum advances. Check back
                after the next cohort week.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
}
