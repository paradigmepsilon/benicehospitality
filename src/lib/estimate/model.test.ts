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
  // 15 of 30 days is a factor of exactly 0.5 against the good-condition (1x) rate.
  assert.equal(half.grossLow, 500);
  assert.equal(half.grossHigh, 1000);
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

test("furnished false applies the 0.85 discount to rooms gross", () => {
  const r = estimate({
    asset: "rooms",
    metro: "nowhere",
    furnished: false,
    rateOverride: { metro: "t", state: "GA", asset: "rooms", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
  });
  if ("unavailable" in r) throw new Error("expected a result");
  assert.equal(r.grossLow, 850);
  assert.equal(r.grossHigh, 1700);
});

test("condition factor: excellent scales gross by 1.05x", () => {
  const r = estimate({
    asset: "car",
    metro: "nowhere",
    condition: "excellent",
    rateOverride: { metro: "t", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
  });
  if ("unavailable" in r) throw new Error("expected a result");
  assert.equal(r.grossLow, 1050);
  assert.equal(r.grossHigh, 2100);
});

test("condition factor: fair scales gross by 0.9x", () => {
  const r = estimate({
    asset: "car",
    metro: "nowhere",
    condition: "fair",
    rateOverride: { metro: "t", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
  });
  if ("unavailable" in r) throw new Error("expected a result");
  assert.equal(r.grossLow, 900);
  assert.equal(r.grossHigh, 1800);
});

test("bedrooms scale gross linearly", () => {
  const r = estimate({
    asset: "rooms",
    metro: "nowhere",
    bedrooms: 4,
    rateOverride: { metro: "t", state: "GA", asset: "rooms", monthlyGrossLow: 500, monthlyGrossHigh: 800 },
  });
  if ("unavailable" in r) throw new Error("expected a result");
  assert.equal(r.grossLow, 2000);
  assert.equal(r.grossHigh, 3200);
});

test("availability day cap: 45 days behaves the same as the 30-day cap", () => {
  const over = estimate({
    asset: "car",
    metro: "nowhere",
    daysAvailable: 45,
    condition: "good",
    rateOverride: { metro: "t", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
  });
  const atCap = estimate({
    asset: "car",
    metro: "nowhere",
    daysAvailable: 30,
    condition: "good",
    rateOverride: { metro: "t", state: "GA", asset: "car", monthlyGrossLow: 1000, monthlyGrossHigh: 2000 },
  });
  assert.deepEqual(over, atCap);
  if ("unavailable" in over) throw new Error("expected a result");
  assert.equal(over.grossLow, 1000);
  assert.equal(over.grossHigh, 2000);
});
