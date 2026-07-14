/**
 * Claim Proof — downloadable editable assets (deck + spreadsheet) catalog.
 *
 * The Fleet card promises an editable staff-training deck and a KPI dashboard.
 * The in-portal KPI tool covers the live dashboard; these two files cover the
 * "editable, take-it-with-you" half: a .pptx staff deck and an .xlsx KPI
 * template with working formulas. Both open natively in Google Slides/Sheets or
 * Office. Hosted as PRIVATE blobs and served tier-gated via
 * /api/claimproof/asset/<key>, exactly like the walkthrough videos.
 */
import { issueSignedToken, presignUrl } from "@vercel/blob";
import type { ClaimProofTier } from "@/lib/claim-proof";

/** Keep in lockstep with scripts/upload-claimproof.ts ASSET_PREFIX. */
export const CLAIM_PROOF_ASSET_PREFIX = "claim-proof-9f2a7c/assets";

export interface DownloadableAsset {
  key: string;
  access: ClaimProofTier;
  title: string;
  /** Human label for what it opens in, shown on the download card. */
  formatLabel: string;
  /** Blob pathname (also the downloaded filename's basename). */
  pathname: string;
  contentType: string;
}

export const CLAIM_PROOF_ASSETS: Record<string, DownloadableAsset> = {
  "kpi-template": {
    key: "kpi-template",
    access: "fleet",
    title: "Fleet KPI Tracker (spreadsheet)",
    formatLabel: "Google Sheets or Excel · .xlsx",
    pathname: `${CLAIM_PROOF_ASSET_PREFIX}/claimproof-fleet-kpi-tracker.xlsx`,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  "staff-deck": {
    key: "staff-deck",
    access: "fleet",
    title: "Fleet Staff Training Deck",
    formatLabel: "Google Slides or PowerPoint · .pptx",
    pathname: `${CLAIM_PROOF_ASSET_PREFIX}/claimproof-fleet-staff-training.pptx`,
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
};

export function getAsset(key: string): DownloadableAsset | null {
  return CLAIM_PROOF_ASSETS[key] ?? null;
}

const ASSET_SIGNED_URL_TTL_MS = 10 * 60 * 1000; // 10 minutes — a click-to-download window

export async function signedAssetUrl(asset: DownloadableAsset): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("[claim-proof-asset] BLOB_READ_WRITE_TOKEN is not set");
  }
  const validUntil = Date.now() + ASSET_SIGNED_URL_TTL_MS;
  const signed = await issueSignedToken({
    pathname: asset.pathname,
    operations: ["get"],
    validUntil,
    token,
  });
  const { presignedUrl } = await presignUrl(signed, {
    operation: "get",
    pathname: asset.pathname,
    access: "private",
    validUntil,
  });
  return presignedUrl;
}
