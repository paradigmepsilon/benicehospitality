"use client";

import type { ReactNode } from "react";

/**
 * Shared "what right looks like" affordance for resource tools, ported from
 * the ClaimProof portal's ExampleUI and restyled for the resources light
 * palette. See example swaps the tool's read source to a completed, read-only
 * dataset; Back returns to the member's own entries, which example mode never
 * touches.
 */

function IconSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 1.5l1.4 3.6a1 1 0 00.58.58L13.5 7.1a.5.5 0 010 .93l-3.52 1.4a1 1 0 00-.58.58L8 13.5a.5.5 0 01-.93 0l-1.4-3.52a1 1 0 00-.58-.58L1.57 8.03a.5.5 0 010-.93l3.52-1.4a1 1 0 00.58-.58L7.07 1.5a.5.5 0 01.93 0z" />
      <path d="M13 11.5l.53 1.34a.5.5 0 00.29.29l1.34.53a.25.25 0 010 .47l-1.34.53a.5.5 0 00-.29.29L13 16.29a.25.25 0 01-.47 0l-.53-1.34a.5.5 0 00-.29-.29l-1.34-.53a.25.25 0 010-.47l1.34-.53a.5.5 0 00.29-.29l.53-1.34a.25.25 0 01.47 0z" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.15 1.44a1.5 1.5 0 012.12 0l.29.29a1.5 1.5 0 010 2.12l-8.9 8.9a1 1 0 01-.44.26l-2.6.74a.4.4 0 01-.5-.5l.75-2.6a1 1 0 01.25-.43l8.9-8.9.13.12z" />
    </svg>
  );
}

export function ExampleToggle({
  on,
  onToggle,
  offLabel = "See a completed example",
  onLabel = "Back to my worksheet",
}: {
  on: boolean;
  onToggle: (next: boolean) => void;
  offLabel?: string;
  onLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!on)}
      className={
        "no-print inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-colors active:scale-[0.97] " +
        (on
          ? "bg-warm-gold text-near-black hover:bg-warm-gold/85"
          : "border border-warm-gold/50 text-near-black hover:bg-warm-gold/10")
      }
    >
      {on ? (
        <>
          <IconPencil className="h-3.5 w-3.5" />
          {onLabel}
        </>
      ) : (
        <>
          <IconSparkle className="h-3.5 w-3.5" />
          {offLabel}
        </>
      )}
    </button>
  );
}

export function ExampleBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-warm-gold/40 bg-warm-gold/10 px-4 py-3">
      <IconSparkle className="mt-0.5 h-4 w-4 flex-none text-warm-gold" />
      <p className="font-sans text-xs leading-relaxed text-charcoal/80">{children}</p>
    </div>
  );
}
