// Room Rental Setup Checklist — data model. Digitized from Della's
// "Room Rental Setup Checklist" handout: every item a co-living property needs
// before it is photographed and listed, grouped by room/system. Completion is
// tracked as a readiness percentage over the required items; items marked
// `optional` are recommended-but-not-required and are excluded from the score.

export interface ChecklistItem {
  id: string;
  label: string;
  optional?: boolean;
}

export interface ChecklistSection {
  id: string;
  label: string;
  /** Short note shown under the section heading. */
  blurb?: string;
  items: ChecklistItem[];
}

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "general",
    label: "General Property Setup",
    items: [
      { id: "g1", label: "Deep clean entire home (floors, walls, baseboards, vents)" },
      { id: "g2", label: "Paint touch-ups (if needed)" },
      { id: "g3", label: "All utilities activated (electric, water, internet, gas)" },
      { id: "g4", label: "High-speed Wi-Fi tested and router centrally located" },
      { id: "g5", label: "Property insurance and any required licenses secured" },
      { id: "g6", label: "Smart lock, security cameras, or secure entry system installed" },
      { id: "g7", label: "Safety equipment installed (smoke detectors, fire extinguisher, carbon monoxide detector)" },
      { id: "g8", label: "Pest control service completed and scheduled", optional: true },
    ],
  },
  {
    id: "bedroom",
    label: "Private Bedroom Setup",
    blurb: "Repeat for each private bedroom.",
    items: [
      { id: "b1", label: "Bed frame and comfortable mattress (Twin XL, Full, or Queen)" },
      { id: "b2", label: "Mattress protector and linen set" },
      { id: "b3", label: "Desk and chair (especially for students / remote workers)" },
      { id: "b4", label: "Nightstand and lamp" },
      { id: "b5", label: "Storage: dresser, closet space, hangers" },
      { id: "b6", label: "Mirror (wall or full-length)" },
      { id: "b7", label: "Trash bin" },
      { id: "b8", label: "Lock on door (preferably keypad lock)" },
      { id: "b9", label: "Rug or area mat", optional: true },
      { id: "b10", label: "Wall art or framed decor (simple but tasteful)", optional: true },
      { id: "b11", label: "Wi-Fi instructions, welcome note, and house rules" },
    ],
  },
  {
    id: "common",
    label: "Living Room / Common Area",
    items: [
      { id: "c1", label: "Comfortable seating (couch, chairs)" },
      { id: "c2", label: "Coffee table or side table" },
      { id: "c3", label: "Throw pillows or blankets", optional: true },
      { id: "c4", label: "TV with streaming access or wall art (depending on target audience)" },
      { id: "c5", label: "Clean, neutral decor for wide appeal" },
      { id: "c6", label: "Designated space for guests to socialize" },
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen Setup",
    items: [
      { id: "k1", label: "Refrigerator and stove/oven in working condition" },
      { id: "k2", label: "Microwave, toaster, coffee maker or kettle" },
      { id: "k3", label: "Pots, pans, and cooking utensils" },
      { id: "k4", label: "Plates, bowls, glasses, mugs" },
      { id: "k5", label: "Silverware set" },
      { id: "k6", label: "Tupperware or food storage containers" },
      { id: "k7", label: "Labels for shared vs. private pantry/fridge space" },
      { id: "k8", label: "Trash and recycling bins" },
      { id: "k9", label: "Basic cleaning supplies (dish soap, sponge, towels)" },
    ],
  },
  {
    id: "bathroom",
    label: "Bathroom(s)",
    items: [
      { id: "ba1", label: "Shower curtain and liner" },
      { id: "ba2", label: "Bath mat" },
      { id: "ba3", label: "Toilet brush and plunger" },
      { id: "ba4", label: "Trash bin" },
      { id: "ba5", label: "Towel hooks or storage for each guest" },
      { id: "ba6", label: "Mirror and good lighting" },
      { id: "ba7", label: "Starter supply of toilet paper and hand soap" },
    ],
  },
  {
    id: "laundry",
    label: "Laundry Area",
    blurb: "If the property has laundry on-site.",
    items: [
      { id: "l1", label: "Washer and dryer, or clear info on nearby laundromat" },
      { id: "l2", label: "Laundry basket or hamper", optional: true },
      { id: "l3", label: "Detergent and drying rack (starter kit)" },
      { id: "l4", label: "Clear instructions for use" },
    ],
  },
  {
    id: "operations",
    label: "Operational Readiness",
    items: [
      { id: "o1", label: "Set up cleaning calendar (with assigned cleaners)" },
      { id: "o2", label: "Backup cleaner contact identified" },
      { id: "o3", label: "Add contacts to your contractor rolodex" },
      { id: "o4", label: "Maintenance phone number listed for tenants" },
      { id: "o5", label: "Emergency instructions printed and posted" },
      { id: "o6", label: "Guest guidebook available (digital or printed)" },
    ],
  },
  {
    id: "prelisting",
    label: "Pre-Listing Final Checks",
    items: [
      { id: "p1", label: "Space decluttered and styled for photos" },
      { id: "p2", label: "All beds made and rooms staged" },
      { id: "p3", label: "Cords, clutter, or trash removed" },
      { id: "p4", label: "Windows cleaned and curtains open for lighting" },
      { id: "p5", label: "At least 8 to 12 quality photos captured per room/area" },
    ],
  },
];

export const CHECKLIST_ALL_ITEMS = CHECKLIST_SECTIONS.flatMap((s) => s.items);
export const CHECKLIST_REQUIRED_COUNT = CHECKLIST_ALL_ITEMS.filter(
  (i) => !i.optional,
).length;
