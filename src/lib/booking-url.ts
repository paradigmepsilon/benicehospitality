/**
 * Centralized helper for building /book URLs with attribution params.
 *
 * Every CTA on the marketing site should route through `bookingUrl()` so we
 * capture which page + section the visitor clicked from. The booking API
 * persists this into `bookings.click_source` and surfaces it in the admin
 * notification email alongside the founder and call type.
 */

export const BOOKING_SOURCES = {
  ALEX_HERO: "alex_hero",
  ALEX_DOORS_CARD: "alex_doors_card",
  ALEX_FINAL_CTA: "alex_final_cta",
  DELLA_HERO: "della_hero",
  DELLA_DOORS_CARD: "della_doors_card",
  DELLA_FINAL_CTA: "della_final_cta",
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
} as const;

export type BookingSource =
  (typeof BOOKING_SOURCES)[keyof typeof BOOKING_SOURCES];

export const VALID_BOOKING_SOURCES = new Set<string>(
  Object.values(BOOKING_SOURCES),
);

export interface BookingUrlOptions {
  source?: BookingSource;
  founder?: "alex" | "della";
  callType?: string;
  auditToken?: string;
  utmSource?: string;
  utmMedium?: string;
}

export function bookingUrl(options: BookingUrlOptions = {}): string {
  const p = new URLSearchParams();
  if (options.auditToken) p.set("audit_token", options.auditToken);
  if (options.callType) p.set("call_type", options.callType);
  if (options.founder) p.set("founder", options.founder);
  if (options.source) p.set("source", options.source);
  if (options.utmSource) p.set("utm_source", options.utmSource);
  if (options.utmMedium) p.set("utm_medium", options.utmMedium);
  return p.toString() ? `/book?${p.toString()}` : "/book";
}
