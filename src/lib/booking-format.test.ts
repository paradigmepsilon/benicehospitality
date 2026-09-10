import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatBookingDate,
  formatBookingTime,
  addMinutesToTime,
  toLocalDateTimeString,
  toDateOnlyString,
} from "./booking-format";

test("toDateOnlyString passes a plain date string through unchanged", () => {
  assert.equal(toDateOnlyString("2026-09-28"), "2026-09-28");
});

test("toDateOnlyString normalizes a Date object (as returned by the DB driver for a DATE column) to YYYY-MM-DD", () => {
  // @neondatabase/serverless returns a DATE column as a UTC-midnight Date,
  // not the string route.ts's INSERT was given — this is the exact shape
  // that broke formatBookingDate before the fix (see booking-actions.ts).
  assert.equal(toDateOnlyString(new Date("2026-09-28T00:00:00.000Z")), "2026-09-28");
});

test("formatBookingDate renders a plain date string", () => {
  assert.equal(formatBookingDate("2026-09-28"), "Monday, September 28, 2026");
});

test("formatBookingDate renders a Date object identically to the equivalent string", () => {
  assert.equal(
    formatBookingDate(new Date("2026-09-28T00:00:00.000Z")),
    formatBookingDate("2026-09-28"),
  );
});

test("formatBookingTime renders morning, noon, and evening correctly", () => {
  assert.equal(formatBookingTime("09:00"), "9:00 AM ET");
  assert.equal(formatBookingTime("12:00"), "12:00 PM ET");
  assert.equal(formatBookingTime("00:00"), "12:00 AM ET");
  assert.equal(formatBookingTime("13:30"), "1:30 PM ET");
});

test("addMinutesToTime advances within the same hour", () => {
  assert.equal(addMinutesToTime("09:00", 45), "09:45");
});

test("addMinutesToTime rolls over an hour boundary", () => {
  assert.equal(addMinutesToTime("09:30", 45), "10:15");
});

test("addMinutesToTime rolls over midnight", () => {
  assert.equal(addMinutesToTime("23:30", 45), "00:15");
});

test("toLocalDateTimeString joins date and time as a floating (no-offset) datetime", () => {
  assert.equal(toLocalDateTimeString("2026-09-28", "09:00"), "2026-09-28T09:00:00");
});
