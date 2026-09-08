import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SERVICE_AREA_STATES,
  SERVICE_AREA_LABEL,
  MANAGEMENT_OFFERS,
  isServiceAreaState,
  getManagementFeeModel,
  managementFeeAsDecimal,
} from "./constants";
import { estimate } from "../estimate/model";

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

test(
  "cross-consumer: one whole-percent env value reads as the same 20% fee on the offer page and in the estimator's net figures",
  () => {
    // This is the test that would have caught the bug: ManagementOffer.tsx
    // renders grossPct as a whole percent, unconverted, while the earnings
    // estimator pages must convert it to a decimal fraction before handing
    // it to estimate() (guard: fee > 0 && fee < 1). Two consumers, two
    // units, one env value. Assert both readings from that single value.
    const saved = {
      pct: process.env.MANAGEMENT_FEE_CAR_PCT,
      onboarding: process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD,
      term: process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS,
    };
    try {
      // Alex sets a whole-percent value, exactly as the offer page's own
      // "% of gross" label instructs him to.
      process.env.MANAGEMENT_FEE_CAR_PCT = "20";
      process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = "250";
      process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = "6";

      const fees = getManagementFeeModel("car");
      assert.ok(fees, "expected a fee model with all three env vars set");

      // Consumer 1: ManagementOffer.tsx:218 renders grossPct straight into
      // the offer-page copy, unconverted.
      assert.equal(`${fees!.grossPct}% of gross`, "20% of gross");

      // Consumer 2: car-earnings-estimator/page.tsx and the room equivalent
      // convert grossPct to a decimal fraction via managementFeeAsDecimal
      // before it reaches estimate() as feePct.
      const result = estimate({
        asset: "car",
        metro: "nowhere",
        daysAvailable: 30,
        condition: "good",
        rateOverride: {
          metro: "test",
          state: "GA",
          asset: "car",
          monthlyGrossLow: 1000,
          monthlyGrossHigh: 2000,
        },
        feePct: managementFeeAsDecimal(fees!.grossPct),
      });
      assert.ok(!("unavailable" in result), "expected a resolvable estimate");
      if ("unavailable" in result) return;

      // A 20% fee nets 80% of gross. If someone hands estimate() the
      // whole-percent number (20) directly instead of converting it first,
      // its 0 < fee < 1 guard rejects it and netLow/netHigh come back null
      // instead of 800 / 1600, silently breaking the estimator's net range.
      assert.equal(result.netLow, 800);
      assert.equal(result.netHigh, 1600);
    } finally {
      if (saved.pct !== undefined) process.env.MANAGEMENT_FEE_CAR_PCT = saved.pct;
      else delete process.env.MANAGEMENT_FEE_CAR_PCT;
      if (saved.onboarding !== undefined) process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD = saved.onboarding;
      else delete process.env.MANAGEMENT_FEE_CAR_ONBOARDING_USD;
      if (saved.term !== undefined) process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS = saved.term;
      else delete process.env.MANAGEMENT_FEE_CAR_MIN_TERM_MONTHS;
    }
  },
);

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
