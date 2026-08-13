import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";
import { getViewerContext } from "@/lib/preview";
import {
  getResourceBySlug,
  getEffectiveTierForUser,
  effectiveTierFromEnrollmentTier,
  userCanAccessResource,
  type EffectiveTier,
} from "@/lib/resources";

export const metadata: Metadata = {
  title: "Resource",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TIER_BADGE: Record<string, string> = {
  any: "All members",
  cohort: "Cohort+",
  operator: "Operator only",
};

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const ctx = await getViewerContext();
  if (!ctx) return null;

  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();

  const effective: EffectiveTier | "admin" = ctx.effectiveIsAdmin
    ? "admin"
    : ctx.effectiveTier !== null
      ? effectiveTierFromEnrollmentTier(ctx.effectiveTier)
      : await getEffectiveTierForUser(ctx.userId);

  if (!userCanAccessResource(effective, resource)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6">
          Restricted
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-6">
          This resource is gated to a higher tier.
        </h1>
        <p className="font-sans text-base text-charcoal leading-relaxed mb-8">
          Required tier:{" "}
          <strong>{TIER_BADGE[resource.requiredTier]}</strong>. Your current
          access is 1 tier below.
        </p>
        <Link
          href="/account/resources?tab=courses"
          className="inline-flex items-center justify-center bg-transparent text-primary-green border-2 border-primary-green hover:bg-primary-green hover:text-white font-sans font-semibold tracking-wide rounded-lg px-7 py-3.5 transition-colors"
        >
          Back to resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/account/resources?tab=courses"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← All resources
      </Link>
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
        {TIER_BADGE[resource.requiredTier]}
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.05] tracking-tight mb-5">
        {resource.title}
      </h1>
      <p className="font-sans text-base text-charcoal leading-relaxed italic mb-8">
        {resource.summary}
      </p>

      <div className="space-y-4">
          {resource.fileUrl && (
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 bg-white border border-light-gray rounded-lg p-5 md:p-6 hover:border-primary-green/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Download
                  className="w-5 h-5 text-primary-green"
                  aria-hidden
                />
                <div>
                  <p className="font-display text-base font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors">
                    Download the file
                  </p>
                  {resource.fileFilename && (
                    <p className="font-sans text-xs text-charcoal/60 mt-0.5">
                      {resource.fileFilename}
                    </p>
                  )}
                </div>
              </div>
              <span className="font-sans text-sm font-semibold text-primary-green">
                Open
              </span>
            </a>
          )}
          {resource.externalUrl && (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 bg-white border border-light-gray rounded-lg p-5 md:p-6 hover:border-primary-green/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ExternalLink
                  className="w-5 h-5 text-primary-green"
                  aria-hidden
                />
                <p className="font-display text-base font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors">
                  Open external link
                </p>
              </div>
              <span className="font-sans text-sm font-semibold text-primary-green truncate max-w-[200px]">
                {new URL(resource.externalUrl).hostname}
              </span>
            </a>
          )}
      </div>

      {resource.body && (
        <article
          className="mt-8 bg-white border border-light-gray rounded-lg p-7 md:p-10 prose prose-slate max-w-none font-sans prose-headings:font-display prose-headings:text-deep-teal prose-p:text-charcoal prose-p:leading-relaxed prose-strong:text-deep-teal prose-li:text-charcoal prose-a:text-primary-green hover:prose-a:text-primary-green-dark whitespace-pre-wrap"
        >
          {resource.body}
        </article>
      )}
    </div>
  );
}
