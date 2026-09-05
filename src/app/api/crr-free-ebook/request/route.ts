import { NextResponse } from "next/server";
import { Resend } from "resend";
import { newsletterLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import {
  CRR_FREE_EBOOK,
  crrFreeEbookDeliveryEmail,
  crrFreeEbookDownloadLink,
  getCrrFreeEbookFromAddress,
  isCarsToday,
  makeCrrFreeEbookToken,
  recordCrrFreeEbookLead,
} from "@/lib/crr-free-ebook";

export const runtime = "nodejs";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

/**
 * POST /api/crr-free-ebook/request
 *   { email, metro?, carsToday?, website?, turnstileToken }
 *
 * Lead-magnet capture for "Before You Buy the Car" (the free Car Rental
 * Riches ebook). Records the email in newsletter_subscribers (source
 * "crr-free-ebook"), then emails token-gated download links for the PDF and
 * ePub. Same defenses as the ClaimProof guide route: rate limit, honeypot
 * ("website"), Turnstile.
 *
 * `metro` and `carsToday` are the funnel's two segmentation signals (see the
 * lead-magnet plan). newsletter_subscribers has no columns for them, so they
 * ride on the PostHog person rather than the row; the nurture sequence reads
 * them from there.
 */
export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const { success: withinLimit } = newsletterLimiter.check(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const { email, metro, carsToday, website, turnstileToken } =
      await request.json();

    // Honeypot: silently accept bots without doing anything.
    if (website) {
      return NextResponse.json({ success: true });
    }

    const turnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();
    const metroClean =
      typeof metro === "string" ? metro.trim().slice(0, 80) : "";
    const cars = isCarsToday(carsToday) ? carsToday : null;

    // Owned list first (durable), then delivery (best-effort but reported).
    await recordCrrFreeEbookLead(normalized);

    const { subject, html } = crrFreeEbookDeliveryEmail({
      pdfUrl: crrFreeEbookDownloadLink("pdf", makeCrrFreeEbookToken("pdf")),
      epubUrl: crrFreeEbookDownloadLink("epub", makeCrrFreeEbookToken("epub")),
    });
    const result = await getResend().emails.send({
      from: getCrrFreeEbookFromAddress(),
      to: normalized,
      subject,
      html,
    });
    if (result.error) {
      console.error(
        `[crr-free-ebook/request] delivery to ${normalized} failed:`,
        `${result.error.name}: ${result.error.message}`,
      );
      return NextResponse.json(
        { error: "We couldn't send the guide. Please try again." },
        { status: 502 },
      );
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: normalized,
      event: "crr_free_ebook_requested",
      properties: {
        source: CRR_FREE_EBOOK.source,
        metro: metroClean || null,
        cars_today: cars,
        // Person properties, so the segment survives past this one event.
        $set: {
          crr_metro: metroClean || undefined,
          crr_cars_today: cars ?? undefined,
          crr_free_ebook: true,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
