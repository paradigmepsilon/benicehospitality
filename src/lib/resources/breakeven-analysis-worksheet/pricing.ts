// Co-Living Property Profitability Analysis Worksheet — per-room pricing model.
//
// Moved from src/lib/resources/room-rental-price-calculator/config.ts when the
// price calculator and the start-up worksheet merged. The model itself is
// unchanged; what changed is that it now runs once per room instead of once per
// page, so the inputs had to be split by who owns them.
//
// price = base + roomPremium + propertyPremium
//   base            = 65% of the fair-market rent of a comparable 1-bedroom. A
//                     bare private bedroom (shared bath, nothing included)
//                     rents for roughly 60-70% of a whole 1-bed in the same
//                     area; 65% is the anchor.
//   roomPremium     = features of THIS room + its size band.
//   propertyPremium = features of the whole house + walkability. Added to every
//                     room, because each tenant independently values in-unit
//                     laundry. See the inflation warning below.
//
// Weighting rationale (monthly $, Southeast co-living / room-rental norms):
//   - A PRIVATE/ensuite bathroom is by far the biggest lever in shared housing
//     ($150). Everything else is secondary.
//   - "Included in rent" items are priced near the real cost they save a
//     tenant: all-utilities ($75), Wi-Fi ($30), weekly room cleaning ($40).
//   - Privacy/independence (detached suite $60, private entrance $30, own
//     climate control $20) command clear premiums.
//   - Room size scales modestly: under ~120 sqft adds nothing, a large 200+
//     sqft room adds a little. Size is a small factor once a bed and desk fit.
//   - Convenience amenities (laundry, parking, stocked kitchen, gym, workspace)
//     each add a moderate, realistic amount.
// Tune any number here; nothing else needs to change.
//
// SCOPE SPLIT, and why each item sits where it does. The old flat model put
// every checkbox in one of three buckets that mixed scopes. Re-partitioning by
// physical reality avoids needing an inherit/override UI at all:
//   - Utilities, Wi-Fi, and community events are PROPERTY: one meter, one
//     router, house-wide by definition. They cannot differ room to room.
//   - Room cleanings, linens, and hygiene items are ROOM: genuinely a per-room
//     service tier you can offer on the suite and not the box room.
//   - Parking moved from property to ROOM. Its label already read "Dedicated
//     parking for the room" — it was mis-filed. Spaces are finite; a five-room
//     house with two spaces should not price all five rooms as if they park.
// Every id and dollar value carried over unchanged, so saved state and the
// rationale above both stay valid.

export const BASE_PERCENT = 0.65;

/**
 * Above this share of the 1-bed comp, a single room is priced at a level where
 * a tenant would rationally just rent the whole 1-bedroom instead. Drives the
 * per-room warning, not a cap — the operator may know something we do not.
 */
export const ROOM_PRICE_WARN_RATIO = 0.95;

/**
 * Whole-house uplift above which the room-by-room total stops being credible.
 * Real co-living uplift over a single lease runs about 1.3-1.8x; 1.9 is the
 * outer edge. Only checked when the operator supplies a whole-house rent.
 */
export const HOUSE_UPLIFT_WARN_RATIO = 1.9;

/**
 * The 65%-of-a-1-bed anchor is a rule of thumb from a normal market. At the top
 * end it breaks: 65% of $2,800 prices a single bedroom at $1,820, which is not
 * a product that exists. Warn rather than silently sliding the base, so the
 * operator decides.
 */
export const FMV_SANITY_CEILING = 2200;

export interface DollarField {
  id: string;
  label: string;
  /** Monthly dollars added to the rent when this feature is present. */
  dollars: number;
}

/** Features of the individual room being priced. */
export const ROOM_FEATURES: DollarField[] = [
  { id: "privateBath", label: "Private / ensuite bathroom", dollars: 150 },
  { id: "detached", label: "Detached from the main home (private suite)", dollars: 60 },
  { id: "parking", label: "Dedicated parking space for this room", dollars: 40 },
  { id: "ownExit", label: "Private entrance / own exit", dollars: 30 },
  { id: "ownClimate", label: "Own climate control (thermostat / mini-split)", dollars: 20 },
  { id: "ownWorkspace", label: "Built-in desk / workspace in the room", dollars: 15 },
  { id: "window", label: "Window with natural light", dollars: 10 },
  { id: "tv", label: "TV in the room", dollars: 10 },
];

