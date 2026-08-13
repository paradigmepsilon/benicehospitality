// Affiliate price review helper for the Co-Living Property Profitability
// Analysis Worksheet.
//
//   npm run affiliate:prices
//
// Lists every product-linked cost line sorted oldest-price-first, so a review
// pass starts with whatever has drifted furthest. Read-only: it touches no
// database and no network, and it changes nothing on disk. Update the prices by
// editing `price` and `priceCheckedAt` in
// src/lib/resources/breakeven-analysis-worksheet/costs.ts.
//
// WHY THIS IS MANUAL. Amazon's Product Advertising API requires three
// qualifying sales before they grant access, and scraping product pages
// violates their terms of service and gets the IP blocked. A stored price with
// an honest "as of" date beats a live fetch that silently breaks, so the config
// is the source of truth and this script just tells you what to look at.

import {
  COST_LINES,
  PRICE_STALE_DAYS,
  assertCostConfigInvariants,
} from "../src/lib/resources/breakeven-analysis-worksheet/costs";

const today = new Date();

function daysSince(iso: string): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((today.getTime() - then) / 86_400_000);
}

const problems = assertCostConfigInvariants();
if (problems.length > 0) {
  console.error("Cost config problems — fix these first:\n");
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}

const withProducts = COST_LINES.filter((l) => l.product).sort(
  (a, b) => daysSince(b.product!.priceCheckedAt) - daysSince(a.product!.priceCheckedAt),
);

const missingUrl = withProducts.filter((l) => l.product!.affiliateUrl.trim() === "");
const stale = withProducts.filter((l) => daysSince(l.product!.priceCheckedAt) > PRICE_STALE_DAYS);
const serviceLines = COST_LINES.filter((l) => !l.product && l.sourceNote);

const pad = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s.padEnd(n));

console.log(
  "\nCo-Living Property Profitability Analysis Worksheet — affiliate product review\n",
);
console.log(
  `${pad("ID", 16)}${pad("PRODUCT", 44)}${pad("PRICE", 9)}${pad("CHECKED", 13)}${pad("AGE", 8)}LINK`,
);
console.log("-".repeat(104));

for (const line of withProducts) {
  const p = line.product!;
  const age = daysSince(p.priceCheckedAt);
  const ageText = Number.isFinite(age) ? `${age}d` : "?";
  const flag = age > PRICE_STALE_DAYS ? " STALE" : "";
  console.log(
    pad(line.id, 16) +
      pad(p.productName, 44) +
      pad(`$${p.price}`, 9) +
      pad(p.priceCheckedAt, 13) +
      pad(ageText + flag, 8) +
      (p.affiliateUrl.trim() === "" ? "— needs a tagged URL" : "ok"),
  );
}

console.log(`\n${withProducts.length} product lines.`);

if (missingUrl.length > 0) {
  console.log(
    `\n${missingUrl.length} still need a tagged affiliate URL. Until one is set, the line uses`,
  );
  console.log("its price as the default and renders no buy pill — nothing is broken:\n");
  for (const l of missingUrl) console.log(`  ${pad(l.id, 16)}${l.product!.productName}`);
}

if (stale.length > 0) {
  console.log(
    `\n${stale.length} price${stale.length === 1 ? " is" : "s are"} older than ${PRICE_STALE_DAYS} days and show a staleness warning in the tool:\n`,
  );
  for (const l of stale) console.log(`  ${pad(l.id, 16)}${l.product!.productName}`);
} else {
  console.log(`\nNo prices older than ${PRICE_STALE_DAYS} days.`);
}

console.log(
  `\n${serviceLines.length} lines have no purchasable product (filings, premiums, permits, services).`,
);
console.log("Those carry a sourceNote instead and need no link.\n");
