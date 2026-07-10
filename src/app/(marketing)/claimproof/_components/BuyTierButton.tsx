"use client";

import { useState } from "react";
import posthog from "posthog-js";
import type { ClaimProofTier } from "@/lib/claim-proof";

/**
 * BuyTierButton — POSTs the chosen tier to /api/claimproof/checkout and
 * redirects to Stripe hosted checkout. Same contract as The Host's Edge
 * BuyButton, plus the tier parameter. `variant="solid"` is the hero (Pro)
 * treatment; "outline" is for the flanking tiers.
 */
export default function BuyTierButton({
  tier,
  label,
  variant = "solid",
  className = "",
}: {
  tier: ClaimProofTier;
  label: string;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    posthog.capture("claimproof_checkout_started", { tier, label });
    try {
      const res = await fetch("/api/claimproof/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
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

  const solid =
    "inline-flex w-full items-center justify-center rounded-full bg-warm-gold px-8 py-4 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70";
  const outline =
    "inline-flex w-full items-center justify-center rounded-full border-2 border-near-black/20 px-8 py-4 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-warm-gold hover:text-warm-gold active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={variant === "solid" ? solid : outline}
      >
        {loading ? "Starting checkout…" : label}
      </button>
      {error ? (
        <p className="mt-3 font-sans text-sm text-terracotta">{error}</p>
      ) : null}
    </div>
  );
}
