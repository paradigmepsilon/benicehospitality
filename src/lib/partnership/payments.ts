import { sql } from "@/lib/db";
import { SECTIONS } from "./journey";

/**
 * Card payment for a partnership engagement. Deliberately NOT a public buy
 * button: a consulting engagement is sold on a call and signed first, so the
 * only way to get a checkout link is an admin creating one from the client's
 * tracker page. The shared Stripe webhook routes on this tag.
 *
 * IMPORTANT: every session MUST carry this tag. The webhook treats an untagged
 * session as a course purchase and would try to enroll the payer.
 */
export const PARTNERSHIP_PRODUCT_TAG = "launch_partnership";

export const PARTNERSHIP_THANKS_PATH = "/partnership/thanks";

/** What an admin can raise a payment link for today. Section 1 only: its price is fixed and approved. */
export const PAYABLE_ITEMS = {
  s1: { section: 1 as const, label: SECTIONS[0].label, envPrice: "PARTNERSHIP_S1_STRIPE_PRICE_ID" },
} as const;

export type PayableItemKey = keyof typeof PAYABLE_ITEMS;

export function isPayableItem(v: unknown): v is PayableItemKey {
  // hasOwn, not `in`: "toString" in {} is true, and this value comes from metadata.
  return typeof v === "string" && Object.hasOwn(PAYABLE_ITEMS, v);
}

/** An optional pre-made BNHG Stripe Price (price_...). Null when unset. */
export function getPartnershipPriceId(item: PayableItemKey): string | null {
  return process.env[PAYABLE_ITEMS[item].envPrice] || null;
}

/**
 * The Checkout line item. With a Price id in the env it uses that; without
 * one it sends the approved amount inline, straight from journey.ts. That is
 * what lets production take a payment with only STRIPE_SECRET_KEY set: no
 * live Price has to exist first, and the amount can never drift from the
 * price the documents quote.
 */
export function lineItemFor(item: PayableItemKey) {
  const priceId = getPartnershipPriceId(item);
  if (priceId) return { price: priceId, quantity: 1 };
  const { section, label } = PAYABLE_ITEMS[item];
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: SECTIONS[section - 1].priceCents,
      product_data: { name: `Co-Living Launch Partnership · Section ${section} · ${label}` },
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
 * Record a payment against an engagement exactly once, however many times
 * Stripe delivers the event (completed + async_payment_succeeded, retries).
 *
 * The once-only guard is the first statement: partnership_steps is unique on
 * (engagement_id, step_key), so inserting the key "stripe:<session id>" either
 * claims this session atomically or returns nothing. Nothing else runs unless
 * the claim succeeded. journey.ts ignores step keys it does not define, so the
 * marker never shows up in a checklist.
 */
export async function recordPartnershipPayment(facts: PaidSessionFacts): Promise<"recorded" | "duplicate" | "no_engagement"> {
  const exists = await sql`SELECT 1 FROM partnership_engagements WHERE id = ${facts.engagementId}`;
  if (exists.length === 0) return "no_engagement";

  const claimed = await sql`
    INSERT INTO partnership_steps (engagement_id, step_key, done_by)
    VALUES (${facts.engagementId}, ${`stripe:${facts.sessionId}`}, 'stripe')
    ON CONFLICT (engagement_id, step_key) DO NOTHING
    RETURNING id
  `;
  if (claimed.length === 0) return "duplicate";

  const { section } = PAYABLE_ITEMS[facts.item];
  const dollars = (facts.amountCents / 100).toLocaleString("en-US");
  // A paid section moves to "sold" unless delivery has already moved it further.
  await sql`
    UPDATE partnership_engagements SET
      paid_cents = paid_cents + ${facts.amountCents},
      s1_status = CASE WHEN ${section} = 1 AND s1_status IN ('not_sold', 'proposed') THEN 'sold' ELSE s1_status END,
      updated_at = NOW()
    WHERE id = ${facts.engagementId}
  `;
  await sql`
    INSERT INTO partnership_steps (engagement_id, step_key, done_by)
    VALUES (${facts.engagementId}, 's1_proposed.paid', 'stripe')
    ON CONFLICT (engagement_id, step_key) DO NOTHING
  `;
  await sql`
    INSERT INTO partnership_events (engagement_id, kind, body, created_by)
    VALUES (${facts.engagementId}, 'money', ${`Card payment received: $${dollars} · Section ${section} · ${facts.sessionId}`}, 'stripe')
  `;
  return "recorded";
}
