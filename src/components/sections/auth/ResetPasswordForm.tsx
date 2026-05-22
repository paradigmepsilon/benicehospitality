"use client";

import { useState, type FormEvent } from "react";

const MIN_PASSWORD_LENGTH = 10;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Reset failed. Try again.");
        setLoading(false);
        return;
      }
      // Reset endpoint auto-issues a session cookie, so we land directly on
      // /account.
      window.location.assign("/account");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
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
          htmlFor="password"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-light-gray rounded-md px-4 py-3 pr-16 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
            placeholder="At least 10 characters"
            minLength={MIN_PASSWORD_LENGTH}
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

      <div>
        <label
          htmlFor="confirm"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          Confirm new password
        </label>
        <input
          id="confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
          placeholder="Type it again"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-7 py-3.5 text-base min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
