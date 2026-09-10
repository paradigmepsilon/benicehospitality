import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { bookingConfirmationEmail } from "@/lib/email-templates";
import { getAuditFromAddress } from "@/lib/email/send";
import { contactBookingLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { FOCUS_DIMENSION_KEYS } from "@/lib/constants/dimensions";
import { getAuditByToken } from "@/lib/audit/token";
import { logAuditEvent, cancelPendingNurture } from "@/lib/audit/events";
import {
  CANONICAL_CALL_TYPE,
  CALL_BLOCK_MINUTES,
  CALL_VISIBLE_MINUTES,
  callDurationLabel,
} from "@/lib/constants/call-types";
import { FOUNDER_LABELS, founderCalendarEmail } from "@/lib/constants/founders";
import { VALID_BOOKING_SOURCES, isHotelAuditBooking } from "@/lib/booking-url";
import { getPostHogClient } from "@/lib/posthog-server";
import { stopNurture } from "@/lib/nurture/engine";
import { hasBookingConflict } from "@/lib/booking-conflict";
import { createBookingMeetEvent } from "@/lib/google-calendar";
import {
  formatBookingDate,
  formatBookingTime,
  toLocalDateTimeString,
  addMinutesToTime,
} from "@/lib/booking-format";
import { buildBookingManageUrl } from "@/lib/booking-manage-token";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

const VALID_FOUNDERS = new Set(["alex", "della"]);

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

    // Hotel context mirrors the client-side gating in BookingCalendar.tsx:
    // only the legacy hotel-audit / Signal funnel requires a hotel name and a
    // focus dimension. Management and general discovery bookings do not.
    const isHotelBooking = isHotelAuditBooking({
      auditToken: typeof auditToken === "string" ? auditToken : null,
      source: clickSource,
      callType,
    });

    if (isHotelBooking) {
      if (!focusDimension) {
        return NextResponse.json(
          { error: "Please choose a focus area for your call." },
          { status: 400 }
        );
      }
      if (!FOCUS_DIMENSION_KEYS.includes(focusDimension)) {
        return NextResponse.json({ error: "Invalid focus_dimension." }, { status: 400 });
      }
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

    if (!name || !email || !date || !time || (isHotelBooking && !hotelName)) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Range-aware conflict check: existing bookings of any call_type on this date
    // could partially overlap the requested slot (e.g., a 40-min Signal call starting
    // at 10:30 conflicts with a 60-min advisory at 10:00). A founder's own bookings
    // never conflict with the other founder's calendar (see hasBookingConflict).
    const conflict = await hasBookingConflict({
      date: String(date),
      time: String(time),
      callType,
      founder: requestedFounder,
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
    const formattedDate = formatBookingDate(String(date));
    const formattedTime = formatBookingTime(String(time));
    const durationLabel = callDurationLabel(callType);

    // Create the Google Meet event (best-effort — returns null when no
    // calendar account is connected yet, same as every other side effect
    // below). Both the guest and the requested founder are invited directly
    // by Google's own calendar invite; our confirmation email below also
    // includes the link for convenience.
    let meetLink: string | null = null;
    try {
      const startDateTime = toLocalDateTimeString(String(date), String(time));
      const endDateTime = toLocalDateTimeString(
        String(date),
        addMinutesToTime(String(time), CALL_VISIBLE_MINUTES[callType] ?? 45)
      );
      const meetEvent = await createBookingMeetEvent({
        summary: `Discovery call: ${name}${requestedFounder ? ` + ${FOUNDER_LABELS[requestedFounder]}` : ""}`,
        description: message ? `Note from ${name}: ${message}` : `Discovery call booked via benicehospitality.com`,
        startDateTime,
        endDateTime,
        guestEmail: email,
        founderEmail: founderCalendarEmail(requestedFounder),
      });
      if (meetEvent) {
        meetLink = meetEvent.meetLink;
        await sql`
          UPDATE bookings SET google_event_id = ${meetEvent.eventId}, meet_link = ${meetEvent.meetLink}
          WHERE id = ${booking.id}
        `;
      }
    } catch (calendarError) {
      console.error("Failed to create Calendar event:", calendarError);
    }

    const manageUrl = buildBookingManageUrl(booking.id as number, email);

    // Create/update pipeline contact. hotel_name is '' rather than null for
    // a non-hotel (e.g. management) booking, because bookings.hotel_name is
    // NOT NULL and the client always sends a string. NULLIF here stops that
    // empty string from ever overwriting a real hotel_name a repeat contact
    // already had on file: an empty string is not NULL, so plain COALESCE
    // let EXCLUDED.hotel_name = '' win and blank the existing value.
    try {
      const crmResult = await sql`
        INSERT INTO pipeline_contacts (name, email, phone, hotel_name, source)
        VALUES (${name}, ${email}, ${phone || null}, ${hotelName}, 'booking')
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = COALESCE(EXCLUDED.phone, pipeline_contacts.phone),
          hotel_name = COALESCE(NULLIF(EXCLUDED.hotel_name, ''), pipeline_contacts.hotel_name),
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

    // Send confirmation email to guest. The Resend SDK does not throw on a
    // delivery failure (e.g. a sandbox-restricted "from" address, or an
    // unverified domain) — it resolves with { data: null, error }. Checking
    // that field is required or a failed send is otherwise indistinguishable
    // from a successful one.
    try {
      const { error: guestEmailError } = await getResend().emails.send({
        from: getAuditFromAddress(),
        to: email,
        subject: `Your Discovery Call is Confirmed for ${formattedDate}`,
        html: bookingConfirmationEmail({ name, formattedDate, formattedTime, durationLabel, meetLink, manageUrl }),
      });
      if (guestEmailError) {
        console.error("Failed to send guest confirmation email:", guestEmailError);
      }
    } catch (emailError) {
      console.error("Failed to send guest confirmation email:", emailError);
    }

    // Send notification email to admin. isHotelBooking branches both the
    // subject and the Hotel row: a management/general booking has no hotel
    // name (the form field is blank, not omitted, because bookings.hotel_name
    // is NOT NULL), and rendering it unconditionally produced "New Booking:
    // Jane Doe at , Monday..." plus a blank Hotel row. Non-hotel bookings
    // show click_source instead, in the same row position, since that is
    // the useful context the route already has for them (no new lookup).
    try {
      const subject = isHotelBooking
        ? `New Booking: ${name} at ${hotelName}, ${formattedDate}`
        : `New Booking: ${name}, ${formattedDate}`;
      const contextRow = isHotelBooking
        ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Hotel</td><td style="padding:8px;border-bottom:1px solid #eee;">${hotelName}</td></tr>`
        : `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Source</td><td style="padding:8px;border-bottom:1px solid #eee;">${clickSource || "Not captured"}</td></tr>`;
      const { error: adminEmailError } = await getResend().emails.send({
        from: getAuditFromAddress(),
        to: process.env.CONTACT_EMAIL || "admin@benicehospitality.com",
        replyTo: email,
        subject,
        html: `
          <h2>New Discovery Call Booking</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px;">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
            ${phone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ""}
            ${contextRow}
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Date</td><td style="padding:8px;border-bottom:1px solid #eee;">${formattedDate}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Time</td><td style="padding:8px;border-bottom:1px solid #eee;">${formattedTime}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Type</td><td style="padding:8px;border-bottom:1px solid #eee;">Discovery call (45 min, blocks 60 min)</td></tr>
            ${requestedFounder ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;background:#fff8e6;">Requested founder</td><td style="padding:8px;border-bottom:1px solid #eee;background:#fff8e6;font-weight:600;">${FOUNDER_LABELS[requestedFounder]}</td></tr>` : ""}
            ${meetLink ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Google Meet</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="${meetLink}">${meetLink}</a></td></tr>` : ""}
            ${clickSource && isHotelBooking ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;background:#fff8e6;">Click source</td><td style="padding:8px;border-bottom:1px solid #eee;background:#fff8e6;font-family:monospace;">${clickSource}</td></tr>` : ""}
            ${message ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
          </table>
        `,
      });
      if (adminEmailError) {
        console.error("Failed to send admin notification email:", adminEmailError);
      }
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

    // A booked call ends the management applicant sequence for that address.
    try {
      await stopNurture(email, "booked_call", ["mgmt_applicant"]);
    } catch (err) {
      console.error("[management] stop on booking failed:", err);
    }

    // Link the booking back to an open management application from the same
    // address, so the admin list shows who actually booked. Best effort: a
    // booking must never fail because the application link did not resolve.
    try {
      await sql`
        UPDATE management_applications
        SET booking_id = ${booking.id}, status = 'call_booked', updated_at = NOW()
        WHERE id = (
          SELECT id FROM management_applications
          WHERE lower(email) = ${email.toLowerCase().trim()}
            AND status IN ('new', 'contacted')
          ORDER BY created_at DESC
          LIMIT 1
        )
      `;
    } catch (err) {
      console.error("[management] booking link failed:", err);
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
