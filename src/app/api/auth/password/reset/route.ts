import { NextResponse } from "next/server";
import {
  consumePasswordResetToken,
  setUserPassword,
  findUserById,
  createUserSession,
  setUserSessionCookie,
} from "@/lib/community-auth";
import {
  passwordResetConsumeLimiter,
  getClientIp,
} from "@/lib/rate-limit";

const MIN_PASSWORD_LENGTH = 10;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = passwordResetConsumeLimiter.check(`pwreset-consume:${ip}`);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    const { token, password } = body as {
      token?: unknown;
      password?: unknown;
    };
    if (typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 },
      );
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const consumed = await consumePasswordResetToken(token);
    if (!consumed) {
      return NextResponse.json(
        {
          error:
            "This reset link is invalid or has expired. Request a new one.",
        },
        { status: 400 },
      );
    }

    await setUserPassword(consumed.userId, password);

    // Auto-login after successful reset so the user lands directly on /account.
    const user = await findUserById(consumed.userId);
    if (!user || user.disabled_at) {
      return NextResponse.json(
        { error: "Account is unavailable. Contact support." },
        { status: 403 },
      );
    }
    const userAgent = request.headers.get("user-agent");
    const { sessionId } = await createUserSession(user.id, ip, userAgent);
    const response = NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role },
    });
    setUserSessionCookie(response, sessionId);
    return response;
  } catch (error) {
    console.error("[auth/password/reset] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
