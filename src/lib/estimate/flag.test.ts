import { test } from "node:test";
import assert from "node:assert/strict";
import { isEstimatorEnabled } from "./flag";
import { METRO_RATES } from "./rates";

/** Runs fn with the rate table emptied, then puts every row back. */
function withEmptyTable(fn: () => void) {
  const saved = METRO_RATES.splice(0, METRO_RATES.length);
  try {
    fn();
  } finally {
    METRO_RATES.push(...saved);
  }
}

test("isEstimatorEnabled: unset env and empty table returns false", () => {
  const saved = process.env.ESTIMATOR_ENABLED;
  try {
    delete process.env.ESTIMATOR_ENABLED;
    assert.equal(isEstimatorEnabled(), false);
  } finally {
    if (saved !== undefined) process.env.ESTIMATOR_ENABLED = saved;
  }
});

test("isEstimatorEnabled: env true but table empty returns false (guards against premature flip)", () => {
  const saved = process.env.ESTIMATOR_ENABLED;
  try {
    process.env.ESTIMATOR_ENABLED = "true";
    withEmptyTable(() => {
      assert.equal(isEstimatorEnabled(), false);
      assert.equal(isEstimatorEnabled("rooms"), false);
    });
  } finally {
    if (saved !== undefined) process.env.ESTIMATOR_ENABLED = saved;
    else delete process.env.ESTIMATOR_ENABLED;
  }
});

test("isEstimatorEnabled: env false returns false", () => {
  const saved = process.env.ESTIMATOR_ENABLED;
  try {
    process.env.ESTIMATOR_ENABLED = "false";
    assert.equal(isEstimatorEnabled(), false);
  } finally {
    if (saved !== undefined) process.env.ESTIMATOR_ENABLED = saved;
    else delete process.env.ESTIMATOR_ENABLED;
  }
});

test("isEstimatorEnabled: env 1 (not the string true) returns false", () => {
  const saved = process.env.ESTIMATOR_ENABLED;
  try {
    process.env.ESTIMATOR_ENABLED = "1";
    assert.equal(isEstimatorEnabled(), false);
  } finally {
    if (saved !== undefined) process.env.ESTIMATOR_ENABLED = saved;
    else delete process.env.ESTIMATOR_ENABLED;
  }
});

test("isEstimatorEnabled: env TRUE (uppercase, not exact string true) returns false", () => {
  const saved = process.env.ESTIMATOR_ENABLED;
  try {
    process.env.ESTIMATOR_ENABLED = "TRUE";
    assert.equal(isEstimatorEnabled(), false);
  } finally {
    if (saved !== undefined) process.env.ESTIMATOR_ENABLED = saved;
    else delete process.env.ESTIMATOR_ENABLED;
  }
});

test("isEstimatorEnabled: env true and a seeded table returns true", () => {
  const saved = process.env.ESTIMATOR_ENABLED;
  try {
    process.env.ESTIMATOR_ENABLED = "true";
    assert.equal(isEstimatorEnabled(), true);
  } finally {
    if (saved !== undefined) process.env.ESTIMATOR_ENABLED = saved;
    else delete process.env.ESTIMATOR_ENABLED;
  }
});

test("isEstimatorEnabled(asset): true only for an asset that has rates", () => {
  const saved = process.env.ESTIMATOR_ENABLED;
  try {
    process.env.ESTIMATOR_ENABLED = "true";
    assert.equal(isEstimatorEnabled("rooms"), true);
    // No car rate exists, so the car tool must stay unreachable even though
    // the table as a whole is no longer empty.
    assert.equal(isEstimatorEnabled("car"), false);
    delete process.env.ESTIMATOR_ENABLED;
    assert.equal(isEstimatorEnabled("rooms"), false);
  } finally {
    if (saved !== undefined) process.env.ESTIMATOR_ENABLED = saved;
    else delete process.env.ESTIMATOR_ENABLED;
  }
});
