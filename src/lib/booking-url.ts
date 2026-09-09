/**
 * Centralized helper for building /book URLs with attribution params.
 *
 * Every CTA on the marketing site should route through `bookingUrl()` so we
 * capture which page + section the visitor clicked from. The booking API
 * persists this into `bookings.click_source` and surfaces it in the admin
 * notification email alongside the founder and call type.
 */

import { CANONICAL_CALL_TYPE } from "@/lib/constants/call-types";

export const BOOKING_SOURCES = {
  ALEX_HERO: "alex_hero",
  ALEX_DOORS_CARD: "alex_doors_card",
  ALEX_SYSTEMS_CARD: "alex_systems_card",
  ALEX_BOUTIQUE_BAND: "alex_boutique_band",
  ALEX_FINAL_CTA: "alex_final_cta",
  DELLA_HERO: "della_hero",
  DELLA_DOORS_CARD: "della_doors_card",
  DELLA_FINAL_CTA: "della_final_cta",
  // Co-living hub — the destination for Della's social funnel.
  COLIVING_HERO: "coliving_hero",
  COLIVING_LIVE_BAND: "coliving_live_band",
  COLIVING_FINAL_CTA: "coliving_final_cta",
  // Fleet and boutique door hubs. These are the lane pages, distinct from the
  // pages they feed: /alex (founder) and /signal (services offer).
  FLEET_HERO: "fleet_hero",
  FLEET_FINAL_CTA: "fleet_final_cta",
  BOUTIQUE_HERO: "boutique_hero",
  BOUTIQUE_FINAL_CTA: "boutique_final_cta",
  SIGNAL_HERO: "signal_hero",
  SIGNAL_ENGAGEMENTS_GRID: "signal_engagements_grid",
  SIGNAL_FREE_AUDIT_BODY: "signal_free_audit_body",
  SIGNAL_OFFERINGS_CARD: "signal_offerings_card",
  SIGNAL_OFFERINGS_FOOTER: "signal_offerings_footer",
  SIGNAL_PAGE_FINAL_CTA: "signal_page_final_cta",
  SIGNAL_COMPONENT_HERO: "signal_component_hero",
  SIGNAL_COMPONENT_FINAL_CTA: "signal_component_final_cta",
  HOME_SIGNAL_SPOTLIGHT: "home_signal_spotlight",
  AUDIT_DEFAULT_CTA: "audit_default_cta",
  AUDIT_OWNER_CTA: "audit_owner_cta",
  AUDIT_OPERATOR_CTA: "audit_operator_cta",
  PAGECTA_DEFAULT: "pagecta_default",
  PAGECTA_OWNER: "pagecta_owner",
  LOGIN_INLINE: "login_inline",
  // Management bin. BNHG is the contracting party on all of these.
  MGMT_OVERVIEW_CTA: "mgmt_overview_cta",
  MGMT_FLEET_HERO: "mgmt_fleet_hero",
  MGMT_FLEET_FINAL_CTA: "mgmt_fleet_final_cta",
  MGMT_COLIVING_HERO: "mgmt_coliving_hero",
  MGMT_COLIVING_FINAL_CTA: "mgmt_coliving_final_cta",
  MGMT_APPLY_CAR: "mgmt_apply_car",
  MGMT_APPLY_ROOMS: "mgmt_apply_rooms",
  HOME_OWNER_PORTAL: "home_owner_portal",
  // Home page closing photo band (2026-09 redesign).
  HOME_FINAL_CTA: "home_final_cta",
} as const;

export type BookingSource =
  (typeof BOOKING_SOURCES)[keyof typeof BOOKING_SOURCES];

export const VALID_BOOKING_SOURCES = new Set<string>(
  Object.values(BOOKING_SOURCES),
);

/**
 * Sources that originate from the hotel-audit funnel (Tier 0 audit report
 * CTAs) or the retired Signal services offer. A booking from one of these
 * still needs the hotel-name field and the audit "Focus" step. Every other
 * source, including the management application funnel, does not.
 */
export const HOTEL_AUDIT_SOURCES = new Set<string>([
  BOOKING_SOURCES.AUDIT_DEFAULT_CTA,
  BOOKING_SOURCES.AUDIT_OWNER_CTA,
  BOOKING_SOURCES.AUDIT_OPERATOR_CTA,
  BOOKING_SOURCES.SIGNAL_HERO,
  BOOKING_SOURCES.SIGNAL_ENGAGEMENTS_GRID,
  BOOKING_SOURCES.SIGNAL_FREE_AUDIT_BODY,
  BOOKING_SOURCES.SIGNAL_OFFERINGS_CARD,
  BOOKING_SOURCES.SIGNAL_OFFERINGS_FOOTER,
  BOOKING_SOURCES.SIGNAL_PAGE_FINAL_CTA,
  BOOKING_SOURCES.SIGNAL_COMPONENT_HERO,
  BOOKING_SOURCES.SIGNAL_COMPONENT_FINAL_CTA,
  BOOKING_SOURCES.HOME_SIGNAL_SPOTLIGHT,
]);

/**
 * True when a /book visit belongs to the legacy hotel-audit flow: it carries
 * an audit_token, it clicked through from an audit/Signal CTA, or its
 * call_type is one of the two pre-canonical aliases that only ever shipped
 * on audit/Signal links (see CANONICAL_CALL_TYPE in constants/call-types.ts).
 * Everything else, including every management and general discovery booking,
 * is not a hotel booking and should not be asked for a hotel name or shown
 * the audit "Focus" step.
 */
export function isHotelAuditBooking(input: {
  auditToken?: string | null;
  source?: string | null;
  callType?: string | null;
}): boolean {
  if (input.auditToken) return true;
  if (input.source && HOTEL_AUDIT_SOURCES.has(input.source)) return true;
  if (input.callType && input.callType !== CANONICAL_CALL_TYPE) return true;
  return false;
}

export interface BookingUrlOptions {
  source?: BookingSource;
  founder?: "alex" | "della";
  callType?: string;
  auditToken?: string;
  utmSource?: string;
  utmMedium?: string;
  prefillName?: string;
  prefillEmail?: string;
}

export function bookingUrl(options: BookingUrlOptions = {}): string {
  const p = new URLSearchParams();
  if (options.auditToken) p.set("audit_token", options.auditToken);
  if (options.callType) p.set("call_type", options.callType);
  if (options.founder) p.set("founder", options.founder);
  if (options.source) p.set("source", options.source);
  if (options.utmSource) p.set("utm_source", options.utmSource);
  if (options.utmMedium) p.set("utm_medium", options.utmMedium);
  if (options.prefillName) p.set("name", options.prefillName);
  if (options.prefillEmail) p.set("email", options.prefillEmail);
  return p.toString() ? `/book?${p.toString()}` : "/book";
}
