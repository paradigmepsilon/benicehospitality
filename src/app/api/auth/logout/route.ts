import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  clearUserSessionCookie,
  revokeSession,
} from "@/lib/community-auth";

export async function POST() {
  try {
    const store = await cookies();
    const sessionId = store.get(SESSION_COOKIE)?.value;
    if (sessionId) {
      await revokeSession(sessionId);
    }
  } catch (err) {
    console.error("[auth/logout] revoke failed:", err);
    // continue to cookie clear regardless — the client should always end up
    // logged out from this endpoint, even if the DB is briefly unavailable.
  }
  const response = NextResponse.json({ success: true });
  clearUserSessionCookie(response);
  return response;
}
