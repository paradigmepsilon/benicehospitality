import { NextRequest, NextResponse } from "next/server";

// Edge proxy gates `/account` and `/admin/*` on cookie presence — a fast,
// DB-free check. Actual session validity (revocation, expiry, role) is
// re-checked inside the page/layout against the DB before any sensitive
// content renders. Edge here is the cheap first wall, not the only wall.
//
// Cookie name matches `SESSION_COOKIE` in src/lib/community-auth.ts.
const SESSION_COOKIE = "bnhg_session";

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!session) {
    const next = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/login?next=${next}`, request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // /account and any subpath
    "/account/:path*",
    "/account",
    // /admin and subpaths, except /admin/login (which now redirects to /login
    // via its own page-level redirect — see src/app/admin/login/page.tsx).
    "/admin/((?!login).*)",
    "/admin",
  ],
};
