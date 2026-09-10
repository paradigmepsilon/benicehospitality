import { Resend } from "resend";
import { sql } from "@/lib/db";
import { getAuditFromAddress } from "@/lib/email/send";
import { bookingRescheduledEmail, bookingCancelledEmail } from "@/lib/email-templates";
import { buildBookingManageUrl } from "@/lib/booking-manage-token";
import { formatBookingDate, formatBookingTime, toLocalDateTimeString, addMinutesToTime } from "@/lib/booking-format";
import { CALL_VISIBLE_MINUTES, callDurationLabel } from "@/lib/constants/call-types";
import { founderCalendarEmail } from "@/lib/constants/founders";
import { hasBookingConflict } from "@/lib/booking-conflict";
import { rescheduleBookingMeetEvent, cancelBookingMeetEvent } from "@/lib/google-calendar";

/**
 * Cancel and reschedule, shared by every surface that can do either: BNHG's
 * own admin panel, the guest self-service manage page, and Unified Ops's
 * service-authenticated proxy. Each does the same three things — update the
 * row, update the Calendar event, and email both the guest and the founder —
 * so a booking behaves identically no matter where the action was taken.
 */

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

interface BookingRow {
  id: number;
  name: string;
  email: string;
  booking_date: string | Date;
  booking_time: string;
  call_type: string;
  requested_founder: string | null;
  google_event_id: string | null;
  meet_link: string | null;
  status: string;
}

async function sendLifecycleEmail(to: string, subject: string, html: string, label: string): Promise<void> {
  try {
    const { error } = await getResend().emails.send({
      from: getAuditFromAddress(),
      to,
      subject,
      html,
    });
    if (error) console.error(`Failed to send ${label} email:`, error);
  } catch (err) {
    console.error(`Failed to send ${label} email:`, err);
  }
}

export type BookingActionResult =
  | { ok: true; booking: BookingRow }
  | { ok: false; error: string };

export async function cancelBooking(bookingId: number): Promise<BookingActionResult> {
  const rows = await sql`
    UPDATE bookings SET status = 'cancelled' WHERE id = ${bookingId} RETURNING *
  `;
  const booking = rows[0] as BookingRow | undefined;
  if (!booking) return { ok: false, error: "Booking not found" };

  if (booking.google_event_id) {
    try {
      await cancelBookingMeetEvent(booking.google_event_id);
    } catch (err) {
      console.error("Failed to cancel Calendar event:", err);
    }
  }

  const formattedDate = formatBookingDate(booking.booking_date);
  const formattedTime = formatBookingTime(booking.booking_time);
  const html = bookingCancelledEmail({ name: booking.name, formattedDate, formattedTime });

  await sendLifecycleEmail(booking.email, "Your Discovery Call Has Been Cancelled", html, "guest cancellation");
  const founderEmail = founderCalendarEmail(booking.requested_founder);
  if (founderEmail) {
    await sendLifecycleEmail(
      founderEmail,
      `Cancelled: ${booking.name}, ${formattedDate}`,
      bookingCancelledEmail({ name: booking.name, formattedDate, formattedTime }),
      "founder cancellation"
    );
  }

  return { ok: true, booking };
}

export async function rescheduleBooking(
  bookingId: number,
  newDate: string,
  newTime: string
): Promise<BookingActionResult> {
  const existingRows = await sql`SELECT * FROM bookings WHERE id = ${bookingId}`;
  const existing = existingRows[0] as BookingRow | undefined;
  if (!existing) return { ok: false, error: "Booking not found" };

  const conflict = await hasBookingConflict({
    date: newDate,
    time: newTime,
    callType: existing.call_type,
    founder: existing.requested_founder,
    excludeBookingId: bookingId,
  });
  if (conflict) {
    return { ok: false, error: "That time slot is no longer available. Please choose another." };
  }

  const rows = await sql`
    UPDATE bookings SET booking_date = ${newDate}, booking_time = ${newTime}
    WHERE id = ${bookingId} RETURNING *
  `;
  const booking = rows[0] as BookingRow;

  if (booking.google_event_id) {
    try {
      const startDateTime = toLocalDateTimeString(newDate, newTime);
      const endDateTime = toLocalDateTimeString(
        newDate,
        addMinutesToTime(newTime, CALL_VISIBLE_MINUTES[booking.call_type] ?? 45)
      );
      await rescheduleBookingMeetEvent(booking.google_event_id, startDateTime, endDateTime);
    } catch (err) {
      console.error("Failed to reschedule Calendar event:", err);
    }
  }

  const formattedDate = formatBookingDate(newDate);
  const formattedTime = formatBookingTime(newTime);
  const durationLabel = callDurationLabel(booking.call_type);
  const manageUrl = buildBookingManageUrl(booking.id, booking.email);

  await sendLifecycleEmail(
    booking.email,
    `Your Discovery Call Has Been Rescheduled to ${formattedDate}`,
    bookingRescheduledEmail({ name: booking.name, formattedDate, formattedTime, durationLabel, meetLink: booking.meet_link, manageUrl }),
    "guest reschedule"
  );
  const founderEmail = founderCalendarEmail(booking.requested_founder);
  if (founderEmail) {
    await sendLifecycleEmail(
      founderEmail,
      `Rescheduled: ${booking.name}, ${formattedDate}`,
      bookingRescheduledEmail({ name: booking.name, formattedDate, formattedTime, durationLabel, meetLink: booking.meet_link, manageUrl: null }),
      "founder reschedule"
    );
  }

  return { ok: true, booking };
}
