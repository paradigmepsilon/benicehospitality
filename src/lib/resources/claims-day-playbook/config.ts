// Claims-Day Playbook: the H04 claims-day SOP plus the H05 claim checklist,
// restructured as five calm stages for the day a guest damages a car.
//
// Fact base (verified 2026-08-15): two clocks start at trip end: the 24-hour
// post-trip photo window, and the plan's incidental invoice window (5 days on
// More peace of mind, 4 on Balanced, 3 on More earnings). Damage
// responsibility applies to ALL claim types. Plan shares and damage
// responsibility import from the vehicle-profitability-calculator config, the
// single home of those numbers.

import type { EarningsPlan } from "@/lib/resources/vehicle-profitability-calculator/config";

/** Incidental invoice window in days from trip end, by 2026 earnings plan. */
export const INVOICE_WINDOW_DAYS: Record<EarningsPlan["id"], number> = {
  peace: 5,
  balanced: 4,
  earnings: 3,
};

/** Hours from trip end to take AND upload post-trip photos. */
export const PHOTO_WINDOW_HOURS = 24;

export const METADATA_WARNING =
  "Photos without metadata are invalid. Turo requires date, time, and geolocation data on every trip photo. Location services off means your photos may not count, no matter how good they are. Check one photo's info panel before you rely on the set.";

export interface PlaybookStage {
  id: string;
  label: string;
  shortLabel: string;
  /** One calm sentence setting the stage. */
  blurb: string;
  items: { id: string; label: string }[];
  /** Optional boundary or context note shown under the checklist. */
  note?: string;
}

export const PLAYBOOK_STAGES: PlaybookStage[] = [
  {
    id: "freeze",
    label: "Secure and freeze",
    shortLabel: "Freeze",
    blurb:
      "Nothing here is urgent except not making it worse. Slow down and preserve the scene exactly as you found it.",
    items: [
      {
        id: "freeze-safety",
        label:
          "If this is an active accident: guest safety first, authorities involved if needed, and the guest reports the incident through the Turo app.",
      },
      {
        id: "freeze-no-clean",
        label:
          "Do NOT clean, repair, or move the vehicle beyond what safety requires.",
      },
      {
        id: "freeze-pretrip",
        label:
          "Confirm your pre-trip photos for this trip uploaded correctly. They are your baseline.",
      },
      {
        id: "freeze-clock",
        label:
          "Note the exact trip end time. Your photo and invoice clocks both run from it.",
      },
    ],
    note: "The cash reserve rule exists for this day: one full damage responsibility held in cash per car means today is a process, not a crisis.",
  },
  {
    id: "document",
    label: "Document (first hour)",
    shortLabel: "Document",
    blurb:
      "Claims are won or lost on documentation. Metadata on, same sequence as every trip, no gaps.",
    items: [
      {
        id: "doc-damage",
        label:
          "Photograph all new damage: close-up, mid-distance, and full-vehicle context shots, metadata on.",
      },
      {
        id: "doc-full-set",
        label:
          "Complete the full post-trip photo sequence even for undamaged areas. Gaps invite disputes.",
      },
      {
        id: "doc-upload",
        label:
          "Upload everything through the Turo app within the 24-hour window. Upload now, not at the deadline.",
      },
      {
        id: "doc-timeline",
        label:
          "Write a plain factual timeline: trip dates, return time, what you found, when you found it. No speculation, no anger.",
      },
    ],
  },
  {
    id: "report",
    label: "Report",
    shortLabel: "Report",
    blurb: "Calm, factual, fast. Every word stays inside the app.",
    items: [
      {
        id: "report-file",
        label: "Report the damage through the Turo app promptly.",
      },
      {
        id: "report-guest",
        label:
          "Message the guest through the app, factual and calm: what you found, and that you have reported it. Keep every word inside the app.",
      },
      {
        id: "report-number",
        label: "Record the claim number and any adjuster contact.",
      },
    ],
  },
  {
    id: "invoices",
    label: "Invoice submission",
    shortLabel: "Invoices",
    blurb:
      "This is the deadline most hosts miss. Your plan sets the window, and it runs from trip end, not from when you noticed.",
    items: [
      {
        id: "inv-list",
        label:
          "List incidental charges: fuel or charge shortfall, tolls, cleaning beyond normal, smoking.",
      },
      {
        id: "inv-receipts",
        label: "Collect receipts and invoices for each charge.",
      },
      {
        id: "inv-submit",
        label:
          "Submit inside YOUR plan's window: 3 days on More earnings, 4 on Balanced, 5 on More peace of mind. Submit day one if you can.",
      },
    ],
    note: "Missed the window? Submit anyway with an explanation, but expect denial, and fix the SOP so it cannot repeat.",
  },
  {
    id: "followup",
    label: "Follow-up and close out",
    shortLabel: "Follow-up",
    blurb:
      "Stay responsive through the repair process, then close the loop so this claim makes the next one easier.",
    items: [
      {
        id: "fu-boundaries",
        label:
          "Know the boundaries going in: Turo alone decides repair versus actual cash value payout; diminished value and repair do-overs are not covered; storage tops out at $2,500.",
      },
      {
        id: "fu-estimates",
        label: "Get repair estimates as directed by the claims process.",
      },
      {
        id: "fu-same-day",
        label: "Respond to every claims request the same day.",
      },
      {
        id: "fu-log",
        label: "Log every call and message in your timeline.",
      },
      {
        id: "fu-verify",
        label: "Verify repairs before accepting the vehicle back.",
      },
      {
        id: "fu-baseline",
        label: "Take a fresh baseline photo set of the repaired vehicle.",
      },
      {
        id: "fu-records",
        label: "Update maintenance and vehicle records.",
      },
      {
        id: "fu-truenet",
        label:
          "Record the total out-of-pocket cost in your true-net tracking. Damage responsibility is a real cost of this business.",
      },
      {
        id: "fu-reserve",
        label:
          "Rebuild your cash reserve to one full damage responsibility, and re-evaluate whether your plan still fits your cash position.",
      },
      {
        id: "fu-sop",
        label:
          "Review what would have made this claim easier, and update your SOPs.",
      },
    ],
  },
];

export const PLAYBOOK_ALL_ITEMS = PLAYBOOK_STAGES.flatMap((s) => s.items);
