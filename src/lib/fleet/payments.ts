import { sql } from "@/lib/db";

/**
 * Card payment for a fleet management owner. Deliberately NOT a public buy
 * button: management is sold on a call and the agreement is signed first, so
 * the only way to get a checkout link is an admin creating one from the
 * owner's tracker page. The shared Stripe webhook routes on this tag.
 *
 * IMPORTANT: every session MUST carry this tag. The webhook treats an untagged
 * session as a course purchase and would try to enroll the payer.
 */
export const FLEET_PRODUCT_TAG = "fleet_management";

export const FLEET_THANKS_PATH = "/management/thanks";

/**
 * What an admin can raise a payment link for. The onboarding fee only, and it
 * has no fixed price: the amount is whatever Alex entered on that owner's card
 * from their signed Exhibit B. `step` is the checklist item a payment ticks.
 */
export const PAYABLE_ITEMS = {
  onboarding_fee: { label: "Onboarding fee", step: "signed.fee_paid" },
} as const;

export type PayableItemKey = keyof typeof PAYABLE_ITEMS;

export function isPayableItem(v: unknown): v is PayableItemKey {
  // hasOwn, not `in`: "toString" in {} is true, and this value comes from metadata.
  return typeof v === "string" && Object.hasOwn(PAYABLE_ITEMS, v);
}

/**
 * The Checkout line item for this owner, or null when no fee has been entered.
 * There is no default on purpose. A link for an amount nobody agreed to is
 * worse than no link, so the route refuses instead of guessing.
 */
export function lineItemFor(item: PayableItemKey, onboardingFeeCents: number) {
  if (!Number.isInteger(onboardingFeeCents) || onboardingFeeCents <= 0) return null;
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: onboardingFeeCents,
      product_data: { name: `BNHG Fleet Management · ${PAYABLE_ITEMS[item].label}` },
    },
  };
}

export interface PaidSessionFacts {
  sessionId: string;
  engagementId: number;
  item: PayableItemKey;
  amountCents: number;
}

/**
 * Pull what fulfillment needs out of a paid session's metadata, or say why it
 * cannot be fulfilled. Pure, so the webhook's trust boundary is unit tested.
 */
export function readPaidSession(session: {
  id: string;
  amount_total: number | null;
  metadata: Record<string, string> | null;
}): { ok: true; facts: PaidSessionFacts } | { ok: false; reason: string } {
  const meta = session.metadata ?? {};
  const engagementId = Number(meta.engagement_id);
  if (!Number.isInteger(engagementId) || engagementId <= 0) {
    return { ok: false, reason: "missing or invalid engagement_id" };
  }
  if (!isPayableItem(meta.item)) return { ok: false, reason: `unknown item "${meta.item ?? ""}"` };
  if (typeof session.amount_total !== "number" || session.amount_total <= 0) {
    return { ok: false, reason: "no amount on the session" };
  }
  return {
    ok: true,
    facts: { sessionId: session.id, engagementId, item: meta.item, amountCents: session.amount_total },
  };
}

/**
 * Record a payment against an owner exactly once, however many times Stripe
 * delivers the event (completed + async_payment_succeeded, retries).
 *
 * The once-only guard is the first statement: fleet_steps is unique on
 * (engagement_id, step_key) for owner-level rows, so inserting the key
 * "stripe:<session id>" either claims this session atomically or returns
 * nothing. Nothing else runs unless the claim succeeded. journey.ts ignores
 * step keys it does not define, so the marker never shows up in a checklist.
 * That index is partial, so each ON CONFLICT restates its predicate.
 */
export async function recordFleetPayment(facts: PaidSessionFacts): Promise<"recorded" | "duplicate" | "no_engagement"> {
  const exists = await sql`SELECT 1 FROM fleet_engagements WHERE id = ${facts.engagementId}`;
  if (exists.length === 0) return "no_engagement";

  const claimed = await sql`
    INSERT INTO fleet_steps (engagement_id, step_key, done_by)
    VALUES (${facts.engagementId}, ${`stripe:${facts.sessionId}`}, 'stripe')
    ON CONFLICT (engagement_id, step_key) WHERE vehicle_id IS NULL DO NOTHING
    RETURNING id
  `;
  if (claimed.length === 0) return "duplicate";

  const { label, step } = PAYABLE_ITEMS[facts.item];
  const dollars = (facts.amountCents / 100).toLocaleString("en-US");
  await sql`
    UPDATE fleet_engagements SET
      paid_cents = paid_cents + ${facts.amountCents},
      updated_at = NOW()
    WHERE id = ${facts.engagementId}
  `;
  await sql`
    INSERT INTO fleet_steps (engagement_id, step_key, done_by)
    VALUES (${facts.engagementId}, ${step}, 'stripe')
    ON CONFLICT (engagement_id, step_key) WHERE vehicle_id IS NULL DO NOTHING
  `;
  await sql`
    INSERT INTO fleet_events (engagement_id, kind, body, created_by)
    VALUES (${facts.engagementId}, 'money', ${`Card payment received: $${dollars} · ${label} · ${facts.sessionId}`}, 'stripe')
  `;
  return "recorded";
}
