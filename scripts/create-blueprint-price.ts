/**
 * Create (or find) the Stripe Product + Price for Room Rental Riches: The
 * Blueprint, and print the price ID to put in BLUEPRINT_STRIPE_PRICE_ID.
 *
 * Run:
 *   npm run blueprint:price
 * which is:
 *   node --env-file=.env.local --import tsx scripts/create-blueprint-price.ts
 *
 * IDEMPOTENT. The product is looked up by a stable metadata key rather than by
 * name, so re-running does not mint duplicates. If a price at the right amount
 * already exists on that product, it is reused; only a price CHANGE creates a
 * new price (Stripe prices are immutable — you never edit one, you make a new
 * one and repoint the env var).
 *
 * Whichever key is in STRIPE_SECRET_KEY decides whether this touches test or
 * live. Check before running:
 *   sk_test_… → test mode      sk_live_… → LIVE, real money
 */

import Stripe from "stripe";
import { BLUEPRINT, BLUEPRINT_PRODUCT_TAG } from "../src/lib/blueprint";

const PRICE_CENTS = BLUEPRINT.priceUsd * 100;

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("STRIPE_SECRET_KEY is not set in .env.local.");
    process.exit(1);
  }

  const mode = key.startsWith("sk_live") ? "LIVE" : "TEST";
  console.log(`Stripe mode: ${mode}`);

  const stripe = new Stripe(key);

  // 1. Find the product by our stable tag, not by name (names get edited).
  const search = await stripe.products.search({
    query: `metadata['product_tag']:'${BLUEPRINT_PRODUCT_TAG}'`,
    limit: 1,
  });

  let product = search.data[0];
  if (product) {
    console.log(`  found product   ${product.id} (${product.name})`);
  } else {
    product = await stripe.products.create({
      name: BLUEPRINT.name,
      description: BLUEPRINT.subtitle,
      metadata: { product_tag: BLUEPRINT_PRODUCT_TAG },
    });
    console.log(`  created product ${product.id}`);
  }

  // 2. Reuse an active price at the right amount if one exists.
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const existing = prices.data.find(
    (p) =>
      p.unit_amount === PRICE_CENTS &&
      p.currency === "usd" &&
      p.type === "one_time",
  );

  let price = existing;
  if (price) {
    console.log(`  found price     ${price.id} ($${BLUEPRINT.priceUsd})`);
  } else {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: PRICE_CENTS,
      metadata: { product_tag: BLUEPRINT_PRODUCT_TAG },
    });
    console.log(`  created price   ${price.id} ($${BLUEPRINT.priceUsd})`);
  }

  console.log(`\nSet this in .env.local (${mode} mode):\n`);
  console.log(`BLUEPRINT_STRIPE_PRICE_ID=${price.id}`);

  if (mode === "LIVE") {
    console.log(
      "\nThis is a LIVE price. Also set it in the Vercel project env before deploying.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
