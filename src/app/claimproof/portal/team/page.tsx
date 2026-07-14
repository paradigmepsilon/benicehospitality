import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalAccess } from "../_lib/access";
import { listWorkspaceMembers, seatsInUse, pendingInviteCount } from "@/lib/claim-proof-workspace";
import TeamManager from "../_components/TeamManager";

/**
 * Fleet team management. Owner-facing: roster, seat usage, invite + remove.
 * Non-fleet or non-owner visitors are redirected — this screen only means
 * something for a Fleet workspace owner.
 */

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const access = await getPortalAccess();
  if (!access || !access.workspace) redirect("/claimproof/portal");
  const { workspace, role } = access.workspace;

  if (workspace.tier !== "fleet" || role !== "owner") {
    redirect("/claimproof/portal");
  }

  const [members, used, pending] = await Promise.all([
    listWorkspaceMembers(workspace.id),
    seatsInUse(workspace.id),
    pendingInviteCount(workspace.id),
  ]);

  return (
    <div>
      <nav className="cp-rise mb-8 font-sans text-sm text-white/45">
        <Link href="/claimproof/portal" className="transition-colors hover:text-[#E19C63]">
          Dashboard
        </Link>
        <span className="mx-2 text-white/25">/</span>
        <span className="text-white/70">Team</span>
      </nav>

      <header className="cp-rise mb-8">
        <h1 className="mb-2 font-display text-3xl font-semibold text-white md:text-4xl">
          Your fleet team
        </h1>
        <p className="max-w-2xl font-sans text-base text-white/60">
          Everyone here shares this workspace&rsquo;s claims, tools, and logs.
          Your license covers you plus {workspace.seatLimit} teammates.
        </p>
      </header>

      <TeamManager
        initialMembers={members}
        seatLimit={workspace.seatLimit}
        initialSeatsUsed={used}
        initialPending={pending}
      />
    </div>
  );
}
