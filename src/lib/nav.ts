import type { NavGroup, NavLink, UtilityNav } from "./types";

/**
 * Primary nav: the three-bin ladder (Resources -> Training -> Management),
 * then Marketplace, Insights and About.
 *
 * Both the header and the mobile sheet render the combined NAV_TREE as one
 * flat list (Header.tsx). NAV_LEFT / NAV_RIGHT are kept as the authoring
 * split -- the ladder vs. everything else -- and only control ordering.
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
  // Marketplace sits here rather than in NAV_LEFT so the three-bin ladder
  // above stays three bins. It was previously reachable only from the footer
  // ("Recommended gear") and from inside the supply-inventory tracker.
  { label: "Marketplace", href: "/marketplace" },
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
