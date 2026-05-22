"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { formatPriceCents, type CourseTier } from "@/lib/course-catalog";

export default function TierBuyCard({
  tier,
  highlight = false,
  disabled = false,
  disabledReason,
  bullets,
}: {
  tier: CourseTier;
  highlight?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  bullets?: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: tier.id }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <article
      className={[
        "relative bg-white border rounded-lg p-6 md:p-7 flex flex-col",
        highlight ? "border-warm-gold shadow-sm" : "border-light-gray",
      ].join(" ")}
    >
      {highlight && (
        <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-warm-gold text-near-black rounded">
          Most popular
        </span>
      )}
      <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-1">
        {tier.name}
      </h3>
      <p className="font-display text-3xl font-semibold text-near-black mb-3">
        {formatPriceCents(tier.priceCents, tier.currency)}
      </p>
      <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-5">
        {tier.description}
      </p>
      {bullets && bullets.length > 0 && (
        <ul className="space-y-2 mb-6 flex-1">
          {bullets.map((b) => (
            <li
              key={b}
              className="font-sans text-sm text-charcoal/85 leading-relaxed flex gap-2"
            >
              <CheckCircle2
                className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5"
                aria-hidden
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        disabled={loading || disabled}
        onClick={handleBuy}
        className={[
          "inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-lg px-5 py-3 transition-colors",
          highlight
            ? "bg-primary-green text-white hover:bg-primary-green-dark disabled:bg-charcoal/30"
            : "bg-near-black text-white hover:bg-charcoal/90 disabled:bg-charcoal/30",
        ].join(" ")}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Redirecting…
          </>
        ) : (
          `Enroll for ${formatPriceCents(tier.priceCents, tier.currency)}`
        )}
      </button>
      {disabled && disabledReason && (
        <p className="font-sans text-xs text-charcoal/60 mt-3 text-center">
          {disabledReason}
        </p>
      )}
      {error && (
        <p className="font-sans text-xs text-red-600 mt-3 text-center">{error}</p>
      )}
    </article>
  );
}
