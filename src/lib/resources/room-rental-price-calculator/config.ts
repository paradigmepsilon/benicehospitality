// Room Rental Price Calculator — data model + pricing formula.
//
// Prices a single private room in a co-living / shared home. The old handout
// used an abstract "+$1 per point" system that did not reflect what features
// actually move rent. This model instead anchors to a market comp and adds a
// realistic monthly dollar premium for each feature, weighted by how much
// tenants actually pay for it.
//
// price = base + premiums
//   base     = 65% of the fair-market rent of a comparable 1-bedroom. A bare
//              private bedroom (shared bath, nothing included) rents for
//              roughly 60-70% of a whole 1-bed in the same area; 65% is the
//              anchor. Real premiums push a great room up from there and leave
//              a basic room near base.
//   premiums = the sum of the monthly dollars below for every feature present.
//
// Weighting rationale (monthly $, Southeast co-living / room-rental norms):
//   - A PRIVATE/ensuite bathroom is by far the biggest lever in shared housing
//     ($150). Everything else is secondary.
//   - "Included in rent" items are priced near the real cost they save a
//     tenant: all-utilities ($75), Wi-Fi ($30), weekly room cleaning ($40).
//   - Privacy/independence (detached suite $60, private entrance $30, own
//     climate control $20) command clear premiums.
//   - Room size scales modestly: under ~120 sqft adds nothing, a large 200+
//     sqft room adds a little. This matches the user's guidance that size is a
//     small factor once a bed and desk fit.
//   - Convenience amenities (laundry, parking, stocked kitchen, gym, workspace)
//     each add a moderate, realistic amount.
// Tune any number here; nothing else needs to change.

export const BASE_PERCENT = 0.65;

export interface DollarField {
  id: string;
  label: string;
  /** Monthly dollars added to the rent when this feature is present. */
  dollars: number;
}

// The room being priced. Private bathroom dominates; the rest are privacy,
// comfort, and size premiums.
export const ROOM_FEATURES: DollarField[] = [
  { id: "privateBath", label: "Private / ensuite bathroom", dollars: 150 },
  { id: "detached", label: "Detached from the main home (private suite)", dollars: 60 },
  { id: "ownExit", label: "Private entrance / own exit", dollars: 30 },
  { id: "ownClimate", label: "Own climate control (thermostat / mini-split)", dollars: 20 },
  { id: "ownWorkspace", label: "Built-in desk / workspace in the room", dollars: 15 },
  { id: "window", label: "Window with natural light", dollars: 10 },
  { id: "tv", label: "TV in the room", dollars: 10 },
];

// Whole-property attributes shared by all rooms.
export const PROPERTY_FEATURES: DollarField[] = [
  { id: "upgraded", label: "Property is upgraded / recently renovated", dollars: 40 },
  { id: "parking", label: "Dedicated parking for the room", dollars: 40 },
  { id: "laundry", label: "In-unit laundry (washer & dryer)", dollars: 35 },
  { id: "stockedKitchen", label: "Fully stocked kitchen", dollars: 25 },
  { id: "workspace", label: "Dedicated workspace / co-working area", dollars: 20 },
  { id: "gym", label: "Gym / fitness area on-site", dollars: 20 },
  { id: "backyard", label: "Backyard or deck", dollars: 15 },
];

// What is bundled into the rent. Priced near the real monthly value it saves.
export const INCLUDED: DollarField[] = [
  { id: "utilitiesIncluded", label: "All utilities included", dollars: 75 },
  { id: "roomCleanings", label: "Room cleanings included", dollars: 40 },
  { id: "wifiIncluded", label: "Wi-Fi included", dollars: 30 },
  { id: "communityEvents", label: "Organized community events", dollars: 15 },
  { id: "linens", label: "Linens provided", dollars: 10 },
  { id: "hygiene", label: "Personal hygiene items provided", dollars: 10 },
];

// Room size is a modest factor: a large room earns a small premium, a small
// room earns nothing.
export const ROOM_SIZE_OPTIONS: { label: string; dollars: number }[] = [
  { label: "Under 120 sqft", dollars: 0 },
  { label: "120 to 200 sqft", dollars: 10 },
  { label: "Over 200 sqft", dollars: 25 },
];

// Walkability (walkscore.com, 0-100): very walkable areas support higher rent.
export function walkabilityDollars(score: number): number {
  if (Number.isNaN(score)) return 0;
  if (score >= 90) return 40;
  if (score >= 70) return 25;
  if (score >= 50) return 10;
  return 0;
}

export interface PriceInputs {
  fmv: number;
  walkability: number;
  sizeBand: string;
  features: Record<string, boolean>; // property features
  amenities: Record<string, boolean>; // included-in-rent items
  room: Record<string, boolean>; // room features
}

export interface PriceBreakdownLine {
  label: string;
  dollars: number;
}

export interface PriceResult {
  base: number;
  premium: number;
  price: number;
  /** Every applied premium — used for the CSV export, not the on-screen panel. */
  breakdown: PriceBreakdownLine[];
}

export function computePrice(inputs: PriceInputs): PriceResult {
  const fmv = Number.isFinite(inputs.fmv) ? inputs.fmv : 0;
  const base = Math.round(fmv * BASE_PERCENT);

  const breakdown: PriceBreakdownLine[] = [];
  let premium = 0;

  const applyGroup = (fields: DollarField[], sel: Record<string, boolean>) => {
    for (const f of fields) {
      if (sel[f.id]) {
        premium += f.dollars;
        breakdown.push({ label: f.label, dollars: f.dollars });
      }
    }
  };

  applyGroup(ROOM_FEATURES, inputs.room);
  applyGroup(PROPERTY_FEATURES, inputs.features);
  applyGroup(INCLUDED, inputs.amenities);

  const size = ROOM_SIZE_OPTIONS.find((s) => s.label === inputs.sizeBand);
  if (size && size.dollars > 0) {
    premium += size.dollars;
    breakdown.push({ label: `Room size: ${size.label}`, dollars: size.dollars });
  }

  const walk = walkabilityDollars(inputs.walkability);
  if (walk > 0) {
    premium += walk;
    breakdown.push({ label: `Walkability score ${inputs.walkability}`, dollars: walk });
  }

  return { base, premium, price: base + premium, breakdown };
}
