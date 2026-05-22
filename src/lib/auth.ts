import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionWithUser,
  type Role,
} from "@/lib/community-auth";

// Backwards-compatible auth surface for the existing /api/admin/* routes.
// Internally these now read the unified `bnhg_session` cookie + DB-backed
// session table introduced in community-auth.ts. The shape returned by
// getSession preserves the `{ sub: string }` contract expected by older
// callers (sub === user email under the new scheme).

export interface AdminSession {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

function readSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`),
  );
  return match?.[1] ?? null;
}

/**
 * Returns null when authenticated as an admin (so callers can early-return on
 * a non-null response). Returns a 401/403 NextResponse otherwise.
 *
 * Usage stays identical to the previous implementation:
 *   const authError = await requireAuth(request);
 *   if (authError) return authError;
 */
export async function requireAuth(
  request: Request,
): Promise<NextResponse | null> {
  const sessionId = readSessionCookie(request);
  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await getSessionWithUser(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Returns the active admin session, or null. Use this when you need the actor
 * identity for audit columns. Older callers expect a `sub` string; that's now
 * the user's email.
 */
export async function getSession(): Promise<AdminSession | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const session = await getSessionWithUser(sessionId);
  if (!session) return null;
  return {
    sub: session.user.email,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}
