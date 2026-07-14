"use client";

import { IconSparkle, IconPencil } from "./Icons";
import { EXAMPLE_BANNER } from "./ExampleData";

/**
 * Shared "what right looks like" affordance. Every interactive tool offers
 * the same toggle: See example swaps the view to a completed, read-only
 * version built from the one shared fictional claim; Back to mine returns to
 * the buyer's own saved entries (which are never touched by example mode).
 */

export function ExampleToggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!on)}
      className={
        "cp-noprint inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] " +
        (on
          ? "bg-[#8BA5BE] text-[#27262E] hover:bg-[#9FB6CC]"
          : "border border-[#8BA5BE]/45 text-[#8BA5BE] hover:border-[#8BA5BE] hover:bg-[#8BA5BE]/10")
      }
    >
      {on ? (
        <>
          <IconPencil className="h-3.5 w-3.5" />
          Back to my entries
        </>
      ) : (
        <>
          <IconSparkle className="h-3.5 w-3.5" />
          See a completed example
        </>
      )}
    </button>
  );
}

export function ExampleBanner() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#8BA5BE]/35 bg-[#8BA5BE]/[0.08] px-4 py-3">
      <IconSparkle className="mt-0.5 h-4 w-4 flex-none text-[#8BA5BE]" />
      <p className="font-sans text-xs leading-relaxed text-[#8BA5BE]">
        {EXAMPLE_BANNER}
      </p>
    </div>
  );
}
