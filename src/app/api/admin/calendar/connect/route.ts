import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth";
import { getCalendarAuthUrl } from "@/lib/google-calendar";

const STATE_COOKIE = "calendar_oauth_state";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const state = crypto.randomBytes(16).toString("hex");
  const res = NextResponse.redirect(getCalendarAuthUrl(state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
