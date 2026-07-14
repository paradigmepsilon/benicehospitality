/**
 * Upload the Claim Proof product PDFs to a PRIVATE Vercel Blob store.
 *
 * Run:
 *   npm run claimproof:upload
 * which is:
 *   node --env-file=.env.local --import tsx scripts/upload-claimproof.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local (from the Vercel dashboard:
 * Storage → your Blob store → ".env.local" tab, or `vercel env pull`).
 *
 * PRIVATE ACCESS: the blobs are uploaded with access:"private", so the raw
 * blob URLs are NOT publicly fetchable — "anyone with the link" cannot open
 * them. Buyers reach the file through our own download endpoint
 * (/api/claimproof/download), which mints a short-lived SIGNED URL per click
 * and redirects. So delivery emails carry a stable, token-gated link to our
 * endpoint; the actual Blob URL is always freshly signed and expires fast.
 *
 * Idempotent: fixed pathnames + allowOverwrite:true, so re-running after you
 * edit a PDF replaces the file at the SAME pathname. The env vars store the
 * PATHNAME (not a URL), so they never change across re-uploads — set once.
 *
 * Source PDFs live in the standalone product workspace, not this repo:
 *   ~/Sites/bna-claim-proof/dist/
 * Override with CLAIM_PROOF_DIST=/abs/path if you moved them.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { put } from "@vercel/blob";

// Unguessable-ish prefix so the public blob URLs aren't enumerable from the
// product name alone. Keep this string STABLE — changing it changes every URL.
const PREFIX = "claim-proof-9f2a7c";

const DIST =
  process.env.CLAIM_PROOF_DIST ||
  path.join(homedir(), "Sites", "bna-claim-proof", "dist");

// Walkthrough MP4s live in the product workspace's videos/final folder. Their
// blob pathnames are derived here and read back (hardcoded) by
// src/lib/claim-proof-video.ts — no env vars, since the tier check on the
// /api/claimproof/video endpoint is the real access boundary.
const VIDEO_SRC =
  process.env.CLAIM_PROOF_VIDEO_SRC ||
  path.join(homedir(), "Sites", "bna-claim-proof", "videos", "final");

// Editable assets (deck + KPI spreadsheet). Sourced from the assets/ folder.
// [local file, blob pathname, contentType]. Keep pathnames in lockstep with
// CLAIM_PROOF_ASSETS in src/lib/claim-proof-asset.ts.
const ASSET_SRC =
  process.env.CLAIM_PROOF_ASSET_SRC ||
  path.join(homedir(), "Sites", "bna-claim-proof", "assets");
const ASSETS: Array<[string, string, string]> = [
  [
    "claimproof_kpi_template.xlsx",
    `${PREFIX}/assets/claimproof-fleet-kpi-tracker.xlsx`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  [
    "claimproof_staff_training.pptx",
    `${PREFIX}/assets/claimproof-fleet-staff-training.pptx`,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
];

// [local file, blob pathname]. Keep the pathname keys in lockstep with
// WALKTHROUGH_VIDEOS in src/lib/claim-proof-video.ts.
const VIDEOS: Array<[string, string]> = [
  ["claimproof_video_1.mp4", `${PREFIX}/videos/orientation.mp4`],
  ["claimproof_video_2.mp4", `${PREFIX}/videos/emergency.mp4`],
  ["claimproof_video_3.mp4", `${PREFIX}/videos/proof.mp4`],
  ["claimproof_video_4.mp4", `${PREFIX}/videos/valuation.mp4`],
  ["claimproof_video_5.mp4", `${PREFIX}/videos/followup.mp4`],
  ["claimproof_video_6.mp4", `${PREFIX}/videos/fleet.mp4`],
];

// [local file, blob pathname, the env var it populates with the PATHNAME]
// NOTE: env vars hold the blob PATHNAME (e.g. "claim-proof-9f2a7c/...pdf"),
// not a URL — the download endpoint signs a fresh URL from the pathname on
// each request. Keys are *_KEY to make that explicit.
const FILES: Array<[string, string, string]> = [
  ["the_24_hour_rule.pdf", `${PREFIX}/the-24-hour-rule.pdf`, "CLAIM_PROOF_GUIDE_KEY"],
  ["claim_proof_core.pdf", `${PREFIX}/claim-proof-core.pdf`, "CLAIM_PROOF_KEY_CORE"],
  ["claim_proof_pro.pdf", `${PREFIX}/claim-proof-pro.pdf`, "CLAIM_PROOF_KEY_PRO"],
  // Fleet delivers Pro + supplement + video. The supplement is uploaded here;
  // the Fleet download bundles Pro + supplement (see download route + runbook).
  [
    "claim_proof_fleet_supplement.pdf",
    `${PREFIX}/claim-proof-fleet-supplement.pdf`,
    "CLAIM_PROOF_KEY_FLEET_SUPPLEMENT",
  ],
];

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error(
      "\n✗ BLOB_READ_WRITE_TOKEN is not set.\n\n" +
        "Get it from the Vercel dashboard:\n" +
        "  Vercel → your project → Storage → (create or open a Blob store) →\n" +
        "  the store's \".env.local\" tab shows BLOB_READ_WRITE_TOKEN=...\n\n" +
        "Add that line to benicehospitality/.env.local, then re-run:\n" +
        "  npm run claimproof:upload\n",
    );
    process.exit(1);
  }

  if (!existsSync(DIST)) {
    console.error(
      `\n✗ Source folder not found: ${DIST}\n` +
        "Render the PDFs first (see ~/Sites/bna-claim-proof), or set\n" +
        "CLAIM_PROOF_DIST=/abs/path/to/dist and re-run.\n",
    );
    process.exit(1);
  }

  console.log(`\nUploading Claim Proof PDFs from:\n  ${DIST}\n`);

  const envLines: string[] = [];
  for (const [file, pathname, envVar] of FILES) {
    const abs = path.join(DIST, file);
    if (!existsSync(abs)) {
      console.error(`  ✗ missing: ${file} — skipped`);
      continue;
    }
    const data = await readFile(abs);
    const blob = await put(pathname, data, {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false, // stable pathname across re-uploads
      allowOverwrite: true, // re-running replaces the file
      token,
    });
    const sizeKb = Math.round(data.byteLength / 1024);
    console.log(`  ✓ ${file}  (${sizeKb} KB) → ${blob.pathname}`);
    // Store the PATHNAME, not the URL. The download route signs a fresh,
    // short-lived URL from the pathname on each request.
    envLines.push(`${envVar}=${blob.pathname}`);
  }

  // Walkthrough videos (private blobs, tier-gated via /api/claimproof/video).
  if (existsSync(VIDEO_SRC)) {
    console.log(`\nUploading walkthrough videos from:\n  ${VIDEO_SRC}\n`);
    for (const [file, pathname] of VIDEOS) {
      const abs = path.join(VIDEO_SRC, file);
      if (!existsSync(abs)) {
        console.error(`  ✗ missing: ${file} — skipped`);
        continue;
      }
      const data = await readFile(abs);
      const blob = await put(pathname, data, {
        access: "private",
        contentType: "video/mp4",
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
      const sizeMb = (data.byteLength / 1024 / 1024).toFixed(1);
      console.log(`  ✓ ${file}  (${sizeMb} MB) → ${blob.pathname}`);
    }
  } else {
    console.log(`\n(no walkthrough videos at ${VIDEO_SRC} — skipping video upload)`);
  }

  // Editable assets (staff deck + KPI spreadsheet), tier-gated via
  // /api/claimproof/asset.
  if (existsSync(ASSET_SRC)) {
    console.log(`\nUploading editable assets from:\n  ${ASSET_SRC}\n`);
    for (const [file, pathname, contentType] of ASSETS) {
      const abs = path.join(ASSET_SRC, file);
      if (!existsSync(abs)) {
        console.error(`  ✗ missing: ${file} — skipped`);
        continue;
      }
      const data = await readFile(abs);
      const blob = await put(pathname, data, {
        access: "private",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
      const sizeKb = Math.round(data.byteLength / 1024);
      console.log(`  ✓ ${file}  (${sizeKb} KB) → ${blob.pathname}`);
    }
  } else {
    console.log(`\n(no editable assets at ${ASSET_SRC} — skipping asset upload)`);
  }

  console.log(
    "\n─────────────────────────────────────────────────────────────\n" +
      "Paste these into .env.local AND the Vercel project env vars.\n" +
      "These are blob PATHNAMES (private) — the /api/claimproof/download\n" +
      "endpoint signs a short-lived URL from them per request.\n" +
      "(Price IDs already live in Stripe — included for convenience.)\n" +
      "─────────────────────────────────────────────────────────────\n",
  );
  console.log(
    [
      "CLAIM_PROOF_STRIPE_PRICE_ID_CORE=price_1TrODvGlNAyM6Ra9RXAeU8eb",
      "CLAIM_PROOF_STRIPE_PRICE_ID_PRO=price_1TrOE5GlNAyM6Ra9IR5nmZKw",
      "CLAIM_PROOF_STRIPE_PRICE_ID_FLEET=price_1TrOE7GlNAyM6Ra97quBGwZh",
      ...envLines,
      "# 32+ char random secret that signs download tokens. Generate with:",
      "#   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      "CLAIM_PROOF_DOWNLOAD_SECRET=<paste generated secret>",
    ].join("\n"),
  );
  console.log(
    "\nFLEET NOTE: the Fleet download serves Pro + the supplement automatically\n" +
      "(both pathnames above).\n\n" +
      "VIDEOS: the 6 walkthroughs upload as private blobs above. They need NO env\n" +
      "vars — src/lib/claim-proof-video.ts derives their pathnames from the same\n" +
      "prefix, and the portal streams them tier-gated via /api/claimproof/video.\n",
  );
}

main().catch((err) => {
  console.error("\n✗ Upload failed:", err);
  process.exit(1);
});
