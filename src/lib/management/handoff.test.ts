import { test } from "node:test";
import assert from "node:assert/strict";
import { applicationDeepLink, engagementHandoffHref, openEngagementHref } from "./handoff";

const app = {
  id: 42,
  name: "Sam Rivera",
  email: "sam@example.com",
  phone: null,
  asset: "rooms" as const,
  city: "Atlanta",
  state: "GA",
  fleetEngagementId: null,
  partnershipEngagementId: null,
};

test("a rooms application hands off to the partnership tracker, prefilled and linked", () => {
  const href = engagementHandoffHref(app);
  const url = new URL(href, "https://x.test");
  assert.equal(url.pathname, "/admin/partnership");
  assert.equal(url.searchParams.get("new"), "1");
  assert.equal(url.searchParams.get("name"), "Sam Rivera");
  assert.equal(url.searchParams.get("email"), "sam@example.com");
  assert.equal(url.searchParams.get("phone"), "");
  assert.equal(url.searchParams.get("city"), "Atlanta");
  assert.equal(url.searchParams.get("state"), "GA");
  assert.equal(url.searchParams.get("source"), "Management application");
  assert.equal(url.searchParams.get("applicationId"), "42");
});

test("a car application hands off to the fleet tracker with the same shape", () => {
  const url = new URL(engagementHandoffHref({ ...app, asset: "car", phone: "770-555-0100" }), "https://x.test");
  assert.equal(url.pathname, "/admin/fleet");
  assert.equal(url.searchParams.get("new"), "1");
  assert.equal(url.searchParams.get("phone"), "770-555-0100");
  assert.equal(url.searchParams.get("applicationId"), "42");
});

test("once a card exists the application links to it instead of starting another", () => {
  assert.equal(openEngagementHref({ ...app, partnershipEngagementId: 7 }), "/admin/partnership/7");
  assert.equal(openEngagementHref({ ...app, asset: "car", fleetEngagementId: 9 }), "/admin/fleet/9");
  assert.equal(openEngagementHref(app), null);
  // A rooms application with a stray fleet card still points at the card that exists.
  assert.equal(openEngagementHref({ ...app, fleetEngagementId: 3 }), "/admin/fleet/3");
});

test("trackers deep-link back to the one application row", () => {
  assert.equal(applicationDeepLink(42), "/admin/applications?id=42");
});
