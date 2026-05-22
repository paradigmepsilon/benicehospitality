"use client";

import { useState, type FormEvent } from "react";

export default function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Try again.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-light-gray rounded-lg p-7 md:p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-deep-teal mb-3">
          Check your inbox.
        </h2>
        <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
          If an account exists for <strong>{email}</strong>, a reset link is on
          its way. The link expires in 30 minutes. Check your spam folder if it
          doesn&rsquo;t arrive within a couple of minutes.
        </p>
      </div>
    );
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

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-7 py-3.5 text-base min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
