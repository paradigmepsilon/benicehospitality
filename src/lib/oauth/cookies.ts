import type { NextResponse } from "next/server";

export const OAUTH_STATE_COOKIE = "bnhg_oauth_state";
export const OAUTH_PKCE_COOKIE = "bnhg_oauth_pkce";

const TEN_MINUTES = 60 * 10;

function baseFlags() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export function setOAuthCookies(
  response: NextResponse,
  opts: { nonce: string; pkceVerifier?: string },
): void {
  response.cookies.set(OAUTH_STATE_COOKIE, opts.nonce, {
    ...baseFlags(),
    maxAge: TEN_MINUTES,
  });
  if (opts.pkceVerifier) {
    response.cookies.set(OAUTH_PKCE_COOKIE, opts.pkceVerifier, {
      ...baseFlags(),
      maxAge: TEN_MINUTES,
    });
  }
}

export function clearOAuthCookies(response: NextResponse): void {
  for (const name of [OAUTH_STATE_COOKIE, OAUTH_PKCE_COOKIE]) {
    response.cookies.set(name, "", {
      ...baseFlags(),
      maxAge: 0,
    });
  }
}
