/**
 * Upload The Car Rental Riches Blueprint (PDF + ePub) to a PRIVATE Vercel
 * Blob store.
 *
 * Run:
 *   npm run crr-book:upload
 * which is:
 *   node --env-file=.env.local --import tsx scripts/upload-crr-book.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local.
 *
 * PRIVATE ACCESS: uploaded with access:"private", so the raw blob URLs are NOT
 * publicly fetchable. Buyers reach the files through a signed-download route
 * that verifies an HMAC token then mints a short-lived signed URL per click.
 * Same contract as scripts/upload-blueprint.ts.
 *
 * Idempotent: fixed pathnames + allowOverwrite:true, so re-running after a
 * revision replaces the file at the SAME pathname. The env vars store the
 * PATHNAME (not a URL), so they never change across re-uploads. Set once.
 *
 * Source files are produced by `npm run crr-book:build` into the build folder
 * below. Override with CRR_BOOK_OUT=/abs/path if the folder moves.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";

// Unguessable-ish prefix so blob pathnames aren't enumerable from the product
// name alone. Keep this string STABLE. Changing it changes every pathname.
const PREFIX = "crr-blueprint-b3f7a2";

const SRC =
  process.env.CRR_BOOK_OUT ||
  "/Users/alexhenry/Projects/Car Rental Riches/04_Book/build";

// [local filename, blob pathname, contentType, env var that stores the pathname]
const FILES: Array<[string, string, string, string]> = [
  [
    "car-rental-riches-blueprint.pdf",
    `${PREFIX}/car-rental-riches-blueprint.pdf`,
    "application/pdf",
    "CRR_BLUEPRINT_BLOB_KEY_PDF",
  ],
  [
    "car-rental-riches-blueprint.epub",
    `${PREFIX}/car-rental-riches-blueprint.epub`,
    "application/epub+zip",
    "CRR_BLUEPRINT_BLOB_KEY_EPUB",
  ],
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
      `Source folder not found:\n  ${SRC}\nRun \`npm run crr-book:build\` first, or set CRR_BOOK_OUT to override.`,
    );
    process.exit(1);
  }

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
    "\nAlso set CRR_BLUEPRINT_DOWNLOAD_SECRET to a random 32+ char string if not already set:",
  );
  console.log("  openssl rand -base64 32");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
