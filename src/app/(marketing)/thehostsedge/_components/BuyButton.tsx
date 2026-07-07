"use client";

import { useState } from "react";
import posthog from "posthog-js";

/**
 * BuyButton — POSTs to /api/thehostsedge/checkout and redirects the browser to
 * the returned Stripe hosted-checkout URL. Handles loading + error states.
 * Never crashes the page if the API returns an error (e.g. Stripe env not
 * configured yet). Styled to match the BNHG brand (warm-gold CTA).
 */
export default function BuyButton({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    posthog.capture("hosts_edge_checkout_started", { label });
    try {
      const res = await fetch("/api/thehostsedge/checkout", {
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

      // Hand off to Stripe's hosted checkout.
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
        className="inline-flex items-center justify-center rounded-full bg-warm-gold px-8 py-4 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Starting checkout…" : label}
      </button>
      {error ? (
        <p className="mt-3 font-sans text-sm text-terracotta">{error}</p>
      ) : null}
    </div>
  );
}
