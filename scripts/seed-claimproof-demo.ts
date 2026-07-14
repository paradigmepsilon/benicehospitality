/**
 * Seed Claim Proof demo workspaces + live sessions, one per tier.
 *
 * Used to record the tier-gated portal walkthrough videos (Ticket 3, capture
 * approach A). For each tier it: upserts a verified demo user, grants an owned
 * workspace at that tier via the normal admin-grant path, and mints a real
 * user_sessions row. It prints the bnhg_session cookie value for each tier so
 * Playwright can inject it and drive the portal as that buyer.
 *
 * Idempotent: re-running reuses the same users/workspaces and just issues fresh
 * sessions. Demo-only — these accounts use @claimproof-demo.local addresses.
 *
 * Run: node --env-file=.env.local --import tsx scripts/seed-claimproof-demo.ts
 */
import { sql } from "@/lib/db";
import { createUserSession } from "@/lib/community-auth";
import { adminGrantWorkspace } from "@/lib/claim-proof-workspace";
import type { ClaimProofTier } from "@/lib/claim-proof";

const TIERS: Array<{ tier: ClaimProofTier; label: string; name: string }> = [
  { tier: "core", label: "Claim Proof Core", name: "Demo Core Owner" },
  { tier: "pro", label: "Claim Proof Complete", name: "Demo Complete Owner" },
  { tier: "fleet", label: "Claim Proof Fleet", name: "Demo Fleet Owner" },
];

async function upsertVerifiedUser(email: string, name: string): Promise<number> {
  const existing = (await sql`
    SELECT id FROM users WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1
  `) as Array<{ id: number }>;
  if (existing[0]) {
    await sql`
      UPDATE users
      SET name = ${name}, email_verified_at = NOW(), disabled_at = NULL, updated_at = NOW()
      WHERE id = ${existing[0].id}
    `;
    return existing[0].id;
  }
  const inserted = (await sql`
    INSERT INTO users (email, name, role, password_hash, email_verified_at)
    VALUES (${email.toLowerCase()}, ${name}, 'user', NULL, NOW())
    RETURNING id
  `) as Array<{ id: number }>;
  return inserted[0].id;
}

async function main() {
  console.log("Seeding Claim Proof demo workspaces + sessions...\n");
  const out: Array<Record<string, unknown>> = [];

  for (const { tier, label, name } of TIERS) {
    const email = `demo-${tier}@claimproof-demo.local`;
    const userId = await upsertVerifiedUser(email, name);
    await adminGrantWorkspace({ email, tier });

    const ws = (await sql`
      SELECT id, tier FROM cp_workspaces WHERE owner_user_id = ${userId} ORDER BY id ASC LIMIT 1
    `) as Array<{ id: number; tier: ClaimProofTier }>;

    const { sessionId, expiresAt } = await createUserSession(
      userId,
      "127.0.0.1",
      "claimproof-demo-capture",
    );

    const rec = {
      tier,
      label,
      email,
      userId,
      workspaceId: ws[0]?.id ?? null,
      workspaceTier: ws[0]?.tier ?? null,
      sessionCookie: sessionId,
      expiresAt: expiresAt.toISOString(),
    };
    out.push(rec);
    console.log(
      `  ${label.padEnd(22)} user#${userId}  ws#${rec.workspaceId} (${rec.workspaceTier})`,
    );
  }

  console.log("\n=== bnhg_session cookies (inject into Playwright) ===");
  console.log(JSON.stringify(out, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
