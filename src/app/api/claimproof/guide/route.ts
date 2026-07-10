import { NextResponse } from "next/server";
import { Resend } from "resend";
import { newsletterLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import {
  claimProofDownloadLink,
  claimProofGuideEmail,
  getClaimProofFromAddress,
  recordClaimProofContact,
} from "@/lib/claim-proof";
import { makeClaimProofToken } from "@/lib/claim-proof-download";
import { getBaseUrl } from "@/lib/stripe";

export const runtime = "nodejs";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

/**
 * POST /api/claimproof/guide  { email, website?, turnstileToken }
 *
 * Lead-magnet capture: records the email (newsletter_subscribers, source
 * "claimproof-guide") and sends The 24-Hour Rule PDF by email. Mirrors the
 * newsletter route's defenses: rate limit, honeypot ("website"), Turnstile.
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

    const { email, website, turnstileToken } = await request.json();

    // Honeypot — silently accept bots without doing anything.
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

    // Owned list first (durable), then delivery (best-effort but reported).
    await recordClaimProofContact(normalized, "claimproof-guide");

    const { subject, html } = claimProofGuideEmail({
      downloadUrl: claimProofDownloadLink(
        getBaseUrl(),
        "guide",
        makeClaimProofToken("guide"),
      ),
    });
    const result = await getResend().emails.send({
      from: getClaimProofFromAddress(),
      to: normalized,
      subject,
      html,
    });
    if (result.error) {
      console.error(
        `[claimproof/guide] delivery to ${normalized} failed:`,
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
      event: "claimproof_guide_requested",
      properties: { source: "claimproof-landing" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
