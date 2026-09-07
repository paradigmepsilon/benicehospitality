import { test } from "node:test";
import assert from "node:assert/strict";
import { isEstimatorEnabled } from "./flag";

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
    assert.equal(isEstimatorEnabled(), false);
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
