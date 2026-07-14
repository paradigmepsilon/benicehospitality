/**
 * Claim Proof — walkthrough video catalog + private signing.
 *
 * Six narrated walkthroughs of the live Command Center, one per pack plus an
 * orientation. Like the kit PDFs, the MP4s live in a PRIVATE Vercel Blob store,
 * so their raw URLs are not publicly fetchable. The portal embeds each via our
 * own /api/claimproof/video/<key> endpoint, which checks the viewer's tier and
 * 302-redirects to a short-lived signed Blob URL.
 *
 * Access mirrors the packs: orientation + emergency are Core, proof/valuation/
 * followup are Complete (pro), fleet is Fleet. tierUnlocks() gates them.
 *
 * Pathnames are derived from a stable, unguessable prefix (shared with the
 * upload script). The blob is private and the signed URL expires, so the prefix
 * is not the security boundary — the tier check on the endpoint is.
 */
import { issueSignedToken, presignUrl } from "@vercel/blob";
import type { ClaimProofTier } from "@/lib/claim-proof";

/** Keep in lockstep with scripts/upload-claimproof.ts VIDEO_PREFIX. */
export const CLAIM_PROOF_VIDEO_PREFIX = "claim-proof-9f2a7c/videos";

export interface WalkthroughVideo {
  key: string;
  /** Minimum tier that can watch it. */
  access: ClaimProofTier;
  title: string;
  /** Runtime label, e.g. "3:22". */
  runtime: string;
  pathname: string;
}

function v(
  key: string,
  access: ClaimProofTier,
  title: string,
  runtime: string,
): WalkthroughVideo {
  return { key, access, title, runtime, pathname: `${CLAIM_PROOF_VIDEO_PREFIX}/${key}.mp4` };
}

export const WALKTHROUGH_VIDEOS: Record<string, WalkthroughVideo> = {
  orientation: v("orientation", "core", "Command Center Orientation", "1:09"),
  emergency: v("emergency", "core", "The 24-Hour Emergency Filing", "3:22"),
  proof: v("proof", "pro", "Building Your Proof System", "2:14"),
  valuation: v("valuation", "pro", "Fighting a Low Appraisal", "2:34"),
  followup: v("followup", "pro", "Follow-Up and Escalation", "2:47"),
  fleet: v("fleet", "fleet", "Running Claims at Fleet Scale", "3:07"),
};

/** Map a pack slug to its walkthrough key (fleet-ops → fleet), or null. */
export function videoKeyForPack(packSlug: string): string | null {
  const map: Record<string, string> = {
    emergency: "emergency",
    proof: "proof",
    valuation: "valuation",
    followup: "followup",
    "fleet-ops": "fleet",
  };
  return map[packSlug] ?? null;
}

export function getWalkthrough(key: string): WalkthroughVideo | null {
  return WALKTHROUGH_VIDEOS[key] ?? null;
}

// A generous window so a viewer can watch and seek without the URL expiring
// mid-play; the portal re-signs on every page load anyway.
const VIDEO_SIGNED_URL_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/** Mint a short-lived signed GET URL for a walkthrough's private blob. */
export async function signedWalkthroughUrl(video: WalkthroughVideo): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("[claim-proof-video] BLOB_READ_WRITE_TOKEN is not set");
  }
  const validUntil = Date.now() + VIDEO_SIGNED_URL_TTL_MS;
  const signed = await issueSignedToken({
    pathname: video.pathname,
    operations: ["get"],
    validUntil,
    token,
  });
  const { presignedUrl } = await presignUrl(signed, {
    operation: "get",
    pathname: video.pathname,
    access: "private",
    validUntil,
  });
  return presignedUrl;
}
