import { NextResponse } from "next/server";
import { getPortalAccess } from "@/app/claimproof/portal/_lib/access";
import type { WorkspaceAccess } from "@/lib/claim-proof-workspace";

/**
 * Sync-API auth guard. Every claim/data endpoint requires an ACCOUNT-based
 * workspace (legacy anonymous-token access is read-only for static tools and
 * cannot write server data). Returns either the authorized context or a ready
 * NextResponse to return immediately.
 */
export interface SyncContext {
  workspace: WorkspaceAccess["workspace"];
  role: "owner" | "member";
  userId: number;
}

export async function requireWorkspace(): Promise<
  { ctx: SyncContext } | { error: NextResponse }
> {
  const access = await getPortalAccess();
  if (!access) {
    return {
      error: NextResponse.json({ error: "Not signed in" }, { status: 401 }),
    };
  }
  if (!access.workspace || access.userId == null) {
    // Signed-in-but-no-workspace, or legacy token only. Sync needs an account.
    return {
      error: NextResponse.json(
        {
          error:
            "Claim syncing needs an account. Create one with your purchase email to track claims across devices.",
          code: "no_workspace",
        },
        { status: 403 },
      ),
    };
  }
  return {
    ctx: {
      workspace: access.workspace.workspace,
      role: access.workspace.role,
      userId: access.userId,
    },
  };
}
