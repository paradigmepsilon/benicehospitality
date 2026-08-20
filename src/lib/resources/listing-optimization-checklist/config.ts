// Listing Optimization Checklist - data model. Digitized from the Car Rental
// Riches handout H01 (verified 2026-08-15): every item a Turo listing needs
// before it publishes, and again once a month after. Six sections: the
// eligibility gate, vehicle prep, photography, listing copy, the 2026 pricing
// levers, and settings/calendar.
//
// The Listing Copy section used to carry a ten-item Vehicle description group.
// Turo removed the free-form vehicle description and guidelines sections from
// listings on July 28, 2026 and now surfaces features and rules itself, so the
// group was deleted rather than reworded. What a host still writes is the
// listing title, the host profile, and the FAQs / parking / guest instructions
// that live in Trip details AFTER a booking. If Turo restores free-text copy,
// restore the group here and in the handout together. Completion is a readiness percentage over the
// required items; items marked `optional` are excluded from the score.
//
// Every Turo platform figure here traces to the CRR fact base
// (turo_platform_facts_2026.md, verified 2026-08-15). When Turo changes rules,
// update this file and the handout together.

export interface ChecklistItem {
  id: string;
  label: string;
  optional?: boolean;
  /** Sub-heading within a section. Emitted once when it changes between items. */
  group?: string;
}

export interface ChecklistSection {
  id: string;
  label: string;
  /** Short note shown under the section heading. */
  blurb?: string;
  items: ChecklistItem[];
}

/**
 * The three pass/fail gate items. If any of these is unchecked the tool shows
 * the stop warning: fix the plan before you fix the listing.
 */
