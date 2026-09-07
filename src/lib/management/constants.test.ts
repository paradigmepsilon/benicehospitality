import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SERVICE_AREA_STATES,
  SERVICE_AREA_LABEL,
  MANAGEMENT_OFFERS,
  isServiceAreaState,
  getManagementFeeModel,
} from "./constants";

test("service area is exactly the six Southeast states", () => {
  assert.equal(SERVICE_AREA_STATES.length, 6);
  assert.deepEqual(
    SERVICE_AREA_STATES.map((s) => s.code),
    ["GA", "FL", "SC", "NC", "AL", "TN"],
  );
});

test("service area label lists every state", () => {
  for (const s of SERVICE_AREA_STATES) {
    assert.ok(SERVICE_AREA_LABEL.includes(s.code), `${s.code} missing from label`);
  }
});

test("isServiceAreaState is case insensitive and rejects outsiders", () => {
  assert.equal(isServiceAreaState("ga"), true);
  assert.equal(isServiceAreaState("TN"), true);
  assert.equal(isServiceAreaState("TX"), false);
  assert.equal(isServiceAreaState(""), false);
});

test("both offers exist and name no operating company", () => {
  const banned = ["Be Nice Properties", "Be Nice Autos", "BNP", "BNA"];
  for (const asset of ["car", "rooms"] as const) {
    const offer = MANAGEMENT_OFFERS[asset];
    assert.equal(offer.asset, asset);
    assert.ok(offer.handles.length > 0);
    assert.ok(offer.ownerKeeps.length > 0);
    const blob = JSON.stringify(offer);
    for (const b of banned) {
      assert.ok(!blob.includes(b), `${asset} offer names ${b}`);
    }
  }
});

test("fee model stays null until env is configured", () => {
  delete process.env.MANAGEMENT_FEE_CAR_PCT;
  delete process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD;
  delete process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS;
  assert.equal(getManagementFeeModel("car"), null);
});

test("fee model returns parsed FeeModel when all env vars are set (car)", () => {
  const saved = {
    pct: process.env.MANAGEMENT_FEE_CAR_PCT,
    onboarding: process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD,
    term: process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS,
  };
  try {
    process.env.MANAGEMENT_FEE_CAR_PCT = "15.5";
    process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = "250";
    process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = "6";
    const model = getManagementFeeModel("car");
    assert.deepEqual(model, {
      grossPct: 15.5,
      onboardingUsd: 250,
      minimumTermMonths: 6,
    });
  } finally {
    if (saved.pct !== undefined) process.env.MANAGEMENT_FEE_CAR_PCT = saved.pct;
    else delete process.env.MANAGEMENT_FEE_CAR_PCT;
    if (saved.onboarding !== undefined) process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = saved.onboarding;
    else delete process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD;
    if (saved.term !== undefined) process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = saved.term;
    else delete process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS;
  }
});

test("fee model returns null when one of three env vars is missing", () => {
  const saved = {
    pct: process.env.MANAGEMENT_FEE_CAR_PCT,
    onboarding: process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD,
    term: process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS,
  };
  try {
    process.env.MANAGEMENT_FEE_CAR_PCT = "15.5";
    process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = "250";
    delete process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS;
    assert.equal(getManagementFeeModel("car"), null);
  } finally {
    if (saved.pct !== undefined) process.env.MANAGEMENT_FEE_CAR_PCT = saved.pct;
    else delete process.env.MANAGEMENT_FEE_CAR_PCT;
    if (saved.onboarding !== undefined) process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = saved.onboarding;
    else delete process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD;
    if (saved.term !== undefined) process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = saved.term;
    else delete process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS;
  }
});

test("fee model returns null when env value is non-numeric", () => {
  const saved = {
    pct: process.env.MANAGEMENT_FEE_CAR_PCT,
    onboarding: process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD,
    term: process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS,
  };
  try {
    process.env.MANAGEMENT_FEE_CAR_PCT = "abc";
    process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = "250";
    process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = "6";
    assert.equal(getManagementFeeModel("car"), null);
  } finally {
    if (saved.pct !== undefined) process.env.MANAGEMENT_FEE_CAR_PCT = saved.pct;
    else delete process.env.MANAGEMENT_FEE_CAR_PCT;
    if (saved.onboarding !== undefined) process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = saved.onboarding;
    else delete process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD;
    if (saved.term !== undefined) process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = saved.term;
    else delete process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS;
  }
});

test("fee model returns null when env value parses to Infinity", () => {
  const saved = {
    pct: process.env.MANAGEMENT_FEE_CAR_PCT,
    onboarding: process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD,
    term: process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS,
  };
  try {
    process.env.MANAGEMENT_FEE_CAR_PCT = "Infinity";
    process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = "250";
    process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = "6";
    assert.equal(getManagementFeeModel("car"), null);
  } finally {
    if (saved.pct !== undefined) process.env.MANAGEMENT_FEE_CAR_PCT = saved.pct;
    else delete process.env.MANAGEMENT_FEE_CAR_PCT;
    if (saved.onboarding !== undefined) process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = saved.onboarding;
    else delete process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD;
    if (saved.term !== undefined) process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = saved.term;
    else delete process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS;
  }
});

test("fee model works for rooms asset (ROOMS suffix)", () => {
  const saved = {
    pct: process.env.MANAGEMENT_FEE_ROOMS_PCT,
    onboarding: process.env.MANAGEMENT_FEE_ROOMS_ONBOARDING_USD,
    term: process.env.MANAGEMENT_FEE_ROOMS_MIN_TERM_MONTHS,
  };
  try {
    process.env.MANAGEMENT_FEE_ROOMS_PCT = "20";
    process.env.MANAGEMENT_FEE_ROOMS_ONBOARDING_USD = "500";
    process.env.MANAGEMENT_FEE_ROOMS_MIN_TERM_MONTHS = "12";
    const model = getManagementFeeModel("rooms");
    assert.deepEqual(model, {
      grossPct: 20,
      onboardingUsd: 500,
      minimumTermMonths: 12,
    });
  } finally {
    if (saved.pct !== undefined) process.env.MANAGEMENT_FEE_ROOMS_PCT = saved.pct;
    else delete process.env.MANAGEMENT_FEE_ROOMS_PCT;
    if (saved.onboarding !== undefined) process.env.MANAGEMENT_FEE_ROOMS_ONBOARDING_USD = saved.onboarding;
    else delete process.env.MANAGEMENT_FEE_ROOMS_ONBOARDING_USD;
    if (saved.term !== undefined) process.env.MANAGEMENT_FEE_ROOMS_MIN_TERM_MONTHS = saved.term;
    else delete process.env.MANAGEMENT_FEE_ROOMS_MIN_TERM_MONTHS;
  }
});
