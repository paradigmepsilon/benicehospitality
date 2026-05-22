import { NextResponse } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";
import { safeNext } from "@/lib/auth-redirect";
import { setOAuthCookies } from "@/lib/oauth/cookies";
import { encodeState } from "@/lib/oauth/state";
import {
  getFacebookClient,
  getGoogleClient,
  getLinkedInClient,
  isProviderEnabled,
  isProviderName,
  PROVIDER_SCOPES,
  ProviderNotConfiguredError,
  type ProviderName,
} from "@/lib/oauth/providers";

export const dynamic = "force-dynamic";

function loginRedirect(
  request: Request,
  errorCode: string,
  next: string,
): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", errorCode);
  if (next && next !== "/account") url.searchParams.set("next", next);
  const res = NextResponse.redirect(url);
  res.headers.set("x-robots-tag", "noindex");
  return res;
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider: providerParam } = await ctx.params;
  const requestUrl = new URL(request.url);
  const next = safeNext(requestUrl.searchParams.get("next"));

  if (!isProviderName(providerParam)) {
    return loginRedirect(request, "oauth_failed", next);
  }
  const provider: ProviderName = providerParam;

  if (!isProviderEnabled(provider)) {
    return loginRedirect(request, "oauth_unconfigured", next);
  }

  try {
    const nonce = generateState();
    const stateValue = encodeState({ nonce, next });

    let authorizeUrl: URL;
    let pkceVerifier: string | undefined;

    if (provider === "google") {
      pkceVerifier = generateCodeVerifier();
      authorizeUrl = getGoogleClient().createAuthorizationURL(
        stateValue,
        pkceVerifier,
        PROVIDER_SCOPES.google,
      );
    } else if (provider === "facebook") {
      authorizeUrl = getFacebookClient().createAuthorizationURL(
        stateValue,
        PROVIDER_SCOPES.facebook,
      );
    } else {
      authorizeUrl = getLinkedInClient().createAuthorizationURL(
        stateValue,
        PROVIDER_SCOPES.linkedin,
      );
    }

    const response = NextResponse.redirect(authorizeUrl);
    response.headers.set("x-robots-tag", "noindex");
    setOAuthCookies(response, { nonce, pkceVerifier });
    return response;
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return loginRedirect(request, "oauth_unconfigured", next);
    }
    console.error("[oauth/start] error:", err);
    return loginRedirect(request, "oauth_failed", next);
  }
}
