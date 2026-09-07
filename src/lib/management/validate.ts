/**
 * Hand-rolled validation, matching the house style in the existing capture
 * routes. Returns a discriminated result rather than throwing so the route can
 * keep the visitor's form state and show one inline message.
 */

import { isServiceAreaState, type ManagedAsset } from "./constants";

export interface ApplicationInput {
  name: string;
  email: string;
  phone: string;
  asset: ManagedAsset;
  assetCount: number;
  state: string;
  city: string;
  currentStatus: string;
  timeline: string;
  wants: string;
  heardFrom: string;
}

export type ApplicationResult =
  | { ok: true; value: ApplicationInput }
  | { ok: false; error: string };

const CURRENT_STATUS = ["idle", "self_managed", "on_platform"];
const TIMELINE = ["now", "30_days", "90_days", "exploring"];

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function validateApplication(raw: unknown): ApplicationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Missing application details." };
  }
  const r = raw as Record<string, unknown>;

  const name = str(r.name, 120);
  if (!name) return { ok: false, error: "Please add your name." };

  const email = str(r.email, 200).toLowerCase();
  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    return { ok: false, error: "Please add a valid email address." };
  }

  const asset = str(r.asset, 10);
  if (asset !== "car" && asset !== "rooms") {
    return { ok: false, error: "Please choose a car or rooms." };
  }

  // No length cap here: truncating before validating would let a malformed
  // code like "GAX" silently pass as "GA". isServiceAreaState only matches an
  // exact 2-character code, so leaving the untruncated string in place makes
  // a too-long value fail validation instead of being reinterpreted.
  const state = (typeof r.state === "string" ? r.state.trim() : "").toUpperCase();
  if (!isServiceAreaState(state)) {
    return {
      ok: false,
      error: "We manage assets in Georgia, Florida, South Carolina, North Carolina, Alabama, and Tennessee. That state is outside our service area today.",
    };
  }

  const countRaw = Number(str(r.assetCount, 6));
  if (!Number.isFinite(countRaw) || countRaw < 1) {
    return { ok: false, error: "How many do you have? Please enter at least one." };
  }
  const assetCount = Math.min(Math.floor(countRaw), 999);

  const currentStatus = str(r.currentStatus, 20);
  if (!CURRENT_STATUS.includes(currentStatus)) {
    return { ok: false, error: "Please tell us how the asset is used today." };
  }

  const timeline = str(r.timeline, 20);
  if (!TIMELINE.includes(timeline)) {
    return { ok: false, error: "Please pick a timeline." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      phone: str(r.phone, 40),
      asset,
      assetCount,
      state,
      city: str(r.city, 120),
      currentStatus,
      timeline,
      wants: str(r.wants, 2000),
      heardFrom: str(r.heardFrom, 120),
    },
  };
}
