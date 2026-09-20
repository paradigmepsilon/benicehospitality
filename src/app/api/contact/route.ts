import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { getAuditFromAddress } from "@/lib/email/send";
import { contactBookingLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { upsertContactByEmail } from "@/lib/pipeline-contacts";

// Lazy-construct so this module can load at build time without RESEND_API_KEY.
let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

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

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const hotelNameValue = hotelName || "";
    const locationValue = location || null;
    const roomCountValue = roomCount || null;

    // The Resend SDK does not throw on a delivery failure (e.g. a
    // sandbox-restricted "from" address, or an unverified domain) — it
    // resolves with { data: null, error }. Checking that field is required
    // or a failed send is otherwise indistinguishable from a successful one.
    const { error: contactEmailError } = await getResend().emails.send({
      from: getAuditFromAddress(),
      to: process.env.CONTACT_EMAIL || "admin@benicehospitality.com",
      replyTo: email,
      subject: `New Contact: ${name}${interests ? ` — ${interests}` : ""}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ""}
          ${interests ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Interests</td><td style="padding:8px;border-bottom:1px solid #eee;">${interests}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
        </table>
      `,
    });
    if (contactEmailError) {
      console.error("Failed to send contact notification email:", contactEmailError);
    }

    // Store in database
    try {
      await sql`
        INSERT INTO contact_submissions (name, email, phone, hotel_name, hotel_location, room_count, interests, message)
        VALUES (${name}, ${email}, ${phone || null}, ${hotelNameValue}, ${locationValue}, ${roomCountValue}, ${interests || null}, ${message || null})
      `;
    } catch (dbError) {
      console.error("Failed to store contact submission:", dbError);
    }

    // Create/update pipeline contact
    try {
      const { id: contactId } = await upsertContactByEmail({
        name,
        email,
        phone,
        hotelName: hotelNameValue,
        hotelLocation: locationValue,
        roomCount: roomCountValue,
        source: "contact_form",
      });

      await sql`UPDATE contact_submissions SET pipeline_contact_id = ${contactId} WHERE email = ${email} AND pipeline_contact_id IS NULL`;

      await sql`
        INSERT INTO pipeline_activities (contact_id, type, title, description)
        VALUES (${contactId}, 'contact_form_submitted', 'Contact form submitted', ${message || null})
      `;
    } catch (crmError) {
      console.error("Failed to create pipeline contact:", crmError);
    }

    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: email,
        event: "contact_form_submitted",
        properties: { interests: interests || null, has_hotel: !!hotelName },
      });
      await posthog.flush();
    } catch (phErr) {
      console.error("Contact form PostHog capture failed:", phErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
