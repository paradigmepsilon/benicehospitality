/**
 * First-person endorsement copy on marketplace listings: how Della or Alex uses
 * an item and their verdict on it.
 *
 * FTC Endorsement Guides: an endorsement must reflect the endorser's honest
 * opinion and actual use. These fields are empty until the named person has
 * approved the words, and the public modal renders a block only when its text
 * is non-empty. Drafts live unpublished in
 * docs/marketplace/bnhg_marketplace_endorsement_drafts.json and reach the
 * database only through scripts/import-marketplace-endorsements.ts, which skips
 * anything not marked approved by that person.
 *
 * NO DB IMPORTS — read by the admin form ("use client") and the API routes.
 */

import type { MarketplaceTabId } from "./marketplace-categories";

export type Endorser = "della" | "alex";

export interface Endorsements {
  dellaUse: string;
  dellaTake: string;
  alexUse: string;
  alexTake: string;
}

export const ENDORSEMENT_KEYS = [
  "dellaUse",
  "dellaTake",
  "alexUse",
  "alexTake",
] as const satisfies readonly (keyof Endorsements)[];

export const ENDORSEMENT_MAX_LENGTH = 1200;

export const EMPTY_ENDORSEMENTS: Endorsements = {
  dellaUse: "",
  dellaTake: "",
  alexUse: "",
  alexTake: "",
};

/** Homes is Della's lane, Vehicles is Alex's, Back Office is both. */
export function endorsersForTab(tabId: MarketplaceTabId): Endorser[] {
  if (tabId === "property") return ["della"];
  if (tabId === "auto") return ["alex"];
  return ["della", "alex"];
}

export const ENDORSER_NAME: Record<Endorser, string> = {
  della: "Della",
  alex: "Alex",
};

/**
 * Validates whichever endorsement keys are present on a request body. Absent
 * keys are left out of `values`, so a PATCH only touches what it sent. Values
 * are trimmed; a non-string or an over-long value is an error.
 */
export function parseEndorsementFields(
  body: Record<string, unknown>,
): { ok: true; values: Partial<Endorsements> } | { ok: false; error: string } {
  const values: Partial<Endorsements> = {};
  for (const key of ENDORSEMENT_KEYS) {
    const raw = body[key];
    if (raw === undefined) continue;
    if (typeof raw !== "string") {
      return { ok: false, error: `${key} must be a string` };
    }
    const trimmed = raw.trim();
    if (trimmed.length > ENDORSEMENT_MAX_LENGTH) {
      return {
        ok: false,
        error: `${key} must be ${ENDORSEMENT_MAX_LENGTH} characters or fewer`,
      };
    }
    values[key] = trimmed;
  }
  return { ok: true, values };
}
