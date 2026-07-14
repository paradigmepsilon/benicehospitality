import { NextResponse } from "next/server";
import { getPortalAccess } from "@/app/claimproof/portal/_lib/access";
import { tierUnlocks } from "@/lib/claim-proof-workspace";
import { getAsset, signedAssetUrl } from "@/lib/claim-proof-asset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/claimproof/asset/<key>
 *
 * Tier-gated gateway to a private editable asset (staff deck, KPI template).
 * Same shape as the video route: resolve portal access, confirm the tier
 * unlocks it, then 302 to a short-lived signed Blob URL that downloads.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const asset = getAsset(key);
  if (!asset) {
    return NextResponse.json({ error: "Unknown asset." }, { status: 404 });
  }

  const access = await getPortalAccess();
  if (!access) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!tierUnlocks(access.tier, asset.access)) {
    return NextResponse.json(
      { error: "This download is not included in your tier." },
      { status: 403 },
    );
  }

  let url: string;
  try {
    url = await signedAssetUrl(asset);
  } catch (err) {
    console.error("[claimproof/asset] signing failed:", err);
    return NextResponse.json(
      { error: "Could not prepare the download right now." },
      { status: 500 },
    );
  }
  return NextResponse.redirect(url, 302);
}
