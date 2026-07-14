import { NextResponse } from "next/server";
import { getPortalAccess } from "@/app/claimproof/portal/_lib/access";
import { tierUnlocks } from "@/lib/claim-proof-workspace";
import { getWalkthrough, signedWalkthroughUrl } from "@/lib/claim-proof-video";

// Blob SDK needs the Node runtime; never cache (each hit re-signs).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/claimproof/video/<key>
 *
 * Tier-gated gateway to a private walkthrough MP4. Resolves the viewer's portal
 * access, confirms their tier unlocks this video, then 302-redirects to a
 * short-lived signed Blob URL. A Core buyer cannot pull the Fleet walkthrough by
 * guessing the key: the tier check refuses it before any URL is signed.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const video = getWalkthrough(key);
  if (!video) {
    return NextResponse.json({ error: "Unknown video." }, { status: 404 });
  }

  const access = await getPortalAccess();
  if (!access) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!tierUnlocks(access.tier, video.access)) {
    return NextResponse.json(
      { error: "This walkthrough is not included in your tier." },
      { status: 403 },
    );
  }

  let url: string;
  try {
    url = await signedWalkthroughUrl(video);
  } catch (err) {
    console.error("[claimproof/video] signing failed:", err);
    return NextResponse.json(
      { error: "Could not prepare the video right now." },
      { status: 500 },
    );
  }
  return NextResponse.redirect(url, 302);
}
