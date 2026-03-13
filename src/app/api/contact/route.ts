import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, hotelName, location, roomCount, interests, message } = body;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
