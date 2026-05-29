import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { SCORECARD_MAX_SCORE } from "@/lib/scorecard/questions";
import { scorecardUnlockBodySchema } from "@/lib/validation/scorecard";
import { scorecardUnlockLimiter, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  scorecardReadyEmail,
  internalScorecardRequestEmail,
} from "@/lib/email-templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.benicehospitality.com";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

type ScorecardRow = {
  id: number;
  token: string;
  property_nickname: string | null;
  overall_score: string | number;
  band: "high" | "moderate" | "low";
  status: "pending_capture" | "unlocked";
};

export async function POST(
  request: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;

  const ip = getClientIp(request);
  const { success } = scorecardUnlockLimiter.check(ip);
  if (!success) {
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

  const parsed = scorecardUnlockBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const turnstileValid = await verifyTurnstileToken(parsed.data.turnstile_token);
  if (!turnstileValid) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const name = parsed.data.name.trim();
  const phone = parsed.data.phone?.trim() || null;
  const optedIn = parsed.data.opted_in_newsletter === true;

  const rows = (await sql`
    SELECT id, token, property_nickname, overall_score, band, status
    FROM viability_scorecards
    WHERE token = ${token}
    LIMIT 1
  `) as ScorecardRow[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Scorecard not found." }, { status: 404 });
  }

  const scorecard = rows[0];

  let pipelineContactId: number | null = null;
  try {
    const existing = (await sql`
      SELECT id FROM pipeline_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `) as Array<{ id: number }>;
    if (existing.length > 0) {
      pipelineContactId = existing[0].id;
      await sql`
        UPDATE pipeline_contacts
        SET name = COALESCE(NULLIF(${name}, ''), name),
            phone = COALESCE(${phone}, phone),
            updated_at = NOW()
        WHERE id = ${pipelineContactId}
      `;
    } else {
      const inserted = (await sql`
        INSERT INTO pipeline_contacts (name, email, phone, source, pipeline_stage)
        VALUES (${name}, ${email}, ${phone}, 'viability_scorecard', 'prospect')
        RETURNING id
      `) as Array<{ id: number }>;
      pipelineContactId = inserted[0].id;
    }
  } catch (crmErr) {
    console.error("[scorecard/unlock] pipeline_contacts upsert failed:", crmErr);
  }

  try {
    await sql`
      UPDATE viability_scorecards
      SET status = 'unlocked',
          email = ${email},
          name = ${name},
          role = ${parsed.data.role},
          phone = ${phone},
          opted_in_newsletter = ${optedIn},
          pipeline_contact_id = ${pipelineContactId},
          unlocked_at = NOW()
      WHERE token = ${token}
    `;
  } catch (err) {
    console.error("[scorecard/unlock] update failed:", err);
    return NextResponse.json(
      { error: "Failed to unlock scorecard." },
      { status: 500 },
    );
  }

  if (optedIn) {
    try {
      await sql`
        INSERT INTO newsletter_subscribers (email, source)
        VALUES (${email}, 'viability_scorecard')
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (subErr) {
      console.error("[scorecard/unlock] newsletter subscribe failed:", subErr);
    }
  }

  const propertyNickname = scorecard.property_nickname || "Your property";
  const overallScore = Number(scorecard.overall_score);
  const resultsUrl = `${SITE_URL}/resources/mtr-viability-scorecard/results/${token}`;
  const bookingUrl = `${SITE_URL}/book`;

  if (process.env.RESEND_API_KEY) {
    try {
      await getResend().emails.send({
        from: process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>",
        to: email,
        subject: `Your MTR Viability Calculator is ready (${propertyNickname})`,
        html: scorecardReadyEmail({
          name,
          propertyNickname,
          overallScore,
          maxScore: SCORECARD_MAX_SCORE,
          band: scorecard.band,
          resultsUrl,
          bookingUrl,
        }),
      });
    } catch (emailErr) {
      console.error("[scorecard/unlock] user email failed:", emailErr);
    }

    try {
      await getResend().emails.send({
        from: process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>",
        to:
          process.env.ADMIN_EMAIL ||
          process.env.CONTACT_EMAIL ||
          "admin@benicehospitality.com",
        replyTo: email,
        subject: `New MTR Viability Calculator: ${propertyNickname} (${scorecard.band})`,
        html: internalScorecardRequestEmail({
          email,
          name,
          role: parsed.data.role,
          propertyNickname,
          band: scorecard.band,
          overallScore,
          maxScore: SCORECARD_MAX_SCORE,
          requestId: scorecard.id,
        }),
      });
    } catch (emailErr) {
      console.error("[scorecard/unlock] admin email failed:", emailErr);
    }
  }

  return NextResponse.json({ ok: true, results_url: `/resources/mtr-viability-scorecard/results/${token}` });
}