/** Bundled into this room's rent. Can differ room to room. */
export const ROOM_INCLUDED: DollarField[] = [
  { id: "roomCleanings", label: "Room cleanings included", dollars: 40 },
  { id: "linens", label: "Linens provided", dollars: 10 },
  { id: "hygiene", label: "Personal hygiene items provided", dollars: 10 },
];

/** Whole-property attributes shared by every room. */
export const PROPERTY_FEATURES: DollarField[] = [
  { id: "upgraded", label: "Property is upgraded / recently renovated", dollars: 40 },
  { id: "laundry", label: "In-unit laundry (washer & dryer)", dollars: 35 },
  { id: "stockedKitchen", label: "Fully stocked kitchen", dollars: 25 },
  { id: "workspace", label: "Dedicated workspace / co-working area", dollars: 20 },
  { id: "gym", label: "Gym / fitness area on-site", dollars: 20 },
  { id: "backyard", label: "Backyard or deck", dollars: 15 },
];

/** Bundled into every room's rent because the house cannot split them. */
export const PROPERTY_INCLUDED: DollarField[] = [
  { id: "utilitiesIncluded", label: "All utilities included", dollars: 75 },
  { id: "wifiIncluded", label: "Wi-Fi included", dollars: 30 },
  { id: "communityEvents", label: "Organized community events", dollars: 15 },
];

/**
 * Property-level "included" ids paired with the monthly cost line that has to
 * cover them. Section 3 uses this to catch an operator who sells all-utilities
 * for +$75 a room and then books $0 of utilities.
 */
export const INCLUDED_COST_COUPLING: { includedId: string; costLineIds: string[] }[] = [
  { includedId: "utilitiesIncluded", costLineIds: ["u1m_electric", "u1m_water", "u1m_gas"] },
  { includedId: "wifiIncluded", costLineIds: ["u2"] },
];

/** Room-level equivalent of the above. */
export const ROOM_INCLUDED_COST_COUPLING: { includedId: string; costLineIds: string[] }[] = [
  { includedId: "roomCleanings", costLineIds: ["op_cleaning"] },
  { includedId: "linens", costLineIds: ["o3"] },
  { includedId: "hygiene", costLineIds: ["o2"] },
];

export const ROOM_SIZE_OPTIONS: { label: string; dollars: number }[] = [
  { label: "Under 120 sqft", dollars: 0 },
  { label: "120 to 200 sqft", dollars: 10 },
  { label: "Over 200 sqft", dollars: 25 },
];

// Location scores, all from walkscore.com and all 0-100. Three separate
// numbers because they measure different things and a room renter values them
// differently:
//
//   Walk Score  — can you live here without driving. The biggest of the three,
//                 unchanged from the original model at $40 top-band.
//   Transit Score — can you get to WORK without a car. Worth real money to the
//                 travel nurses and service workers who fill co-living rooms,
//                 many of whom do not bring a vehicle. Slightly under walk
//                 because good transit usually comes with good walkability, so
//                 pricing it equally would double-count the same advantage.
//   Bike Score  — genuine but secondary. A nice-to-have that closes a deal,
//                 not one that sets the rent.
//
// Deliberately smaller than they could be. All three are correlated in
// practice (dense areas score high on everything), so a truly transit-rich
// address stacks all three and adds $85 to every room. That is real, but it
// also feeds the over-comp problem — which is why ROOM_PRICE_WARN_RATIO exists.

/** Walk Score (0-100): can you live here without a car. */
export function walkabilityDollars(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score >= 90) return 40;
  if (score >= 70) return 25;
  if (score >= 50) return 10;
  return 0;
}

