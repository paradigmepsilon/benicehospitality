import { test } from "node:test";
import assert from "node:assert/strict";
import { validateApplication } from "./validate";

const good = {
  name: "Sam Rivera",
  email: "Sam@Example.COM ",
  phone: "770-555-0100",
  asset: "car",
  assetCount: "2",
  state: "ga",
  city: "Atlanta",
  currentStatus: "on_platform",
  timeline: "30_days",
  wants: "Tired of handling turnovers on weekends.",
  heardFrom: "facebook_group",
};

const VALID_CURRENT_STATUS = ["idle", "self_managed", "on_platform"];
const VALID_TIMELINE = ["now", "30_days", "90_days", "exploring"];

test("accepts a complete application and normalizes email and state", () => {
  const r = validateApplication(good);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.deepEqual(r.value, {
    name: "Sam Rivera",
    email: "sam@example.com",
    phone: "770-555-0100",
    asset: "car",
    assetCount: 2,
    state: "GA",
    city: "Atlanta",
    currentStatus: "on_platform",
    timeline: "30_days",
    wants: "Tired of handling turnovers on weekends.",
    heardFrom: "facebook_group",
  });
});

test("rejects a state outside the six-state service area", () => {
  const r = validateApplication({ ...good, state: "TX" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.match(r.error, /service area/i);
});

test("rejects a malformed state code instead of truncating it", () => {
  const r = validateApplication({ ...good, state: "GAX" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.match(r.error, /service area/i);
});

test("rejects a missing email and a malformed one", () => {
  assert.equal(validateApplication({ ...good, email: "" }).ok, false);
  assert.equal(validateApplication({ ...good, email: "nope" }).ok, false);
});

test("rejects an unknown asset type", () => {
  assert.equal(validateApplication({ ...good, asset: "boat" }).ok, false);
});

test("rejects an unknown currentStatus", () => {
  const r = validateApplication({ ...good, currentStatus: "whatever" });
  assert.equal(r.ok, false);
});

test("accepts every valid currentStatus value", () => {
  for (const currentStatus of VALID_CURRENT_STATUS) {
    const r = validateApplication({ ...good, currentStatus });
    assert.equal(r.ok, true, `expected currentStatus "${currentStatus}" to be accepted`);
  }
});

test("rejects an unknown timeline", () => {
  const r = validateApplication({ ...good, timeline: "someday" });
  assert.equal(r.ok, false);
});

test("accepts every valid timeline value", () => {
  for (const timeline of VALID_TIMELINE) {
    const r = validateApplication({ ...good, timeline });
    assert.equal(r.ok, true, `expected timeline "${timeline}" to be accepted`);
  }
});

test("rejects a non-object payload", () => {
  assert.equal(validateApplication(null).ok, false);
  assert.equal(validateApplication("hi").ok, false);
});

test("clamps assetCount to a sane range", () => {
  assert.equal(validateApplication({ ...good, assetCount: "0" }).ok, false);
  const r = validateApplication({ ...good, assetCount: "9999" });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.assetCount, 999);
});
