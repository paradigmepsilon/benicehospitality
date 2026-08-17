import { NextResponse } from "next/server";
import {
  isCrrBlueprintFormat,
  verifyCrrBlueprintToken,
  signedCrrBlueprintUrlFor,
} from "@/lib/crr-blueprint";

// Blob SDK + node crypto need the Node runtime.
export const runtime = "nodejs";
// Never cache: every hit mints a fresh signed URL.
export const dynamic = "force-dynamic";

/**
 * GET /api/crr-blueprint/download?format=<pdf|epub>&t=<token>
 *
 * The token-gated gateway to the PRIVATE book blobs. Verifies the HMAC token,
 * then 302-redirects to a freshly-minted, short-lived signed Blob URL.
 *
 * Because the store is private, the signed URL expires in minutes and the raw
 * blob URL is never exposed: "anyone with the email link" still needs a valid
 * token, and even then only gets a briefly-valid URL. Same contract as
 * /api/blueprint/download.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const token = url.searchParams.get("t");

  if (!isCrrBlueprintFormat(format)) {
    return NextResponse.json({ error: "Unknown format." }, { status: 400 });
  }
  if (!token || !verifyCrrBlueprintToken(token, format)) {
    return new NextResponse(
      "This download link is invalid or has expired. Reply to your confirmation email and we'll send a fresh one.",
      { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  try {
    const signed = await signedCrrBlueprintUrlFor(format);
    return NextResponse.redirect(signed, { status: 302 });
  } catch (err) {
    console.error("[crr-blueprint/download] signing failed:", err);
    return new NextResponse(
      "We couldn't prepare your download right now. Please try again in a minute, or reply to your confirmation email.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }
}
