/**
 * Backfill claimproof_purchases from Stripe history.
 *
 * Idempotent: inserts use ON CONFLICT (stripe_session_id) DO NOTHING, refund
 * marking is a plain UPDATE. Run with --dry-run first.
 *
 *   npm run db:migrate                      (table must exist)
 *   node --env-file=.env.local --import tsx scripts/backfill-claimproof-purchases.ts --dry-run
 *   node --env-file=.env.local --import tsx scripts/backfill-claimproof-purchases.ts
 */
import type Stripe from "stripe";
import { getStripe } from "../src/lib/stripe";
import { sql } from "../src/lib/db";
import { CLAIM_PROOF_PRODUCT_TAG, isClaimProofTier } from "../src/lib/claim-proof";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  // src/lib/db.ts silently stubs sql`` to [] when DATABASE_URL is unset —
  // a real run would then "complete" without writing anything. Note that
  // `vercel env pull` leaves DATABASE_URL empty (it's a sensitive var);
  // supply it explicitly, e.g. from Unified-Ops' BNHG_DATABASE_URL.
  if (!DRY_RUN && !process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required for a real run (dry-run works without it).");
    process.exit(1);
  }
  const stripe = getStripe();
  let inserted = 0;
  let skipped = 0;

  // 1. Paid Claim Proof checkout sessions → purchase rows.
  for await (const session of stripe.checkout.sessions.list({ limit: 100 })) {
    if (session.metadata?.product !== CLAIM_PROOF_PRODUCT_TAG) continue;
    if (session.payment_status !== "paid") continue;
    const email =
      session.customer_details?.email || session.customer_email || null;
    if (!email) {
      console.warn(`skip ${session.id}: no email`);
      skipped++;
      continue;
    }
    const tierRaw = session.metadata?.tier;
    const tier = isClaimProofTier(tierRaw) ? tierRaw : "core";
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    if (DRY_RUN) {
      console.log(
        `would insert ${session.id} ${tier} ${email} $${(session.amount_total ?? 0) / 100}`,
      );
      inserted++;
      continue;
    }
    const rows = await sql`
      INSERT INTO claimproof_purchases
        (stripe_session_id, stripe_payment_intent, email, tier, amount_cents,
         currency, amount_discount_cents, purchased_at)
      VALUES
        (${session.id}, ${paymentIntent}, ${email.toLowerCase().trim()}, ${tier},
         ${session.amount_total ?? 0}, ${session.currency ?? "usd"},
         ${session.total_details?.amount_discount ?? 0},
         ${new Date(session.created * 1000).toISOString()})
      ON CONFLICT (stripe_session_id) DO NOTHING
      RETURNING id
    `;
    if (rows.length > 0) inserted++;
    else skipped++;
  }

  // 2. Refunds → mark rows. Cheap to scan all refunds; only payment_intents
  //    that match a mirrored Claim Proof purchase update anything.
  let refunded = 0;
  if (!DRY_RUN) {
    const refundList: Stripe.ApiListPromise<Stripe.Refund> = stripe.refunds.list({ limit: 100 });
    for await (const refund of refundList) {
      const pi =
        typeof refund.payment_intent === "string"
          ? refund.payment_intent
          : refund.payment_intent?.id ?? null;
      if (!pi) continue;
      const rows = await sql`
        UPDATE claimproof_purchases
        SET status = 'refunded',
            refunded_at = ${new Date(refund.created * 1000).toISOString()}
        WHERE stripe_payment_intent = ${pi} AND status <> 'refunded'
        RETURNING id
      `;
      refunded += rows.length;
    }
  }

  console.log(
    `${DRY_RUN ? "[dry-run] " : ""}done: ${inserted} inserted, ${skipped} skipped, ${refunded} marked refunded`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
