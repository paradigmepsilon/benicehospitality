import { Facebook, Google, LinkedIn } from "arctic";

// Providers are instantiated lazily on first use so a missing client ID for one
// provider doesn't crash the others. Each profile fetch normalizes to the same
// shape so the callback route can be provider-agnostic.

export type ProviderName = "google" | "facebook" | "linkedin";

export const PROVIDER_NAMES: readonly ProviderName[] = [
  "google",
  "facebook",
  "linkedin",
] as const;

export function isProviderName(value: unknown): value is ProviderName {
  return (
    typeof value === "string" &&
    (PROVIDER_NAMES as readonly string[]).includes(value)
  );
}

export interface OAuthProfile {
  providerAccountId: string;
  email: string | null;
  name: string;
  emailVerified: boolean;
}

interface ProviderEnv {
  clientId: string | undefined;
  clientSecret: string | undefined;
}

function envFor(name: ProviderName): ProviderEnv {
  switch (name) {
    case "google":
      return {
        clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      };
    case "facebook":
      return {
        clientId: process.env.FACEBOOK_OAUTH_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
      };
    case "linkedin":
      return {
        clientId: process.env.LINKEDIN_OAUTH_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_OAUTH_CLIENT_SECRET,
      };
  }
}

export function isProviderEnabled(name: ProviderName): boolean {
  const env = envFor(name);
  return Boolean(env.clientId && env.clientSecret);
}

export function getEnabledProviders(): Record<ProviderName, boolean> {
  return {
    google: isProviderEnabled("google"),
    facebook: isProviderEnabled("facebook"),
    linkedin: isProviderEnabled("linkedin"),
  };
}

function getBaseUrl(): string {
  return (
    process.env.BNHG_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getRedirectUri(name: ProviderName): string {
  return `${getBaseUrl()}/api/auth/oauth/${name}/callback`;
}

export const PROVIDER_SCOPES: Record<ProviderName, string[]> = {
  google: ["openid", "email", "profile"],
  facebook: ["email", "public_profile"],
  linkedin: ["openid", "profile", "email"],
};

// Per-provider client constructors. Returning the concrete class lets callers
// invoke createAuthorizationURL with the right argument shape (Google needs a
// PKCE verifier; Facebook and LinkedIn don't).

export function getGoogleClient(): Google {
  const env = envFor("google");
  if (!env.clientId || !env.clientSecret) {
    throw new ProviderNotConfiguredError("google");
  }
  return new Google(env.clientId, env.clientSecret, getRedirectUri("google"));
}

export function getFacebookClient(): Facebook {
  const env = envFor("facebook");
  if (!env.clientId || !env.clientSecret) {
    throw new ProviderNotConfiguredError("facebook");
  }
  return new Facebook(
    env.clientId,
    env.clientSecret,
    getRedirectUri("facebook"),
  );
}

export function getLinkedInClient(): LinkedIn {
  const env = envFor("linkedin");
  if (!env.clientId || !env.clientSecret) {
    throw new ProviderNotConfiguredError("linkedin");
  }
  return new LinkedIn(
    env.clientId,
    env.clientSecret,
    getRedirectUri("linkedin"),
  );
}

export class ProviderNotConfiguredError extends Error {
  constructor(public provider: ProviderName) {
    super(`OAuth provider not configured: ${provider}`);
    this.name = "ProviderNotConfiguredError";
  }
}

// ===========================================================================
// Profile fetch + normalization. Each provider's userinfo response is shaped
// differently; we normalize to OAuthProfile so the callback route doesn't care.
// ===========================================================================

export async function fetchGoogleProfile(
  accessToken: string,
): Promise<OAuthProfile> {
  // https://developers.google.com/identity/openid-connect/openid-connect#obtainuserinfo
  const res = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`google userinfo ${res.status}`);
  const data = (await res.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
  };
  if (!data.sub) throw new Error("google userinfo missing sub");
  return {
    providerAccountId: data.sub,
    email: typeof data.email === "string" ? data.email : null,
    name: data.name || data.given_name || data.email || "Google User",
    emailVerified: data.email_verified === true,
  };
}

export async function fetchFacebookProfile(
  accessToken: string,
): Promise<OAuthProfile> {
  // Graph API v19: /me?fields=id,name,email. Email is missing if the user
  // signed up to Facebook with a phone number, or revoked the email scope.
  // Facebook does NOT return an email_verified flag.
  const url = new URL("https://graph.facebook.com/v19.0/me");
  url.searchParams.set("fields", "id,name,email");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`facebook /me ${res.status}`);
  const data = (await res.json()) as {
    id?: string;
    name?: string;
    email?: string;
  };
  if (!data.id) throw new Error("facebook /me missing id");
  return {
    providerAccountId: data.id,
    email: typeof data.email === "string" ? data.email : null,
    name: data.name || data.email || "Facebook User",
    emailVerified: false,
  };
}

export async function fetchLinkedInProfile(
  accessToken: string,
): Promise<OAuthProfile> {
  // Sign In with LinkedIn using OpenID Connect — the modern product.
  // https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`linkedin userinfo ${res.status}`);
  const data = (await res.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
  };
  if (!data.sub) throw new Error("linkedin userinfo missing sub");
  return {
    providerAccountId: data.sub,
    email: typeof data.email === "string" ? data.email : null,
    name: data.name || data.given_name || data.email || "LinkedIn User",
    emailVerified: data.email_verified === true,
  };
}

export async function fetchProfile(
  provider: ProviderName,
  accessToken: string,
): Promise<OAuthProfile> {
  switch (provider) {
    case "google":
      return fetchGoogleProfile(accessToken);
    case "facebook":
      return fetchFacebookProfile(accessToken);
    case "linkedin":
      return fetchLinkedInProfile(accessToken);
  }
}
