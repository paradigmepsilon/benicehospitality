import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { bookingConfirmationEmail } from "@/lib/email-templates";
import { contactBookingLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { name, email, phone, hotelName, message, date, time, website, turnstileToken } = body;

    // Honeypot check — silently reject bots
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

    // Check slot is still available
    const existing = await sql`
      SELECT id FROM bookings
      WHERE booking_date = ${date} AND booking_time = ${time} AND status = 'confirmed'
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: "This time slot is no longer available. Please choose another." }, { status: 409 });
    }

    // Insert booking
    const result = await sql`
      INSERT INTO bookings (name, email, phone, hotel_name, message, booking_date, booking_time)
      VALUES (${name}, ${email}, ${phone || null}, ${hotelName}, ${message || null}, ${date}, ${time})
      RETURNING *
    `;

    const booking = result[0];

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
      await resend.emails.send({
        from: "BNHG Website <onboarding@resend.dev>",
        to: email,
        subject: `Your Discovery Call is Confirmed — ${formattedDate}`,
        html: bookingConfirmationEmail({ name, formattedDate, formattedTime }),
      });
    } catch (emailError) {
      console.error("Failed to send guest confirmation email:", emailError);
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: "BNHG Website <onboarding@resend.dev>",
        to: process.env.CONTACT_EMAIL || "admin@benicehospitality.com",
        replyTo: email,
        subject: `New Booking: ${hotelName} — ${name} on ${formattedDate}`,
        html: `
          <h2>New Discovery Call Booking</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px;">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
            ${phone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ""}
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Hotel</td><td style="padding:8px;border-bottom:1px solid #eee;">${hotelName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Date</td><td style="padding:8px;border-bottom:1px solid #eee;">${formattedDate}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Time</td><td style="padding:8px;border-bottom:1px solid #eee;">${formattedTime}</td></tr>
            ${message ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
          </table>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
