import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentSession } from "@/lib/community-auth";
import { computeScorecard } from "@/lib/scorecard/score";
import { scorecardSubmitBodySchema } from "@/lib/validation/scorecard";
import { scorecardSubmitLimiter, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { personId } from "@/lib/posthog-identity";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = scorecardSubmitLimiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = scorecardSubmitBodySchema.safeParse(body);
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

  const computed = computeScorecard(parsed.data.answers);
  const token = randomBytes(16).toString("base64url");
  const propertyNickname = parsed.data.property_nickname?.trim() || "Your property";

  const session = await getCurrentSession();
  const status = session ? "unlocked" : "pending_capture";
  const userId = session?.user.id ?? null;
  const unlockedAt = session ? new Date().toISOString() : null;
  const email = session?.user.email ?? null;
  const name = session?.user.name ?? null;

  try {
    await sql`
      INSERT INTO viability_scorecards (
        token, property_nickname, answers, section_scores, overall_score, band,
        status, user_id, email, name, unlocked_at
      )
      VALUES (
        ${token},
        ${propertyNickname},
        ${JSON.stringify(parsed.data.answers)}::jsonb,
        ${JSON.stringify(computed.sectionScores)}::jsonb,
        ${computed.overallScore},
        ${computed.band},
        ${status},
        ${userId},
        ${email},
        ${name},
        ${unlockedAt}
      )
    `;
  } catch (err) {
    console.error("[scorecard/submit] insert failed:", err);
    return NextResponse.json(
      { error: "Failed to save scorecard." },
      { status: 500 },
    );
  }

  // Email first, always — it is the canonical person key and the only one that
  // joins this submission to the rest of the funnel. The token fallback covers
  // the genuinely anonymous case: the scorecard can be completed before the
  // capture step, so there may be no email yet.
  const distinctId = email ? personId(email) : token;
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId,
    event: "scorecard_submitted",
    properties: {
      overall_score: computed.overallScore,
      band: computed.band,
      property_nickname: propertyNickname,
      is_logged_in: Boolean(session),
    },
  });

  return NextResponse.json(
    {
      token,
      requires_capture: !session,
    },
    { status: 201 },
  );
}
