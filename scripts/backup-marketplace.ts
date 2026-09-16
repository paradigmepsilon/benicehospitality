/**
 * Snapshot marketplace_products to a committed JSON file.
 *
 * Taken before any bulk write to the catalog (copy rewrites, category
 * backfills, position renumbers). Pair with restore-marketplace.ts, which can
 * revert a single column via --only=body so a copy revert does not clobber
 * unrelated admin edits made since the snapshot.
 *
 *   npm run marketplace:backup
 *   node --env-file=.env.local --import tsx scripts/backup-marketplace.ts
 *
 * Writes backups/marketplace_products/<ISO>.json plus a .sql sidecar of plain
 * upserts, so a restore is possible by pasting into the Neon console even if
 * the restore script itself is broken.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { sql } from "../src/lib/db";

const TABLE = "marketplace_products";
const OUT_DIR = path.join(process.cwd(), "backups", TABLE);

export interface MarketplaceBackup {
  takenAt: string;
  databaseHost: string;
  table: string;
  rowCount: number;
  /** From information_schema, so restore can detect schema drift. */
  columns: string[];
  /** Raw SELECT * rows, snake_case. Deliberately not mapped through
   *  rowToProduct() — a backup routed through the TS type can only restore the
   *  columns today's code knows about. */
  rows: Record<string, unknown>[];
  sha256: string;
}

/** Host only. Never write the connection string — it carries credentials. */
function databaseHost(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) return "unknown";
  try {
    return new URL(raw).host;
  } catch {
    return "unparseable";
  }
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (Array.isArray(value)) {
    const inner = value
      .map((v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
      .join(",");
    return `'{${inner.replace(/'/g, "''")}}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Plain upserts, one per row. The 2am fallback if the restore script fails. */
function toSqlSidecar(columns: string[], rows: Record<string, unknown>[]): string {
  const cols = columns.map((c) => `"${c}"`).join(", ");
  const updates = columns
    .filter((c) => c !== "id")
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(", ");
  const header = [
    `-- ${TABLE} snapshot, ${rows.length} rows`,
    `-- Paste into the Neon SQL editor to restore. Safe to re-run.`,
    "",
  ].join("\n");
  const statements = rows.map((row) => {
    const values = columns.map((c) => sqlLiteral(row[c])).join(", ");
    return `INSERT INTO ${TABLE} (${cols}) VALUES (${values})\n  ON CONFLICT (id) DO UPDATE SET ${updates};`;
  });
  const reseed = `\n-- Keep SERIAL ahead of restored ids, or the next admin create collides.\nSELECT setval(pg_get_serial_sequence('${TABLE}','id'), (SELECT max(id) FROM ${TABLE}));\n`;
  return `${header}${statements.join("\n")}\n${reseed}`;
}

async function main() {
  // src/lib/db.ts silently stubs sql`` to [] when DATABASE_URL is unset. For a
  // backup that is the worst possible failure: it would write a zero-row file
  // and report success. Note `vercel env pull` leaves DATABASE_URL empty
  // (it's a sensitive var); supply it explicitly.
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required — a backup without it would silently write zero rows.");
    process.exit(1);
  }

  const columnRows = (await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = ${TABLE}
    ORDER BY ordinal_position
  `) as Array<{ column_name: string }>;
  const columns = columnRows.map((c) => c.column_name);

  if (columns.length === 0) {
    console.error(`Table ${TABLE} not found. Run npm run db:migrate first.`);
    process.exit(1);
  }

  const rows = (await sql`
    SELECT * FROM marketplace_products ORDER BY id
  `) as Record<string, unknown>[];

  if (rows.length === 0) {
    console.error("Refusing to write an empty backup — 0 rows returned.");
    process.exit(1);
  }

  const serialized = JSON.stringify(rows);
  const backup: MarketplaceBackup = {
    takenAt: new Date().toISOString(),
    databaseHost: databaseHost(),
    table: TABLE,
    rowCount: rows.length,
    columns,
    rows,
    sha256: createHash("sha256").update(serialized).digest("hex"),
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const stamp = backup.takenAt.replace(/[:.]/g, "-");
  const jsonPath = path.join(OUT_DIR, `${stamp}.json`);
  const sqlPath = path.join(OUT_DIR, `${stamp}.sql`);

  writeFileSync(jsonPath, `${JSON.stringify(backup, null, 2)}\n`, "utf8");
  writeFileSync(sqlPath, toSqlSidecar(columns, rows), "utf8");

  const rel = (p: string) => path.relative(process.cwd(), p);
  console.log(`✓ ${rows.length} rows from ${backup.databaseHost}`);
  console.log(`  ${rel(jsonPath)}`);
  console.log(`  ${rel(sqlPath)}`);
  console.log(`  sha256 ${backup.sha256.slice(0, 16)}…`);
  console.log(`  columns: ${columns.join(", ")}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
