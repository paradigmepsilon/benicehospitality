import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exchangeCalendarCode, saveCalendarConnection } from "@/lib/google-calendar";

const STATE_COOKIE = "calendar_oauth_state";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieState = cookieHeader.match(new RegExp(`(?:^|; )${STATE_COOKIE}=([^;]+)`))?.[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.json({ error: "Invalid or expired OAuth state. Try connecting again." }, { status: 400 });
  }

  try {
    const { refreshToken, accountEmail } = await exchangeCalendarCode(code);
    await saveCalendarConnection(accountEmail, refreshToken);
    const res = NextResponse.json({
      success: true,
      message: `Connected ${accountEmail} as the shared booking calendar. New bookings will now create a Google Meet event automatically.`,
    });
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (error) {
    console.error("Calendar OAuth callback failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect calendar." },
      { status: 500 }
    );
  }
}
