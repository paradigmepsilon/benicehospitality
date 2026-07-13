import { randomBytes, createHash } from "node:crypto";
import { sql } from "@/lib/db";
import type { ClaimProofTier } from "@/lib/claim-proof";

/**
 * Claim Proof — Command Center Phase 2 workspace layer.
 *
 * A WORKSPACE owns claims and holds the purchased tier. Solo buyers get a
 * one-member workspace; Fleet buyers get up to 5 additional invited members
 * who share the workspace's claims. Everything here is server-side and keyed
 * to real user accounts (the users/user_sessions system), so a buyer's claims
 * follow them across every device they sign in on.
 *
 * Tier -> seat model:
 *   core  -> 0 extra seats (solo)
 *   pro   -> 0 extra seats (solo)
 *   fleet -> 5 extra seats (team)
 */

const TIER_RANK: Record<ClaimProofTier, number> = { core: 0, pro: 1, fleet: 2 };
const INVITE_TTL_DAYS = 14;

/** Additional members allowed beyond the owner, by tier. */
export function seatLimitForTier(tier: ClaimProofTier): number {
  return tier === "fleet" ? 5 : 0;
}

export function tierUnlocks(tier: ClaimProofTier, needs: ClaimProofTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[needs];
}

export interface Workspace {
  id: number;
  ownerUserId: number;
  tier: ClaimProofTier;
  name: string;
  seatLimit: number;
}

export interface WorkspaceAccess {
  workspace: Workspace;
  /** The requesting user's role in this workspace. */
  role: "owner" | "member";
}

interface WorkspaceRow {
  id: number;
  owner_user_id: number;
  tier: ClaimProofTier;
  name: string;
  seat_limit: number;
}

