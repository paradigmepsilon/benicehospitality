"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { safeNext } from "@/lib/auth-redirect";

/**
 * Claim Proof's own auth form, styled for the Command Center (dark, gold) so a
 * buyer never sees the BNHG cream/green member chrome. It reuses the shared
 * backend — /api/auth/oauth/<provider>/start, /api/auth/login, /api/auth/signup
 * — so it is the same account system underneath (one email, two front doors),
 * and threads `next` so login lands the buyer back in the portal.
 */

const PORTAL_FALLBACK = "/claimproof/portal";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function errorCopy(code: string | null): string {
  switch (code) {
    case null:
    case "oauth_cancelled":
      return "";
    case "oauth_no_email":
      return "That Google account has no email attached. Use email and password instead.";
    case "oauth_unverified":
      return "Verify the email on your Google account first, then try again.";
    case "oauth_link_conflict":
      return "An account already exists for that email. Sign in with your password, then link Google from your account settings.";
    case "oauth_unconfigured":
      return "Google sign-in isn't available right now. Use email and password.";
    case "verify_email":
      return "Check your inbox to verify your email before signing in.";
    default:
      return "Something went wrong with sign-in. Try again.";
  }
}

export default function CpAuthForm({
  mode,
  googleEnabled,
}: {
  mode: "login" | "signup";
  googleEnabled: boolean;
}) {
  const params = useSearchParams();
  const next = safeNext(params.get("next")) || PORTAL_FALLBACK;
  // A raw ?t= legacy token can arrive on the auth page; preserve it into next
  // so the portal-auth bridge still runs after login.
  const resolvedNext = next === "/account" ? PORTAL_FALLBACK : next;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState(() => errorCopy(params.get("error")));

  const googleHref = `/api/auth/oauth/google/start?next=${encodeURIComponent(resolvedNext)}`;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice(null);
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Fill in every field to continue.");
      return;
    }
    if (mode === "signup") {
      if (password.length < 10) {
        setError("Password must be at least 10 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Those passwords don't match. Re-enter them.");
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const r = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          setError(d.error || "Login failed. Check your email and password.");
          setLoading(false);
          return;
        }
        // Hard navigation so the fresh session cookie rides the next request.
        window.location.assign(resolvedNext);
      } else {
        const r = await fetch("/api/claimproof/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(d.error || "Could not create your account.");
          setLoading(false);
          return;
        }
        setNotice(
          d.message ||
            "Check your email to verify your account, then sign in with this same email.",
        );
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/12 bg-white/[0.04] px-4 py-3 font-sans text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#E19C63]";
  const labelCls =
    "mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50";

  return (
    <div className="space-y-5">
      {googleEnabled && (
        <>
          <a
            href={googleHref}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.07]"
          >
            <GoogleMark />
            Continue with Google
          </a>
          <div className="flex items-center gap-4" role="separator">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              or with email
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </>
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <div className="rounded-lg border border-[#E19C63]/40 bg-[#E19C63]/[0.08] px-4 py-3 font-sans text-sm text-[#EBB183]">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-lg border border-[#8BA5BE]/40 bg-[#8BA5BE]/[0.08] px-4 py-3 font-sans text-sm text-[#8BA5BE]">
            {notice}
          </div>
        )}

        {mode === "signup" && (
          <div>
            <label htmlFor="cp-name" className={labelCls}>
              Full name
            </label>
            <input
              id="cp-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Alex Henry"
            />
          </div>
        )}

        <div>
          <label htmlFor="cp-email" className={labelCls}>
            Email
          </label>
          <input
            id="cp-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="cp-password" className={labelCls}>
            Password
          </label>
          <div className="relative">
            <input
              id="cp-password"
              type={show ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls + " pr-16"}
              placeholder={mode === "signup" ? "At least 10 characters" : "••••••••"}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-xs font-semibold text-white/50 hover:text-[#E19C63]"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {mode === "signup" && (
          <div>
            <label htmlFor="cp-confirm" className={labelCls}>
              Confirm password
            </label>
            <input
              id="cp-confirm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={
                inputCls +
                (confirm && confirm !== password ? " border-[#E19C63]/60" : "")
              }
              placeholder="Re-enter your password"
            />
            {confirm && confirm !== password && (
              <p className="mt-1.5 font-sans text-xs text-[#EBB183]">
                Passwords don&rsquo;t match yet.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#E19C63] px-6 py-3.5 font-sans text-base font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? mode === "login"
              ? "Signing in…"
              : "Creating your account…"
            : mode === "login"
              ? "Sign in to your Command Center"
              : "Create your account"}
        </button>
      </form>

      <p className="text-center font-sans text-sm text-white/45">
        {mode === "login" ? (
          <>
            Bought Claim Proof or been invited to a team?{" "}
            <Link
              href={`/claimproof/signup${params.toString() ? `?${params.toString()}` : ""}`}
              className="font-semibold text-[#E19C63] hover:text-[#EBB183]"
            >
              Set up your account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={`/claimproof/login${params.toString() ? `?${params.toString()}` : ""}`}
              className="font-semibold text-[#E19C63] hover:text-[#EBB183]"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
      {mode === "login" && (
        <p className="text-center">
          <Link
            href="/login/reset"
            className="font-sans text-xs text-white/40 underline underline-offset-4 hover:text-white/70"
          >
            Forgot your password?
          </Link>
        </p>
      )}
    </div>
  );
}
