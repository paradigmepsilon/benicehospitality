"use client";

import { DIMENSIONS } from "@/lib/constants/dimensions";
import type { FocusDimensionKey } from "@/lib/types/audit";

interface FocusDimensionStepProps {
  selected: FocusDimensionKey | null;
  onSelect: (key: FocusDimensionKey) => void;
  recommendedKey?: FocusDimensionKey | null;
}

export default function FocusDimensionStep({
  selected,
  onSelect,
  recommendedKey,
}: FocusDimensionStepProps) {
  return (
    <div className="space-y-3">
      {DIMENSIONS.map((dim) => {
        const isSelected = selected === dim.key;
        const isRecommended = !isSelected && recommendedKey === dim.key;
        return (
          <button
            key={dim.key}
            type="button"
            onClick={() => onSelect(dim.key)}
            aria-pressed={isSelected}
            className={[
              "w-full text-left rounded-lg border-2 p-4 sm:p-5 transition-all duration-150 cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2",
              isSelected
                ? "border-primary-green bg-primary-green/5"
                : isRecommended
                  ? "border-warm-gold/60 bg-warm-gold/5 hover:border-warm-gold"
                  : "border-light-gray bg-white hover:border-primary-green/40",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={[
                  "shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected
                    ? "border-primary-green bg-primary-green"
                    : "border-charcoal/30 bg-white",
                ].join(" ")}
              >
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-sans font-semibold text-near-black text-base">
                    {dim.label}
                  </h4>
                  {isRecommended && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-warm-gold-dark bg-warm-gold/15 px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="font-sans text-sm text-charcoal/70 mt-1 leading-relaxed">
                  {dim.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
