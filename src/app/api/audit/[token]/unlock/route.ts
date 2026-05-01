import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuditByToken, buildAuditUrl } from "@/lib/audit/token";
import {
  logAuditEvent,
  upsertAuditView,
  scheduleNurtureSequence,
} from "@/lib/audit/events";
import { auditUnlockBodySchema } from "@/lib/validation/audit";
import { auditUnlockLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendAuditEmail } from "@/lib/email/send";

const VIEW_COOKIE = "audit_view_id";
const VIEW_COOKIE_TTL_DAYS = 90;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const { success } = auditUnlockLimiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = auditUnlockBodySchema.safeParse(body);
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

  const audit = await getAuditByToken(token);
  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userAgent = request.headers.get("user-agent");
  const email = parsed.data.email.toLowerCase().trim();

  try {
    const { id: auditViewId, isFirstView } = await upsertAuditView({
      auditId: audit.id,
      email,
      ipAddress: ip !== "unknown" ? ip : null,
      userAgent,
    });

    if (isFirstView) {
      await logAuditEvent({
        auditId: audit.id,
        auditViewId,
        eventType: "email_submitted",
        metadata: { email },
      });
      await scheduleNurtureSequence(auditViewId);

      // Upsert into pipeline_contacts so the existing CRM views show this lead
      try {
        await sql`
          INSERT INTO pipeline_contacts (name, email, hotel_name, source, pipeline_stage)
          VALUES (${email.split("@")[0]}, ${email}, ${audit.hotel_name}, 'audit', 'prospect')
          ON CONFLICT (email) DO UPDATE SET
            hotel_name = COALESCE(pipeline_contacts.hotel_name, EXCLUDED.hotel_name),
            updated_at = NOW()
        `;
      } catch (crmErr) {
        console.error("[audit/unlock] pipeline_contacts upsert failed:", crmErr);
      }

      // Send the audit-ready email so the recipient has a permanent return link
      const auditUrl = buildAuditUrl(token);
      const bookingUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://benicehospitality.com").replace(/\/$/, "")}/book?audit_token=${token}&utm_source=tier-0-audit&utm_medium=audit-email`;
      await sendAuditEmail({
        kind: "audit_ready",
        to: email,
        payload: {
          hotelName: audit.hotel_name,
          overallScore: audit.overall_score,
          overallGrade: audit.overall_grade,
          auditUrl,
          bookingUrl,
        },
      });
    } else {
      await logAuditEvent({
        auditId: audit.id,
        auditViewId,
        eventType: "report_viewed",
      });
    }

    const response = NextResponse.json({ audit_data: audit.audit_data });
    response.cookies.set(VIEW_COOKIE, String(auditViewId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VIEW_COOKIE_TTL_DAYS * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error("[audit/unlock] Failed:", err);
    return NextResponse.json({ error: "Failed to unlock audit" }, { status: 500 });
  }
}
