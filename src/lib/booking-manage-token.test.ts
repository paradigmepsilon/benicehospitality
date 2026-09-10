import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateBookingManageToken,
  verifyBookingManageToken,
  buildBookingManageUrl,
} from "./booking-manage-token";

// generateBookingManageToken/verifyBookingManageToken read this lazily on
// each call, not at import time, so setting it here (before any test()
// callback runs) keeps every test in this file deterministic regardless of
// what a real .env.local does or doesn't define.
process.env.UNSUBSCRIBE_HMAC_SECRET = "test-secret-do-not-use-in-prod";

test("a token verifies against the same booking id + email it was generated for", () => {
  const token = generateBookingManageToken(42, "guest@example.com");
  assert.equal(verifyBookingManageToken(42, "guest@example.com", token), true);
});

test("email comparison is case-insensitive (matches how the value is normalized before signing)", () => {
  const token = generateBookingManageToken(42, "Guest@Example.com");
  assert.equal(verifyBookingManageToken(42, "guest@example.com", token), true);
});

test("a token does not verify against a different booking id", () => {
  const token = generateBookingManageToken(42, "guest@example.com");
  assert.equal(verifyBookingManageToken(43, "guest@example.com", token), false);
});

test("a token does not verify against a different email", () => {
  const token = generateBookingManageToken(42, "guest@example.com");
  assert.equal(verifyBookingManageToken(42, "someone-else@example.com", token), false);
});

test("a malformed (non-hex) token is rejected rather than throwing", () => {
  assert.equal(verifyBookingManageToken(42, "guest@example.com", "not-hex!!"), false);
});

test("an empty token is rejected", () => {
  assert.equal(verifyBookingManageToken(42, "guest@example.com", ""), false);
});

test("buildBookingManageUrl embeds a token that verifies, plus the id and email as query params", () => {
  const url = new URL(buildBookingManageUrl(42, "guest@example.com"));
  assert.equal(url.pathname, "/book/manage");
  assert.equal(url.searchParams.get("id"), "42");
  assert.equal(url.searchParams.get("email"), "guest@example.com");
  const token = url.searchParams.get("token");
  assert.ok(token);
  assert.equal(verifyBookingManageToken(42, "guest@example.com", token!), true);
});
