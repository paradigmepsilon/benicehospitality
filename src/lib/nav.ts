import type { NavGroup, NavLink, UtilityNav } from "./types";

/**
 * Primary nav: the three-bin ladder (Resources -> Training -> Management)
 * on the left, Insights and About on the right, flanking the centered logo.
 *
 * The header renders NAV_LEFT and NAV_RIGHT as two flanking groups. The
 * mobile sheet renders the combined NAV_TREE as one flat list.
 *
 * The Owner Portal utility link is not in this file: it only exists when
 * process.env.OWNER_PORTAL_URL is set, so Header.tsx renders it directly
 * rather than sourcing it from a static array.
 */
export const NAV_LEFT: NavGroup[] = [
  { label: "Resources", href: "/resources" },
  { label: "Training", href: "/training" },
  { label: "Management", href: "/management" },
];

export const NAV_RIGHT: NavGroup[] = [
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
];

export const NAV_TREE: NavGroup[] = [...NAV_LEFT, ...NAV_RIGHT];

export const UTILITY_NAV: UtilityNav = {
  communityLogin: {
    label: "Login",
    href: "/login",
  },
};

/**
 * Mobile sticky bottom nav. Three highest-intent paths only. Labels here
 * must match a key in MobileBottomNav.tsx's ICONS map or that item renders
 * with no icon.
 */
export const MOBILE_BOTTOM_NAV: NavLink[] = [
  { label: "Estimate", href: "/estimate" },
  { label: "Training", href: "/training" },
  { label: "Management", href: "/management" },
];
