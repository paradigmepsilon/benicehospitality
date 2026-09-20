import { test } from "node:test";
import assert from "node:assert/strict";
import { PARTNERSHIP_PRODUCT_TAG, isPayableItem, readPaidSession } from "./payments";

const base = { id: "cs_test_123", amount_total: 100_000, metadata: { product: PARTNERSHIP_PRODUCT_TAG, engagement_id: "42", item: "s1" } };

test("a well-formed paid session yields the facts fulfillment needs", () => {
  assert.deepEqual(readPaidSession(base), {
    ok: true,
    facts: { sessionId: "cs_test_123", engagementId: 42, item: "s1", amountCents: 100_000 },
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
  assert.equal(readPaidSession({ ...base, metadata: { ...base.metadata, item: "s9" } }).ok, false);
  assert.equal(isPayableItem("s1"), true);
  assert.equal(isPayableItem("toString"), false, "prototype keys are not items");
});

test("a session with no amount is refused rather than recorded as $0", () => {
  assert.equal(readPaidSession({ ...base, amount_total: null }).ok, false);
  assert.equal(readPaidSession({ ...base, amount_total: 0 }).ok, false);
});

test("with no Price id configured, checkout charges the approved amount inline", async () => {
  const { lineItemFor } = await import("./payments");
  const saved = process.env.PARTNERSHIP_S1_STRIPE_PRICE_ID;
  try {
    delete process.env.PARTNERSHIP_S1_STRIPE_PRICE_ID;
    const inline = lineItemFor("s1");
    assert.equal(inline.price_data?.unit_amount, 100_000);
    assert.equal(inline.price_data?.currency, "usd");
    process.env.PARTNERSHIP_S1_STRIPE_PRICE_ID = "price_abc";
    assert.deepEqual(lineItemFor("s1"), { price: "price_abc", quantity: 1 });
  } finally {
    if (saved === undefined) delete process.env.PARTNERSHIP_S1_STRIPE_PRICE_ID;
    else process.env.PARTNERSHIP_S1_STRIPE_PRICE_ID = saved;
  }
});
