import { NextResponse } from "next/server";
import {
  findUserByEmail,
  createPasswordResetToken,
} from "@/lib/community-auth";
import { sendPasswordResetEmail } from "@/lib/auth-email";
import {
  passwordResetRequestLimiter,
  getClientIp,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = passwordResetRequestLimiter.check(`pwreset:${ip}`);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const email =
      body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string"
        ? ((body as { email: string }).email)
        : null;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    // Always respond identically whether or not the user exists, to avoid
    // leaking which emails are registered. Email send happens out-of-band.
    const user = await findUserByEmail(email);
    if (user && !user.disabled_at) {
      try {
        const { rawToken } = await createPasswordResetToken(user.id);
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          rawToken,
        });
      } catch (err) {
        console.error("[auth/password/request-reset] send failed:", err);
        // Swallow — we do not want to leak failure modes back to the caller.
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for that email, a reset link is on its way.",
    });
  } catch (error) {
    console.error("[auth/password/request-reset] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
