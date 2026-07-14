import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalTier, tierUnlocks } from "../_lib/access";
import { getPack } from "../_content";
import { AccessGate, UpgradeLock } from "../_components/Gates";
import { WalkthroughVideo } from "../_components/WalkthroughVideo";
import { videoKeyForPack } from "@/lib/claim-proof-video";
import { PackIcon, IconArrowUpRight, IconClock } from "../_components/Icons";

/**
 * Pack index: the pack's tools as a workflow list, numbered so it reads as one
 * process to run front to back, not a file listing.
 */

export const dynamic = "force-dynamic";

export default async function PackPage({
  params,
}: {
  params: Promise<{ pack: string }>;
}) {
  const { pack: packSlug } = await params;
  const pack = getPack(packSlug);
  if (!pack) notFound();

  const tier = await getPortalTier();
  if (!tier) return <AccessGate />;
  if (!tierUnlocks(tier, pack.access)) {
    return <UpgradeLock tier={tier} needs={pack.access} packName={pack.name} />;
  }

  return (
    <div>
      <nav className="cp-rise mb-8 font-sans text-sm text-white/45">
        <Link
          href="/claimproof/portal"
          className="transition-colors hover:text-[#E19C63]"
        >
          Dashboard
        </Link>
        <span className="mx-2 text-white/25">/</span>
        <span className="text-white/70">{pack.name}</span>
      </nav>

      <header className="cp-rise mb-10 flex items-start gap-5" style={{ "--d": "60ms" } as React.CSSProperties}>
        <span className="hidden h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#E19C63]/12 text-[#E19C63] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] ring-1 ring-[#E19C63]/25 sm:flex">
          <PackIcon slug={pack.slug} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="mb-2 font-display text-3xl font-semibold text-white md:text-4xl">
            {pack.name}
          </h1>
          <p className="max-w-2xl font-sans text-base text-white/60">
            {pack.blurb}
          </p>
          <p className="mt-3 font-sans text-xs uppercase tracking-[0.18em] text-[#8BA5BE]">
            {pack.tools.length} tools · run them in order
          </p>
        </div>
      </header>

      {videoKeyForPack(pack.slug) && (
        <WalkthroughVideo videoKey={videoKeyForPack(pack.slug)!} />
      )}

      {/* the workflow rail */}
      <ol className="space-y-3 pl-9 md:pl-10">
        {pack.tools.map((tool, i) => (
          <li key={tool.slug} className="relative">
            <span className="absolute -left-9 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#E19C63]/30 bg-[#E19C63]/10 font-sans text-[10px] font-bold tabular-nums text-[#E19C63] md:-left-10">
              {i + 1}
            </span>
            <Link
              href={`/claimproof/portal/${pack.slug}/${tool.slug}`}
              style={{ "--d": `${100 + i * 45}ms` } as React.CSSProperties}
              className="cp-rise group flex items-center gap-4 rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#E19C63]/55 hover:bg-white/[0.05] active:scale-[0.995]"
            >
              <span className="hidden w-8 flex-none font-display text-xl font-semibold text-[#E19C63]/70 transition-colors duration-300 group-hover:text-[#E19C63] sm:block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-sans font-bold text-white transition-colors duration-300 group-hover:text-[#E19C63]">
                  {tool.name}
                </span>
                <span className="mt-0.5 block font-sans text-sm leading-relaxed text-white/55">
                  {tool.tagline}
                </span>
              </span>
              <span className="hidden flex-none items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 font-sans text-[11px] tabular-nums text-[#8BA5BE] sm:flex">
                <IconClock className="h-3.5 w-3.5" />
                {tool.minutes}
              </span>
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/12 text-white/40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:border-[#E19C63] group-hover:bg-[#E19C63] group-hover:text-[#27262E]">
                <IconArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
