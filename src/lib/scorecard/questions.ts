export type ScorecardSectionId =
  | "location"
  | "shared_spaces"
  | "layout"
  | "condition"
  | "rooms"
  | "neighborhood"
  | "legal";

export interface ScorecardQuestion {
  id: string;
  text: string;
  recommendation: string;
}

export interface ScorecardSection {
  id: ScorecardSectionId;
  label: string;
  blurb: string;
  weight: number;
  questions: ScorecardQuestion[];
}

export const SCORECARD_SECTIONS: ScorecardSection[] = [
  {
    id: "location",
    label: "Location",
    blurb: "Where the property sits decides who can rent it.",
    weight: 4.5,
    questions: [
      {
        id: "l1",
        text: "Is the property within 30 minutes of a major hospital, hospital system, or medical campus?",
        recommendation:
          "Travel nurses and travel allied health are your highest-rate cohort. No hospital nearby, no travel nurse market.",
      },
      {
        id: "l2",
        text: "Is there a college, university, or graduate program within 5 miles?",
        recommendation:
          "Adjuncts, visiting researchers, and grad students need furnished MTRs. Without one nearby, you lose a steady demand layer.",
      },
      {
        id: "l3",
        text: "Are essential services (pharmacy, urgent care, grocery) within walking distance?",
        recommendation:
          "Furnished tenants are mid-stay, often without a car. Walkable essentials cut friction and show up in reviews.",
      },
      {
        id: "l4",
        text: "Is the property within 10 miles of a major employment hub or corporate campus?",
        recommendation:
          "Corporate relocations and project teams need 30 to 90 day housing. Distance to work decides the booking.",
      },
      {
        id: "l5",
        text: "Is the surrounding crime rate considered low (county or city stats)?",
        recommendation:
          "High crime kills bookings and raises insurance. Pull county stats. If it is a hard no, this property may not fit MTR.",
      },
      {
        id: "l6",
        text: "Is the property near a major highway, airport, or transit line?",
        recommendation:
          "Travel professionals fly in on Mondays. If they cannot get from the airport in under an hour, you lose the booking.",
      },
    ],
  },
  {
    id: "shared_spaces",
    label: "Shared Spaces & Operations",
    blurb: "The biggest lever. What is inside and how it runs.",
    weight: 6.0,
    questions: [
      {
        id: "a1",
        text: "Is there onsite laundry (in-unit washer and dryer) available to tenants?",
        recommendation:
          "Non-negotiable for stays over 14 days. A stackable W/D runs $1,200 to $1,800 installed and pays back in two bookings.",
      },
      {
        id: "a2",
        text: "Does the kitchen have a full set of appliances (stove, fridge, microwave, dishwasher)?",
        recommendation:
          "Mid-stay tenants cook. Missing appliances drop you from MTR-eligible to extended-stay-hotel competition.",
      },
      {
        id: "a3",
        text: "Is high-speed internet available (at least 300 Mbps download, hardwired or strong WiFi)?",
        recommendation:
          "Remote workers are half your demand. Run a speed test before listing. Upgrade to gig if you are under 300.",
      },
      {
        id: "a4",
        text: "Is there a dedicated workspace or desk in a quiet area of the home?",
        recommendation:
          "Travel professionals chart at night, remote workers take calls. A desk with a real chair is a top-3 photo.",
      },
      {
        id: "a5",
        text: "Is there off-street or assigned parking, one space per bedroom?",
        recommendation:
          "Travel nurses drive their own cars. One spot per bed or you will get marked down in reviews.",
      },
      {
        id: "a6",
        text: "Is there a smart lock with keyless entry (Schlage, Yale, August)?",
        recommendation:
          "Self check-in is table stakes. Key hand-offs break for arrivals after 9pm. A Schlage Encode runs about $220.",
      },
      {
        id: "a7",
        text: "Are there outdoor security cameras at entry points?",
        recommendation:
          "Most MTR insurance carriers now want them. A Wyze v3 four-pack runs about $140. Cheap insurance against incident claims.",
      },
      {
        id: "a8",
        text: "Is there sufficient outdoor lighting around entries and walkways?",
        recommendation:
          "Travel nurses arrive from night shifts. Bad lighting reads as unsafe in reviews. Motion floods are about $60 each.",
      },
      {
        id: "a9",
        text: "Is there private outdoor space (yard, patio, or balcony)?",
        recommendation:
          "Long stays without outdoor access feel claustrophobic. A small patio with two chairs is enough.",
      },
      {
        id: "a10",
        text: "Do you have a cleaner already lined up who can do mid-stay and turnovers?",
        recommendation:
          "Operations live or die on cleaning. Lock this in before listing, not after the first booking.",
      },
    ],
  },
  {
    id: "layout",
    label: "Property Size & Layout",
    blurb: "Bones of the house.",
    weight: 2.25,
    questions: [
      {
        id: "s1",
        text: "Is there at least one bathroom per two bedrooms?",
        recommendation:
          "Below this ratio and you will see complaints in week one. Adding a half-bath costs $7 to $15K but lifts viable headcount.",
      },
      {
        id: "s2",
        text: "Are common areas big enough for every tenant to be in at once without crowding?",
        recommendation:
          "If two tenants cannot sit in the living room at the same time, it is not co-living-ready.",
      },
      {
        id: "s3",
        text: "Can each bedroom fit a queen bed, a nightstand, and a small desk?",
        recommendation:
          "Anything smaller reads as a dorm. Queen plus nightstand plus desk is the minimum guests expect.",
      },
      {
        id: "s4",
        text: "Does the property have at least two exterior access points (front plus back or side)?",
        recommendation:
          "Fire code in most jurisdictions plus a real feature for shared layouts. Worth zero dollars if it already exists.",
      },
    ],
  },
  {
    id: "condition",
    label: "Property Condition",
    blurb: "What the photos will actually look like.",
    weight: 2.5,
    questions: [
      {
        id: "c1",
        text: "Has the interior been recently painted (within 3 years) in neutral, photo-friendly colors?",
        recommendation:
          "Two weekends and about $600 in paint moves your listing from dated to current. Highest ROI cosmetic fix.",
      },
      {
        id: "c2",
        text: "Is the flooring in good condition (no major wear, no carpet in high-traffic areas)?",
        recommendation:
          "Carpet in living rooms or hallways kills MTR. LVP runs $3 to $5 per square foot installed and lasts.",
      },
      {
        id: "c3",
        text: "Does the kitchen have modern fixtures, hardware, and updated cabinets or counters?",
        recommendation:
          "You do not need a remodel. Cabinet paint plus new pulls plus a faucet swap is about $800 and shows in every photo.",
      },
      {
        id: "c4",
        text: "Are the bathrooms updated (no dated tile, no chipped vanity, modern faucet)?",
        recommendation:
          "Bathrooms decide bookings more than kitchens at this stage. A single bath refresh runs $2 to $4K.",
      },
      {
        id: "c5",
        text: "Is the HVAC functional, recently serviced, with zoning or good distribution?",
        recommendation:
          "Mid-stay tenants are home all day. A hot bedroom in July gets a 3-star review. Get a service contract in place.",
      },
      {
        id: "c6",
        text: "Is there any soundproofing between bedrooms (insulated walls, solid-core doors, acoustic panels)?",
        recommendation:
          "Shared houses live or die here. Solid-core doors are about $200 each and the single best soundproofing dollar.",
      },
    ],
  },
  {
    id: "rooms",
    label: "Room Features",
    blurb: "What each bedroom needs to be a real bedroom.",
    weight: 1.33,
    questions: [
      {
        id: "r1",
        text: "Does each bedroom fit a queen bed comfortably with walking space around it?",
        recommendation:
          "Queens are the floor for furnished rentals. Anything smaller and your nightly rate drops 20 percent.",
      },
      {
        id: "r2",
        text: "Does each bedroom have a closet or wardrobe with hanging space and shelves?",
        recommendation:
          "Travel professionals pack a uniform plus civvies. No closet means no booking from a recurring guest.",
      },
      {
        id: "r3",
        text: "Does every bedroom have at least one window with natural light?",
        recommendation:
          "Interior bedrooms (no window) are not legally bedrooms in most jurisdictions. Check code before listing.",
      },
      {
        id: "r4",
        text: "Does every bedroom have smoke and CO detectors (interconnected if possible)?",
        recommendation:
          "Required by law in nearly every state. First Alert combo units are about $40 each. Do not skip this.",
      },
      {
        id: "r5",
        text: "Does every bedroom have its own door lock (privacy latch minimum)?",
        recommendation:
          "Shared-house tenants will ask. Privacy latches are about $15 each and install in 20 minutes.",
      },
    ],
  },
  {
    id: "neighborhood",
    label: "Neighborhood",
    blurb: "The block your photos cannot hide.",
    weight: 1.92,
    questions: [
      {
        id: "n1",
        text: "Is the neighborhood clean, well-maintained, and free of obvious blight?",
        recommendation:
          "Drive it on a Saturday morning. If trash is visible from your front door, your photos will show it too.",
      },
      {
        id: "n2",
        text: "Is there a park, trail, or green space within a 10-minute walk?",
        recommendation:
          "Mid-stay tenants run, walk dogs, decompress. Green space within a 10-minute walk shows up in reviews.",
      },
      {
        id: "n3",
        text: "Is the property away from heavy traffic noise (interstate, train, flight path)?",
        recommendation:
          "A house under an approach path is a 4-star ceiling no matter what you do inside.",
      },
      {
        id: "n4",
        text: "Is the neighborhood welcoming and diverse (not visibly hostile to any demographic)?",
        recommendation:
          "Travel nurses are 90 percent women, often Black or mixed-race. If your block does not welcome them, neither will the booking.",
      },
    ],
  },
  {
    id: "legal",
    label: "Legal & Compliance",
    blurb: "Low weight, but binary failures live here.",
    weight: 1.5,
    questions: [
      {
        id: "z1",
        text: "Are 30+ day rentals allowed under local zoning (no STR-only ordinance)?",
        recommendation:
          "Most cities allow a 30-day minimum without the STR permit hassle. Confirm with planning, in writing.",
      },
      {
        id: "z2",
        text: "Does your insurance cover furnished mid-term or multi-tenant use?",
        recommendation:
          "Most homeowner policies exclude it. Proper Insurance or a landlord policy with MTR endorsement runs $1,500 to $3,000 a year.",
      },
      {
        id: "z3",
        text: "Does your HOA or condo board permit furnished rentals of 30+ days?",
        recommendation:
          "Read the bylaws. HOAs killing MTR plans is the number one deal-breaker we see. Read before you buy or list.",
      },
      {
        id: "z4",
        text: "Do you have a business license or short-term lodging permit if your jurisdiction requires one?",
        recommendation:
          "Some cities require a license for stays under 90 days. Quick call to the city clerk before listing.",
      },
      {
        id: "z5",
        text: "Were property upgrades (electrical, plumbing, additions) permitted and signed off?",
        recommendation:
          "Unpermitted work voids insurance claims and can blow up a sale. If you do not know, hire an inspector.",
      },
    ],
  },
];

export const SCORECARD_QUESTION_COUNT = SCORECARD_SECTIONS.reduce(
  (acc, s) => acc + s.questions.length,
  0,
);

export const SCORECARD_MAX_SCORE = SCORECARD_SECTIONS.reduce(
  (acc, s) => acc + s.weight,
  0,
);

export const SCORECARD_QUESTION_IDS: Set<string> = new Set(
  SCORECARD_SECTIONS.flatMap((s) => s.questions.map((q) => q.id)),
);

export function getSection(id: ScorecardSectionId): ScorecardSection {
  const section = SCORECARD_SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown scorecard section: ${id}`);
  return section;
}
