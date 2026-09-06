import { test } from "node:test";
import assert from "node:assert/strict";
import { advance, isSuppressed, nextSendAt, normalizeEmail } from "./schedule";

test("nextSendAt adds whole hours", () => {
  const from = new Date("2026-09-05T12:00:00Z");
  assert.equal(nextSendAt(from, 48).toISOString(), "2026-09-07T12:00:00.000Z");
  assert.equal(nextSendAt(from, 0).toISOString(), from.toISOString());
});

test("advance moves to the next step until the last one completes", () => {
  assert.deepEqual(advance(0, 4), { nextStep: 1, completed: false });
  assert.deepEqual(advance(3, 4), { nextStep: 4, completed: true });
});

test("isSuppressed matches case-insensitively", () => {
  const set = new Set(["a@b.com"]);
  assert.equal(isSuppressed("A@B.com", set), true);
  assert.equal(isSuppressed("c@d.com", set), false);
});

test("normalizeEmail lowercases and trims", () => {
  assert.equal(normalizeEmail("  Alex@Example.COM "), "alex@example.com");
});
