import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { bookingConfirmationEmail } from "@/lib/email-templates";
import { contactBookingLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { FOCUS_DIMENSION_KEYS } from "@/lib/constants/dimensions";
import { getAuditByToken } from "@/lib/audit/token";
import { logAuditEvent, cancelPendingNurture } from "@/lib/audit/events";
import {
  CANONICAL_CALL_TYPE,
  CALL_BLOCK_MINUTES,
  callDurationLabel,
} from "@/lib/constants/call-types";
import { VALID_BOOKING_SOURCES } from "@/lib/booking-url";
import { getPostHogClient } from "@/lib/posthog-server";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

const VALID_FOUNDERS = new Set(["alex", "della"]);
const FOUNDER_LABELS: Record<string, string> = {
  alex: "Alex Henry",
  della: "Della Henry",
};

export async function POST(req: Request) {
  try {
    // Rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const { success: withinLimit } = contactBookingLimiter.check(ip);
    if (!withinLimit) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      hotelName,
      message,
      date,
      time,
      website,
      turnstileToken,
      focus_dimension: focusDimension,
      audit_token: auditToken,
      call_type: callTypeRaw,
      requested_founder: requestedFounderRaw,
      click_source: clickSourceRaw,
    } = body;

    const requestedFounder =
      typeof requestedFounderRaw === "string" &&
      VALID_FOUNDERS.has(requestedFounderRaw)
        ? requestedFounderRaw
        : null;

    const clickSource =
      typeof clickSourceRaw === "string" &&
      VALID_BOOKING_SOURCES.has(clickSourceRaw)
        ? clickSourceRaw
        : null;

    const callType: string = callTypeRaw ?? CANONICAL_CALL_TYPE;
    const slotDuration = CALL_BLOCK_MINUTES[callType];
    if (!slotDuration) {
      return NextResponse.json({ error: "Invalid call_type." }, { status: 400 });
    }

    if (!focusDimension) {
      return NextResponse.json(
        { error: "Please choose a focus area for your call." },
        { status: 400 }
      );
    }
    if (!FOCUS_DIMENSION_KEYS.includes(focusDimension)) {
      return NextResponse.json({ error: "Invalid focus_dimension." }, { status: 400 });
    }

    // Honeypot check. Silently reject bots that fill in the hidden field.
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Turnstile verification
    const turnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    if (!name || !email || !hotelName || !date || !time) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Range-aware conflict check: existing bookings of any call_type on this date
    // could partially overlap the requested slot (e.g., a 40-min Signal call starting
    // at 10:30 conflicts with a 60-min advisory at 10:00).
    const [reqH, reqM] = String(time).split(":").map(Number);
    const requestedStart = reqH * 60 + reqM;
    const requestedEnd = requestedStart + slotDuration;

    const sameDayBookings = await sql`
      SELECT booking_time, call_type FROM bookings
      WHERE booking_date = ${date} AND status = 'confirmed'
    `;

    const conflict = sameDayBookings.find((b) => {
      const [bh, bm] = String(b.booking_time).split(":").map(Number);
      const start = bh * 60 + bm;
      const end = start + (CALL_BLOCK_MINUTES[String(b.call_type)] ?? 60);
      return requestedStart < end && requestedEnd > start;
    });

    if (conflict) {
      return NextResponse.json({ error: "This time slot is no longer available. Please choose another." }, { status: 409 });
    }

    // Resolve audit_token -> audit_id (if present)
    let auditId: number | null = null;
    if (auditToken && typeof auditToken === "string") {
      const audit = await getAuditByToken(auditToken);
      if (audit) auditId = audit.id;
    }

    // Insert booking
    const result = await sql`
      INSERT INTO bookings (name, email, phone, hotel_name, message, booking_date, booking_time, focus_dimension, audit_id, call_type, requested_founder, click_source)
      VALUES (${name}, ${email}, ${phone || null}, ${hotelName}, ${message || null}, ${date}, ${time}, ${focusDimension || null}, ${auditId}, ${callType}, ${requestedFounder}, ${clickSource})
      RETURNING *
    `;

    const booking = result[0];

    // If linked to an audit, log the booked_call event and cancel pending nurture for that lead
    if (auditId) {
      try {
        const viewRows = await sql`
          SELECT id FROM audit_views WHERE audit_id = ${auditId} AND email = ${email.toLowerCase().trim()} LIMIT 1
        `;
        const auditViewId = (viewRows[0]?.id as number | undefined) ?? null;
        await logAuditEvent({
          auditId,
          auditViewId,
          eventType: "booked_call",
          metadata: { booking_id: booking.id, focus_dimension: focusDimension || null, date, time },
        });
        if (auditViewId) {
          await cancelPendingNurture({ auditViewId, reason: "booked_call" });
        }
      } catch (auditEventErr) {
        console.error("Failed to log booked_call event:", auditEventErr);
      }
    }

    // Format date/time for emails
    const bookingDate = new Date(date + "T00:00:00");
    const formattedDate = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const formattedTime = `${hour12}:${m} ${ampm} ET`;
    const durationLabel = callDurationLabel(callType);

    // Create/update pipeline contact
    try {
      const crmResult = await sql`
        INSERT INTO pipeline_contacts (name, email, phone, hotel_name, source)
        VALUES (${name}, ${email}, ${phone || null}, ${hotelName}, 'booking')
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = COALESCE(EXCLUDED.phone, pipeline_contacts.phone),
          hotel_name = COALESCE(EXCLUDED.hotel_name, pipeline_contacts.hotel_name),
          updated_at = NOW()
        RETURNING id
      `;
      const contactId = crmResult[0].id;

      await sql`UPDATE bookings SET pipeline_contact_id = ${contactId} WHERE id = ${booking.id}`;

      await sql`
        INSERT INTO pipeline_activities (contact_id, type, title, metadata)
        VALUES (${contactId}, 'booking_scheduled', 'Discovery call booked', ${JSON.stringify({ date, time, booking_id: booking.id })})
      `;
    } catch (crmError) {
      console.error("Failed to create pipeline contact:", crmError);
    }

    // Send confirmation email to guest
    try {
      await getResend().emails.send({
        from: "BNHG Website <onboarding@resend.dev>",
        to: email,
        subject: `Your Discovery Call is Confirmed for ${formattedDate}`,
        html: bookingConfirmationEmail({ name, formattedDate, formattedTime, durationLabel }),
      });
    } catch (emailError) {
      console.error("Failed to send guest confirmation email:", emailError);
    }

    // Send notification email to admin
    try {
      await getResend().emails.send({
        from: "BNHG Website <onboarding@resend.dev>",
        to: process.env.CONTACT_EMAIL || "admin@benicehospitality.com",
        replyTo: email,
        subject: `New Booking: ${name} at ${hotelName}, ${formattedDate}`,
        html: `
          <h2>New Discovery Call Booking</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px;">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
            ${phone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ""}
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Hotel</td><td style="padding:8px;border-bottom:1px solid #eee;">${hotelName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Date</td><td style="padding:8px;border-bottom:1px solid #eee;">${formattedDate}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Time</td><td style="padding:8px;border-bottom:1px solid #eee;">${formattedTime}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Type</td><td style="padding:8px;border-bottom:1px solid #eee;">Discovery call (45 min, blocks 60 min)</td></tr>
            ${requestedFounder ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;background:#fff8e6;">Requested founder</td><td style="padding:8px;border-bottom:1px solid #eee;background:#fff8e6;font-weight:600;">${FOUNDER_LABELS[requestedFounder]}</td></tr>` : ""}
            ${clickSource ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;background:#fff8e6;">Click source</td><td style="padding:8px;border-bottom:1px solid #eee;background:#fff8e6;font-family:monospace;">${clickSource}</td></tr>` : ""}
            ${message ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
          </table>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: email,
        event: "discovery_call_booked",
        properties: {
          call_type: callType,
          focus_dimension: focusDimension || null,
          requested_founder: requestedFounder,
          click_source: clickSource,
          has_audit: !!auditId,
        },
      });
      await posthog.flush();
    } catch (phErr) {
      console.error("[bookings] PostHog capture failed:", phErr);
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
