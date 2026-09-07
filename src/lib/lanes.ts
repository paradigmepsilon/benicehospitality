/**
 * Lane tokens — the bridge between BNHG's social carousels and the website.
 *
 * On Instagram each vertical owns a full-bleed brand color, because a 1080×1440
 * carousel has no room for hierarchy: the color IS the wayfinding. The web has
 * photography, type scale, and whitespace doing that job already, so here the
 * lane color is demoted from *ground* to *signal*. It only has to confirm "yes,
 * this is the same thing you saw on Instagram."
 *
 * THE RULE: saturation is inversely proportional to area.
 *
 *   Small marks (keylines, eyebrows, dots, ≤20px)  → `accent`, the exact hex.
 *   Large areas (section backgrounds)              → `wash`, the tinted hex.
 *   Anything on a near-black section               → `accentOnDark`.
 *
 * Never use `accent` for body text, never as a card fill, and never show two
 * lanes at full strength in the same viewport.
 *
 * Source of truth for the raw hexes is the social skill's carousel spec
 * (~/.claude/skills/bnhg-social-week/references/carousel-design.md). Keep them
 * in sync — the whole point is that they match what ships on Instagram.
 */

export type LaneId = "coliving" | "fleet";

export interface LaneTokens {
  id: LaneId;
  /** Human label for the vertical. */
  name: string;
  /** Operating company the color belongs to. */
  company: string;
  /**
   * The lane's mark color on light surfaces — eyebrows, keylines, dots.
   *
   * Matches `carousel` for both lanes today. The boutique lane (BNHG's house
   * gold, resolved instead of its carousel charcoal) was retired with the
   * resources registry regroup; pages that carried it now rely on their own
   * var(--color-warm-gold) fallback for the same accent.
   */
  accent: string;
  /** Lightened variant, legible on near-black. AA against #1a1a1a. */
  accentOnDark: string;
  /** ~7-10% accent over cream. Safe for full section backgrounds. */
  wash: string;
  /** The exact hex shipping on Instagram. Fidelity reference for large grounds. */
  carousel: string;
}

export const LANES: Record<LaneId, LaneTokens> = {
  coliving: {
    id: "coliving",
    name: "Co-living",
    company: "BNP",
    accent: "#bc3229",
    accentOnDark: "#e06a5c",
    // Identical to SECTION_COLORS.alertWash by coincidence of the math —
    // 7% of #bc3229 over cream lands on the same value.
    wash: "#f6eae5",
    carousel: "#bc3229",
  },
  fleet: {
    id: "fleet",
    name: "Fleet Management",
    company: "BNA",
    accent: "#294d8c",
    accentOnDark: "#7fa3e0",
    wash: "#e5e7e9",
    carousel: "#294d8c",
  },
};

/**
 * CSS custom properties for a lane, spread onto a wrapper's `style`.
 *
 * Descendants then read them through Tailwind arbitrary values with a fallback,
 * e.g. `text-[color:var(--lane-accent,var(--color-primary-green))]`. Outside a
 * lane wrapper the fallback applies and nothing changes, so lane-aware
 * components stay safe to use on non-lane pages.
 */
export function laneVars(lane: LaneId): React.CSSProperties {
  const t = LANES[lane];
  return {
    "--lane-accent": t.accent,
    "--lane-accent-on-dark": t.accentOnDark,
    "--lane-wash": t.wash,
  } as React.CSSProperties;
}
