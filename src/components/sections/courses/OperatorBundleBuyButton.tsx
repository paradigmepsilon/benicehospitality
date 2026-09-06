"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { OPERATOR_BUNDLE } from "@/lib/operator-bundle";

/** Same contract as CrrFoundingBuyButton, pointed at the bundle route. */
export default function OperatorBundleBuyButton({
  source,
  className = "",
}: {
  source: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    posthog.capture("operator_bundle_checkout_started", { source });
    try {
      const res = await fetch("/api/operator-bundle/checkout", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
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
        {loading ? "Starting checkout…" : `Get both courses, $${OPERATOR_BUNDLE.priceUsd}`}
      </button>
      {error ? (
        <p className="mt-3 font-sans text-sm text-terracotta" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
