"use client";

import { useState } from "react";
import posthog from "posthog-js";

/**
 * CrrFoundingBuyButton — POSTs to /api/car-rental-riches/checkout and hands
 * off to the returned Stripe hosted-checkout URL. Same contract as
 * BuyBlueprintButton: handles loading + error, and degrades to a plain message
 * (never a crash) while the presale Price env is unset (503).
 */
export default function CrrFoundingBuyButton({
  label = "Become a Founding Member — $197",
  className = "",
  source,
  fullWidth = false,
}: {
  label?: string;
  className?: string;
  /** Where on the page the click came from (hero, tiers, footer) for PostHog. */
  source: string;
  fullWidth?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    posthog.capture("crr_founding_checkout_started", { source });
    try {
      const res = await fetch("/api/car-rental-riches/checkout", {
        method: "POST",
      });
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
        className={[
          "inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-warm-gold bg-warm-gold px-9 py-4 font-sans text-lg font-semibold tracking-wide text-near-black transition-all duration-200 hover:border-gold-light hover:bg-gold-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",
          fullWidth ? "w-full" : "",
        ].join(" ")}
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
