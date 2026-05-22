import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";

// One-time (idempotent on re-run) sync script. For every published course_tiers
// row that doesn't yet have a stripe_price_id, this creates a Stripe Product
// + Price and writes the IDs back to the DB.
//
// Re-running is safe — rows that already have IDs are skipped. Update the
// price by setting stripe_price_id = NULL on the row and re-running (this
// will create a NEW Stripe Price; old paid sessions still reference the old
// Stripe Price by ID and remain valid). Stripe Prices are immutable; the only
// way to change a price is to create a new one.
//
// Run:
//   node --env-file=.env.local --import tsx scripts/sync-stripe-prices.ts

interface TierRow {
  id: number;
  course_id: number;
  tier: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  course_title: string;
  course_slug: string;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }
  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY not set in .env.local");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const stripe = new Stripe(stripeKey);

  const tiers = (await sql`
    SELECT t.id, t.course_id, t.tier, t.name, t.description, t.price_cents,
           t.currency, t.stripe_product_id, t.stripe_price_id,
           c.title AS course_title, c.slug AS course_slug
    FROM course_tiers t
    JOIN courses c ON c.id = t.course_id
    WHERE t.is_published = true
    ORDER BY c.display_position, t.position
  `) as TierRow[];

  if (tiers.length === 0) {
    console.log("No published tiers found. Run db:migrate first to seed RRR.");
    return;
  }

  let created = 0;
  let skipped = 0;
  for (const t of tiers) {
    if (t.stripe_price_id) {
      console.log(`  · ${t.course_title} / ${t.name} — already synced (${t.stripe_price_id})`);
      skipped++;
      continue;
    }

    // Create or reuse the product (one product per course).
    let productId = t.stripe_product_id;
    if (!productId) {
      // Look across other tiers for the same course to share a product.
      const sibling = tiers.find(
        (other) =>
          other.course_id === t.course_id && other.stripe_product_id !== null,
      );
      if (sibling?.stripe_product_id) {
        productId = sibling.stripe_product_id;
      } else {
        const product = await stripe.products.create({
          name: t.course_title,
          description: `${t.course_title} (${t.name})`,
          metadata: { bnhg_course_slug: t.course_slug },
        });
        productId = product.id;
      }
    }

    const price = await stripe.prices.create({
      product: productId,
      unit_amount: t.price_cents,
      currency: t.currency,
      nickname: `${t.course_title} – ${t.name}`,
      metadata: {
        bnhg_course_slug: t.course_slug,
        bnhg_tier: t.tier,
        bnhg_tier_id: String(t.id),
      },
    });

    await sql`
      UPDATE course_tiers
      SET stripe_product_id = ${productId},
          stripe_price_id = ${price.id},
          updated_at = NOW()
      WHERE id = ${t.id}
    `;

    // Mutate local cache so siblings reuse the same product on subsequent loop iterations.
    t.stripe_product_id = productId;
    t.stripe_price_id = price.id;

    console.log(
      `  ✓ ${t.course_title} / ${t.name} → product ${productId} · price ${price.id} · $${(t.price_cents / 100).toFixed(2)}`,
    );
    created++;
  }

  console.log(`\nDone. Created ${created} Stripe price${created === 1 ? "" : "s"}, skipped ${skipped} already-synced row${skipped === 1 ? "" : "s"}.`);
}

main().catch((err) => {
  console.error("sync-stripe-prices failed:", err);
  process.exit(1);
});
