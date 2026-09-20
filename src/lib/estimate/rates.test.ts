import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate } from "./model";
import { listMetros, lookupRate, METRO_RATES } from "./rates";

/**
 * The lowest public one-bedroom rent comparable on file for each seeded metro.
 * These are published listing-site figures, the same ones named in the
 * provenance comment in rates.ts. The tests pin the seeded range to them so a
 * later edit cannot drift the table above what the comps support.
 */
const LOWEST_ONE_BED_COMP: Record<string, number> = {
  Charlotte: 1482,
  Charleston: 1645,
  Jacksonville: 1289,
};

const SEEDED = Object.keys(LOWEST_ONE_BED_COMP);

test("the three researched metros are seeded for rooms", () => {
  for (const metro of SEEDED) {
    assert.ok(lookupRate("rooms", metro), `${metro} has no rooms rate`);
  }
  assert.deepEqual(
    listMetros("rooms").map((m) => m.label),
    ["Charlotte, NC", "Charleston, SC", "Jacksonville, FL"],
  );
});

test("a seeded metro returns a sane per-room monthly range with low at or below high", () => {
  for (const metro of SEEDED) {
    const r = estimate({ asset: "rooms", metro, bedrooms: 1, furnished: true });
    if ("unavailable" in r) throw new Error(`${metro} should be available`);
    assert.ok(r.grossLow <= r.grossHigh, `${metro} low is above high`);
    assert.ok(r.grossLow >= 500, `${metro} low is implausibly small`);
    assert.ok(r.grossHigh <= 2000, `${metro} high is implausibly large`);
    assert.equal(r.netLow, null);
    assert.equal(r.netHigh, null);
  }
});

test("seeded ranges stay conservative against the lowest public 1-bed comp", () => {
  for (const metro of SEEDED) {
    const rate = lookupRate("rooms", metro)!;
    const comp = LOWEST_ONE_BED_COMP[metro];
    // Low end: a bare room at 65% of the comp, rounded DOWN, never up.
    assert.ok(
      rate.monthlyGrossLow <= Math.round(comp * 0.65),
      `${metro} low is above 65% of its comp`,
    );
    assert.ok(
      rate.monthlyGrossLow > comp * 0.6,
      `${metro} low is further below the comp than rounding explains`,
    );
    // High end: a single room never approaches the rent of the whole 1-bed.
    assert.ok(
      rate.monthlyGrossHigh < comp * 0.95,
      `${metro} high is too close to a whole 1-bed`,
    );
    assert.equal(rate.monthlyGrossLow % 25, 0);
    assert.equal(rate.monthlyGrossHigh % 25, 0);
  }
});

test("bedrooms and furnished status scale a seeded metro", () => {
  const one = estimate({ asset: "rooms", metro: "Charlotte", bedrooms: 1, furnished: true });
  const three = estimate({ asset: "rooms", metro: "charlotte ", bedrooms: 3, furnished: true });
  if ("unavailable" in one || "unavailable" in three) throw new Error("expected results");
  assert.equal(three.grossLow, one.grossLow * 3);
  assert.equal(three.grossHigh, one.grossHigh * 3);
  assert.equal(three.state, "NC");
});

test("a rooms metro with no research keeps the unavailable fallback", () => {
  for (const metro of ["Atlanta", "Nashville", "Birmingham", "nowhere"]) {
    assert.equal(lookupRate("rooms", metro), null);
    assert.deepEqual(estimate({ asset: "rooms", metro, bedrooms: 2 }), { unavailable: true });
  }
});

test("no car rate is seeded, so a rooms metro is still unavailable for cars", () => {
  assert.equal(METRO_RATES.filter((r) => r.asset === "car").length, 0);
  assert.deepEqual(listMetros("car"), []);
  assert.deepEqual(
    estimate({ asset: "car", metro: "Charlotte", daysAvailable: 30, condition: "good" }),
    { unavailable: true },
  );
});
