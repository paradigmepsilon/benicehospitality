import type { NavGroup, NavLink, UtilityNav } from "./types";

/**
 * Primary nav: six top-level items split around a centered logo. Left of
 * logo: discovery (Courses, Resources, Community). Right of logo: brand
 * (Insights, About, Contact) plus the Login utility CTA.
 *
 * The header renders NAV_LEFT and NAV_RIGHT as two flanking groups. The
 * mobile sheet renders the combined NAV_TREE as one flat list.
 *
 * Signal and Labs live in the footer ("Signal & Labs" column); they are not
 * top-level destinations in this IA.
 */
export const NAV_LEFT: NavGroup[] = [
  { label: "Home", href: "/" },
  {
    label: "Education",
    children: [
      {
        label: "Room Rental Riches",
        href: "/courses/room-rental-riches",
      },
    ],
  },
  { label: "Resources", href: "/resources" },
];

export const NAV_RIGHT: NavGroup[] = [
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const NAV_TREE: NavGroup[] = [...NAV_LEFT, ...NAV_RIGHT];

export const UTILITY_NAV: UtilityNav = {
  communityLogin: {
    label: "Login",
    href: "/login",
  },
  freeAudit: {
    label: "Login",
    href: "/login",
  },
};

/**
 * Mobile sticky bottom nav. Three highest-intent paths only.
 */
export const MOBILE_BOTTOM_NAV: NavLink[] = [
  { label: "Login", href: "/login" },
  { label: "Course", href: "/courses/room-rental-riches" },
  { label: "Signal", href: "/signal" },
];
