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

/**
 * An optional "go look it up" link rendered in the section header. Most people
 * answer these from memory and guess. A link to the place that actually holds
 * the answer costs nothing and makes the score honest.
 */
export interface ScorecardSectionHelper {
  label: string;
  href: string;
  hint: string;
}

export interface ScorecardSection {
  id: ScorecardSectionId;
  label: string;
  blurb: string;
  weight: number;
  helper?: ScorecardSectionHelper;
  questions: ScorecardQuestion[];
}

const ZILLOW_HELPER = (hint: string): ScorecardSectionHelper => ({
  label: "Look it up on Zillow",
  href: "https://www.zillow.com/homes/",
  hint,
});

export const SCORECARD_SECTIONS: ScorecardSection[] = [
  {
    id: "location",
    label: "Location",
    blurb: "Where the property sits decides who can rent it.",
    weight: 4.5,
    helper: {
      label: "Open Google Maps",
      href: "https://www.google.com/maps",
      hint: "Search the address, then check what sits around it: hospitals, campuses, employers, and transit.",
    },
    questions: [
      {
        id: "l1",
        text: "Is the property within 15 minutes of a major hospital, hospital system, or medical campus?",
        recommendation:
          "Nurses, techs, and traveling healthcare staff are a reliable co-living cohort, and many want a room near work. A hospital nearby keeps your rooms filled with steady, employed tenants.",
      },
      {
        id: "l2",
        text: "Is there a college, university, or graduate program within 5 miles?",
        recommendation:
          "Students, grad students, and young university staff are prime co-living tenants. A campus nearby is a renewing pool of people who want an affordable furnished room.",
      },
      {
        id: "l3",
        text: "Are essential services (pharmacy, urgent care, grocery) within walking distance?",
        recommendation:
          "Co-living tenants live here month to month, and some do not have a car. Walkable grocery, pharmacy, and urgent care cut daily friction and help you keep rooms filled.",
      },
      {
        id: "l4",
        text: "Is the property within 10 miles of a major employment hub or corporate campus?",
        recommendation:
          "Young professionals and workforce tenants pick a room by commute. Sitting close to a major employer keeps your rooms in demand and your tenants longer.",
      },
      {
        id: "l5",
        text: "Is the surrounding crime rate considered low (county or city stats)?",
        recommendation:
          "High crime scares off tenants and raises insurance. Pull county stats. If it is a hard no, this property may not fit co-living.",
      },
      {
        id: "l6",
        text: "Is the property near a major highway, airport, or transit line?",
        recommendation:
          "Tenants without cars lean on transit, and traveling workers need airport access. Strong highway or transit links widen the pool of people who can live here.",
      },
      {
        id: "l9",
        text: "Are there already rooms for rent within a few miles you can price against?",
        recommendation:
          "Live comps tell you the real ceiling and prove somebody is actually renting rooms here. Check Furnished Finder, Roomster, SpareRoom, and local Facebook housing groups. Zero rooms listed anywhere nearby usually means no market, not an untapped one.",
      },
      {
        id: "l10",
        text: "Is the property within 15 minutes of a military base, VA campus, or large government facility?",
        recommendation:
          "Service members on orders, contractors, and VA staff rotate in on 30 to 180 day assignments and need a furnished room fast. In the Southeast that is Fort Moore, Fort Stewart, Robins, and Dobbins. A separate cohort from hospitals and campuses, and it holds up in a downturn.",
      },
      {
        id: "l11",
        text: "Does this area hold demand year round, or is it seasonal?",
        recommendation:
          "College towns go quiet from May through August. Beach and mountain markets flip the other way. Pull 12 months of local rent and vacancy data before you count on full occupancy. A market with a dead season needs a second tenant cohort or three months of reserves.",
      },
      {
        id: "l12",
        text: "Does the local economy have more than one major employer?",
        recommendation:
          "One plant, one hospital, one campus is one point of failure. If that employer cuts a shift, every room empties the same month. Look up the metro's top five employers and make sure at least two of them can fill your house on their own.",
      },
    ],
  },
  {
    id: "shared_spaces",
    label: "Shared Spaces & Operations",
    blurb: "The biggest lever. What is inside and how it runs.",
    weight: 6.0,
    helper: ZILLOW_HELPER(
      "Pull the listing and read the photos and appliance details before you answer.",
    ),
    questions: [
      {
        id: "a1",
        text: "Is there onsite laundry (in-unit washer and dryer) available to tenants?",
        recommendation:
          "Non-negotiable in a shared house. A stackable W/D runs $1,200 to $1,800 installed and pays back fast in higher rent and lower turnover.",
      },
      {
        id: "a2",
        text: "Does the kitchen have a full set of appliances (stove, fridge, microwave, dishwasher)?",
        recommendation:
          "Co-living tenants cook and share one kitchen. Missing or undersized appliances create daily friction and drive turnover in a full house.",
      },
      {
        id: "a3",
        text: "Is high-speed internet available (at least 300 Mbps download, hardwired or strong WiFi)?",
        recommendation:
          "Remote workers are half your tenant pool, and everyone shares the pipe. Run a speed test before you rent rooms. Upgrade to gig if you are under 300.",
      },
      {
        id: "a4",
        text: "Is there a dedicated workspace or desk in a quiet area of the home?",
        recommendation:
          "Remote workers take calls and students study late. A quiet desk with a real chair fills a room faster and is a top-3 photo.",
      },
      {
        id: "a5",
        text: "Is there off-street or assigned parking, one space per bedroom?",
        recommendation:
          "Most co-living tenants own a car. One spot per bedroom, or parking becomes the house's number one fight.",
      },
      {
        id: "a8",
        text: "Is there sufficient outdoor lighting around entries and walkways?",
        recommendation:
          "Tenants come and go at all hours, including night shifts. Poor lighting reads as unsafe and costs you good tenants. Motion floods are about $60 each.",
      },
      {
        id: "a9",
        text: "Is there private outdoor space (yard, patio, or balcony)?",
        recommendation:
          "A full house with no outdoor access feels claustrophobic. A small patio with a couple of chairs gives tenants somewhere to decompress.",
      },
    ],
  },
  {
    id: "layout",
    label: "Property Size & Layout",
    blurb: "Bones of the house.",
    weight: 2.25,
    helper: ZILLOW_HELPER(
      "The listing gives you beds, baths, square footage, and usually a floor plan.",
    ),
    questions: [
      {
        id: "s1",
        text: "Is there at least one bathroom per two bedrooms?",
        recommendation:
          "Below one bath per two bedrooms and the morning fight starts week one. A half-bath costs $7 to $15K but raises how many rooms you can rent.",
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
          "Anything smaller reads as a dorm. Queen plus nightstand plus desk is the minimum a paying tenant expects.",
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
    helper: ZILLOW_HELPER(
      "Interior photos and year built tell you most of this. Check the price history for a recent renovation.",
    ),
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
          "Carpet in shared living areas and hallways wears out fast with a full house. LVP runs $3 to $5 per square foot installed and takes the traffic.",
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
          "Bathrooms decide whether a room rents more than kitchens do. A single bath refresh runs $2 to $4K.",
      },
      {
        id: "c5",
        text: "Is the HVAC functional, recently serviced, with zoning or good distribution?",
        recommendation:
          "Tenants are home all day, every day. A hot bedroom in July is the fastest way to lose a good one. Get a service contract in place.",
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
    helper: ZILLOW_HELPER(
      "Work through the bedroom photos and the floor plan one room at a time.",
    ),
    questions: [
      {
        id: "r2",
        text: "Does each bedroom have a closet or wardrobe with hanging space and shelves?",
        recommendation:
          "A tenant living here for months needs real storage. No closet means the room sits empty or rents at a discount.",
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
    helper: ZILLOW_HELPER(
      "Use the neighborhood tab and street view. Then drive it yourself before you sign anything.",
    ),
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
          "Tenants living here for months run, walk dogs, and decompress. Green space within a 10-minute walk helps you keep rooms filled.",
      },
      {
        id: "n3",
        text: "Is the property away from heavy traffic noise (interstate, train, flight path)?",
        recommendation:
          "A house under an approach path caps the rent you can charge no matter what you do inside.",
      },
      {
        id: "n4",
        text: "Is the neighborhood welcoming and diverse (not visibly hostile to any demographic)?",
        recommendation:
          "Co-living tenants span ages, backgrounds, and races. If your block is not welcoming to all of them, you shrink your pool and your rents.",
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
          "Most cities allow 30-day-plus leases without STR permits, but plenty still write the rule as STR-only. Confirm the duration rule with planning, in writing. Ask about the unrelated-adult occupancy cap on the same call: most cities allow two to five, and a five-room house in a three-adult city is a violation on day one that no amount of finish work fixes.",
      },
      {
        id: "z2",
        text: "Does your insurance cover furnished mid-term or multi-tenant use?",
        recommendation:
          "Most homeowner policies exclude multi-tenant use. A landlord or dwelling policy with a co-living or rooming-house endorsement runs $1,500 to $3,000 a year.",
      },
      {
        id: "z3",
        text: "Does your HOA or condo board permit furnished rentals of 30+ days?",
        recommendation:
          "Read the bylaws. HOAs banning room rentals or unrelated occupants are the number one deal-breaker we see. Read before you buy or rent rooms.",
      },
      {
        id: "z4",
        text: "Do you have a business license or short-term lodging permit if your jurisdiction requires one?",
        recommendation:
          "Some cities require a license for stays under 90 days. Quick call to the city clerk before listing.",
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
