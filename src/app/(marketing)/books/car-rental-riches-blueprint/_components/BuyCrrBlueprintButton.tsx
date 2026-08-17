"use client";

import { useState } from "react";
import posthog from "posthog-js";

/**
 * BuyCrrBlueprintButton: POSTs to /api/crr-blueprint/checkout and hands off to
 * the returned Stripe hosted-checkout URL. Same contract as the RRR
 * BuyBlueprintButton: handles loading + error, and never crashes the page when
 * the API is not configured yet (503 with a plain message).
 */
export default function BuyCrrBlueprintButton({
  label,
  className = "",
  source,
}: {
  label: string;
  className?: string;
  /** Where on the page the click came from, so hero vs. footer CTA are
   *  separately attributable in PostHog. */
  source: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    posthog.capture("crr_blueprint_checkout_started", { source });
    try {
      const res = await fetch("/api/crr-blueprint/checkout", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-warm-gold bg-warm-gold px-9 py-4 font-sans text-lg font-semibold tracking-wide text-near-black transition-all duration-200 hover:border-gold-light hover:bg-gold-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Starting checkout…" : label}
      </button>
      {error ? (
        <p className="mt-3 font-sans text-sm text-terracotta" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
