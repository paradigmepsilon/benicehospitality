import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPortalAccess } from "../../_lib/access";
import { getClaim } from "@/lib/claim-proof-claims";
import { PACKS } from "../../_content";
import type { PackSlug } from "../../_content/types";
import ClaimHeader from "../../_components/ClaimHeader";
import { IconArrowUpRight, IconClock } from "../../_components/Icons";

/**
 * A single tracked claim. The editable header (stage / next action / figures)
 * syncs to the server; below it, the tools that operate on THIS claim link
 * through with ?claim=ID so their worksheets and logs save against it.
 */

export const dynamic = "force-dynamic";

// Tools whose data is naturally per-claim (worksheets, logs, builders).
const CLAIM_TOOLS: Array<{ pack: PackSlug; tool: string; name: string; minutes: string }> = [
  { pack: "emergency", tool: "quick-start", name: "Emergency Quick Start", minutes: "20 min" },
  { pack: "emergency", tool: "incident-summary", name: "Incident Summary Builder", minutes: "15 min" },
  { pack: "valuation", tool: "gap-worksheet", name: "Valuation Gap Worksheet", minutes: "20 min" },
  { pack: "valuation", tool: "supplement-builder", name: "Supplement Request Builder", minutes: "60 min" },
  { pack: "followup", tool: "comms-log", name: "Claim Communication Log", minutes: "ongoing" },
  { pack: "followup", tool: "downtime-tracker", name: "Downtime Cost Tracker", minutes: "ongoing" },
  { pack: "followup", tool: "economics-worksheet", name: "Claim Economics Worksheet", minutes: "10 min" },
];

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getPortalAccess();
  if (!access) redirect("/claimproof/portal");
  if (!access.workspace) {
    // Legacy-token visitor: claims live under an account. Send them home.
    redirect("/claimproof/portal");
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const claim = await getClaim(access.workspace.workspace.id, id);
  if (!claim) notFound();

  // Only surface tools the tier unlocks.
  const unlockedPacks = new Set(
    PACKS.filter((p) => {
      const rank = { core: 0, pro: 1, fleet: 2 } as const;
      return rank[access.tier] >= rank[p.access];
    }).map((p) => p.slug),
  );
  const tools = CLAIM_TOOLS.filter((t) => unlockedPacks.has(t.pack));

  return (
    <div>
      <nav className="cp-rise mb-8 font-sans text-sm text-white/45">
        <Link href="/claimproof/portal" className="transition-colors hover:text-[#E19C63]">
          Dashboard
        </Link>
        <span className="mx-2 text-white/25">/</span>
        <span className="text-white/70">{claim.label}</span>
      </nav>

      <ClaimHeader claim={claim} />

      <h2 className="mb-4 mt-12 font-display text-xl font-semibold text-white">
        Work this claim
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <li key={`${t.pack}/${t.tool}`}>
            <Link
              href={`/claimproof/portal/${t.pack}/${t.tool}?claim=${claim.id}`}
              className="group flex items-center gap-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#E19C63]/50 hover:bg-white/[0.05] active:scale-[0.99]"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-sm font-bold text-white transition-colors group-hover:text-[#E19C63]">
                  {t.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 font-sans text-[11px] text-[#8BA5BE]/80">
                  <IconClock className="h-3 w-3" />
                  {t.minutes}
                </span>
              </span>
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/12 text-white/40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:border-[#E19C63] group-hover:bg-[#E19C63] group-hover:text-[#27262E]">
                <IconArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