function rowToWorkspace(r: WorkspaceRow): Workspace {
  return {
    id: r.id,
    ownerUserId: r.owner_user_id,
    tier: r.tier,
    name: r.name,
    seatLimit: r.seat_limit,
  };
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// ---------------------------------------------------------------------------
// Provisioning (called from the Stripe webhook and from signup claiming)
// ---------------------------------------------------------------------------

/**
 * Attach a purchased tier to a workspace by purchase email, BEFORE the buyer
 * has necessarily created their account.
 *
 * - If a user already exists for the email, provision/upgrade their workspace
 *   immediately and mark them owner.
 * - Otherwise, park an owner-less workspace keyed by purchase_email; it is
 *   claimed when that email signs up (see claimWorkspacesForUser).
 *
 * Idempotent on stripe_session_id so a webhook replay never double-provisions.
 */
export async function provisionWorkspaceForPurchase(args: {
  email: string;
  tier: ClaimProofTier;
  stripeSessionId: string | null;
}): Promise<void> {
  const email = args.email.trim().toLowerCase();
  const seatLimit = seatLimitForTier(args.tier);

  // Replay guard: this exact checkout already provisioned a workspace.
  if (args.stripeSessionId) {
    const seen = (await sql`
      SELECT id FROM cp_workspaces WHERE stripe_session_id = ${args.stripeSessionId} LIMIT 1
    `) as Array<{ id: number }>;
    if (seen[0]) {
      await upgradeWorkspaceTier(seen[0].id, args.tier);
      return;
    }
  }

  // Does a user with this email already exist? If so, provision against them.
  const users = (await sql`
    SELECT id FROM users WHERE LOWER(email) = ${email} LIMIT 1
  `) as Array<{ id: number }>;
  const userId = users[0]?.id ?? null;

  if (userId) {
    // Existing user: reuse their owned workspace if any, else create one.
    const owned = (await sql`
      SELECT id, tier FROM cp_workspaces WHERE owner_user_id = ${userId}
      ORDER BY id ASC LIMIT 1
    `) as Array<{ id: number; tier: ClaimProofTier }>;
    if (owned[0]) {
      await upgradeWorkspaceTier(owned[0].id, args.tier);
      if (args.stripeSessionId) {
        await sql`
          UPDATE cp_workspaces SET stripe_session_id = ${args.stripeSessionId}, updated_at = NOW()
          WHERE id = ${owned[0].id} AND stripe_session_id IS NULL
        `;
      }
      return;
    }
    const created = (await sql`
      INSERT INTO cp_workspaces (owner_user_id, tier, seat_limit, purchase_email, stripe_session_id)
      VALUES (${userId}, ${args.tier}, ${seatLimit}, ${email}, ${args.stripeSessionId})
      RETURNING id
    `) as Array<{ id: number }>;
    await sql`
      INSERT INTO cp_workspace_members (workspace_id, user_id, role)
      VALUES (${created[0].id}, ${userId}, 'owner')
      ON CONFLICT (workspace_id, user_id) DO NOTHING
    `;
    return;
  }

  // No user yet: the workspace's owner_user_id is NOT NULL, so we can't create
  // the workspace until the buyer signs up. Park the entitlement on the email
  // in cp_pending_purchases; claimWorkspacesForUser() turns it into a real
  // owned workspace the moment that email creates an account.
  await sql`
    INSERT INTO cp_pending_purchases (email, tier, stripe_session_id)
    VALUES (${email}, ${args.tier}, ${args.stripeSessionId})
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;
}

/** Raise a workspace's tier (never lowers it) and adjust its seat limit. */
export async function upgradeWorkspaceTier(
  workspaceId: number,
  tier: ClaimProofTier,
): Promise<void> {
  const rows = (await sql`
    SELECT tier FROM cp_workspaces WHERE id = ${workspaceId} LIMIT 1
  `) as Array<{ tier: ClaimProofTier }>;
  const current = rows[0]?.tier;
  if (!current) return;
  // Only move up the ladder; a re-purchase of a lower tier never downgrades.
  const next = TIER_RANK[tier] > TIER_RANK[current] ? tier : current;
  await sql`
    UPDATE cp_workspaces
    SET tier = ${next}, seat_limit = ${seatLimitForTier(next)}, updated_at = NOW()
    WHERE id = ${workspaceId}
  `;
}

/**
 * On signup / first login, turn any pending purchases for this user's email
 * into a real owned workspace. Called from the auth flow after a user row
 * exists. Safe to call repeatedly.
 */
export async function claimWorkspacesForUser(
  userId: number,
  email: string,
): Promise<void> {
  const lc = email.trim().toLowerCase();
  const pending = (await sql`
    SELECT id, tier, stripe_session_id FROM cp_pending_purchases
    WHERE LOWER(email) = ${lc} AND claimed_at IS NULL
    ORDER BY id ASC
  `) as Array<{ id: number; tier: ClaimProofTier; stripe_session_id: string | null }>;

  if (pending.length === 0) return;

  // Highest tier among pending purchases wins as the workspace tier.
  let bestTier: ClaimProofTier = "core";
  for (const p of pending) {
    if (TIER_RANK[p.tier] > TIER_RANK[bestTier]) bestTier = p.tier;
  }

  // Find or create the user's owned workspace.
  const owned = (await sql`
    SELECT id FROM cp_workspaces WHERE owner_user_id = ${userId} ORDER BY id ASC LIMIT 1
  `) as Array<{ id: number }>;
  let workspaceId: number;
  if (owned[0]) {
    workspaceId = owned[0].id;
    await upgradeWorkspaceTier(workspaceId, bestTier);
  } else {
    const firstSession = pending.find((p) => p.stripe_session_id)?.stripe_session_id ?? null;
    const created = (await sql`
      INSERT INTO cp_workspaces (owner_user_id, tier, seat_limit, purchase_email, stripe_session_id)
      VALUES (${userId}, ${bestTier}, ${seatLimitForTier(bestTier)}, ${lc}, ${firstSession})
      RETURNING id
    `) as Array<{ id: number }>;
    workspaceId = created[0].id;
    await sql`
      INSERT INTO cp_workspace_members (workspace_id, user_id, role)
      VALUES (${workspaceId}, ${userId}, 'owner')
      ON CONFLICT (workspace_id, user_id) DO NOTHING
    `;
  }

  await sql`
    UPDATE cp_pending_purchases SET claimed_at = NOW()
    WHERE LOWER(email) = ${lc} AND claimed_at IS NULL
  `;
}

// ---------------------------------------------------------------------------
// Access resolution (called on every portal request)
// ---------------------------------------------------------------------------

/**
 * Resolve the workspace a signed-in user can act in, plus their role. Returns
 * null when the user has no Claim Proof workspace (never purchased, or a
 * pending purchase not yet claimed). Owner membership is preferred; if the
 * user is only a member of someone else's fleet workspace, that is returned.
 */
export async function getWorkspaceForUser(
  userId: number,
): Promise<WorkspaceAccess | null> {
  const rows = (await sql`
    SELECT w.id, w.owner_user_id, w.tier, w.name, w.seat_limit, m.role
    FROM cp_workspace_members m
    JOIN cp_workspaces w ON w.id = m.workspace_id
    WHERE m.user_id = ${userId}
    ORDER BY (m.role = 'owner') DESC, w.id ASC
    LIMIT 1
  `) as Array<WorkspaceRow & { role: "owner" | "member" }>;
  const row = rows[0];
  if (!row) return null;
  return { workspace: rowToWorkspace(row), role: row.role };
}

/**
 * Whether an email is ENTITLED to a Claim Proof account. Signup is not open to
 * the public: an account is only created for someone who bought Claim Proof
 * (pending purchase, or an existing workspace on that email) or who was invited
 * to a fleet workspace (a live, unaccepted invite). Everyone else is blocked.
 *
 * Case-insensitive on email. `reason` lets the caller tailor guidance.
 */
export async function claimProofEntitlementForEmail(
  email: string,
): Promise<{ entitled: boolean; reason: "purchase" | "invite" | null }> {
  const lc = email.trim().toLowerCase();
  if (!lc) return { entitled: false, reason: null };

  // Bought it: an unclaimed pending purchase, OR a workspace already keyed to
  // this purchase email, OR they already own/belong to a workspace by account.
  const purchase = (await sql`
    SELECT 1 AS ok FROM cp_pending_purchases WHERE LOWER(email) = ${lc} AND claimed_at IS NULL
    UNION ALL
    SELECT 1 FROM cp_workspaces WHERE LOWER(purchase_email) = ${lc}
    UNION ALL
    SELECT 1 FROM cp_workspace_members m JOIN users u ON u.id = m.user_id WHERE LOWER(u.email) = ${lc}
    LIMIT 1
  `) as Array<{ ok: number }>;
  if (purchase.length > 0) return { entitled: true, reason: "purchase" };

  // Invited: a live (unaccepted, unrevoked, unexpired) fleet invite.
  const invite = (await sql`
    SELECT 1 AS ok FROM cp_invites
    WHERE LOWER(email) = ${lc}
      AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
    LIMIT 1
  `) as Array<{ ok: number }>;
  if (invite.length > 0) return { entitled: true, reason: "invite" };

  return { entitled: false, reason: null };
}

/**
 * The most relevant Claim Proof purchase for an email, used to re-send access.
 * Prefers a real paid, non-refunded purchase; falls back to a provisioned
 * workspace, then a still-pending purchase. Returns null if the email never
 * bought (callers should still respond generically to avoid enumeration).
 */
export async function claimProofPurchaseForEmail(
  email: string,
): Promise<{ tier: ClaimProofTier; stripeSessionId: string | null } | null> {
  const lc = email.trim().toLowerCase();
  if (!lc) return null;

  const paid = (await sql`
    SELECT tier, stripe_session_id
    FROM claimproof_purchases
    WHERE LOWER(email) = ${lc} AND status = 'paid' AND refunded_at IS NULL
    ORDER BY purchased_at DESC
    LIMIT 1
  `) as Array<{ tier: ClaimProofTier; stripe_session_id: string | null }>;
  if (paid[0]) return { tier: paid[0].tier, stripeSessionId: paid[0].stripe_session_id };

  const ws = (await sql`
    SELECT tier, stripe_session_id
    FROM cp_workspaces
    WHERE LOWER(purchase_email) = ${lc}
    ORDER BY id DESC
    LIMIT 1
  `) as Array<{ tier: ClaimProofTier; stripe_session_id: string | null }>;
  if (ws[0]) return { tier: ws[0].tier, stripeSessionId: ws[0].stripe_session_id };

  const pending = (await sql`
    SELECT tier, stripe_session_id
    FROM cp_pending_purchases
    WHERE LOWER(email) = ${lc} AND claimed_at IS NULL
    ORDER BY id DESC
    LIMIT 1
  `) as Array<{ tier: ClaimProofTier; stripe_session_id: string | null }>;
  if (pending[0])
    return { tier: pending[0].tier, stripeSessionId: pending[0].stripe_session_id };

  return null;
}

/** True if the user is a member (any role) of the workspace. */
export async function userInWorkspace(
  userId: number,
  workspaceId: number,
): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 AS ok FROM cp_workspace_members
    WHERE user_id = ${userId} AND workspace_id = ${workspaceId} LIMIT 1
  `) as Array<{ ok: number }>;
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Fleet seats
// ---------------------------------------------------------------------------

export interface Member {
  userId: number;
  email: string;
  name: string;
  role: "owner" | "member";
  /** True when the underlying account is disabled (users.disabled_at set). */
  suspended: boolean;
}

export async function listWorkspaceMembers(
  workspaceId: number,
): Promise<Member[]> {
  const rows = (await sql`
    SELECT u.id AS user_id, u.email, u.name, m.role,
           (u.disabled_at IS NOT NULL) AS suspended
    FROM cp_workspace_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.workspace_id = ${workspaceId}
    ORDER BY (m.role = 'owner') DESC, u.name ASC
  `) as Array<{
    user_id: number;
    email: string;
    name: string;
    role: "owner" | "member";
    suspended: boolean;
  }>;
  return rows.map((r) => ({
    userId: r.user_id,
    email: r.email,
    name: r.name,
    role: r.role,
    suspended: r.suspended,
  }));
}

/** Current additional-member count (excludes the owner). */
export async function seatsInUse(workspaceId: number): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int AS n FROM cp_workspace_members
    WHERE workspace_id = ${workspaceId} AND role = 'member'
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

/** Pending (unaccepted, unexpired) invite count. */
export async function pendingInviteCount(workspaceId: number): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int AS n FROM cp_invites
    WHERE workspace_id = ${workspaceId}
      AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

export class SeatLimitReachedError extends Error {
  constructor() {
    super("seat_limit_reached");
    this.name = "SeatLimitReachedError";
  }
}

/**
 * Create a seat invite for a Fleet workspace. Enforces the seat cap counting
 * both filled seats and outstanding invites, so you cannot over-invite.
 * Returns the raw token (goes in the invite email link).
 */
export async function createInvite(args: {
  workspaceId: number;
  email: string;
  invitedByUserId: number;
}): Promise<{ rawToken: string; expiresAt: Date }> {
  const ws = (await sql`
    SELECT seat_limit FROM cp_workspaces WHERE id = ${args.workspaceId} LIMIT 1
  `) as Array<{ seat_limit: number }>;
  const limit = ws[0]?.seat_limit ?? 0;
  const used = await seatsInUse(args.workspaceId);
  const pending = await pendingInviteCount(args.workspaceId);
  if (used + pending >= limit) throw new SeatLimitReachedError();

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400000);
  const email = args.email.trim().toLowerCase();

  // Supersede any prior pending invite to the same email in this workspace.
  await sql`
    UPDATE cp_invites SET revoked_at = NOW()
    WHERE workspace_id = ${args.workspaceId} AND LOWER(email) = ${email}
      AND accepted_at IS NULL AND revoked_at IS NULL
  `;
  await sql`
    INSERT INTO cp_invites (workspace_id, email, token_hash, invited_by_user_id, expires_at)
    VALUES (${args.workspaceId}, ${email}, ${tokenHash}, ${args.invitedByUserId}, ${expiresAt.toISOString()})
  `;
  return { rawToken, expiresAt };
}

