import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCurrentSession,
  upsertUserProfile,
  AuthBackendUnavailableError,
  SERVICE_INTERESTS,
  BUSINESS_STAGES,
} from "@/lib/community-auth";
import { onboardingLimiter, getClientIp } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics";

const OnboardingBody = z.object({
  // For Google users the deep form is the first place we collect phone +
  // interests. For password-signup users these are pre-filled from the
  // signup row; resending them here is harmless because the COALESCE in
  // upsertUserProfile keeps the stored value if EXCLUDED is null.
  phone: z.string().trim().min(7).max(32).optional(),
  serviceInterests: z
    .array(z.enum(SERVICE_INTERESTS))
    .min(1)
    .max(SERVICE_INTERESTS.length)
    .optional(),
  whyJoining: z.string().trim().max(2000).optional(),
  goals: z.string().trim().max(2000).optional(),
  businessStage: z.enum(BUSINESS_STAGES).optional(),
  heardFrom: z.string().trim().max(120).optional(),
  marketingOptIn: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: "Sign in first." },
        { status: 401 },
      );
    }

    const ip = getClientIp(request);
    const limit = onboardingLimiter.check(
      `onboarding:${ip}:${session.user.id}`,
    );
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many submissions. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const raw = await request.json().catch(() => null);
    const parsed = OnboardingBody.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid submission." },
        { status: 400 },
      );
    }

    try {
      await upsertUserProfile(session.user.id, parsed.data, {
        markOnboarded: true,
      });
    } catch (err) {
      if (err instanceof AuthBackendUnavailableError) {
        return NextResponse.json(
          { error: "Onboarding is not configured on this server." },
          { status: 503 },
        );
      }
      throw err;
    }

    void recordEvent({
      userId: session.user.id,
      eventType: "auth.onboarded",
      metadata: {
        interests: parsed.data.serviceInterests ?? [],
        businessStage: parsed.data.businessStage,
      },
    });

    return NextResponse.json({
      success: true,
      redirect: "/account?welcome=1",
    });
  } catch (error) {
    console.error("[auth/onboarding] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