/** Transit Score (0-100): can you get to work without a car. */
export function transitDollars(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score >= 90) return 30;
  if (score >= 70) return 20;
  if (score >= 50) return 8;
  return 0;
}

/** Bike Score (0-100): bike lanes, terrain, and road connectivity. */
export function bikeDollars(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score >= 90) return 15;
  if (score >= 70) return 10;
  if (score >= 50) return 5;
  return 0;
}

/** Combined location premium added to every room. */
export function locationDollars(property: {
  walkability: string;
  transitScore: string;
  bikeScore: string;
}): number {
  return (
    walkabilityDollars(parseNum(property.walkability)) +
    transitDollars(parseNum(property.transitScore)) +
    bikeDollars(parseNum(property.bikeScore))
  );
}

/** For the per-room breakdown, so the location stack is never a mystery. */
export const LOCATION_SCORES: {
  key: "walkability" | "transitScore" | "bikeScore";
  label: string;
  dollars: (score: number) => number;
}[] = [
  { key: "walkability", label: "Walk Score", dollars: walkabilityDollars },
  { key: "transitScore", label: "Transit Score", dollars: transitDollars },
  { key: "bikeScore", label: "Bike Score", dollars: bikeDollars },
];

/**
 * A room's plan-time designation, not an occupancy tracker.
 *
 * Deliberately NOT a "currently vacant" toggle: occupancy varies month to
 * month, and freezing it as a boolean produces a number that is neither today's
 * reality nor a forecast. Expected vacancy is a rate on the projection; actual
 * occupancy belongs in the Co-Living Profit Calculator, which is an actuals
 * ledger.
 */
export type RoomStatus = "renting" | "owner" | "not-renting";

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  renting: "Renting out",
  owner: "Owner / family occupies",
  "not-renting": "Not renting (office, storage)",
};

export interface Room {
  /** Stable key for React and CSV. */
  id: string;
  name: string;
  status: RoomStatus;
  /** "" or one of ROOM_SIZE_OPTIONS labels. */
  sizeBand: string;
  features: Record<string, boolean>;
  included: Record<string, boolean>;
  /** Manual override of the computed price. "" means use the computed value. */
  priceOverride: string;
}

export interface PropertyInputs {
  // The property's NAME is not here. It is resource_analyses.name — the same
  // string the switcher, the account dashboard, and the ?a= deep link use.
  //
  // There used to be a `nickname` field here as well, so a property could be
  // called "Hutchens" in the switcher and "123 Maple St" in the form, and
  // neither one was wrong. One property, one name.
  //
  // Address is free-text on purpose. This is a planning tool, not a system of
  // record: an operator evaluating a listing often has a street and a city and
  // nothing else, and a validated address form would block them at the door.
  street: string;
  city: string;
  /** Two-letter code or full name; not validated. */
  state: string;
  zip: string;
  /**
   * Bathrooms and square footage are RECORDED, not computed with. Nothing in
   * the pricing or projection model reads them. They exist because they are the
   * first two things anyone asks about a property, they are what the web lookup
   * can fill, and a report that omits them looks incomplete to a lender.
   *
   * If a future model prices a private bath or a room's size off these, that is
   * a deliberate change — do not let them quietly acquire meaning.
   */
  bathrooms: string;
  squareFeet: string;
  /** Comparable 1-bedroom fair-market rent. */
  fmv: string;
  /**
   * How many bedrooms the property has in total, including any the owner keeps
   * or uses as an office. Asked outright rather than inferred from how many
   * room cards happen to exist, because the two are genuinely different
   * numbers: this one drives how many beds and dressers the launch budget buys,
   * and someone can be part-way through pricing rooms while the property still
   * has all of them. Blank falls back to the number of room cards.
   */
  totalRooms: string;
  /** Walk Score, walkscore.com, 0-100. */
  walkability: string;
  /** Transit Score, walkscore.com, 0-100. */
  transitScore: string;
  /** Bike Score, walkscore.com, 0-100. */
  bikeScore: string;
  /** Optional sanity anchor: what the whole house would rent for on one lease. */
  wholeHouseRent: string;
  features: Record<string, boolean>;
  included: Record<string, boolean>;
}

