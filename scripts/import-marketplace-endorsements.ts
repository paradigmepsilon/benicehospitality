/**
 * Import APPROVED endorsement copy into marketplace_products.
 *
 *   node --env-file=.env.local --import tsx scripts/import-marketplace-endorsements.ts            # dry run
 *   node --env-file=.env.local --import tsx scripts/import-marketplace-endorsements.ts --apply    # write
 *
 * Reads docs/marketplace/bnhg_marketplace_endorsement_drafts.json. For each
 * entry, Della's two fields are written only when della_approved is true, and
 * Alex's only when alex_approved is true. Unapproved fields are never touched,
 * so re-running after approving a few more entries is safe.
 *
 * Refuses the whole run if any approved field still contains a [confirm: ...]
 * placeholder or an em/en dash, or is longer than the admin form allows.
 *
 * FTC Endorsement Guides: an endorsement must reflect the endorser's real use
 * and honest opinion. The approval flags are that person's sign-off; don't set
 * them on anyone's behalf.
 *
 * Builds its own Neon client (see restore-marketplace.ts for why).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { ENDORSEMENT_MAX_LENGTH } from "../src/lib/marketplace-endorsements";

interface DraftEntry {
  slug: string;
  name: string;
  della_use: string;
  della_take: string;
  alex_use: string;
  alex_take: string;
  della_approved: boolean;
  alex_approved: boolean;
}

const APPLY = process.argv.includes("--apply");
const FILE = path.join(
  process.cwd(),
  "docs/marketplace/bnhg_marketplace_endorsement_drafts.json",
);

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) fail("DATABASE_URL is not set");

  const { entries } = JSON.parse(readFileSync(FILE, "utf8")) as {
    entries: DraftEntry[];
  };

  const problems: string[] = [];
  const writes: Array<{ slug: string; set: Record<string, string> }> = [];

  for (const e of entries) {
    const set: Record<string, string> = {};
    if (e.della_approved) {
      set.della_use = e.della_use.trim();
      set.della_take = e.della_take.trim();
    }
    if (e.alex_approved) {
      set.alex_use = e.alex_use.trim();
      set.alex_take = e.alex_take.trim();
    }
    for (const [col, text] of Object.entries(set)) {
      if (text.includes("[confirm:")) problems.push(`${e.slug}.${col} still has a [confirm: ...] placeholder`);
      if (/[–—]/.test(text)) problems.push(`${e.slug}.${col} contains an em or en dash`);
      if (text.length > ENDORSEMENT_MAX_LENGTH) problems.push(`${e.slug}.${col} is over ${ENDORSEMENT_MAX_LENGTH} characters`);
    }
    if (Object.keys(set).length > 0) writes.push({ slug: e.slug, set });
  }

  if (problems.length > 0) {
    fail(`Fix these before importing:\n  ${problems.join("\n  ")}`);
  }
  if (writes.length === 0) {
    console.log("No approved entries. Nothing to import.");
    return;
  }

  const sql = neon(url);
  const existing = (await sql`SELECT slug FROM marketplace_products`) as { slug: string }[];
  const known = new Set(existing.map((r) => r.slug));
  const missing = writes.filter((w) => !known.has(w.slug)).map((w) => w.slug);
  if (missing.length > 0) fail(`Unknown slugs: ${missing.join(", ")}`);

  for (const w of writes) {
    console.log(`${APPLY ? "write" : "would write"} ${w.slug}: ${Object.keys(w.set).join(", ")}`);
    if (!APPLY) continue;
    const s = w.set;
    // COALESCE keeps a column untouched when that person didn't approve.
    await sql`
      UPDATE marketplace_products SET
        della_use = COALESCE(${s.della_use ?? null}, della_use),
        della_take = COALESCE(${s.della_take ?? null}, della_take),
        alex_use = COALESCE(${s.alex_use ?? null}, alex_use),
        alex_take = COALESCE(${s.alex_take ?? null}, alex_take),
        updated_at = NOW()
      WHERE slug = ${w.slug}
    `;
  }
  console.log(
    `${APPLY ? "✓ Imported" : "Dry run:"} ${writes.length} product(s).${APPLY ? "" : " Re-run with --apply to write."}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
