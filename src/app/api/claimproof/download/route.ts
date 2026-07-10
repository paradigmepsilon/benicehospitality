import { NextResponse } from "next/server";
import {
  isClaimProofItem,
  verifyClaimProofToken,
  signedUrlsFor,
} from "@/lib/claim-proof-download";

// Blob SDK + node crypto need the Node runtime.
export const runtime = "nodejs";
// Never cache — every hit mints a fresh signed URL.
export const dynamic = "force-dynamic";

/**
 * GET /api/claimproof/download?item=<core|pro|fleet|guide>&t=<token>
 *
 * The token-gated gateway to the PRIVATE product blobs. Verifies the HMAC
 * token, then:
 *   - single-file items (guide/core/pro): 302-redirect to a fresh short-lived
 *     signed Blob URL (browser downloads immediately);
 *   - fleet (two files): render a tiny links page with both freshly-signed
 *     URLs (Pro manual + Fleet supplement).
 *
 * Because the store is private, the signed URLs expire in minutes and the raw
 * blob URLs are never exposed — "anyone with the email link" still needs a
 * valid token, and even then only gets a briefly-valid signed URL.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const item = url.searchParams.get("item");
  const token = url.searchParams.get("t");

  if (!isClaimProofItem(item)) {
    return NextResponse.json({ error: "Unknown item." }, { status: 400 });
  }
  if (!token || !verifyClaimProofToken(token, item)) {
    return new NextResponse(
      "This download link is invalid or has expired. Reply to your confirmation email and we'll send a fresh one.",
      { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  let signedUrls: string[];
  try {
    signedUrls = await signedUrlsFor(item);
  } catch (err) {
    console.error("[claimproof/download] signing failed:", err);
    return new NextResponse(
      "We couldn't prepare your download right now. Please try again in a minute, or reply to your confirmation email.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  // Single file → redirect straight to the download.
  if (signedUrls.length === 1) {
    return NextResponse.redirect(signedUrls[0], { status: 302 });
  }

  // Fleet (multiple files) → a minimal, unbranded links page.
  const [proUrl, supplementUrl] = signedUrls;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Your Claim Proof Fleet Kit</title>
<style>
  body{font-family:-apple-system,Helvetica,Arial,sans-serif;background:#FAF8F3;color:#1a1a1a;margin:0;padding:48px 20px;}
  .card{max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:36px;box-shadow:0 2px 24px rgba(0,0,0,.06);}
  h1{font-size:22px;margin:0 0 8px;color:#1A4D4F;}
  p{font-size:15px;line-height:1.55;color:#4B5563;margin:0 0 24px;}
  a.btn{display:block;text-align:center;background:#B08D57;color:#1a1a1a;text-decoration:none;font-weight:600;padding:14px 20px;border-radius:10px;margin-bottom:12px;}
  a.btn.alt{background:#1A4D4F;color:#fff;}
  small{display:block;color:#9a9484;font-size:12px;margin-top:20px;line-height:1.5;}
</style></head><body><div class="card">
  <h1>Your Fleet Kit is ready.</h1>
  <p>Two documents — start with the manual, keep the supplement for when you scale.</p>
  <a class="btn" href="${proUrl}">Download the Claim Proof manual (PDF)</a>
  <a class="btn alt" href="${supplementUrl}">Download the Fleet Operations supplement (PDF)</a>
  <small>These download links are freshly generated and expire in a few minutes. Reopen your email link anytime to get new ones. Operational guidance, not legal advice. Not affiliated with Turo Inc.</small>
</div></body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
