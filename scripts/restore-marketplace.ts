/**
 * Restore marketplace_products from a backup-marketplace.ts snapshot.
 *
 *   node --env-file=.env.local --import tsx scripts/restore-marketplace.ts <file>.json --dry-run
 *   node --env-file=.env.local --import tsx scripts/restore-marketplace.ts <file>.json --only=body
 *   node --env-file=.env.local --import tsx scripts/restore-marketplace.ts <file>.json
 *
 * --only=<cols> is the important one. updateProduct() in src/lib/marketplace.ts
 * rewrites every column on every PATCH, so a full-row restore would revert
 * legitimate admin edits made since the snapshot along with the mistake you are
 * trying to undo. --only=body reverts a copy rewrite and nothing else.
 *
 * Rows present in the database but absent from the backup are reported, never
 * deleted.
 *
 * Builds its own Neon client rather than importing src/lib/db.ts: that module
 * stubs sql`` to [] when DATABASE_URL is unset, and the stub has no .query().
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { MarketplaceBackup } from "./backup-marketplace";

const TABLE = "marketplace_products";
const MAX_AGE_DAYS = 30;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const file = args.find((a) => !a.startsWith("--"));
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg
  ? onlyArg
      .slice("--only=".length)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
  : null;

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function equalish(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => String(v) === String(b[i]));
  }
  if (a instanceof Date || b instanceof Date) {
    return new Date(a as string).getTime() === new Date(b as string).getTime();
  }
  return a === b || String(a ?? "") === String(b ?? "");
}

function preview(value: unknown): string {
  const s = Array.isArray(value) ? `[${value.join(" | ")}]` : String(value ?? "");
  return s.length > 70 ? `${s.slice(0, 67)}…` : s;
}

async function main() {
  if (!file) fail("Pass the backup file: restore-marketplace.ts <file>.json [--dry-run]");
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is required.");

  const sql = neon(process.env.DATABASE_URL);
  const abs = path.resolve(process.cwd(), file);
  const backup = JSON.parse(readFileSync(abs, "utf8")) as MarketplaceBackup;

  if (backup.table !== TABLE) fail(`Backup is for "${backup.table}", not "${TABLE}".`);
  if (!backup.rowCount || backup.rows.length === 0) fail("Backup contains zero rows.");
  if (backup.rows.length !== backup.rowCount) {
    fail(`Backup is inconsistent: rowCount ${backup.rowCount}, rows ${backup.rows.length}.`);
  }

  const ageDays = (Date.now() - new Date(backup.takenAt).getTime()) / 86_400_000;
  if (ageDays > MAX_AGE_DAYS && !FORCE) {
    fail(`Backup is ${Math.round(ageDays)} days old (limit ${MAX_AGE_DAYS}). Pass --force to override.`);
  }

  // Schema drift check. Restoring against a changed table would write NULLs
  // into columns the snapshot never saw.
  const liveColRows = (await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = ${TABLE}
    ORDER BY ordinal_position
  `) as Array<{ column_name: string }>;
  const liveColumns = liveColRows.map((c) => c.column_name);
  const missingInLive = backup.columns.filter((c) => !liveColumns.includes(c));
  const addedInLive = liveColumns.filter((c) => !backup.columns.includes(c));

  if (missingInLive.length > 0) {
    fail(`Backup has columns the table no longer does: ${missingInLive.join(", ")}`);
  }
  if (addedInLive.length > 0 && !ONLY && !FORCE) {
    fail(
      `Table gained columns since the backup (${addedInLive.join(", ")}). ` +
        `Use --only=<cols> to restore specific columns, or --force for a full restore.`,
    );
  }

  const targetColumns = ONLY ?? backup.columns.filter((c) => c !== "id");
  const unknown = targetColumns.filter((c) => !backup.columns.includes(c));
  if (unknown.length > 0) fail(`--only names columns not in the backup: ${unknown.join(", ")}`);
  if (targetColumns.length === 0) fail("Nothing to restore.");

  const live = (await sql`SELECT * FROM marketplace_products ORDER BY id`) as Record<
    string,
    unknown
  >[];
  const liveById = new Map(live.map((r) => [Number(r.id), r]));

  const changes: Array<{ id: number; slug: string; column: string; from: unknown; to: unknown }> = [];
  const newRows: Record<string, unknown>[] = [];

  for (const row of backup.rows) {
    const id = Number(row.id);
    const current = liveById.get(id);
    if (!current) {
      newRows.push(row);
      continue;
    }
    for (const col of targetColumns) {
      if (!equalish(current[col], row[col])) {
        changes.push({ id, slug: String(row.slug), column: col, from: current[col], to: row[col] });
      }
    }
  }

  const backupIds = new Set(backup.rows.map((r) => Number(r.id)));
  const orphans = live.filter((r) => !backupIds.has(Number(r.id)));

  console.log(`Backup   ${path.relative(process.cwd(), abs)}`);
  console.log(`Taken    ${backup.takenAt} from ${backup.databaseHost} (${backup.rowCount} rows)`);
  console.log(`Columns  ${targetColumns.join(", ")}`);
  console.log("");

  if (changes.length === 0 && newRows.length === 0) {
    console.log("✓ Live data already matches the backup for these columns. Nothing to do.");
    if (orphans.length > 0) {
      console.log(`\n${orphans.length} row(s) exist live but not in the backup (left untouched):`);
      for (const o of orphans) console.log(`  id ${o.id}  ${o.slug}`);
    }
    return;
  }

  for (const c of changes) {
    console.log(`  id ${String(c.id).padEnd(4)} ${c.slug}`);
    console.log(`    ${c.column}`);
    console.log(`      now → ${preview(c.from)}`);
    console.log(`      bak → ${preview(c.to)}`);
  }
  for (const r of newRows) {
    console.log(`  id ${String(r.id).padEnd(4)} ${r.slug}  (missing live — will be reinserted)`);
  }

  console.log("");
  console.log(
    `${changes.length} column change(s) across ${new Set(changes.map((c) => c.id)).size} row(s), ` +
      `${newRows.length} row(s) to reinsert.`,
  );
  if (orphans.length > 0) {
    console.log(`${orphans.length} live row(s) absent from the backup — reported, never deleted:`);
    for (const o of orphans) console.log(`  id ${o.id}  ${o.slug}`);
  }

  if (DRY_RUN) {
    console.log("\n[dry-run] Nothing written. Re-run without --dry-run to apply.");
    return;
  }

  // Parameterized per row. Column names come from the backup's own
  // information_schema list, validated above, so they cannot be injected.
  let updated = 0;
  const touched = new Set(changes.map((c) => c.id));
  for (const id of touched) {
    const row = backup.rows.find((r) => Number(r.id) === id)!;
    const sets = targetColumns.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
    const params = targetColumns.map((c) => row[c] ?? null);
    params.push(id);
    await sql.query(
      `UPDATE ${TABLE} SET ${sets}, updated_at = NOW() WHERE id = $${targetColumns.length + 1}`,
      params,
    );
    updated++;
  }

  let reinserted = 0;
  for (const row of newRows) {
    const cols = backup.columns;
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const updates = cols.filter((c) => c !== "id").map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");
    await sql.query(
      `INSERT INTO ${TABLE} (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${updates}`,
      cols.map((c) => row[c] ?? null),
    );
    reinserted++;
  }

  // A reinsert of previously-deleted ids leaves SERIAL behind, and the next
  // admin create then collides on the primary key.
  if (reinserted > 0) {
    await sql`
      SELECT setval(pg_get_serial_sequence('marketplace_products','id'),
                    (SELECT max(id) FROM marketplace_products))
    `;
  }

  console.log(`\n✓ ${updated} row(s) updated, ${reinserted} reinserted.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
