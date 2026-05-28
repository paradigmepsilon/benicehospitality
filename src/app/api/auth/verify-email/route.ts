import { NextResponse } from "next/server";
import {
  consumeEmailVerificationToken,
  markEmailVerified,
  createUserSession,
  setUserSessionCookie,
} from "@/lib/community-auth";
import { emailVerifyLimiter, getClientIp } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics";

// GET so the email link is clickable. The token is single-use and SHA-256
// hashed in the DB, so exposing it once in the URL is safe. On success we
// mark the email verified, create a session, set the cookie, and redirect
// the user into /onboarding to finish intake.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const failed = () =>
    NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url),
    );

  try {
    const ip = getClientIp(request);
    const limit = emailVerifyLimiter.check(`emailverify:${ip}`);
    if (!limit.success) {
      // Lump rate-limit hits in with the generic failure case so attackers
      // can't distinguish "token is wrong" from "you're being throttled."
      return failed();
    }
    if (!token) return failed();

    const consumed = await consumeEmailVerificationToken(token);
    if (!consumed) return failed();

    await markEmailVerified(consumed.userId);

    const userAgent = request.headers.get("user-agent");
    const { sessionId } = await createUserSession(
      consumed.userId,
      ip,
      userAgent,
    );
    void recordEvent({
      userId: consumed.userId,
      eventType: "auth.email_verified",
      metadata: {},
    });

    // ?welcome=signup is informational — the onboarding page reads it to
    // tweak its heading from "Tell us about yourself" to a warmer
    // "Welcome — let's get you set up."
    const redirectUrl = new URL("/onboarding?welcome=signup", request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("x-robots-tag", "noindex");
    setUserSessionCookie(response, sessionId);
    return response;
  } catch (error) {
    console.error("[auth/verify-email] error:", error);
    return failed();
  }
}
