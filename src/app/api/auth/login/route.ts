import { NextResponse } from "next/server";
import {
  authenticate,
  createUserSession,
  setUserSessionCookie,
  AuthBackendUnavailableError,
  EmailNotVerifiedError,
} from "@/lib/community-auth";
import { loginLimiter, getClientIp } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    const { email, password } = body as {
      email?: unknown;
      password?: unknown;
    };
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Rate-limit by IP + email so a single attacker can't brute-force one
    // account by rotating IPs, and can't sweep many accounts from one IP.
    const limitKey = `login:${ip}:${email.toLowerCase().trim()}`;
    const limit = loginLimiter.check(limitKey);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 },
      );
    }

    let user;
    try {
      user = await authenticate(email, password);
    } catch (err) {
      if (err instanceof EmailNotVerifiedError) {
        // Password matched but they haven't clicked the verification link
        // yet. Use a distinct status + code so the form can render the
        // "check your inbox" message instead of "invalid credentials."
        return NextResponse.json(
          {
            error:
              "Check your inbox to verify your email before signing in.",
            code: "verify_email",
          },
          { status: 403 },
        );
      }
      if (err instanceof AuthBackendUnavailableError) {
        // Clear, actionable message in development; production never lands
        // here because production NODE_ENV refuses the dev fallback path.
        return NextResponse.json(
          {
            error:
              "Auth is not configured on this server. Set DATABASE_URL and run `npm run db:migrate && npm run db:seed:users`, or set `BNHG_DEV_FALLBACK_AUTH=1` in .env.local for the in-memory dev fallback. Restart the dev server after changing env vars.",
          },
          { status: 503 },
        );
      }
      throw err;
    }
    if (!user) {
      // Generic message — never confirm whether the email exists.
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const userAgent = request.headers.get("user-agent");
    const { sessionId } = await createUserSession(user.id, ip, userAgent);
    void recordEvent({
      userId: user.id,
      eventType: "auth.login",
      metadata: { role: user.role },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    setUserSessionCookie(response, sessionId);
    return response;
  } catch (error) {
    console.error("[auth/login] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