export interface InviteInfo {
  workspaceId: number;
  email: string;
  workspaceName: string;
}

/** Look up a pending invite by its raw token, or null if invalid/expired. */
export async function getInviteByToken(rawToken: string): Promise<InviteInfo | null> {
  const tokenHash = hashToken(rawToken);
  const rows = (await sql`
    SELECT i.workspace_id, i.email, w.name AS workspace_name
    FROM cp_invites i JOIN cp_workspaces w ON w.id = i.workspace_id
    WHERE i.token_hash = ${tokenHash}
      AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at > NOW()
    LIMIT 1
  `) as Array<{ workspace_id: number; email: string; workspace_name: string }>;
  const row = rows[0];
  if (!row) return null;
  return {
    workspaceId: row.workspace_id,
    email: row.email,
    workspaceName: row.workspace_name,
  };
}

/**
 * Accept an invite: add the user as a member (re-checking the seat cap at
 * accept time so two invites racing to the last seat can't both land) and mark
 * the invite accepted. Returns the workspace id joined, or throws.
 */
export async function acceptInvite(
  rawToken: string,
  userId: number,
): Promise<number> {
  const info = await getInviteByToken(rawToken);
  if (!info) throw new Error("invite_invalid");

  const ws = (await sql`
    SELECT seat_limit FROM cp_workspaces WHERE id = ${info.workspaceId} LIMIT 1
  `) as Array<{ seat_limit: number }>;
  const alreadyMember = await userInWorkspace(userId, info.workspaceId);
  if (!alreadyMember) {
    const used = await seatsInUse(info.workspaceId);
    if (used >= (ws[0]?.seat_limit ?? 0)) throw new SeatLimitReachedError();
    await sql`
      INSERT INTO cp_workspace_members (workspace_id, user_id, role)
      VALUES (${info.workspaceId}, ${userId}, 'member')
      ON CONFLICT (workspace_id, user_id) DO NOTHING
    `;
  }
  await sql`
    UPDATE cp_invites SET accepted_at = NOW()
    WHERE token_hash = ${hashToken(rawToken)} AND accepted_at IS NULL
  `;
  return info.workspaceId;
}

