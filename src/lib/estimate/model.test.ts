import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate } from "./model";
import { lookupRate, METRO_RATES } from "./rates";

test("an unknown metro returns unavailable instead of a made-up number", () => {
  const r = estimate({ asset: "car", metro: "nowhere", daysAvailable: 20, condition: "good" });
  assert.deepEqual(r, { unavailable: true });
});

test("lookupRate is null for a metro with no data", () => {
  assert.equal(lookupRate("car", "nowhere"), null);
});

test("every seeded rate has a low below its high and a service-area state", () => {
  const states = ["GA", "FL", "SC", "NC", "AL", "TN"];
  for (const rate of METRO_RATES) {
    assert.ok(
      rate.monthlyGrossLow < rate.monthlyGrossHigh,
      `${rate.metro} low is not below high`,
    );
    assert.ok(states.includes(rate.state), `${rate.metro} is outside the service area`);
  }
});

test("net subtracts the management fee from gross", () => {
  // 30 days available means the availability factor is exactly 1, so this test
  // isolates the fee arithmetic. Scaling is covered by the next test.
  const r = estimate({
    asset: "car",
    metro: "nowhere",
    daysAvailable: 30,
    condition: "good",
    rateOverride: { metro: "test", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
    feePct: 0.2,
  });
  assert.ok(!("unavailable" in r));
  if ("unavailable" in r) return;
  assert.equal(r.grossLow, 1000);
  assert.equal(r.grossHigh, 2000);
  assert.equal(r.netLow, 800);
  assert.equal(r.netHigh, 1600);
});

test("availability scales the range and never goes negative", () => {
  const half = estimate({
    asset: "car",
    metro: "nowhere",
    daysAvailable: 15,
    condition: "good",
    rateOverride: { metro: "t", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
  });
  if ("unavailable" in half) throw new Error("expected a result");
  assert.ok(half.grossLow < 1000);
  assert.ok(half.grossLow >= 0);
});

test("net is omitted when no fee is configured", () => {
  const r = estimate({
    asset: "rooms",
    metro: "nowhere",
    bedrooms: 3,
    rateOverride: { metro: "t", state: "GA", asset: "rooms", monthlyGrossLow: 900, monthlyGrossHigh: 1500 },
  });
  if ("unavailable" in r) throw new Error("expected a result");
  assert.equal(r.netLow, null);
  assert.equal(r.netHigh, null);
});
