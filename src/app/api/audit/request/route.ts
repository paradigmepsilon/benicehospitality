import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { auditRequestBodySchema } from "@/lib/validation/audit";
import { auditRequestLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { internalAuditRequestEmail } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const { success } = auditRequestLimiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = auditRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const turnstileValid = await verifyTurnstileToken(parsed.data.turnstile_token);
  if (!turnstileValid) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    const result = await sql`
      INSERT INTO audit_requests (hotel_url, email, role)
      VALUES (${parsed.data.hotel_url}, ${email}, ${parsed.data.role})
      RETURNING id
    `;
    const requestId = result[0].id as number;

    // Upsert into pipeline_contacts so admin CRM sees the lead too
    try {
      await sql`
        INSERT INTO pipeline_contacts (name, email, hotel_name, source, pipeline_stage)
        VALUES (${email.split("@")[0]}, ${email}, ${parsed.data.hotel_url}, 'audit_request', 'prospect')
        ON CONFLICT (email) DO UPDATE SET
          updated_at = NOW()
      `;
    } catch (crmErr) {
      console.error("[audit/request] pipeline_contacts upsert failed:", crmErr);
    }

    // Notify Alex internally
    try {
      await resend.emails.send({
        from: process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || "admin@benicehospitality.com",
        replyTo: email,
        subject: `New audit request: ${parsed.data.hotel_url}`,
        html: internalAuditRequestEmail({
          hotelUrl: parsed.data.hotel_url,
          email,
          role: parsed.data.role,
          requestId,
        }),
      });
    } catch (emailErr) {
      console.error("[audit/request] internal notification failed:", emailErr);
    }

    return NextResponse.json({ success: true, request_id: requestId }, { status: 201 });
  } catch (err) {
    console.error("[audit/request] insert failed:", err);
    return NextResponse.json({ error: "Failed to submit request." }, { status: 500 });
  }
}