/** Remove a member from a fleet workspace (owner action). Never removes owner. */
export async function removeMember(
  workspaceId: number,
  memberUserId: number,
): Promise<void> {
  await sql`
    DELETE FROM cp_workspace_members
    WHERE workspace_id = ${workspaceId} AND user_id = ${memberUserId} AND role = 'member'
  `;
}

// ---------------------------------------------------------------------------
// Member profile administration (Fleet owner console)
//
// An owner can edit the accounts of the MEMBERS in their workspace: name,
// login email, suspend/reactivate, and trigger a password-reset email. The
// owner's own row is never editable through these (guarded by role='member'),
// so an owner can't accidentally lock or rename themselves out of the console.
// ---------------------------------------------------------------------------

export class MemberNotFoundError extends Error {
  constructor() {
    super("member_not_found");
    this.name = "MemberNotFoundError";
  }
}

export class EmailTakenError extends Error {
  constructor() {
    super("email_taken");
    this.name = "EmailTakenError";
  }
}

/** Confirm a user is an editable MEMBER (not the owner) of this workspace. */
async function assertEditableMember(
  workspaceId: number,
  memberUserId: number,
): Promise<void> {
  const rows = (await sql`
    SELECT 1 AS ok FROM cp_workspace_members
    WHERE workspace_id = ${workspaceId} AND user_id = ${memberUserId} AND role = 'member'
    LIMIT 1
  `) as Array<{ ok: number }>;
  if (rows.length === 0) throw new MemberNotFoundError();
}

