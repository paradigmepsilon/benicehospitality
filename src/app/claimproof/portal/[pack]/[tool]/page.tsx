import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalTier, tierUnlocks } from "../../_lib/access";
import { getPack, getTool } from "../../_content";
import { AccessGate, UpgradeLock } from "../../_components/Gates";
import ToolRenderer from "../../_components/ToolRenderer";
import { IconArrowRight } from "../../_components/Icons";

/**
 * Tool page: breadcrumb with position-in-pack, the rendered tool, and
 * prev/next cards so a workflow reads front to back without returning to
 * the dashboard.
 */

export const dynamic = "force-dynamic";

export default async function ToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ pack: string; tool: string }>;
  searchParams: Promise<{ claim?: string }>;
}) {
  const { pack: packSlug, tool: toolSlug } = await params;
  const { claim } = await searchParams;
  const hit = getTool(packSlug, toolSlug);
  if (!hit) notFound();
  const { pack, tool } = hit;

  const tier = await getPortalTier();
  if (!tier) return <AccessGate />;
  if (!tierUnlocks(tier, pack.access)) {
    return <UpgradeLock tier={tier} needs={pack.access} packName={pack.name} />;
  }

  // Claim context: interactive tools sync their data against this claim id.
  const claimId = claim && /^\d+$/.test(claim) ? Number(claim) : null;

  const idx = pack.tools.findIndex((t) => t.slug === tool.slug);
  const prev = idx > 0 ? pack.tools[idx - 1] : null;
  const next = idx < pack.tools.length - 1 ? pack.tools[idx + 1] : null;

  return (
    <div>
      <nav className="cp-chrome cp-rise mb-8 flex flex-wrap items-center justify-between gap-3 font-sans text-sm text-white/45">
        <p className="min-w-0">
          <Link
            href="/claimproof/portal"
            className="transition-colors hover:text-[#E19C63]"
          >
            Dashboard
          </Link>
          <span className="mx-2 text-white/25">/</span>
          <Link
            href={`/claimproof/portal/${pack.slug}`}
            className="transition-colors hover:text-[#E19C63]"
          >
            {pack.name}
          </Link>
          <span className="mx-2 text-white/25">/</span>
          <span className="text-white/70">{tool.name}</span>
        </p>
        <span className="flex-none rounded-full border border-white/10 px-3 py-1 font-sans text-[11px] tabular-nums text-[#8BA5BE]">
          Tool {idx + 1} of {pack.tools.length}
        </span>
      </nav>

      <div className="cp-rise" style={{ "--d": "60ms" } as React.CSSProperties}>
        <ToolRenderer tool={tool} packSlug={pack.slug} claimId={claimId} />
      </div>

      <nav className="cp-chrome mt-14 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/claimproof/portal/${pack.slug}/${prev.slug}`}
            className="group flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.02] p-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#8BA5BE]/60 hover:bg-white/[0.04] active:scale-[0.99]"
          >
            <span className="flex h-9 w-9 flex-none rotate-180 items-center justify-center rounded-full border border-white/12 text-white/40 transition-colors duration-300 group-hover:border-[#8BA5BE] group-hover:text-[#8BA5BE]">
              <IconArrowRight className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block font-sans text-[10px] uppercase tracking-[0.18em] text-white/40">
                Previous
              </span>
              <span className="block truncate font-sans text-sm font-semibold text-white/75 transition-colors duration-300 group-hover:text-[#8BA5BE]">
                {prev.name}
              </span>
            </span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={`/claimproof/portal/${pack.slug}/${next.slug}`}
            className="group flex items-center justify-end gap-3 rounded-[1.2rem] border border-[#E19C63]/25 bg-[#E19C63]/[0.04] p-4 text-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#E19C63]/70 hover:bg-[#E19C63]/[0.08] active:scale-[0.99]"
          >
            <span className="min-w-0">
              <span className="block font-sans text-[10px] uppercase tracking-[0.18em] text-[#E19C63]/70">
                Next in this pack
              </span>
              <span className="block truncate font-sans text-sm font-semibold text-white/85 transition-colors duration-300 group-hover:text-[#E19C63]">
                {next.name}
              </span>
            </span>
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#E19C63]/15 text-[#E19C63] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:bg-[#E19C63] group-hover:text-[#27262E]">
              <IconArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ) : (
          <Link
            href={`/claimproof/portal/${pack.slug}`}
            className="group flex items-center justify-end gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.02] p-4 text-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#8BA5BE]/60 active:scale-[0.99]"
          >
            <span className="min-w-0">
              <span className="block font-sans text-[10px] uppercase tracking-[0.18em] text-white/40">
                Pack complete
              </span>
              <span className="block truncate font-sans text-sm font-semibold text-white/75 transition-colors duration-300 group-hover:text-[#8BA5BE]">
                Back to {pack.name}
              </span>
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
