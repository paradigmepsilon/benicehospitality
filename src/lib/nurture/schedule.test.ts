import { test } from "node:test";
import assert from "node:assert/strict";
import { advance, isSuppressed, nextSendAt, normalizeEmail } from "./schedule";
import { allSequences, getSequence } from "./registry";

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

test("mgmt_applicant is registered with three steps over seven days", () => {
  const seq = getSequence("mgmt_applicant");
  assert.equal(seq.steps.length, 3);
  const total = seq.steps.reduce((sum, s) => sum + s.delayHours, 0);
  assert.ok(total <= 7 * 24, `sequence runs ${total}h, longer than seven days`);
});

test("every sequence renders without throwing and carries an unsubscribe link", () => {
  const ctx = {
    email: "a@b.com",
    firstName: "Sam",
    baseUrl: "https://example.com",
    unsubscribeUrl: "https://example.com/unsubscribe?t=x",
  };
  for (const seq of allSequences()) {
    for (const [i, step] of seq.steps.entries()) {
      const html = step.html(ctx);
      assert.ok(html.length > 0, `${seq.key} step ${i} rendered empty`);
      assert.ok(
        html.includes(ctx.unsubscribeUrl),
        `${seq.key} step ${i} is missing the unsubscribe link`,
      );
    }
  }
});

test("no sequence copy contains an em dash or en dash", () => {
  const ctx = {
    email: "a@b.com",
    baseUrl: "https://example.com",
    unsubscribeUrl: "https://example.com/u",
  };
  for (const seq of allSequences()) {
    for (const [i, step] of seq.steps.entries()) {
      const blob = step.subject + step.preheader + step.html(ctx);
      assert.ok(!/[–—]/.test(blob), `${seq.key} step ${i} has a dash`);
    }
  }
});
