import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DOCS,
  EVENT_KINDS,
  MONTHLY_STEPS,
  OPERATING_STAGES,
  OWNERS,
  PHASES,
  STAGES,
  STAGE_KEYS,
  STEPS,
  VEHICLE_STATUS_KEYS,
  VEHICLE_STEPS,
  VEHICLE_STEP_GROUPS,
  getDoc,
  isStatementLate,
  monthLabel,
  monthStepKey,
  parseMonthStepKey,
  previousMonth,
  statementMonths,
  vehicleLabel,
  vehicleStepsFor,
} from "./journey";

const migrate = readFileSync("scripts/migrate.ts", "utf8");

/** The values inside `<column> ... CHECK (<column> IN (...))` within one fleet table's CREATE block. */
function checkList(table: string, column: string): string[] {
  const start = migrate.indexOf(`CREATE TABLE IF NOT EXISTS ${table} (`);
  assert.ok(start >= 0, `no CREATE TABLE for ${table}`);
  const block = migrate.slice(start, migrate.indexOf("`;", start));
  const match = block.match(new RegExp(`CHECK \\(${column} IN \\(([^)]+)\\)\\)`));
  assert.ok(match, `no CHECK found for ${table}.${column}`);
  return match[1].split(",").map((v) => v.trim().replace(/'/g, ""));
}

test("migrate.ts CHECK constraints mirror journey.ts exactly", () => {
  assert.deepEqual(checkList("fleet_engagements", "stage"), [...STAGE_KEYS]);
  assert.deepEqual(checkList("fleet_engagements", "owner"), [...OWNERS]);
  assert.deepEqual(checkList("fleet_vehicles", "status"), [...VEHICLE_STATUS_KEYS]);
  assert.deepEqual(checkList("fleet_events", "kind"), [...EVENT_KINDS]);
});

test("the tracker stores no VIN, policy number, lienholder, or fee percentage", () => {
  const start = migrate.indexOf("CREATE TABLE IF NOT EXISTS fleet_engagements (");
  const end = migrate.indexOf("fleet_doc_reviews table created");
  const columns = migrate.slice(start, end).split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  for (const banned of [/\bvin\b/i, /policy/i, /lienholder/i, /_pct\b/i, /percent/i]) {
    assert.ok(!banned.test(columns), `fleet tables mention ${banned}`);
  }
});

test("step keys are unique across all three lists and every step belongs somewhere real", () => {
  const keys = [...STEPS.map((s) => s.key), ...VEHICLE_STEPS.map((s) => s.key)];
  assert.equal(new Set(keys).size, keys.length);
  for (const s of STEPS) assert.ok(STAGE_KEYS.includes(s.stage), `${s.key} → unknown stage ${s.stage}`);
  const groups = VEHICLE_STEP_GROUPS.map((g) => g.key);
  for (const s of VEHICLE_STEPS) assert.ok(groups.includes(s.group), `${s.key} → unknown group ${s.group}`);
  // Owner-level and vehicle-level keys share a table; the prefix keeps them apart.
  for (const s of VEHICLE_STEPS) assert.ok(s.key.startsWith("v."), s.key);
  for (const s of STEPS) assert.ok(!s.key.startsWith("v.") && !s.key.startsWith("month:") && !s.key.startsWith("stripe:"), s.key);
});

test("every doc a step points at exists in the library, and doc keys are unique", () => {
  const keys = DOCS.map((d) => d.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const s of [...STEPS, ...VEHICLE_STEPS, ...MONTHLY_STEPS]) {
    if (s.doc) assert.ok(getDoc(s.doc), `${s.key} → missing doc ${s.doc}`);
  }
  for (const d of DOCS) assert.match(d.pdf, /^[a-z0-9_/]+\.pdf$/, `${d.key} has an unsafe path`);
  // doc-files.ts special-cases the co-living key "intake"; the fleet library must not collide with it.
  assert.equal(getDoc("intake"), undefined);
});

test("every stage has a checklist and sits in a real phase; every vehicle group has steps", () => {
  const phases = PHASES.map((p) => p.key);
  for (const stage of STAGES) {
    assert.ok(phases.includes(stage.phase), `${stage.key} → unknown phase`);
    assert.ok(STEPS.some((s) => s.stage === stage.key), `${stage.key} has no steps`);
  }
  for (const g of VEHICLE_STEP_GROUPS) assert.ok(vehicleStepsFor(g.key).length > 0, `${g.key} has no steps`);
  for (const s of OPERATING_STAGES) assert.ok(STAGE_KEYS.includes(s));
});

test("the step a card payment ticks is a real money step", async () => {
  const { PAYABLE_ITEMS } = await import("./payments");
  for (const item of Object.values(PAYABLE_ITEMS)) {
    const step = STEPS.find((s) => s.key === item.step);
    assert.ok(step, `${item.step} is not a step`);
    assert.equal(step.flag, "money");
  }
});

test("monthly keys round-trip, and junk is refused", () => {
  const key = monthStepKey("2026-10", "statement_sent");
  assert.equal(key, "month:2026-10.statement_sent");
  assert.deepEqual(parseMonthStepKey(key)?.month, "2026-10");
  assert.equal(parseMonthStepKey(key)?.step.key, "statement_sent");
  for (const bad of ["month:2026-13.statement_sent", "month:2026-00.statement_sent", "month:2026-10.nope", "month:26-10.statement_sent", "month:2026-10.statement_sent.x", "stripe:cs_1", "lead.crm_linked"]) {
    assert.equal(parseMonthStepKey(bad), null, bad);
  }
  assert.equal(monthLabel("2026-10"), "October 2026");
});

test("statement months walk backwards across a year boundary and stop at the first live month", () => {
  assert.equal(previousMonth("2026-01-05"), "2025-12");
  assert.equal(previousMonth("2026-10-31"), "2026-09");
  assert.deepEqual(statementMonths("2026-02-10", 3), ["2026-01", "2025-12", "2025-11"]);
  assert.deepEqual(statementMonths("2026-10-10", 6, "2026-08"), ["2026-09", "2026-08"]);
  // First vehicle went live this month: no statement is owed yet.
  assert.deepEqual(statementMonths("2026-10-10", 6, "2026-10"), []);
});

test("the late flag needs a statement day, a live vehicle last month, and a missed date", () => {
  const base = { doneKeys: [] as string[], statementDay: 10, firstLiveAt: "2026-08-14", today: "2026-10-11" };
  assert.equal(isStatementLate(base), true);
  assert.equal(isStatementLate({ ...base, today: "2026-10-10" }), false, "due day itself is not late");
  assert.equal(isStatementLate({ ...base, statementDay: null }), false, "no day entered, no deadline");
  assert.equal(isStatementLate({ ...base, firstLiveAt: null }), false, "nothing live");
  assert.equal(isStatementLate({ ...base, firstLiveAt: "2026-10-02" }), false, "went live this month");
  assert.equal(isStatementLate({ ...base, doneKeys: ["month:2026-09.statement_sent"] }), false, "already sent");
  assert.equal(isStatementLate({ ...base, doneKeys: ["month:2026-08.statement_sent"] }), true, "an older month does not count");
});

test("a vehicle label uses what is known", () => {
  assert.equal(vehicleLabel({ year: 2021, make: "Toyota", model: "Camry" }), "2021 Toyota Camry");
  assert.equal(vehicleLabel({ year: null, make: "Toyota", model: null }), "Toyota");
  assert.equal(vehicleLabel({ year: null, make: null, model: null }), "Unnamed vehicle");
});
