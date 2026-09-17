/**
 * Pull the main Amazon product image for every marketplace product that still
 * shows the placeholder plate and whose affiliate link is an Amazon short link.
 *
 *   node --env-file=.env.local --import tsx scripts/import-amazon-product-images.ts            # dry run
 *   node --env-file=.env.local --import tsx scripts/import-amazon-product-images.ts --apply    # write
 *   node --env-file=.env.local --import tsx scripts/import-amazon-product-images.ts --only=slug-a,slug-b
 *
 * Per product:
 *   1. Follow the short link (link.amazon/... -> amzlinks.in -> amazon.com/dp/ASIN).
 *   2. Fetch the product page with a browser user agent and read the hi-res
 *      main image (data-old-hires, else the first "hiRes" in the image JSON).
 *   3. Download it through importImageFromUrl (same path as the admin form),
 *      insert into `uploads`, and point image_url at /api/images/<id>.
 *
 * Dry run writes docs/marketplace/bnhg_marketplace_amazon_images.json with the
 * resolved ASIN, page title, and image URL for every product so the matches
 * can be eyeballed before --apply. Products already resolved in that manifest
 * are reused on later runs (dry or --apply) so Amazon is only hit for the
 * rows still missing; --refresh re-resolves everything. Amazon's bot check
 * usually trips after ~50 page loads in a row, so expect to run this in a few
 * passes with a pause between them.
 *
 * Only rows whose image_url is still the placeholder are touched, so re-running
 * is safe. Rows that already have a real image are skipped.
 *
 * LICENSING: the Associates Operating Agreement wants product imagery via the
 * Product Advertising API. Alex's call (2026-09-16) is to import now and move
 * to PA-API once the account has three qualifying sales. See image-import.ts.
 *
 * Builds its own Neon client (see restore-marketplace.ts for why).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { importImageFromUrl } from "../src/lib/image-import";

const APPLY = process.argv.includes("--apply");
// Ignore the manifest cache and re-resolve everything against Amazon.
const REFRESH = process.argv.includes("--refresh");
const ONLY = process.argv
  .find((a) => a.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const PLACEHOLDER = "/images/brand-asset.png";
const SHORT_LINK_PREFIX = "https://link.amazon/";
const MANIFEST = path.join(
  process.cwd(),
  "docs/marketplace/bnhg_marketplace_amazon_images.json",
);
const DELAY_MS = 4000;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml",
};

interface Row {
  id: number;
  slug: string;
  name: string;
  affiliate_url: string;
  image_url: string;
}

interface Resolved {
  slug: string;
  name: string;
  asin: string | null;
  pageTitle: string | null;
  imageUrl: string | null;
  uploadId?: number;
  error?: string;
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function resolveAsin(shortUrl: string): Promise<string | null> {
  const res = await fetch(shortUrl, {
    redirect: "follow",
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(20_000),
  });
  const m = res.url.match(/\/dp\/([A-Z0-9]{10})/);
  // Drain so the socket is released.
  await res.arrayBuffer().catch(() => undefined);
  return m ? m[1] : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function fetchMainImage(
  asin: string,
): Promise<{ title: string | null; imageUrl: string | null; blocked: boolean }> {
  const res = await fetch(`https://www.amazon.com/dp/${asin}`, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(30_000),
  });
  const html = await res.text();
  const blocked = /Robot Check|automated access|validateCaptcha/i.test(html);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null;
  const oldHires = html.match(/data-old-hires="([^"]+)"/)?.[1];
  const hiRes = html.match(/"hiRes":"(https:[^"]+)"/)?.[1];
  const landing = html
    .match(/id="landingImage"[^>]*\ssrc="([^"]+)"/)?.[1];
  const imageUrl = oldHires || hiRes || landing || null;
  return {
    title: title ? decodeEntities(title).replace(/^Amazon\.com:\s*/, "") : null,
    imageUrl: imageUrl ? decodeEntities(imageUrl) : null,
    blocked,
  };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) fail("DATABASE_URL is not set");
  const sql = neon(url);

  let rows = (await sql`
    SELECT id, slug, name, affiliate_url, image_url
    FROM marketplace_products
    WHERE image_url = ${PLACEHOLDER}
      AND affiliate_url LIKE ${SHORT_LINK_PREFIX + "%"}
    ORDER BY slug
  `) as Row[];
  if (ONLY && ONLY.length) rows = rows.filter((r) => ONLY.includes(r.slug));

  console.log(
    `${APPLY ? "APPLY" : "DRY RUN"}: ${rows.length} placeholder products with Amazon short links`,
  );

  const cache = new Map<string, Resolved>();
  if (!REFRESH && existsSync(MANIFEST)) {
    const prior = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
      results: Resolved[];
    };
    for (const r of prior.results) {
      if (r.asin && r.imageUrl && !r.error) cache.set(r.slug, r);
    }
    console.log(`Reusing ${cache.size} products already resolved in the manifest`);
  }

  const results: Resolved[] = [];
  let written = 0;

  for (const [i, row] of rows.entries()) {
    const out: Resolved = {
      slug: row.slug,
      name: row.name,
      asin: null,
      pageTitle: null,
      imageUrl: null,
    };
    results.push(out);
    const tag = `[${i + 1}/${rows.length}] ${row.slug}`;

    let hitAmazon = false;
    try {
      const cached = cache.get(row.slug);
      if (cached) {
        out.asin = cached.asin;
        out.pageTitle = cached.pageTitle;
        out.imageUrl = cached.imageUrl;
        console.log(`${tag}: (cached) ${out.asin}`);
      } else {
        hitAmazon = true;
        out.asin = await resolveAsin(row.affiliate_url);
        if (!out.asin) {
          out.error = "short link did not land on an amazon.com/dp/ page";
          console.log(`${tag}: ✗ ${out.error}`);
          continue;
        }
        await sleep(DELAY_MS);

        const page = await fetchMainImage(out.asin);
        out.pageTitle = page.title;
        out.imageUrl = page.imageUrl;
        if (page.blocked) {
          out.error = "amazon served a bot check";
          console.log(`${tag}: ✗ ${out.error}`);
          break; // keep hammering and every remaining row gets blocked too
        }
        if (!out.imageUrl) {
          out.error = "no main image found on page";
          console.log(`${tag}: ✗ ${out.error}`);
          continue;
        }
        console.log(`${tag}: ${out.asin} · ${out.pageTitle?.slice(0, 60)}`);
      }

      if (APPLY) {
        const img = await importImageFromUrl(out.imageUrl ?? "");
        if (!img.ok) {
          out.error = `download failed: ${img.error}`;
          console.log(`${tag}: ✗ ${out.error}`);
          continue;
        }
        const inserted = await sql`
          INSERT INTO uploads (filename, content_type, data)
          VALUES (${`${row.slug}-${img.filename}`}, ${img.contentType}, ${img.base64})
          RETURNING id
        `;
        const uploadId = inserted[0].id as number;
        out.uploadId = uploadId;
        await sql`
          UPDATE marketplace_products
          SET image_url = ${`/api/images/${uploadId}`},
              image_alt = ${row.name},
              image_anchor = 'center',
              updated_at = NOW()
          WHERE id = ${row.id} AND image_url = ${PLACEHOLDER}
        `;
        written++;
        console.log(`${tag}: ✓ image_url -> /api/images/${uploadId}`);
      }
    } catch (err) {
      out.error = err instanceof Error ? err.message : String(err);
      console.log(`${tag}: ✗ ${out.error}`);
    }
    if (hitAmazon) await sleep(DELAY_MS);
  }

  // A run that broke out early (bot check) must not drop rows the manifest
  // already had resolved but this run never reached.
  const seen = new Set(results.map((r) => r.slug));
  for (const [slug, r] of cache) if (!seen.has(slug)) results.push(r);
  results.sort((a, b) => a.slug.localeCompare(b.slug));

  writeFileSync(
    MANIFEST,
    JSON.stringify(
      { generated_at: new Date().toISOString(), apply: APPLY, results },
      null,
      2,
    ) + "\n",
  );

  const failed = results.filter((r) => r.error);
  console.log(
    `\nDone. ${results.length} processed, ${failed.length} failed${APPLY ? `, ${written} written` : ""}.`,
  );
  console.log(`Manifest: ${path.relative(process.cwd(), MANIFEST)}`);
  if (failed.length) {
    console.log("Failed:");
    for (const f of failed) console.log(`  ${f.slug}: ${f.error}`);
  }
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
