"use client";

import { useState } from "react";
import posthog from "posthog-js";
import WaitlistModal from "@/components/sections/courses/WaitlistModal";
import type { WaitlistTier } from "@/lib/validation/waitlist";

/**
 * WaitlistCta — the buy button stand-in on the two RRR tier landing pages.
 *
 * Those pages cannot take money yet: no course_tiers row carries a
 * stripe_price_id, and /api/checkout/course requires a signed-in session
 * anyway. So the conversion is a founding-seat waitlist, which already works
 * end to end (WaitlistModal -> /api/waitlist -> course_waitlist).
 *
 * Shape deliberately mirrors BuyBlueprintButton: label in, one PostHog event
 * per click, a `source` so the hero and footer CTAs stay separately
 * attributable. When Stripe prices are synced this component is the one place
 * that has to change.
 *
 * NOTE ON `tier.slug`: the Masterclass tier's stored value is "cohort". That
 * string is baked into the WaitlistTier enum, the course_tiers CHECK
 * constraint, and every /account and /admin path. Only the label says
 * "Masterclass" — do not "fix" the slug without a migration.
 */
export default function WaitlistCta({
  tier,
  label,
  source,
  variant = "gold",
  className = "",
}: {
  tier: { name: string; slug: WaitlistTier };
  label: string;
  /** "hero" | "footer" — which CTA on the page fired. */
  source: string;
  /** gold = the primary buy-shaped button. outline = the quieter repeat. */
  variant?: "gold" | "outline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  function handleClick() {
    // Same event name TierComparison emits, so the comparison table and these
    // pages report into one funnel instead of two half-populations.
    posthog.capture("tier_waitlist_clicked", {
      tier_name: tier.name,
      tier_slug: tier.slug,
      source,
    });
    setOpen(true);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        className={[
          "inline-flex min-h-[44px] items-center justify-center rounded-lg border-2",
          "px-9 py-4 font-sans text-lg font-semibold tracking-wide",
          "transition-all duration-200 active:scale-[0.98]",
          variant === "gold"
            ? "border-warm-gold bg-warm-gold text-near-black hover:border-gold-light hover:bg-gold-light"
            : "border-deep-teal bg-transparent text-deep-teal hover:bg-deep-teal hover:text-white",
        ].join(" ")}
      >
        {label}
      </button>

      <WaitlistModal
        open={open}
        onClose={() => setOpen(false)}
        tier={tier}
      />
    </div>
  );
}
