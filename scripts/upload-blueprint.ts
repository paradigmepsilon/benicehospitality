/**
 * Upload Room Rental Riches: The Blueprint (PDF + ePub) to a PRIVATE Vercel
 * Blob store.
 *
 * Run:
 *   npm run blueprint:upload
 * which is:
 *   node --env-file=.env.local --import tsx scripts/upload-blueprint.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local.
 *
 * PRIVATE ACCESS: uploaded with access:"private", so the raw blob URLs are NOT
 * publicly fetchable. Buyers reach the files through /api/blueprint/download,
 * which verifies an HMAC token then mints a short-lived signed URL per click.
 * Same contract as scripts/upload-claimproof.ts.
 *
 * Idempotent: fixed pathnames + allowOverwrite:true, so re-running after a
 * revision replaces the file at the SAME pathname. The env vars store the
 * PATHNAME (not a URL), so they never change across re-uploads — set once.
 *
 * Source files live in Google Drive (synced locally), not this repo. Override
 * with BLUEPRINT_SRC=/abs/path if the folder moves.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { put } from "@vercel/blob";

// Unguessable-ish prefix so blob pathnames aren't enumerable from the product
// name alone. Keep this string STABLE — changing it changes every pathname.
const PREFIX = "blueprint-4c81e6";

const SRC =
  process.env.BLUEPRINT_SRC ||
  path.join(
    homedir(),
    "Library",
    "CloudStorage",
    "GoogleDrive-benicehospitality@gmail.com",
    "My Drive",
    "Operations",
    "Be Nice Hospitality",
    "Course",
    "Room Rental Riches: The Blueprint",
    "Complete Book",
  );

// [local filename, blob pathname, contentType, env var that stores the pathname]
const FILES: Array<[string, string, string, string]> = [
  [
    "blueprint.pdf",
    `${PREFIX}/room-rental-riches-blueprint.pdf`,
    "application/pdf",
    "BLUEPRINT_BLOB_KEY_PDF",
  ],
  [
    "blueprint.epub",
    `${PREFIX}/room-rental-riches-blueprint.epub`,
    "application/epub+zip",
    "BLUEPRINT_BLOB_KEY_EPUB",
  ],
];

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error(
      "BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local (Vercel → Storage → Blob store → .env.local tab).",
    );
    process.exit(1);
  }

  if (!existsSync(SRC)) {
    console.error(`Source folder not found:\n  ${SRC}\nSet BLUEPRINT_SRC to override.`);
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
    console.log(`  uploaded ${filename}  ${mb} MB  →  ${pathname}`);
    // The URL is logged only to prove the blob exists; it is private and
    // unusable without a signed token.
    console.log(`           (private url: ${url.slice(0, 60)}…)`);
    envLines.push(`${envVar}=${pathname}`);
  }

  console.log("\nAdd these to .env.local (and to Vercel project env):\n");
  console.log(envLines.join("\n"));
  console.log(
    "\nAlso set BLUEPRINT_DOWNLOAD_SECRET to a random 32+ char string if not already set:",
  );
  console.log("  openssl rand -base64 32");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
