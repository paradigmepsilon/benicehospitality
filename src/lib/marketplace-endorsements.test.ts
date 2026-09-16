import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ENDORSEMENT_MAX_LENGTH,
  endorsersForTab,
  parseEndorsementFields,
} from "./marketplace-endorsements";

test("endorsersForTab maps each tab to its endorsers", () => {
  assert.deepEqual(endorsersForTab("property"), ["della"]);
  assert.deepEqual(endorsersForTab("auto"), ["alex"]);
  assert.deepEqual(endorsersForTab("back-office"), ["della", "alex"]);
});

test("parseEndorsementFields keeps only the keys that were sent, trimmed", () => {
  const result = parseEndorsementFields({ dellaUse: "  In every bedroom.  ", name: "x" });
  assert.deepEqual(result, { ok: true, values: { dellaUse: "In every bedroom." } });
});

test("parseEndorsementFields accepts an empty string to clear a field", () => {
  const result = parseEndorsementFields({ alexTake: "" });
  assert.deepEqual(result, { ok: true, values: { alexTake: "" } });
});

test("parseEndorsementFields rejects non-strings", () => {
  const result = parseEndorsementFields({ alexUse: 42 });
  assert.equal(result.ok, false);
});

test("parseEndorsementFields rejects over-long text", () => {
  const result = parseEndorsementFields({
    dellaTake: "a".repeat(ENDORSEMENT_MAX_LENGTH + 1),
  });
  assert.equal(result.ok, false);
});
