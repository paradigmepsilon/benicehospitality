// Shared presentation for a scorecard band.
//
// ScorecardReport keeps its own BAND_META because it carries copy the dashboard
// has no use for (summary paragraphs, per-band CTAs). This is just the label and
// the chip colors, so the account shelf and the resources tab agree on what
// "moderate" looks like without either importing the report's marketing copy.

import type { ScorecardBand } from "./score";

export const BAND_LABEL: Record<ScorecardBand, string> = {
  high: "High viability",
  moderate: "Moderate viability",
  low: "Low viability",
};

/** Short form for tight rows where the full label wraps. */
export const BAND_SHORT: Record<ScorecardBand, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
};

/** Chip classes. Tokens only — see the palette in tailwind.config. */
export const BAND_CHIP: Record<ScorecardBand, string> = {
  high: "bg-primary-green/10 text-primary-green",
  moderate: "bg-warm-gold/15 text-warm-gold-dark",
  low: "bg-terracotta/10 text-terracotta",
};

/** Progress-bar fill. */
export const BAND_BAR: Record<ScorecardBand, string> = {
  high: "bg-primary-green",
  moderate: "bg-warm-gold",
  low: "bg-terracotta",
};
