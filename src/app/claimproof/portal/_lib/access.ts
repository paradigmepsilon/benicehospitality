import { cookies } from "next/headers";
import type { ClaimProofTier } from "@/lib/claim-proof";
import { readClaimProofToken } from "@/lib/claim-proof-download";
import { getCurrentSession } from "@/lib/community-auth";
import {
  getWorkspaceForUser,
  claimWorkspacesForUser,
  adminGrantWorkspace,
  tierUnlocks as wsUnlocks,
  type WorkspaceAccess,
} from "@/lib/claim-proof-workspace";

/**
 * Portal access resolution — Phase 2.
 *
 * The source of truth is now the signed-in account (bnhg_session) and its
 * Claim Proof workspace. On resolve we also lazily claim any pending purchase
 * for the user's email, so a buyer who paid before signing up is entitled the
 * instant they first reach the portal.
 *
 * The legacy anonymous delivery token (cp_access cookie) is kept ONLY as a
 * read-only bridge: it still resolves a tier so pre-Phase-2 buyers aren't
 * locked out, but it grants no workspace (no cross-device sync) until they
 * sign in. New deliveries send buyers to account creation instead.
 */

export const PORTAL_COOKIE = "cp_access"; // legacy bridge token

export type PortalTier = ClaimProofTier; // "core" | "pro" | "fleet"

export interface PortalAccess {
  tier: PortalTier;
  /** Present when the buyer is signed in and has a synced workspace. */
  workspace: WorkspaceAccess | null;
  /** How access was granted, for UI affordances. */
  via: "account" | "legacy-token";
  /** The signed-in user's id, when account-based. */
  userId: number | null;
}

/**
 * Full access record for the current request, or null when the visitor has
 * neither a workspace nor a valid legacy token.
 */
export async function getPortalAccess(): Promise<PortalAccess | null> {
  const session = await getCurrentSession();

  if (session) {
    // Safety net: convert any pending purchase to a workspace on first touch.
    try {
      await claimWorkspacesForUser(session.user.id, session.user.email);
    } catch {
      // best effort; a resolver must not throw on a claim hiccup
    }
    let ws = await getWorkspaceForUser(session.user.id);

    // Legacy-token bridge upgrade: a signed-in buyer who paid before Phase 2
    // may hold a legacy delivery token but own no workspace. Convert that
    // entitlement into a real workspace once, so cross-device sync and (for
    // fleet) the team console light up instead of silently redirecting.
    if (!ws) {
      const legacyTier = readLegacyTokenTier(await cookies());
      if (legacyTier) {
        try {
          await adminGrantWorkspace({ email: session.user.email, tier: legacyTier });
          ws = await getWorkspaceForUser(session.user.id);
        } catch {
          // best effort; never throw from the resolver
        }
      }
    }

    if (ws) {
      return {
        tier: ws.workspace.tier,
        workspace: ws,
        via: "account",
        userId: session.user.id,
      };
    }
    // Signed in but still no workspace: fall through to the legacy token check
    // so an old delivery link in the same browser at least resolves a tier.
  }

  const legacyTier = readLegacyTokenTier(await cookies());
  if (legacyTier) {
    return { tier: legacyTier, workspace: null, via: "legacy-token", userId: null };
  }

  return null;
}

/** Read the tier encoded in a legacy cp_access delivery token, if present. */
function readLegacyTokenTier(
  jar: Awaited<ReturnType<typeof cookies>>,
): PortalTier | null {
  const token = jar.get(PORTAL_COOKIE)?.value;
  if (!token) return null;
  const item = readClaimProofToken(token);
  if (item && item !== "guide") return item;
  return null;
}

/** Convenience: just the tier (or null). */
export async function getPortalTier(): Promise<PortalTier | null> {
  const access = await getPortalAccess();
  return access?.tier ?? null;
}

export function tierUnlocks(tier: PortalTier, needs: PortalTier): boolean {
  return wsUnlocks(tier, needs);
}

export const TIER_LABEL: Record<PortalTier, string> = {
  core: "Claim Proof Core",
  pro: "Claim Proof Complete",
  fleet: "Claim Proof Fleet",
};