export const HARD_GATE_IDS = ["e1", "e2", "e3"];

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "gate",
    label: "Eligibility Gate",
    blurb:
      "Check this before anything else. If the car fails any of the first three, stop. Fix the plan before you fix the listing.",
    items: [
      { id: "e1", label: "Vehicle is 12 years old or newer" },
      { id: "e2", label: "Vehicle has under 130,000 miles" },
      {
        id: "e3",
        label: "Vehicle has a clean title (salvage and branded titles do not qualify)",
      },
      {
        id: "e4",
        label:
          "If the vehicle is worth $125,000 or more: an activated OEM tracker is installed. Without tracker or location info, Turo can withhold up to 20% of covered damages on a claim. Check this off if it does not apply to your car.",
      },
    ],
  },
  {
    id: "prep",
    label: "Vehicle Preparation",
    items: [
      { id: "v1", label: "Vehicle thoroughly cleaned inside and out" },
      { id: "v2", label: "All maintenance up to date and documented" },
      { id: "v3", label: "Minor issues fixed (scratches, dents, trim)" },
      { id: "v4", label: "Interior detailed and deodorized" },
      { id: "v5", label: "All features and functions tested and working" },
      {
        id: "v6",
        label: "Fuel tank filled (or EV charged, with charging instructions ready)",
      },
      { id: "v7", label: "Tire pressure checked and adjusted" },
      { id: "v8", label: "Fluids topped off" },
      { id: "v9", label: "Accessories organized and functional" },
      { id: "v10", label: "Safety equipment present and accessible" },
      {
        id: "v11",
        label:
          "Maintenance treated as a listing-survival item: if your five-star maintenance rating falls below 30% over your last 10 trips, Turo delists the vehicle and requires an ASE-certified inspection to reinstate it",
      },
    ],
  },
  {
    id: "photos",
    label: "Photography",
    items: [
      {
        id: "ph1",
        label:
          "20 or more high-quality photos taken (our working recommendation; confirm the current photo cap in the app before planning your shoot)",
      },
      { id: "ph2", label: "Exterior shots from all angles (front, rear, both sides)" },
      { id: "ph3", label: "Interior shots of all seating areas" },
      { id: "ph4", label: "Dashboard and controls" },
      { id: "ph5", label: "Trunk or cargo space" },
      { id: "ph6", label: "Special features highlighted" },
      { id: "ph7", label: "Shot in good light with a clean, uncluttered background" },
      { id: "ph8", label: "Vehicle staged (no clutter, no personal items visible)" },
      {
        id: "ph9",
        label: "Edited for brightness, contrast, and color. Edited, not misleading",
      },
      { id: "ph10", label: "Hero image selected: your strongest exterior angle" },
      { id: "ph11", label: "Photos ordered best-first" },
    ],
  },
  {
    id: "copy",
    label: "Listing Copy",
    blurb:
      "The title and the host profile behind it. Turo removed the free-form vehicle description and guidelines sections from listings on July 28, 2026, so the title and your profile are the only copy you still control.",
    items: [
      { id: "t1", group: "Listing title", label: "Contains make and model" },
      { id: "t2", group: "Listing title", label: "Includes one key benefit or feature" },
      { id: "t3", group: "Listing title", label: "Descriptive, not hypey" },
      { id: "t4", group: "Listing title", label: "No all caps, no excessive punctuation" },
      {
        id: "t5",
        group: "Listing title",
        label: "Fits the character limit while staying specific",
      },
      {
        id: "t6",
        group: "Listing title",
        label: "Reads differently from the similar listings in your market (go check them)",
      },
      { id: "h1", group: "Host profile", label: "Professional profile photo" },
      {
        id: "h2",
        group: "Host profile",
        label: "Bio that builds trust in two or three sentences",
      },
      { id: "h3", group: "Host profile", label: "Response time commitment" },
      {
        id: "h4",
        group: "Host profile",
        label: "Hosting experience mentioned honestly (new is fine, say so)",
      },
      { id: "h5", group: "Host profile", label: "Local knowledge emphasized" },
      { id: "h6", group: "Host profile", label: "Business approach described" },
      { id: "h7", group: "Host profile", label: "One personal touch", optional: true },
    ],
  },
  {
    id: "pricing",
    label: "Pricing Setup (2026 Levers)",
    blurb: "The pricing game changed in 2026. Work through this section carefully.",
    items: [
      {
        id: "p1",
        label:
          "Base daily rate researched against your market. No official Turo ADR data exists, so use Turo's Carculator plus a market tool (Sharelytics, RentScout, or TurboPricing) and treat every number as an estimate",
      },
      { id: "p2", label: "Weekend and seasonal adjustments planned" },
      { id: "p3", label: "Special event pricing strategy in place" },
      {
        id: "p4",
        label:
          "Long-trip discounts set deliberately. Turo now applies baseline discounts for longer trips; know what the platform already discounts before you stack your own on top",
      },
      {
        id: "p5",
        label:
          "Non-refundable booking option decision made. It is a lever for guests who commit early; decide whether the tradeoff fits your calendar risk",
      },
      {
        id: "p6",
        label:
          "Advance-booking effect understood. Since March 31, 2026, host share ties to booking lead time in pilot markets (Austin, Dallas, Detroit, Las Vegas, Maui, Philadelphia, Phoenix, San Diego, Seattle). On the More earnings plan, trips booked 28 or more days out can pay up to 100% host share. In a pilot market, price and promote to attract early bookings",
      },
      {
        id: "p7",
        label:
          "Monthly pricing reviewed with eyes open. Turo dropped trip fees on monthly bookings in most markets in March 2025 and pushes monthly rentals hard. Price monthly discounts so a 30-day trip still clears your true-net bar, or set duration limits",
      },
      {
        id: "p8",
        label:
          "Newest pricing rules confirmed on Turo's blog. Host community coverage reports mandatory host discounts starting August 13, 2026, plus guest security deposits and in-app vehicle swaps; confirm exact terms before building your pricing around them",
      },
      { id: "p9", label: "Minimum trip duration established" },
      { id: "p10", label: "Delivery fee structure determined" },
      {
        id: "p11",
        label:
          "Extras chosen and priced to match the vehicle and market (prepaid refuel, child seats, phone mounts, toll transponder, USB cables and chargers, premium extras that fit the car)",
      },
      {
        id: "p12",
        label:
          "EV note handled in the listing: guests are charged by battery-level difference plus a convenience fee, and a low-battery fee applies. Explain your charging expectations",
        optional: true,
      },
      {
        id: "p13",
        label: "Young driver fee reviewed in your current host settings",
        optional: true,
      },
    ],
  },
  {
    id: "settings",
    label: "Settings & Calendar",
    items: [
      {
        id: "s1",
        label: "Advance notice requirement set (6 to 24 hours is a reasonable starting range)",
      },
      { id: "s2", label: "Trip duration limits set" },
      {
        id: "s3",
        label:
          "Cancellation reality understood: if you cancel a booking, Turo charges you $25 more than 24 hours out and $50 inside 24 hours, posts an automated review on your listing, applies ranking penalties, and can remove repeat cancellers. Only list availability you will honor",
      },
      { id: "s4", label: "Distance limits set" },
      {
        id: "s5",
        label:
          "Earnings plan selected. The 2026 US plans: More peace of mind (70% host share, $250 damage responsibility per claim), Balanced (80%, $1,500), More earnings (90%, $2,750), all with up to $750,000 in third-party liability coverage. Pick the plan whose damage responsibility you could pay in cash tomorrow",
      },
      { id: "s6", label: "Delivery radius and fees configured" },
      {
        id: "s7",
        label:
          "Airport delivery set up (check your airport's peer-to-peer rules first; airports can regulate or restrict handoffs on their property)",
        optional: true,
      },
      { id: "s8", label: "Book Instantly decision made and configured" },
      { id: "s9", label: "Calendar current, unavailable dates blocked" },
    ],
  },
];

export const CHECKLIST_ALL_ITEMS = CHECKLIST_SECTIONS.flatMap((s) => s.items);

export const CHECKLIST_REQUIRED_COUNT = CHECKLIST_ALL_ITEMS.filter(
  (i) => !i.optional,
).length;
