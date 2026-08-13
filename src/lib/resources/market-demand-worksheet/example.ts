// Completed example for the Market Demand Worksheet — Della's worked analysis
// of a Charlotte, NC (28211 / Cotswold) market from the original handout.
// Rendered read-only in the tool via the "See a completed example" toggle so
// members can see what a correct, finished worksheet looks like. Keys must
// match the indicator ids in ./config.ts exactly.

export const EXAMPLE_ADDRESS = "1719 Shoreham Dr, Charlotte, NC 28211";

export const EXAMPLE_BANNER =
  "A completed example: Della's market analysis for a Charlotte, NC address. It's read-only — your own entries are saved and untouched.";

export const EXAMPLE_FINDINGS: Record<string, string> = {
  // Demographic Fit
  d_young:
    "About 34% of the 28211 ZIP population is aged 22 to 40 — the group most inclined toward co-living for affordability and social opportunity.",
  d_income:
    "Median household income in 28211 is roughly $208,511 — well above the $30K–$70K band. Premium co-living is affordable here, but some residents will prefer traditional housing.",
  d_students:
    "No major campus on the doorstep, but several colleges and universities are within reach of the area (served by Myers Park High School). Students are a secondary demand source, not the core.",
  d_single:
    "About 30% of households are single individuals — a meaningful base of renters who trade a whole apartment for a well-run room plus community.",
  d_employment:
    "The area sits near Uptown Charlotte, a hub for finance, healthcare, and professional services. Proximity to major employment centers drives demand for nearby flexible housing.",
  d_growth:
    "Charlotte has posted steady population growth for years, including young professionals relocating for work — demand should be sustainable, not a one-time spike.",
  d_renters:
    "Only about 25% of households are renter-occupied. Fewer renters than a downtown ZIP, but that also means less rental competition; demand concentrates in the few well-located rentals.",

  // Housing Market Conditions
  h_vacancy:
    "Approximately 6.2% in the submarket (HUD 2023) — under the 7% threshold, which supports a strong occupancy outlook.",
  h_trend:
    "Rents are up about 4.5% year over year. An upward trend supports income potential and signals demand, not oversupply.",
  h_inventory:
    "Healthy inventory of 3–4 bedroom homes on Zillow, and several 4–5 bedroom homes available in the Cotswold area — enough supply to acquire or lease for a room-by-room strategy.",
  h_zoning:
    "Zoning appears residential (R-3); room rental is allowed with owner occupancy or a special exception. Favorable, with limited barriers — confirm specifics with the county planning office.",
  h_development:
    "New development within 1–2 miles, mostly high-end multifamily. Nearby building activity signals growing housing demand in the corridor.",
  h_turnover:
    "Moderate turnover — rental listings refresh every 30 to 60 days. Consistent demand without signs of saturation or instability.",
  h_rentcontrol:
    "No rent control in North Carolina; pricing is market-driven, so room rates can be optimized to demand.",
  h_sharedrent:
    "$900–$1,200/month per private room based on Craigslist and Facebook listings, typically furnished with utilities included. In line with co-living affordability goals.",

  // Rental Demand Signals
  s_search:
    "Google Trends shows moderate-to-high interest in 'room for rent' searches for the Charlotte area — consistent search activity, not a one-off spike.",
  s_listings:
    "An estimated 25–40 active listings for private rooms in shared homes at any time, with new posts weekly. An active segment without oversaturation.",
  s_forums:
    "Threads on r/Charlotte regularly discuss housing availability and shared living — informal chatter confirms localized renter demand and gaps.",
  s_waitlists:
    "Charlotte Housing Authority carries multi-month waitlists for subsidized housing. That backlog funnels renters toward private shared options.",
  s_facebook:
    "Multiple active groups like 'Charlotte Rooms for Rent' with daily posts, plus steady Marketplace activity — a vibrant room-rental community.",

  // Lifestyle & Amenities
  l_transit:
    "CATS bus stops within walking distance and roughly a 15-minute ride to Uptown — workable for non-driving tenants and urban commuters.",
  l_cafes:
    "Multiple coffee shops (Starbucks plus local cafés) within a mile — social and remote-work space for younger renters.",
  l_grocery:
    "Harris Teeter and Trader Joe's are under 10 minutes away by car — daily-need access that boosts livability.",
  l_fitness:
    "YMCA, Orangetheory, and other gyms within 2 miles — supports the health-conscious tenant profile.",
  l_coworking:
    "CoCoTiv and other co-working spaces about 15 minutes away — enough to attract remote professionals and entrepreneurs.",
  l_walk:
    "Walk Score of 44 — car-dependent. The main lifestyle weakness; most tenants will need a vehicle or bike.",
  l_safety:
    "Considered a safe, family-friendly neighborhood with low crime rates — supports peace of mind and long-term tenant retention.",

  // Competition Assessment
  c_price:
    "Most rooms rent for $850–$1,200/month furnished with utilities included — attainable for working professionals and a validated income range.",
  c_differentiator:
    "Cleaning service, community events, and responsive maintenance support. Value-added services like these can command higher rents than the informal listings nearby.",
  c_operators:
    "Mostly individual landlords; no branded co-living operators observed nearby. Real opportunity to be the first branded, professional operator.",
  c_occupancy:
    "High occupancy reported for affordable shared units in the area — consistently full units reflect healthy demand.",
  c_quality:
    "Listings range from basic to semi-professional; few show branding or perks. Better photos and a complete listing are a low-cost way to stand out.",
  c_amenities:
    "Amenities vary widely — few competitors offer regular cleaning or community perks. Bundling cleaning, Wi-Fi, and events would clearly beat the field.",
  c_length:
    "Mix of 6-month and 12-month leases with some flexibility noted. Offering flexible stays (e.g., 3-month minimums) broadens the tenant base.",
  c_brands:
    "No Common, Bungalow, or similar branded operators active in the area — space to build a local identity before the big brands arrive.",
  c_reviews:
    "Many listings have few or no reviews, or mixed guest feedback — room to win on tenant experience and service delivery.",
};

export const EXAMPLE_SUMMARY =
  "1719 Shoreham Dr, Charlotte, NC shows strong market potential for co-living. The surrounding area has a favorable demographic of young adults (34%) and highly educated residents, indicating demand for upscale shared housing. The rental market is healthy: 6.2% vacancy, steady 4.5% rent growth, and good availability of large multi-bedroom homes. Demand signals are strong — rooms typically rent within 1 to 2 weeks, and Facebook Marketplace and Craigslist show high engagement. Lifestyle fit is ideal: gyms, cafes, transit, and a safe neighborhood all align with what co-living tenants want. Competition is minimal and mostly informal, leaving room for a branded, hospitality-forward offering with furnished rooms, shared services, and community perks. GO. Recommended action: secure a 4–5 bedroom home, price rooms at $950–$1,100/month, and market to professionals and medical staff seeking flexible, well-managed housing.";

export const EXAMPLE_STATE = {
  address: EXAMPLE_ADDRESS,
  findings: EXAMPLE_FINDINGS,
  summary: EXAMPLE_SUMMARY,
};
