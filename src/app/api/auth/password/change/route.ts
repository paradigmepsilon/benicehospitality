import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getCurrentSession,
  findUserById,
  setUserPassword,
} from "@/lib/community-auth";

const MIN_PASSWORD_LENGTH = 10;

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    const { currentPassword, newPassword } = body as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "Current and new passwords are required" },
        { status: 400 },
      );
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const userRow = await findUserById(session.user.id);
    if (!userRow || userRow.disabled_at) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // OAuth-only accounts (Google/LinkedIn) have password_hash NULL — they
    // can't change a password they don't have. Tell them to use the reset
    // flow which sets a password instead.
    if (!userRow.password_hash) {
      return NextResponse.json(
        {
          error:
            "This account uses social sign-in. Use the password reset flow to add a password first.",
        },
        { status: 400 },
      );
    }

    const ok = await bcrypt.compare(currentPassword, userRow.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    await setUserPassword(userRow.id, newPassword);
    // setUserPassword revokes all sessions, so the current cookie is now
    // invalid. The client must log in again with the new password.
    return NextResponse.json({
      success: true,
      message:
        "Password updated. You've been signed out everywhere; sign back in with your new password.",
    });
  } catch (error) {
    console.error("[auth/password/change] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
