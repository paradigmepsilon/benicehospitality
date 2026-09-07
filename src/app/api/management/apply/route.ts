/**
 * Management application intake. Mirrors the shape of every other capture
 * route in this repo: rate limit, honeypot, Turnstile, hand-rolled validation,
 * insert, then best-effort side effects that must never fail the submission.
 */

import { NextResponse, after } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { getClientIp, managementApplyLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";
import { CANONICAL_CALL_TYPE } from "@/lib/constants/call-types";
import { validateApplication } from "@/lib/management/validate";
import { createApplication } from "@/lib/management/applications";
import { internalManagementApplicationEmail } from "@/lib/email-templates";
import { enrollInNurture } from "@/lib/nurture/engine";
import { getPostHogClient } from "@/lib/posthog-server";

export const runtime = "nodejs";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!managementApplyLimiter.check(ip).success) {
      return NextResponse.json(
        { error: "Too many applications. Please try again shortly." },
        { status: 429 },
      );
    }

    const body = await request.json();
    // Honeypot: silently accept so the bot does not learn anything.
    if (body?.website) return NextResponse.json({ success: true });

    if (!(await verifyTurnstileToken(body?.turnstileToken))) {
      return NextResponse.json({ error: "Verification failed." }, { status: 400 });
    }

    const result = validateApplication(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const input = result.value;

    const { id } = await createApplication(input);

    // Everything below is best effort. The application is already saved.
    after(async () => {
      try {
        await enrollInNurture({
          email: input.email,
          sequenceKey: "mgmt_applicant",
          context: { firstName: input.name.split(" ")[0] },
        });
      } catch (err) {
        console.error("[management] nurture enroll failed:", err);
      }
      try {
        // Same env var the bookings route already uses for admin notifications
        // (src/app/api/bookings/route.ts:220). Do not introduce a second one.
        const to = process.env.CONTACT_EMAIL || "admin@benicehospitality.com";
        const sent = await getResend().emails.send({
          from:
            process.env.MANAGEMENT_FROM_EMAIL ||
            process.env.BNHG_AUTH_FROM ||
            "BNHG <onboarding@resend.dev>",
          to,
          subject: `New management application: ${input.asset === "car" ? "Fleet" : "Co-living"}, ${input.state}`,
          html: internalManagementApplicationEmail({ ...input, id }),
        });
        // The Resend SDK returns { data, error } and does not throw on 4xx.
        if (sent.error) console.error("[management] admin email failed:", sent.error);
      } catch (err) {
        console.error("[management] admin email threw:", err);
      }
      try {
        getPostHogClient().capture({
          distinctId: input.email,
          event: "management_application_submitted",
          properties: { asset: input.asset, state: input.state, timeline: input.timeline },
        });
      } catch (err) {
        console.error("[management] posthog capture failed:", err);
      }
    });

    // Build the handoff with the shared helper so the source value stays in
    // sync with VALID_BOOKING_SOURCES and the param order matches every other
    // booking CTA on the site.
    return NextResponse.json({
      success: true,
      redirectTo: bookingUrl({
        callType: CANONICAL_CALL_TYPE,
        source:
          input.asset === "car"
            ? BOOKING_SOURCES.MGMT_APPLY_CAR
            : BOOKING_SOURCES.MGMT_APPLY_ROOMS,
        prefillName: input.name,
        prefillEmail: input.email,
      }),
    });
  } catch (err) {
    console.error("[management] apply failed:", err);
    // The spec asks for failed submissions to land in user_events. Best effort:
    // if the database is what broke, this write fails too and we still return
    // the friendly error rather than throwing again.
    try {
      await sql`
        INSERT INTO user_events (event_type, metadata)
        VALUES ('management_apply_failed', ${JSON.stringify({ message: String(err) })}::jsonb)
      `;
    } catch {
      // swallowed on purpose
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
