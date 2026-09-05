/**
 * Upload one of Alex's car rental books (PDF + ePub) to a PRIVATE Vercel
 * Blob store.
 *
 *   npm run crr-book:upload          The Inside Lane (paid, $32)
 *   npm run crr-free-ebook:upload    Before You Buy the Car (free magnet)
 *
 * Both are:
 *   node --env-file=.env.local --import tsx scripts/upload-crr-book.ts [--free]
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local.
 *
 * PRIVATE ACCESS: uploaded with access:"private", so the raw blob URLs are NOT
 * publicly fetchable. Readers reach the files through a signed-download route
 * that verifies an HMAC token then mints a short-lived signed URL per click
 * (src/lib/crr-blueprint.ts for the paid book, src/lib/crr-free-ebook.ts for
 * the free one). Same contract as scripts/upload-blueprint.ts.
 *
 * Idempotent: fixed pathnames + allowOverwrite:true, so re-running after a
 * revision replaces the file at the SAME pathname. The env vars store the
 * PATHNAME (not a URL), so they never change across re-uploads. Set once.
 *
 * Source files are produced by `npm run crr-book:build` (and the free-ebook
 * variant documented at the top of scripts/build-crr-book.ts). Override the
 * folder with CRR_BOOK_OUT=/abs/path if it moves.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";

const FREE = process.argv.includes("--free");

interface Target {
  label: string;
  /** Unguessable-ish prefix so blob pathnames aren't enumerable from the
   *  product name alone. Keep these STABLE: changing one changes every
   *  pathname and every env var that stores it. */
  prefix: string;
  defaultSrc: string;
  slug: string;
  envPdf: string;
  envEpub: string;
  secretEnv: string;
}

const PAID: Target = {
  label: "The Inside Lane",
  prefix: "crr-blueprint-b3f7a2",
  defaultSrc: "/Users/alexhenry/Projects/Car Rental Riches/04_Book/build",
  slug: "car-rental-riches-blueprint",
  envPdf: "CRR_BLUEPRINT_BLOB_KEY_PDF",
  envEpub: "CRR_BLUEPRINT_BLOB_KEY_EPUB",
  secretEnv: "CRR_BLUEPRINT_DOWNLOAD_SECRET",
};

const FREE_EBOOK: Target = {
  label: "Before You Buy the Car (free)",
  prefix: "crr-free-ebook-9d2c41",
  defaultSrc:
    "/Users/alexhenry/Projects/Car Rental Riches/04_Book/build_free_ebook",
  slug: "before-you-buy-the-car",
  envPdf: "CRR_FREE_EBOOK_BLOB_KEY_PDF",
  envEpub: "CRR_FREE_EBOOK_BLOB_KEY_EPUB",
  secretEnv: "CRR_FREE_EBOOK_DOWNLOAD_SECRET",
};

const T = FREE ? FREE_EBOOK : PAID;
const SRC = process.env.CRR_BOOK_OUT || T.defaultSrc;

// [local filename, blob pathname, contentType, env var that stores the pathname]
const FILES: Array<[string, string, string, string]> = [
  [`${T.slug}.pdf`, `${T.prefix}/${T.slug}.pdf`, "application/pdf", T.envPdf],
  [`${T.slug}.epub`, `${T.prefix}/${T.slug}.epub`, "application/epub+zip", T.envEpub],
];

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error(
      "BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local (Vercel -> Storage -> Blob store -> .env.local tab).",
    );
    process.exit(1);
  }

  if (!existsSync(SRC)) {
    console.error(
      `Source folder not found:\n  ${SRC}\nRun the book build first, or set CRR_BOOK_OUT to override.`,
    );
    process.exit(1);
  }

  console.log(`Uploading ${T.label} from ${SRC}`);
  const envLines: string[] = [];

  for (const [filename, pathname, contentType, envVar] of FILES) {
    const abs = path.join(SRC, filename);
    if (!existsSync(abs)) {
      console.error(`  MISSING  ${abs}`);
      process.exit(1);
    }

    const body = await readFile(abs);
    const { url } = await put(pathname, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      token,
    });

    const mb = (body.byteLength / 1024 / 1024).toFixed(1);
    console.log(`  uploaded ${filename}  ${mb} MB  ->  ${pathname}`);
    // The URL is logged only to prove the blob exists; it is private and
    // unusable without a signed token.
    console.log(`           (private url: ${url.slice(0, 60)}...)`);
    envLines.push(`${envVar}=${pathname}`);
  }

  console.log("\nAdd these to .env.local (and to Vercel project env):\n");
  console.log(envLines.join("\n"));
  console.log(
    `\nAlso set ${T.secretEnv} to a random 32+ char string if not already set` +
      (FREE ? " (it falls back to CRR_BLUEPRINT_DOWNLOAD_SECRET when unset):" : ":"),
  );
  console.log("  openssl rand -base64 32");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
