import { NextResponse } from "next/server";
import {
  isCrrFreeEbookFormat,
  signedCrrFreeEbookUrlFor,
  verifyCrrFreeEbookToken,
} from "@/lib/crr-free-ebook";

// Blob SDK + node crypto need the Node runtime.
export const runtime = "nodejs";
// Never cache: every hit mints a fresh signed URL.
export const dynamic = "force-dynamic";

/**
 * GET /api/crr-free-ebook/download?format=<pdf|epub>&t=<token>
 *
 * Token-gated gateway to the PRIVATE blob for "Before You Buy the Car". The
 * guide is free, but the file still lives behind the same HMAC + short-lived
 * signed URL pattern as the paid books so the raw blob URL never leaks into
 * a forwarded email or a scraper: the email link is what gets shared, and
 * every click on it re-signs for five minutes.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const token = url.searchParams.get("t");

  if (!isCrrFreeEbookFormat(format)) {
    return NextResponse.json({ error: "Unknown format." }, { status: 400 });
  }
  if (!token || !verifyCrrFreeEbookToken(token, format)) {
    return new NextResponse(
      "This download link is invalid or has expired. Request the guide again at benicehospitality.com/before-you-buy-the-car and a fresh one will arrive by email.",
      { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  let signed: string;
  try {
    signed = await signedCrrFreeEbookUrlFor(format);
  } catch (err) {
    console.error("[crr-free-ebook/download] signing failed:", err);
    return new NextResponse(
      "We couldn't prepare your download right now. Please try again in a minute.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  return NextResponse.redirect(signed, { status: 302 });
}
