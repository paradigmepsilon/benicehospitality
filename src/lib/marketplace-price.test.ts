import { test } from "node:test";
import assert from "node:assert/strict";
import { compareByPrice, priceFloor } from "./marketplace-price";

test("priceFloor reads the low end of a range", () => {
  assert.equal(priceFloor("$18–$28"), 18);
  assert.equal(priceFloor("$210-$260"), 210);
});

test("priceFloor handles single prices, subscriptions, commas, and cents", () => {
  assert.equal(priceFloor("$32"), 32);
  assert.equal(priceFloor("$20/mo"), 20);
  assert.equal(priceFloor("$1,299"), 1299);
  assert.equal(priceFloor("$9.99"), 9.99);
});

test("priceFloor returns null when there is no number", () => {
  assert.equal(priceFloor(""), null);
  assert.equal(priceFloor("Varies"), null);
});

test("compareByPrice sorts both directions with unpriced items last", () => {
  const prices = ["$50", "", "$10–$20", "$20/mo"];
  assert.deepEqual(
    [...prices].sort((a, b) => compareByPrice(a, b, "asc")),
    ["$10–$20", "$20/mo", "$50", ""],
  );
  assert.deepEqual(
    [...prices].sort((a, b) => compareByPrice(a, b, "desc")),
    ["$50", "$20/mo", "$10–$20", ""],
  );
});
