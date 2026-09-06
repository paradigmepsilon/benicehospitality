import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { waitlistRequestBodySchema, TIER_LABELS } from "@/lib/validation/waitlist";
import { waitlistLimiter, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  waitlistStudentThankYouEmail,
  waitlistAdminNotificationEmail,
} from "@/lib/email-templates";
import { enrollInNurture } from "@/lib/nurture/engine";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.benicehospitality.com";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

const COURSE_NAMES: Record<string, string> = {
  "room-rental-riches": "Room Rental Riches",
  "car-rental-riches": "Car Rental Riches",
};

// Each course is fronted by one founder. The student thank-you email is
// signed by them and the admin subject calls them out.
const COURSE_SIGNOFFS: Record<
  string,
  { signoffName: string; signoffTitle: string }
> = {
  "room-rental-riches": {
    signoffName: "Della Henry",
    signoffTitle: "Co-founder, Be Nice Hospitality Group",
  },
  "car-rental-riches": {
    signoffName: "Alex Henry",
    signoffTitle: "Co-founder, Be Nice Hospitality Group",
  },
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success: withinLimit } = waitlistLimiter.check(ip);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = waitlistRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const turnstileValid = await verifyTurnstileToken(
    parsed.data.turnstile_token,
  );
  if (!turnstileValid) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 },
    );
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.toLowerCase().trim();
  const tier = parsed.data.tier;
  const courseSlug = parsed.data.course_slug;
  const tierName = TIER_LABELS[tier];
  const courseName = COURSE_NAMES[courseSlug] || courseSlug;

  try {
    const result = await sql`
      INSERT INTO course_waitlist (name, email, course_slug, tier)
      VALUES (${name}, ${email}, ${courseSlug}, ${tier})
      ON CONFLICT (email, course_slug, tier) DO NOTHING
      RETURNING id
    `;

    // Duplicate signup — still show success to the caller. Don't double-send
    // the thank-you / admin notification.
    if (result.length === 0) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    const signupId = result[0].id as number;

    // Nurture: CRR signups get Alex's waitlist series while the presale is
    // closed; RRR signups get Della's welcome series.
    await enrollInNurture({
      email,
      sequenceKey:
        courseSlug === "car-rental-riches" ? "crr_waitlist" : "rrr_welcome",
      context: { firstName: name.split(/\s+/)[0] || undefined },
    });

    // Upsert into pipeline_contacts so the admin CRM sees the lead too.
    try {
      await sql`
        INSERT INTO pipeline_contacts (name, email, source, pipeline_stage)
        VALUES (${name}, ${email}, 'course_waitlist', 'prospect')
        ON CONFLICT (email) DO UPDATE SET
          updated_at = NOW()
      `;
    } catch (crmErr) {
      console.error("[waitlist] pipeline_contacts upsert failed:", crmErr);
    }

    const fromAddress =
      process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>";
    const adminTo =
      process.env.ADMIN_EMAIL ||
      process.env.CONTACT_EMAIL ||
      "admin@benicehospitality.com";
    const signupTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const adminUrl = `${SITE_URL}/admin/waitlist`;

    const signoff = COURSE_SIGNOFFS[courseSlug];
    const tierless = tier === "interest";
    const adminSubject = tierless
      ? `New ${courseName} waitlist signup: ${name}`
      : `New waitlist signup: ${tierName} for ${courseName}`;

    // Fire both emails in parallel. Use allSettled so neither failure breaks
    // the response. The DB row is the source of truth.
    const [studentResult, adminResult] = await Promise.allSettled([
      getResend().emails.send({
        from: fromAddress,
        to: email,
        subject: `You're on the ${courseName} waitlist.`,
        html: waitlistStudentThankYouEmail({
          name,
          tierName,
          courseName,
          tierless,
          signoffName: signoff?.signoffName,
          signoffTitle: signoff?.signoffTitle,
        }),
      }),
      getResend().emails.send({
        from: fromAddress,
        to: adminTo,
        replyTo: email,
        subject: adminSubject,
        html: waitlistAdminNotificationEmail({
          name,
          email,
          tierName,
          courseSlug,
          signupTime: `${signupTime} ET`,
          signupId,
          adminUrl,
        }),
      }),
    ]);

    if (studentResult.status === "rejected") {
      console.error("[waitlist] student email failed:", studentResult.reason);
    } else if (studentResult.value.error) {
      console.error("[waitlist] student email error:", studentResult.value.error);
    }
    if (adminResult.status === "rejected") {
      console.error("[waitlist] admin email failed:", adminResult.reason);
    } else if (adminResult.value.error) {
      console.error("[waitlist] admin email error:", adminResult.value.error);
    }

    return NextResponse.json({ success: true, signup_id: signupId }, { status: 201 });
  } catch (err) {
    console.error("[waitlist] insert failed:", err);
    return NextResponse.json(
      { error: "Failed to submit waitlist signup." },
      { status: 500 },
    );
  }
}
