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
  assert.equal(getManagementFeeModel("car"), null);
});
