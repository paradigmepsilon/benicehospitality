import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createPasswordUser,
  createEmailVerificationToken,
  SignupEmailInUseError,
  AuthBackendUnavailableError,
  SERVICE_INTERESTS,
} from "@/lib/community-auth";
import { sendVerificationEmail } from "@/lib/auth-email";
import { signupLimiter, getClientIp } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics";
import { getPostHogClient } from "@/lib/posthog-server";

const SignupBody = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254)
    .transform((s) => s.toLowerCase()),
  phone: z.string().trim().min(7, "Enter a phone number.").max(32),
  // 10-char minimum matches the password reset enforcement elsewhere in the
  // app so the rule stays consistent across surfaces.
  password: z.string().min(10, "Password must be at least 10 characters.").max(200),
  serviceInterests: z
    .array(z.enum(SERVICE_INTERESTS))
    .min(1, "Pick at least one area you're interested in.")
    .max(SERVICE_INTERESTS.length),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = signupLimiter.check(`signup:${ip}`);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many signups from this address. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const raw = await request.json().catch(() => null);
    const parsed = SignupBody.safeParse(raw);
    if (!parsed.success) {
      // Surface the first user-readable field error so the form can show it.
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid signup details." },
        { status: 400 },
      );
    }
    const body = parsed.data;

    try {
      const { userId } = await createPasswordUser(body);
      const { rawToken } = await createEmailVerificationToken(userId);
      try {
        await sendVerificationEmail({
          to: body.email,
          name: body.name,
          rawToken,
        });
      } catch (err) {
        console.error("[auth/signup] verification email send failed:", err);
        // Swallow send failures — the row is created, the user can request
        // another verification link later. Surfacing this would leak which
        // emails exist via timing/error differences.
      }
      void recordEvent({
        userId,
        eventType: "auth.signup",
        metadata: { method: "password", interests: body.serviceInterests },
      });
      const posthog = getPostHogClient();
      posthog.identify({
        distinctId: String(userId),
        properties: { name: body.name, role: "member" },
      });
      posthog.capture({
        distinctId: String(userId),
        event: "user_signed_up",
        properties: { method: "password", service_interests: body.serviceInterests },
      });
    } catch (err) {
      if (err instanceof SignupEmailInUseError) {
        // Generic success response, same as request-reset, to avoid leaking
        // which emails are registered. A real account holder who tries to
        // sign up again just sees the same "check your inbox" message; their
        // existing account is untouched.
      } else if (err instanceof AuthBackendUnavailableError) {
        return NextResponse.json(
          {
            error:
              "Signup is not configured on this server. Set DATABASE_URL and run `npm run db:migrate`.",
          },
          { status: 503 },
        );
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Check your email to verify your account.",
    });
  } catch (error) {
    console.error("[auth/signup] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
