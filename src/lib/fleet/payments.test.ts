import { test } from "node:test";
import assert from "node:assert/strict";
import { FLEET_PRODUCT_TAG, isPayableItem, lineItemFor, readPaidSession } from "./payments";
import { PARTNERSHIP_PRODUCT_TAG } from "@/lib/partnership/payments";

const base = { id: "cs_test_123", amount_total: 25_000, metadata: { product: FLEET_PRODUCT_TAG, engagement_id: "42", item: "onboarding_fee" } };

test("a well-formed paid session yields the facts fulfillment needs", () => {
  assert.deepEqual(readPaidSession(base), {
    ok: true,
    facts: { sessionId: "cs_test_123", engagementId: 42, item: "onboarding_fee", amountCents: 25_000 },
  });
});

test("metadata is untrusted: bad engagement ids are refused", () => {
  for (const engagement_id of ["", "abc", "0", "-3", "1.5", "1; DROP TABLE"]) {
    const r = readPaidSession({ ...base, metadata: { ...base.metadata, engagement_id } });
    assert.equal(r.ok, false, `accepted "${engagement_id}"`);
  }
  assert.equal(readPaidSession({ ...base, metadata: null }).ok, false);
});

test("only known items can be fulfilled", () => {
  assert.equal(readPaidSession({ ...base, metadata: { ...base.metadata, item: "s1" } }).ok, false, "a co-living item is not a fleet item");
  assert.equal(isPayableItem("onboarding_fee"), true);
  assert.equal(isPayableItem("toString"), false, "prototype keys are not items");
});

test("a session with no amount is refused rather than recorded as $0", () => {
  assert.equal(readPaidSession({ ...base, amount_total: null }).ok, false);
  assert.equal(readPaidSession({ ...base, amount_total: 0 }).ok, false);
});

test("there is no default fee: no amount entered means no line item", () => {
  assert.equal(lineItemFor("onboarding_fee", 0), null);
  assert.equal(lineItemFor("onboarding_fee", -500), null);
  assert.equal(lineItemFor("onboarding_fee", 12.5), null);
  assert.equal(lineItemFor("onboarding_fee", 25_000)?.price_data.unit_amount, 25_000);
});

test("the webhook can tell the two trackers apart", () => {
  assert.notEqual(FLEET_PRODUCT_TAG, PARTNERSHIP_PRODUCT_TAG);
});
