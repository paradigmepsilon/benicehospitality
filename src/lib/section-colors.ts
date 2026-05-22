/**
 * Hex tokens mirrored from src/app/globals.css. SectionDivider's <svg> path
 * needs raw hex (Tailwind classes can't apply inside <path fill>), so any
 * page using curve dividers references these constants instead of repeating
 * the literals.
 *
 * Keep these in sync with the --color-* tokens in globals.css.
 */

export const SECTION_COLORS = {
  cream: "#FAF8F3",
  white: "#FFFFFF",
  offWhite: "#FAF8F3",
  warmGold: "#B08D57",
  primaryGreen: "#1A4D4F",
  deepTeal: "#1A4D4F",
  nearBlack: "#1a1a1a",
} as const;
