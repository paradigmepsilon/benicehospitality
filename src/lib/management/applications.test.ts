import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APPLICATION_STATUSES } from "./statuses";

const migrate = readFileSync("scripts/migrate.ts", "utf8");

function tableBlock(table: string): string {
  const start = migrate.indexOf(`CREATE TABLE IF NOT EXISTS ${table} (`);
  assert.ok(start >= 0, `${table} is not created in migrate.ts`);
  return migrate.slice(start, migrate.indexOf("`;", start));
}

test("the application status list mirrors the table CHECK exactly", () => {
  const match = tableBlock("management_applications").match(/CHECK \(status IN \(([^)]+)\)\)/);
  assert.ok(match);
  const inDb = match[1].split(",").map((v) => v.trim().replace(/'/g, ""));
  assert.deepEqual(inDb, [...APPLICATION_STATUSES]);
});

test("the migration carries the intake columns both trackers and the form rely on", () => {
  assert.match(migrate, /ALTER TABLE management_applications ADD COLUMN IF NOT EXISTS click_source TEXT/);
  assert.match(
    migrate,
    /ALTER TABLE partnership_engagements ADD COLUMN IF NOT EXISTS application_id INTEGER REFERENCES management_applications\(id\) ON DELETE SET NULL/,
  );
  // management_applications must exist before partnership_engagements points at it.
  assert.ok(
    migrate.indexOf("CREATE TABLE IF NOT EXISTS management_applications (") <
      migrate.indexOf("CREATE TABLE IF NOT EXISTS partnership_engagements ("),
  );
});