/** Rename a member's account. */
export async function updateMemberName(
  workspaceId: number,
  memberUserId: number,
  name: string,
): Promise<void> {
  await assertEditableMember(workspaceId, memberUserId);
  const clean = name.trim().slice(0, 120);
  if (!clean) return;
  await sql`UPDATE users SET name = ${clean}, updated_at = NOW() WHERE id = ${memberUserId}`;
}

/** Change a member's login email. Rejects if the email is already in use. */
export async function updateMemberEmail(
  workspaceId: number,
  memberUserId: number,
  email: string,
): Promise<void> {
  await assertEditableMember(workspaceId, memberUserId);
  const clean = email.trim().toLowerCase();
  if (!clean) return;
  const clash = (await sql`
    SELECT id FROM users WHERE LOWER(email) = ${clean} AND id <> ${memberUserId} LIMIT 1
  `) as Array<{ id: number }>;
  if (clash[0]) throw new EmailTakenError();
  await sql`UPDATE users SET email = ${clean}, updated_at = NOW() WHERE id = ${memberUserId}`;
}

/** Suspend (disable) or reactivate a member's account. */
export async function setMemberSuspended(
  workspaceId: number,
  memberUserId: number,
  suspended: boolean,
): Promise<void> {
  await assertEditableMember(workspaceId, memberUserId);
  if (suspended) {
    await sql`UPDATE users SET disabled_at = NOW(), updated_at = NOW() WHERE id = ${memberUserId}`;
    // Kill any live sessions so the suspension takes effect immediately.
    await sql`UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ${memberUserId} AND revoked_at IS NULL`;
  } else {
    await sql`UPDATE users SET disabled_at = NULL, updated_at = NOW() WHERE id = ${memberUserId}`;
  }
}