export interface RoomPrice {
  base: number;
  roomPremium: number;
  propertyPremium: number;
  /** base + roomPremium + propertyPremium. */
  computed: number;
  /** The override when set and valid, otherwise `computed`. */
  price: number;
  overridden: boolean;
  /**
   * Priced at or above ROOM_PRICE_WARN_RATIO of a whole 1-bed.
   *
   * Computed but no longer shown. It drove a per-room warning that Alex had
   * removed on 2026-08-11 as noise. Kept because it is pure, tested, and the
   * signal is still true — put it back behind a quieter treatment if the
   * question ever comes up again, rather than recomputing it.
   */
  exceedsComp: boolean;
}

/**
 * "123 Maple St, Douglasville, GA 30135". Every part is optional, so a
 * half-filled address still reads as an address rather than as punctuation.
 */
export function formatAddress(p: Pick<PropertyInputs, "street" | "city" | "state" | "zip">): string {
  const street = p.street.trim();
  const cityState = [p.city.trim(), [p.state.trim(), p.zip.trim()].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [street, cityState].filter(Boolean).join(", ");
}

/**
 * "Douglasville, GA" — the short form for list rows, where the street would
 * crowd out the numbers that make the row worth scanning. Falls back to the
 * street when there is no city, so something always shows if anything was typed.
 */
export function formatLocality(p: Pick<PropertyInputs, "street" | "city" | "state" | "zip">): string {
  const cityState = [p.city.trim(), p.state.trim()].filter(Boolean).join(", ");
  return cityState || p.street.trim() || p.zip.trim();
}

/**
 * The walkscore.com page for this exact property.
 *
 * WHY A LINK AND NOT A LOOKUP. Walk Score is the authoritative source for all
 * three location scores, and it publishes a page per US address. Those pages
 * are not in Google's index, so the web lookup cannot reach them: asked for
 * 540 Hutchens Rd SE it read the surrounding neighbourhood's page and the
 * house at 800 Hutchens instead, then offered their scores as this property's.
 * For 6470 Church St it reported no score exists. The real page says 63.
 *
 * Sending the member to the page costs nothing, needs no key, and gives them
 * the real number instead of a near-miss. Walk Score's own API would automate
 * it, but its free tier is licensed for "free consumer-facing applications
 * only" and excludes caching, which saving a score into an analysis arguably
 * is. That is a licensing call, not an engineering one.
 *
 * The slug is the whole address, lowercased, non-alphanumerics collapsed to
 * hyphens. Verified against six addresses including a trailing period on "Rd."
 * and a missing ZIP; every one reached the right page. Street-only was not
 * verified, so a locality is required rather than assumed to work.
 */
export function walkScoreUrl(
  p: Pick<PropertyInputs, "street" | "city" | "state" | "zip">,
): string | null {
  const street = p.street.trim();
  const located = p.city.trim() || p.zip.trim();
  if (!street || !located) return null;
  const slug = [p.street, p.city, p.state, p.zip]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `https://www.walkscore.com/score/${slug}` : null;
}

export function parseNum(v: string | undefined): number {
  if (v === undefined) return 0;
  const t = v.trim();
  if (t === "") return 0;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

function sumGroup(fields: DollarField[], sel: Record<string, boolean>): number {
  let total = 0;
  for (const f of fields) if (sel[f.id]) total += f.dollars;
  return total;
}

/**
 * The property premium every room inherits. Computed once per property rather
 * than per room so the caller can show it as a single line.
 */
export function computePropertyPremium(property: PropertyInputs): number {
  return (
    sumGroup(PROPERTY_FEATURES, property.features) +
    sumGroup(PROPERTY_INCLUDED, property.included) +
    locationDollars(property)
  );
}

export function computeRoomPrice(
  property: PropertyInputs,
  room: Room,
  /** Pass the memoized value from computePropertyPremium when pricing many rooms. */
  propertyPremium = computePropertyPremium(property),
): RoomPrice {
  const fmv = parseNum(property.fmv);
  const base = Math.round(fmv * BASE_PERCENT);

  const size = ROOM_SIZE_OPTIONS.find((s) => s.label === room.sizeBand);
  const roomPremium =
    sumGroup(ROOM_FEATURES, room.features) +
    sumGroup(ROOM_INCLUDED, room.included) +
    (size?.dollars ?? 0);

  const computed = base + roomPremium + propertyPremium;

  const overrideRaw = room.priceOverride.trim();
  const overrideNum = parseFloat(overrideRaw);
  const overridden = overrideRaw !== "" && Number.isFinite(overrideNum) && overrideNum >= 0;
  const price = overridden ? Math.round(overrideNum) : computed;

  return {
    base,
    roomPremium,
    propertyPremium,
    computed,
    price,
    overridden,
    exceedsComp: fmv > 0 && price > fmv * ROOM_PRICE_WARN_RATIO,
  };
}

export interface PricedRoom extends Room {
  result: RoomPrice;
}

export interface PricingSummary {
  rooms: PricedRoom[];
  /**
   * Bedrooms in the property. What the user typed, or the number of room cards
   * when they have not said. Drives per-room cost quantities — you still buy a
   * bed for the room you keep for yourself.
   */
  roomCount: number;
  /** True when roomCount came from the user rather than from counting cards. */
  roomCountStated: boolean;
  /** Room cards that exist, whatever their status. */
  pricedRoomCount: number;
  /** Stated room count and priced cards disagree — worth a nudge, not an error. */
  roomCountMismatch: boolean;
  /** Only rooms with status "renting" — drives revenue. */
  rentingRoomCount: number;
  /** Monthly rent across renting rooms, before vacancy. */
  grossScheduledRent: number;
  /** Mean price of renting rooms; 0 when none. Used in break-even guidance. */
  averageRoomPrice: number;
  /** Any room priced at or above the 1-bed comp. */
  hasRoomOverComp: boolean;
  /** grossScheduledRent / wholeHouseRent, or null when not supplied. */
  houseUplift: number | null;
  /** Uplift beyond what co-living realistically achieves. */
  upliftImplausible: boolean;
  /** The 1-bed comp is high enough that the 65% anchor is shaky. */
  fmvAboveSanityCeiling: boolean;
}

export function computePricing(
  property: PropertyInputs,
  rooms: Room[],
): PricingSummary {
  const propertyPremium = computePropertyPremium(property);
  const priced: PricedRoom[] = rooms.map((r) => ({
    ...r,
    result: computeRoomPrice(property, r, propertyPremium),
  }));

  const renting = priced.filter((r) => r.status === "renting");
  const grossScheduledRent = renting.reduce((sum, r) => sum + r.result.price, 0);

  const wholeHouseRent = parseNum(property.wholeHouseRent);
  const houseUplift =
    wholeHouseRent > 0 ? grossScheduledRent / wholeHouseRent : null;

  const statedRooms = Math.floor(parseNum(property.totalRooms));
  const roomCountStated = statedRooms > 0;
  const roomCount = roomCountStated ? statedRooms : rooms.length;

  return {
    rooms: priced,
    roomCount,
    roomCountStated,
    pricedRoomCount: rooms.length,
    roomCountMismatch: roomCountStated && statedRooms !== rooms.length,
    rentingRoomCount: renting.length,
    grossScheduledRent,
    averageRoomPrice: renting.length > 0 ? grossScheduledRent / renting.length : 0,
    hasRoomOverComp: priced.some((r) => r.status === "renting" && r.result.exceedsComp),
    houseUplift,
    upliftImplausible: houseUplift !== null && houseUplift > HOUSE_UPLIFT_WARN_RATIO,
    fmvAboveSanityCeiling: parseNum(property.fmv) > FMV_SANITY_CEILING,
  };
}

export const MAX_ROOMS = 12;

export function makeRoom(index: number, id: string): Room {
  return {
    id,
    name: `Room ${index + 1}`,
    status: "renting",
    sizeBand: "",
    features: {},
    included: {},
    priceOverride: "",
  };
}
