// Assertions for the resource shelf: which tools land on a member's dashboard,
// and when.
//
// Two halves. The first is pure and runs anywhere. The second needs a database
// and only runs when DATABASE_URL is set, because the interesting part of
// shelveResourceTool is SQL — the CTE that reports whether a row was ALREADY on
// the shelf before the upsert touched it. RETURNING cannot answer that, so it
// is exactly the kind of thing a typecheck will never catch.
//
//   npm run smoke:shelf                          # pure checks only
//   node --env-file=.env.local --import tsx \
//     scripts/smoke/resource-shelf.ts            # + live database checks
//
// The live half writes to one synthetic row keyed by a slug that is not in the
// registry, under a user id that does not exist, so it cannot collide with a
// real member. It cleans up after itself and skips entirely if it cannot make
// its own fixture.

import {
  RESOURCE_TOOLS,
  RESOURCE_TOOL_SLUGS,
} from "../../src/lib/resources/registry";

let failures = 0;
let checks = 0;

function ok(label: string, cond: boolean, detail?: string) {
  checks += 1;
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${label}${detail ? `\n      ${detail}` : ""}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

// ------------------------------------------------------------ registry gates

section("Persistence flags");
{
  const all = Object.values(RESOURCE_TOOLS);
  const kinds = { none: 0, blob: 0, analyses: 0 };
  for (const t of all) kinds[t.persistence] += 1;

  ok(
    "every registered tool declares a persistence kind",
    all.every((t) => ["none", "blob", "analyses"].includes(t.persistence)),
    all.filter((t) => !t.persistence).map((t) => t.slug).join(", "),
  );
  ok(
    "the registry and the slug set agree",
    all.length === RESOURCE_TOOL_SLUGS.size,
    `${all.length} tools, ${RESOURCE_TOOL_SLUGS.size} slugs`,
  );
  ok(
    "at least one tool of each kind exists",
    kinds.none > 0 && kinds.blob > 0 && kinds.analyses > 0,
    JSON.stringify(kinds),
  );

  // The gate that decides open-vs-first-edit. If a stateful tool ever slipped
  // into "none" it would silently go back to shelving on open, which is the
  // behaviour this whole change exists to remove — and nothing else would fail.
  ok(
    "the breakeven worksheet is the analyses tool",
    RESOURCE_TOOLS["breakeven-analysis-worksheet"]?.persistence === "analyses",
  );
  for (const slug of [
    "co-living-profit-calculator",
    "contractor-rolodex",
    "maintenance-tracker",
    "market-demand-worksheet",
    "nicelisting-ai",
    "photo-shot-list",
    "room-rental-setup-checklist",
    "supply-inventory-tracker",
    "tenant-tracker",
  ]) {
    ok(
      `${slug} waits for a real edit`,
      RESOURCE_TOOLS[slug]?.persistence === "blob",
      `got ${RESOURCE_TOOLS[slug]?.persistence}`,
    );
  }
  for (const slug of [
    "guest-message-templates",
    "legal-toolkit",
    "room-rental-agreement",
    "social-posting-calendar",
    "target-audience-matrix",
    "upsell-playbook",
  ]) {
    ok(
      `${slug} shelves on open`,
      RESOURCE_TOOLS[slug]?.persistence === "none",
      `got ${RESOURCE_TOOLS[slug]?.persistence}`,
    );
  }
}

// ------------------------------------------------------------- live database

async function liveChecks() {
  if (!process.env.DATABASE_URL) {
    console.log("\nDatabase checks SKIPPED (no DATABASE_URL).");
    console.log("  Run with: node --env-file=.env.local --import tsx scripts/smoke/resource-shelf.ts");
    return;
  }

  const { sql } = await import("../../src/lib/db");

  section("shelveResourceTool (live)");

  // A user of our own, so nothing here can touch a real member's shelf. The
  // slug is deliberately NOT in the registry — shelveResourceTool would refuse
  // it — so the SQL is exercised directly, which is the part under test.
  const email = `smoke-shelf-${Date.now()}@example.invalid`;
  let userId: number | null = null;
  const SLUG = "smoke-shelf-tool";

  try {
    const created = (await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (${email}, 'Smoke Test', 'x', 'user')
      RETURNING id
    `) as Array<{ id: number }>;
    userId = created[0]?.id ?? null;
  } catch (err) {
    console.log(`  … could not create a fixture user, skipping: ${String(err).slice(0, 120)}`);
    return;
  }
  if (userId === null) {
    console.log("  … no fixture user, skipping");
    return;
  }

  /** The exact statement shelveResourceTool runs. */
  async function shelve(source: string) {
    const rows = (await sql`
      WITH prev AS (
        SELECT saved_at
        FROM saved_resource_tools
        WHERE user_id = ${userId} AND tool_slug = ${SLUG}
      )
      INSERT INTO saved_resource_tools (user_id, tool_slug, source, last_opened_at, saved_at)
      VALUES (${userId}, ${SLUG}, ${source}, NOW(), NOW())
      ON CONFLICT (user_id, tool_slug)
      DO UPDATE SET
        saved_at = COALESCE(saved_resource_tools.saved_at, NOW()),
        last_opened_at = NOW()
      RETURNING (xmax = 0) AS inserted,
                (SELECT saved_at FROM prev) IS NULL AS newly_shelved
    `) as Array<{ inserted: boolean; newly_shelved: boolean }>;
    return rows[0];
  }

  async function savedAt() {
    const rows = (await sql`
      SELECT saved_at, source FROM saved_resource_tools
      WHERE user_id = ${userId} AND tool_slug = ${SLUG}
    `) as Array<{ saved_at: string | null; source: string }>;
    return rows[0] ?? null;
  }

  try {
    const first = await shelve("auto-use");
    ok("first use reports inserted", first?.inserted === true);
    ok("first use reports newly shelved", first?.newly_shelved === true);
    ok("the row is on the shelf", (await savedAt())?.saved_at !== null);

    const second = await shelve("auto-use");
    ok("a second edit does not report inserted", second?.inserted === false);
    ok(
      "a second edit does not report newly shelved",
      second?.newly_shelved === false,
      "this is what stops the CRM lead and the analytics event re-firing",
    );

    // source must survive: a tool the member explicitly bookmarked stays
    // 'manual' no matter how many times they edit it afterwards.
    await sql`
      UPDATE saved_resource_tools SET source = 'manual'
      WHERE user_id = ${userId} AND tool_slug = ${SLUG}
    `;
    await shelve("auto-use");
    ok("an explicit save is not relabelled by later edits", (await savedAt())?.source === "manual");

    // Removal, then use again. Alex's call: a removal is temporary.
    await sql`
      UPDATE saved_resource_tools SET saved_at = NULL
      WHERE user_id = ${userId} AND tool_slug = ${SLUG}
    `;
    ok("removal clears saved_at without deleting the row", (await savedAt())?.saved_at === null);

    const third = await shelve("auto-use");
    ok("using it again puts it back", (await savedAt())?.saved_at !== null);
    ok("the re-shelve is not an insert", third?.inserted === false);
    ok(
      "but it IS newly shelved again",
      third?.newly_shelved === true,
      "the CTE reads the pre-update row; RETURNING alone always says false here",
    );
  } finally {
    // ON DELETE CASCADE takes the shelf row with it.
    await sql`DELETE FROM users WHERE id = ${userId}`;
    const left = (await sql`
      SELECT COUNT(*)::int AS n FROM saved_resource_tools WHERE user_id = ${userId}
    `) as Array<{ n: number }>;
    ok("fixture cleaned up", left[0]?.n === 0);
  }
}

// Wrapped rather than top-level await: tsx transpiles these scripts to CJS,
// which does not support it. Same shape as scripts/smoke/planner-projection.ts.
async function main() {
  await liveChecks();

  console.log(
    `\n${failures === 0 ? "PASS" : "FAIL"} — ${checks - failures}/${checks} checks passed`,
  );
  if (failures > 0) process.exit(1);
}

void main();