/** The member's email + name, for issuing a password-reset email to them. */
export async function getMemberContact(
  workspaceId: number,
  memberUserId: number,
): Promise<{ email: string; name: string }> {
  await assertEditableMember(workspaceId, memberUserId);
  const rows = (await sql`
    SELECT email, name FROM users WHERE id = ${memberUserId} LIMIT 1
  `) as Array<{ email: string; name: string }>;
  if (!rows[0]) throw new MemberNotFoundError();
  return rows[0];
}

// ---------------------------------------------------------------------------
// Admin grant (BNHG site admin, outside the Stripe flow)
//
// Lets an admin provision a Claim Proof workspace for any email without a
// Stripe event — used to heal a missing purchase or to seed a real fleet
// owner. Reuses provisionWorkspaceForPurchase, so it is idempotent and will
// upgrade (never downgrade) an existing workspace.
// ---------------------------------------------------------------------------

export async function adminGrantWorkspace(args: {
  email: string;
  tier: ClaimProofTier;
}): Promise<{ workspaceId: number | null; pending: boolean }> {
  await provisionWorkspaceForPurchase({
    email: args.email,
    tier: args.tier,
    stripeSessionId: null,
  });
  // If the email belongs to an existing user, they now own a workspace.
  const users = (await sql`
    SELECT id FROM users WHERE LOWER(email) = ${args.email.trim().toLowerCase()} LIMIT 1
  `) as Array<{ id: number }>;
  if (!users[0]) return { workspaceId: null, pending: true };
  const ws = (await sql`
    SELECT id FROM cp_workspaces WHERE owner_user_id = ${users[0].id} ORDER BY id ASC LIMIT 1
  `) as Array<{ id: number }>;
  return { workspaceId: ws[0]?.id ?? null, pending: !ws[0] };
}
