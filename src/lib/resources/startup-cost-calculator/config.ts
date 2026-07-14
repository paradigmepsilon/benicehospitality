// Start-Up Cost Projection Worksheet — data model.
//
// Digitized from Della's "Start-Up Cost Projection Worksheet" handout, whose
// stated categories are furniture, décor, operations, marketing, legal setup,
// and safety. The concrete line items below are reconstructed from those
// categories plus the physical items enumerated in the companion Room Rental
// Setup Checklist, so the two handouts stay consistent. Users enter their own
// estimates; the tool only sums — there is no hidden formula to match, so the
// line list can be tuned freely without affecting correctness.

export interface CostItem {
  id: string;
  label: string;
}

export interface CostCategory {
  id: string;
  label: string;
  items: CostItem[];
}

export const COST_CATEGORIES: CostCategory[] = [
  {
    id: "furniture",
    label: "Furniture & Furnishings",
    items: [
      { id: "f1", label: "Beds, frames, and mattresses (per room)" },
      { id: "f2", label: "Mattress protectors and linen sets" },
      { id: "f3", label: "Desks and chairs" },
      { id: "f4", label: "Nightstands and lamps" },
      { id: "f5", label: "Dressers and closet storage" },
      { id: "f6", label: "Living room seating (couch, chairs)" },
      { id: "f7", label: "Coffee, side, and dining tables" },
    ],
  },
  {
    id: "decor",
    label: "Décor & Styling",
    items: [
      { id: "d1", label: "Wall art and framed decor" },
      { id: "d2", label: "Mirrors" },
      { id: "d3", label: "Rugs and mats" },
      { id: "d4", label: "Curtains and window treatments" },
      { id: "d5", label: "Throw pillows, blankets, and plants" },
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen & Appliances",
    items: [
      { id: "k1", label: "Refrigerator and stove/oven (if not present)" },
      { id: "k2", label: "Microwave, toaster, coffee maker or kettle" },
      { id: "k3", label: "Pots, pans, and cooking utensils" },
      { id: "k4", label: "Plates, bowls, glasses, mugs, silverware" },
      { id: "k5", label: "Food storage containers" },
    ],
  },
  {
    id: "safety",
    label: "Safety & Security",
    items: [
      { id: "s1", label: "Smoke and carbon monoxide detectors" },
      { id: "s2", label: "Fire extinguishers" },
      { id: "s3", label: "Smart lock / keypad locks" },
      { id: "s4", label: "Security cameras or entry system" },
      { id: "s5", label: "Outdoor lighting" },
      { id: "s6", label: "First aid kit" },
    ],
  },
  {
    id: "utilities",
    label: "Utilities & Setup",
    items: [
      { id: "u1", label: "Utility activation and deposits (electric, water, gas)" },
      { id: "u2", label: "High-speed internet install and router" },
      { id: "u3", label: "Streaming subscriptions for common areas" },
      { id: "u4", label: "Pest control (initial service)" },
    ],
  },
  {
    id: "legal",
    label: "Legal & Insurance",
    items: [
      { id: "lg1", label: "LLC / business registration" },
      { id: "lg2", label: "Property and landlord/business insurance" },
      { id: "lg3", label: "Licenses and permits" },
      { id: "lg4", label: "Lease drafting and legal review" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Listing",
    items: [
      { id: "m1", label: "Professional photography" },
      { id: "m2", label: "Listing fees and platform setup" },
      { id: "m3", label: "Initial advertising spend" },
      { id: "m4", label: "Signage and branding" },
    ],
  },
  {
    id: "operations",
    label: "Operations & Supplies",
    items: [
      { id: "o1", label: "Initial cleaning supplies" },
      { id: "o2", label: "Starter consumables (toilet paper, soap, paper towels)" },
      { id: "o3", label: "Laundry starter kit (detergent, baskets)" },
      { id: "o4", label: "Welcome kits and guest guidebook printing" },
      { id: "o5", label: "Tenant onboarding (background checks, keys)" },
    ],
  },
  {
    id: "contingency",
    label: "Contingency Reserve",
    items: [
      { id: "c1", label: "Buffer for surprises (recommend 10 to 15%)" },
    ],
  },
];

export const COST_ALL_ITEMS = COST_CATEGORIES.flatMap((c) => c.items);
