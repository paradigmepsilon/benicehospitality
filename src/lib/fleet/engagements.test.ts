import { test } from "node:test";
import assert from "node:assert/strict";
import { describeStep, parsePatch, parseVehiclePatch } from "./engagements";

test("an engagement patch keeps valid fields and normalises them", () => {
  const r = parsePatch({ clientName: "  Jordan Sample ", marketState: "ga", statementDay: 10, onboardingFeeCents: 12_345, termEndsAt: "2027-09-20", notes: "" });
  assert.ok("patch" in r);
  assert.deepEqual(r.patch, { clientName: "Jordan Sample", marketState: "GA", statementDay: 10, onboardingFeeCents: 12_345, termEndsAt: "2027-09-20", notes: null });
});

test("an engagement patch refuses values the table would reject", () => {
  for (const body of [
    { stage: "s1_verdict" },            // a co-living stage, not a fleet one
    { owner: "claude" },
    { statementDay: 29 },               // must exist in February
    { statementDay: 0 },
    { statementDay: 10.5 },
    { onboardingFeeCents: -1 },
    { onboardingFeeCents: 99.5 },
    { termEndsAt: "09/20/2027" },
    { marketState: "Georgia" },
    { clientName: "   " },
    {},
    null,
  ]) {
    assert.ok("error" in parsePatch(body), JSON.stringify(body));
  }
});

test("clearing a date or the statement day is allowed", () => {
  const r = parsePatch({ termEndsAt: null, statementDay: null, nextActionDue: "" });
  assert.ok("patch" in r);
  assert.deepEqual(r.patch, { termEndsAt: null, statementDay: null, nextActionDue: null });
});

test("a new vehicle needs a make or a model; an edit does not", () => {
  assert.ok("error" in parseVehiclePatch({ year: 2021 }, { requireIdentity: true }));
  assert.ok("patch" in parseVehiclePatch({ make: "Toyota" }, { requireIdentity: true }));
  assert.ok("patch" in parseVehiclePatch({ year: 2021 }));
});

test("a vehicle patch refuses bad years, states, statuses, and dates", () => {
  for (const body of [
    { year: 1979 }, { year: 3000 }, { year: "2021" }, { plateState: "GEO" }, { garagingState: "1A" },
    { status: "sold" }, { liveAt: "soon" }, {},
  ]) {
    assert.ok("error" in parseVehiclePatch(body), JSON.stringify(body));
  }
  const ok = parseVehiclePatch({ year: 2021, make: "Toyota", model: "Camry", plateState: "ga", status: "live", liveAt: "2026-10-01" });
  assert.ok("patch" in ok);
  assert.equal(ok.patch.plateState, "GA");
});

test("only keys the journey defines can be ticked, and vehicle keys stay on vehicles", () => {
  assert.equal(describeStep("lead.crm_linked", false), "Log the source and link the CRM contact");
  assert.equal(describeStep("month:2026-09.statement_sent", false), "Statement sent to the owner · September 2026");
  assert.equal(describeStep("v.c2.live", true), "Listing live");
  assert.equal(describeStep("v.c2.live", false), null, "a vehicle key is not an owner-level step");
  assert.equal(describeStep("lead.crm_linked", true), null, "an owner key is not a vehicle step");
  assert.equal(describeStep("stripe:cs_live_123", false), null, "the payment marker cannot be ticked by hand");
  assert.equal(describeStep("month:2026-09.nope", false), null);
});
