// Turnover & Photo Protocol - data model. Digitized from the Car Rental Riches
// handout H04, worked example 2 (check-in and check-out, verified 2026-08-15).
// A per-trip runbook with two modes: CHECK-IN before handoff, CHECK-OUT after
// return. State is the CURRENT trip only; "start new trip" clears the checks
// and bumps a completed-trips counter. Nothing is archived.
//
// The timing facts trace to the CRR fact base (turo_platform_facts_2026.md,
// verified 2026-08-15): pre-trip photos taken no more than 24 hours before
// trip start and uploaded within 24 hours after start; post-trip photos taken
// AND uploaded within 24 hours after trip end; photos without date, time, and
// geolocation metadata are invalid; incidental invoice windows are 5 / 4 / 3
// days by earnings plan.

import type { EarningsPlan } from "@/lib/resources/vehicle-profitability-calculator/config";

export interface ProtocolItem {
  id: string;
  label: string;
  optional?: boolean;
}

export interface ProtocolGroup {
  label: string;
  items: ProtocolItem[];
}

export interface ProtocolMode {
  id: "checkin" | "checkout";
  label: string;
  shortLabel: string;
  /** The timing rule for this end of the trip, shown as the mode's callout. */
  timing: string;
  groups: ProtocolGroup[];
}

/** Incidental invoice window in days after trip end, by earnings plan. */
export const INVOICE_WINDOW_DAYS: Record<EarningsPlan["id"], number> = {
  peace: 5,
  balanced: 4,
  earnings: 3,
};

export const METADATA_RULE =
  "Photos without date, time, and geolocation metadata are INVALID. Location services on, every shot, or the set may be worthless in a claim.";

export const PROTOCOL_MODES: ProtocolMode[] = [
  {
    id: "checkin",
    label: "Check-in (pre-trip)",
    shortLabel: "Check-in",
    timing:
      "Pre-trip photos: taken within 24 hours BEFORE trip start, uploaded within 24 hours after start. Upload immediately; do not bank on the deadline.",
    groups: [
      {
        label: "Photo sequence (within 24h before start)",
        items: [
          {
            id: "ci1",
            label:
              "Phone location services and timestamp ON. No metadata, no protection",
          },
          {
            id: "ci2",
            label:
              "Exterior full walkaround: all four corners, all four sides, roof line, wheels",
          },
          {
            id: "ci3",
            label:
              "Existing damage close-up, then the same damage from a step back for context",
          },
          { id: "ci4", label: "Interior: seats, carpets, dash, cargo area" },
          {
            id: "ci5",
            label: "Fuel level (or charge level) and odometer, ignition on",
          },
        ],
      },
      {
        label: "Upload and handoff",
        items: [
          {
            id: "ci6",
            label:
              "Upload everything through the Turo app now (hard deadline: 24 hours after trip start)",
          },
          {
            id: "ci7",
            label:
              "Send the check-in message with access instructions (template 4 in H02)",
          },
          {
            id: "ci8",
            label:
              "Stage keys or lockbox. Never share codes before the trip is confirmed and check-in is due",
          },
        ],
      },
      {
        label: "During the trip",
        items: [
          { id: "ci9", label: "Confirm the guest completed in-app check-in" },
          {
            id: "ci10",
            label: "Send the mid-trip check-in message on longer trips (template 5 in H02)",
            optional: true,
          },
          {
            id: "ci11",
            label: "Log any guest-reported issue in writing, in the app",
            optional: true,
          },
        ],
      },
    ],
  },
  {
    id: "checkout",
    label: "Check-out (post-trip)",
    shortLabel: "Check-out",
    timing:
      "Post-trip photos: taken AND uploaded within 24 hours AFTER trip end. The clock started at trip end, not when you got to the car.",
    groups: [
      {
        label: "Photo sequence (taken + uploaded within 24h after end)",
        items: [
          {
            id: "co1",
            label:
              "Get to the vehicle as soon as practical after return; the 24-hour clock is already running",
          },
          {
            id: "co2",
            label:
              "Repeat the full photo sequence: walkaround, interior, fuel or charge, odometer, metadata on",
          },
          {
            id: "co3",
            label: "Compare against your pre-trip photos panel by panel",
          },
          {
            id: "co4",
            label:
              "New damage found? Photograph it close and wide, then go straight to the claims-day SOP. Do not clean the car first",
          },
          {
            id: "co5",
            label: "Upload post-trip photos through the app immediately",
          },
        ],
      },
      {
        label: "Wrap up",
        items: [
          { id: "co6", label: "Send the thank-you message (template 8 in H02)" },
          { id: "co7", label: "Hand off to the cleaning SOP" },
        ],
      },
      {
        label: "Quality control",
        items: [
          {
            id: "co8",
            label:
              "Every photo set includes all four sides, interior, fuel, and odometer",
          },
          {
            id: "co9",
            label:
              "Spot-check one photo's info panel: date, time, and location present",
          },
          {
            id: "co10",
            label: "Photos uploaded in-app, inside the windows, both ends of trip",
          },
          { id: "co11", label: "Damage comparisons done before cleaning" },
        ],
      },
    ],
  },
];

export function modeItems(mode: ProtocolMode): ProtocolItem[] {
  return mode.groups.flatMap((g) => g.items);
}

export interface ProtocolState {
  /** Checked steps for the CURRENT trip only. */
  checks: Record<string, boolean>;
  planId: EarningsPlan["id"];
  tripsCompleted: number;
}

export const DEFAULT_PROTOCOL_STATE: ProtocolState = {
  checks: {},
  planId: "balanced",
  tripsCompleted: 0,
};
