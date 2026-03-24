import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
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
    const { name, email, phone, hotelName, location, roomCount, interests, message, website, turnstileToken } = body;

    // Honeypot check — silently reject bots
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Turnstile verification
    const turnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    if (!name || !email || !hotelName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await resend.emails.send({
      from: "BNHG Website <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "admin@benicehospitality.com",
      replyTo: email,
      subject: `New Contact: ${hotelName} — ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Hotel</td><td style="padding:8px;border-bottom:1px solid #eee;">${hotelName}</td></tr>
          ${location ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Location</td><td style="padding:8px;border-bottom:1px solid #eee;">${location}</td></tr>` : ""}
          ${roomCount ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Rooms</td><td style="padding:8px;border-bottom:1px solid #eee;">${roomCount}</td></tr>` : ""}
          ${interests ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Interests</td><td style="padding:8px;border-bottom:1px solid #eee;">${interests}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
        </table>
      `,
    });

    // Store in database
    try {
      await sql`
        INSERT INTO contact_submissions (name, email, phone, hotel_name, hotel_location, room_count, interests, message)
        VALUES (${name}, ${email}, ${phone || null}, ${hotelName}, ${location || null}, ${roomCount || null}, ${interests || null}, ${message || null})
      `;
    } catch (dbError) {
      console.error("Failed to store contact submission:", dbError);
    }

    // Create/update pipeline contact
    try {
      const crmResult = await sql`
        INSERT INTO pipeline_contacts (name, email, phone, hotel_name, hotel_location, room_count, source)
        VALUES (${name}, ${email}, ${phone || null}, ${hotelName}, ${location || null}, ${roomCount || null}, 'contact_form')
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = COALESCE(EXCLUDED.phone, pipeline_contacts.phone),
          hotel_name = COALESCE(EXCLUDED.hotel_name, pipeline_contacts.hotel_name),
          hotel_location = COALESCE(EXCLUDED.hotel_location, pipeline_contacts.hotel_location),
          room_count = COALESCE(EXCLUDED.room_count, pipeline_contacts.room_count),
          updated_at = NOW()
        RETURNING id
      `;
      const contactId = crmResult[0].id;

      await sql`UPDATE contact_submissions SET pipeline_contact_id = ${contactId} WHERE email = ${email} AND pipeline_contact_id IS NULL`;

      await sql`
        INSERT INTO pipeline_activities (contact_id, type, title, description)
        VALUES (${contactId}, 'contact_form_submitted', 'Contact form submitted', ${message || null})
      `;
    } catch (crmError) {
      console.error("Failed to create pipeline contact:", crmError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
