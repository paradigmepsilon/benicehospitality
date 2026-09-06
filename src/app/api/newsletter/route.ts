import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { newsletterLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { enrollInNurture } from "@/lib/nurture/engine";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const { success: withinLimit } = newsletterLimiter.check(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email, source, website, turnstileToken } = await request.json();

    // Honeypot check — silently reject bots
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Turnstile verification
    const turnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO newsletter_subscribers (email, source)
      VALUES (${email.toLowerCase().trim()}, ${source || "insights"})
      ON CONFLICT (email) DO NOTHING
    `;

    // The CRR ebook route enrolls its own sequence; every other source is a
    // co-living or general reader and gets Della's welcome series.
    if (source !== "crr-free-ebook") {
      await enrollInNurture({
        email: email.toLowerCase().trim(),
        sequenceKey: "rrr_welcome",
      });
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email.toLowerCase().trim(),
      event: "newsletter_subscribed",
      properties: { source: source || "insights" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
