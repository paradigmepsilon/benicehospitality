import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DOCS,
  OWNERS,
  PACKAGE_KEYS,
  PATH_KEYS,
  SECTION_STATUS_KEYS,
  STAGES,
  STAGE_KEYS,
  STEPS,
  VERDICTS,
  VERDICT_KEYS,
  creditForVerdict,
  daysUntil,
  getDoc,
  stepsFor,
} from "./journey";

const migrate = readFileSync("scripts/migrate.ts", "utf8");

/** The values inside `<column> ... CHECK (<column> IN (...))` for the partnership tables. */
function checkList(column: string): string[] {
  const block = migrate.slice(migrate.indexOf("CREATE TABLE IF NOT EXISTS partnership_engagements"));
  const match = block.match(new RegExp(`CHECK \\(${column} IN \\(([^)]+)\\)\\)`));
  assert.ok(match, `no CHECK found for ${column}`);
  return match[1].split(",").map((v) => v.trim().replace(/'/g, ""));
}

test("migrate.ts CHECK constraints mirror journey.ts exactly", () => {
  assert.deepEqual(checkList("stage"), [...STAGE_KEYS]);
  assert.deepEqual(checkList("path"), [...PATH_KEYS]);
  assert.deepEqual(checkList("verdict"), [...VERDICT_KEYS]);
  assert.deepEqual(checkList("package"), [...PACKAGE_KEYS]);
  assert.deepEqual(checkList("owner"), [...OWNERS]);
  for (const n of [1, 2, 3, 4, 5]) {
    assert.deepEqual(checkList(`s${n}_status`), [...SECTION_STATUS_KEYS]);
  }
});

test("step keys are unique and every step belongs to a real stage", () => {
  const keys = STEPS.map((s) => s.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const s of STEPS) assert.ok(STAGE_KEYS.includes(s.stage), `${s.key} → unknown stage ${s.stage}`);
});

test("every doc a step points at exists in the library, and doc keys are unique", () => {
  const keys = DOCS.map((d) => d.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const s of STEPS) if (s.doc) assert.ok(getDoc(s.doc), `${s.key} → missing doc ${s.doc}`);
  for (const d of DOCS) assert.match(d.pdf, /^[a-z0-9_/]+\.pdf$/, `${d.key} has an unsafe path`);
});

test("every stage a client can sit in has a checklist", () => {
  for (const stage of STAGES) {
    assert.ok(STEPS.some((s) => s.stage === stage.key), `${stage.key} has no steps`);
  }
});

test("every verdict lands on a fork stage, so no verdict is a dead end", () => {
  for (const v of VERDICTS) assert.ok(STAGE_KEYS.includes(v.nextStage));
  assert.equal(VERDICTS.find((v) => v.key === "no_go")!.nextStage, "pivot");
});

test("tiered credit policy: Go 30 days, Adjust 90 days, No-go half for a year", () => {
  assert.deepEqual(creditForVerdict("go", "2026-09-18"), { creditCents: 100_000, creditExpiresAt: "2026-10-18" });
  assert.deepEqual(creditForVerdict("adjust", "2026-09-18"), { creditCents: 100_000, creditExpiresAt: "2026-12-17" });
  assert.deepEqual(creditForVerdict("no_go", "2026-09-18"), { creditCents: 50_000, creditExpiresAt: "2027-09-18" });
});

test("path filters the fork checklists", () => {
  const next = stepsFor("pivot", "next_property").map((s) => s.key);
  assert.ok(next.includes("pivot.buy_box"));
  assert.ok(!next.includes("pivot.alt_sheet"));
  const alt = stepsFor("pivot", "alt_strategy").map((s) => s.key);
  assert.ok(alt.includes("pivot.alt_sheet"));
  assert.ok(!alt.includes("pivot.buy_box"));
  // The partnership proposal steps disappear once a client takes another path.
  assert.ok(!stepsFor("decision", "market_watch").some((s) => s.key === "decision.proposal"));
});

test("daysUntil counts whole calendar days and goes negative once past", () => {
  assert.equal(daysUntil("2026-09-25", "2026-09-18"), 7);
  assert.equal(daysUntil("2026-09-18", "2026-09-18"), 0);
  assert.equal(daysUntil("2026-09-17", "2026-09-18"), -1);
  // Across the November DST change a naive local-midnight diff is off by an hour.
  assert.equal(daysUntil("2026-11-02", "2026-10-31"), 2);
});
