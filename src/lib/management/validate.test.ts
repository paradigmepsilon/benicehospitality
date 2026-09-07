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

test("accepts a complete application and normalizes email and state", () => {
  const r = validateApplication(good);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.email, "sam@example.com");
  assert.equal(r.value.state, "GA");
  assert.equal(r.value.assetCount, 2);
});

test("rejects a state outside the six-state service area", () => {
  const r = validateApplication({ ...good, state: "TX" });
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
