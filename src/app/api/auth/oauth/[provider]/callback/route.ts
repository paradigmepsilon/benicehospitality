import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { OAuth2RequestError } from "arctic";
import { safeNext } from "@/lib/auth-redirect";
import {
  AuthBackendUnavailableError,
  createUserSession,
  findOrCreateOAuthUser,
  OAuthLinkError,
  setUserSessionCookie,
} from "@/lib/community-auth";
import { recordEvent } from "@/lib/analytics";
import { getClientIp, loginLimiter } from "@/lib/rate-limit";
import {
  clearOAuthCookies,
  OAUTH_PKCE_COOKIE,
  OAUTH_STATE_COOKIE,
} from "@/lib/oauth/cookies";
import { decodeState, nonceMatches } from "@/lib/oauth/state";
import {
  fetchProfile,
  getFacebookClient,
  getGoogleClient,
  getLinkedInClient,
  isProviderEnabled,
  isProviderName,
  ProviderNotConfiguredError,
  type ProviderName,
} from "@/lib/oauth/providers";

export const dynamic = "force-dynamic";

function errorRedirect(
  request: Request,
  errorCode: string,
  next: string,
): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", errorCode);
  if (next && next !== "/account") url.searchParams.set("next", next);
  const res = NextResponse.redirect(url);
  res.headers.set("x-robots-tag", "noindex");
  clearOAuthCookies(res);
  return res;
}

function silentRedirect(request: Request, next: string): NextResponse {
  const url = new URL("/login", request.url);
  if (next && next !== "/account") url.searchParams.set("next", next);
  const res = NextResponse.redirect(url);
  res.headers.set("x-robots-tag", "noindex");
  clearOAuthCookies(res);
  return res;
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider: providerParam } = await ctx.params;
  const requestUrl = new URL(request.url);

  // Best-effort `next` even before state is parsed, for early-failure redirects.
  let next = safeNext(requestUrl.searchParams.get("next"));

  if (!isProviderName(providerParam)) {
    return errorRedirect(request, "oauth_failed", next);
  }
  const provider: ProviderName = providerParam;

  // User cancelled at the provider → silent return.
  const providerError = requestUrl.searchParams.get("error");
  if (providerError === "access_denied" || providerError === "user_cancelled_login") {
    return silentRedirect(request, next);
  }
  if (providerError) {
    return errorRedirect(request, "oauth_failed", next);
  }

  if (!isProviderEnabled(provider)) {
    return errorRedirect(request, "oauth_unconfigured", next);
  }

  // Rate-limit callback handling. Code-replay attempts will hit this before
  // we touch the DB or the provider's token endpoint.
  const ip = getClientIp(request);
  const limit = loginLimiter.check(`oauth:${ip}:${provider}`);
  if (!limit.success) {
    return errorRedirect(request, "oauth_failed", next);
  }

  const code = requestUrl.searchParams.get("code");
  const rawState = requestUrl.searchParams.get("state");
  if (!code || !rawState) {
    return errorRedirect(request, "oauth_state", next);
  }

  const decoded = decodeState(rawState);
  if (!decoded) {
    return errorRedirect(request, "oauth_state", next);
  }
  next = decoded.next;

  const cookieStore = await cookies();
  const nonceCookie = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  if (!nonceCookie || !nonceMatches(nonceCookie, decoded.nonce)) {
    return errorRedirect(request, "oauth_state", next);
  }

  const pkceVerifier = cookieStore.get(OAUTH_PKCE_COOKIE)?.value;
  if (provider === "google" && !pkceVerifier) {
    return errorRedirect(request, "oauth_state", next);
  }

  // Exchange the authorization code for tokens.
  let accessToken: string;
  try {
    if (provider === "google") {
      const tokens = await getGoogleClient().validateAuthorizationCode(
        code,
        pkceVerifier as string,
      );
      accessToken = tokens.accessToken();
    } else if (provider === "facebook") {
      const tokens = await getFacebookClient().validateAuthorizationCode(code);
      accessToken = tokens.accessToken();
    } else {
      const tokens = await getLinkedInClient().validateAuthorizationCode(code);
      accessToken = tokens.accessToken();
    }
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return errorRedirect(request, "oauth_unconfigured", next);
    }
    if (err instanceof OAuth2RequestError) {
      return errorRedirect(request, "oauth_failed", next);
    }
    console.error("[oauth/callback] token exchange:", err);
    return errorRedirect(request, "oauth_failed", next);
  }

  // Fetch the provider's user profile.
  let profile;
  try {
    profile = await fetchProfile(provider, accessToken);
  } catch (err) {
    console.error("[oauth/callback] profile fetch:", err);
    return errorRedirect(request, "oauth_failed", next);
  }

  if (!profile.email) {
    return errorRedirect(request, "oauth_no_email", next);
  }

  // Google/LinkedIn must attest email_verified=true. Facebook never does;
  // findOrCreateOAuthUser enforces the strict policy for Facebook directly.
  if (
    (provider === "google" || provider === "linkedin") &&
    !profile.emailVerified
  ) {
    return errorRedirect(request, "oauth_unverified", next);
  }

  // Link or create the local user, then create a session.
  let user;
  try {
    user = await findOrCreateOAuthUser({
      provider,
      providerAccountId: profile.providerAccountId,
      email: profile.email,
      name: profile.name,
      emailVerified: profile.emailVerified,
    });
  } catch (err) {
    if (err instanceof OAuthLinkError) {
      return errorRedirect(request, err.code, next);
    }
    if (err instanceof AuthBackendUnavailableError) {
      return errorRedirect(request, "oauth_unconfigured", next);
    }
    console.error("[oauth/callback] link error:", err);
    return errorRedirect(request, "oauth_failed", next);
  }

  const userAgent = request.headers.get("user-agent");
  const { sessionId } = await createUserSession(user.id, ip, userAgent);
  void recordEvent({
    userId: user.id,
    eventType: "auth.login",
    metadata: { role: user.role, method: "oauth", provider },
  });

  // Admins go to /admin if the caller didn't ask for somewhere specific.
  const finalNext =
    next === "/account" && user.role === "admin" ? "/admin" : next;

  const redirectUrl = new URL(finalNext, request.url);
  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("x-robots-tag", "noindex");
  setUserSessionCookie(response, sessionId);
  clearOAuthCookies(response);
  return response;
}
