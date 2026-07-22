"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import OAuthButtons, {
  type EnabledProviders,
} from "@/components/sections/auth/OAuthButtons";
import { safeNext } from "@/lib/auth-redirect";
import posthog from "posthog-js";
import { personId } from "@/lib/posthog-identity";

interface Props {
  enabledProviders?: EnabledProviders;
}

function errorCopy(code: string | null): string {
  if (!code) return "";
  switch (code) {
    case "oauth_cancelled":
      return "";
    case "oauth_state":
      return "Authentication failed. Please try again.";
    case "oauth_no_email":
      return "Your social account doesn't expose an email. Use email and password instead.";
    case "oauth_unverified":
      return "Verify the email on your social account first, then try again.";
    case "oauth_link_conflict":
      return "An account already exists for that email. Sign in with your password, then link your social account from your account page.";
    case "oauth_disabled":
      return "Invalid email or password.";
    case "oauth_unconfigured":
      return "That sign-in option is not available right now.";
    case "oauth_failed":
      return "Authentication failed. Please try again.";
    // Emitted when an unverified password account tries to sign in. The
    // signup verification email is the unblocker.
    case "verify_email":
      return "Check your inbox to verify your email before signing in.";
    // Emitted by the /api/auth/verify-email route when the token is missing,
    // expired, or already consumed.
    case "verification_failed":
      return "That verification link is invalid or has expired. Sign up again to get a fresh one.";
    default:
      return "";
  }
}

const NO_PROVIDERS: EnabledProviders = {
  google: false,
  facebook: false,
  linkedin: false,
};

export default function LoginForm({
  enabledProviders = NO_PROVIDERS,
}: Props) {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  // Seed `error` from the `?error=...` OAuth-callback param on first render so
  // a failed round-trip lands users back here with a readable message rather
  // than a silent return. Computed lazily so re-renders don't reset edits.
  const [error, setError] = useState(() =>
    errorCopy(searchParams.get("error")),
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed. Check your email and password.");
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({})) as { user?: { id?: number; name?: string; role?: string } };
      if (data.user?.id) {
        // Client-side identify is what merges this browser's anonymous history
        // into the person. Keyed on email (see lib/posthog-identity) so it
        // matches the server-side identify in the login route and the earlier
        // resource-gate unlock, instead of forking a user-id-keyed profile.
        posthog.identify(personId(email), {
          name: data.user.name,
          role: data.user.role,
          user_id: data.user.id,
        });
      }
      posthog.capture("user_logged_in", { role: data.user?.role });

      // Hard navigation so the freshly-set bnhg_session cookie is sent on the
      // very next request (avoids router.push race with cookie write under
      // Next.js + Turbopack).
      window.location.assign(next);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const hasOAuth =
    enabledProviders.google ||
    enabledProviders.facebook ||
    enabledProviders.linkedin;

  return (
    <div className="space-y-6">
      {hasOAuth && (
        <OAuthButtons next={next} enabledProviders={enabledProviders} />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-light-gray rounded-lg p-7 md:p-8 space-y-5"
        noValidate
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-sans p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-light-gray rounded-md px-4 py-3 pr-16 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-xs font-semibold text-charcoal/60 hover:text-primary-green"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 font-sans text-sm text-charcoal/80 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-primary-green"
            />
            Remember me
          </label>
          <Link
            href="/login/reset"
            className="font-sans text-sm text-primary-green hover:text-primary-green-dark"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-7 py-3.5 text-base min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
