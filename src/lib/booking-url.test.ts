import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOOKING_SOURCES,
  HOTEL_AUDIT_SOURCES,
  isHotelAuditBooking,
} from "./booking-url";
import { CANONICAL_CALL_TYPE } from "@/lib/constants/call-types";

test("an auditToken short-circuits true regardless of source or call type", () => {
  // Even a management source and the canonical call type do not override an
  // explicit audit_token: once a visitor is carrying an audit token, this is
  // an audit booking, full stop.
  assert.equal(
    isHotelAuditBooking({
      auditToken: "tok_123",
      source: BOOKING_SOURCES.MGMT_APPLY_CAR,
      callType: CANONICAL_CALL_TYPE,
    }),
    true,
  );
});

test("a representative audit-CTA source is a hotel-audit booking", () => {
  assert.equal(
    isHotelAuditBooking({ source: BOOKING_SOURCES.AUDIT_DEFAULT_CTA }),
    true,
  );
});

test("a representative Signal source is a hotel-audit booking", () => {
  assert.equal(
    isHotelAuditBooking({ source: BOOKING_SOURCES.SIGNAL_HERO }),
    true,
  );
});

test("management sources are not hotel-audit bookings", () => {
  assert.equal(
    isHotelAuditBooking({ source: BOOKING_SOURCES.MGMT_APPLY_CAR }),
    false,
  );
  assert.equal(
    isHotelAuditBooking({ source: BOOKING_SOURCES.MGMT_APPLY_ROOMS }),
    false,
  );
});

test("the canonical call type alone is not a hotel-audit booking", () => {
  assert.equal(isHotelAuditBooking({ callType: CANONICAL_CALL_TYPE }), false);
});

test("legacy call-type aliases are hotel-audit bookings", () => {
  assert.equal(isHotelAuditBooking({ callType: "advisory_discovery_60" }), true);
  assert.equal(isHotelAuditBooking({ callType: "signal_discovery_40" }), true);
});

test("any non-canonical, non-empty call type gates into the audit funnel, not just the two known legacy aliases", () => {
  // isHotelAuditBooking does not check call_type against an allowlist of
  // legacy aliases. It only compares against CANONICAL_CALL_TYPE, so any
  // other non-empty value (a typo, a future call type) is still treated as
  // an audit booking. Pinning this so the "just the two legacy aliases"
  // mental model doesn't get assumed to be the real implementation.
  assert.equal(isHotelAuditBooking({ callType: "some_future_call_type" }), true);
});

test("all inputs empty or null is not a hotel-audit booking (a bare /book visit)", () => {
  // A bare /book visit with no audit_token, source, or call_type param is
  // now treated as a general discovery booking: no hotel name required, no
  // Focus step shown. That's a deliberate consequence of the repositioning
  // (BNHG no longer sells hotel consulting), but it IS a behavior change
  // from before this branch. Pin it here so nobody reverts it by accident.
  assert.equal(isHotelAuditBooking({}), false);
  assert.equal(
    isHotelAuditBooking({ auditToken: null, source: null, callType: null }),
    false,
  );
});

test("auditToken is falsy for undefined, null, and empty string alike", () => {
  assert.equal(isHotelAuditBooking({ auditToken: undefined }), false);
  assert.equal(isHotelAuditBooking({ auditToken: null }), false);
  assert.equal(isHotelAuditBooking({ auditToken: "" }), false);
});

test("source is falsy for undefined, null, and empty string alike", () => {
  assert.equal(isHotelAuditBooking({ source: undefined }), false);
  assert.equal(isHotelAuditBooking({ source: null }), false);
  assert.equal(isHotelAuditBooking({ source: "" }), false);
});

test("callType is falsy for undefined, null, and empty string alike", () => {
  assert.equal(isHotelAuditBooking({ callType: undefined }), false);
  assert.equal(isHotelAuditBooking({ callType: null }), false);
  assert.equal(isHotelAuditBooking({ callType: "" }), false);
});

test("HOTEL_AUDIT_SOURCES contains no management source", () => {
  // A future edit that adds a source to HOTEL_AUDIT_SOURCES without
  // realizing it is a management source would silently route management
  // applicants back into the hotel-name/Focus-step funnel this branch just
  // removed them from. Guard the set directly, not just the predicate.
  const managementEntries = Object.entries(BOOKING_SOURCES).filter(([key]) =>
    key.startsWith("MGMT_"),
  );
  assert.ok(managementEntries.length > 0, "expected at least one MGMT_ source to check");
  for (const [key, value] of managementEntries) {
    assert.ok(
      !HOTEL_AUDIT_SOURCES.has(value),
      `${key} ("${value}") must not be in HOTEL_AUDIT_SOURCES`,
    );
  }
});
