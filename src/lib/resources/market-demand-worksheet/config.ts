// Market Demand Worksheet — data model. Digitized from Della's "Market Demand
// Worksheet: Co-Living Property Analysis" handout. Five research dimensions,
// each a set of indicators with a guiding question, why it matters, and where
// to pull the data. The operator records findings against each one, then writes
// a go / no-go summary.

export interface DemandIndicator {
  id: string;
  indicator: string;
  question: string;
  why: string;
  sources: string;
}

export interface DemandSection {
  id: string;
  label: string;
  indicators: DemandIndicator[];
}

export const DEMAND_SECTIONS: DemandSection[] = [
  {
    id: "demographic",
    label: "Demographic Fit",
    indicators: [
      { id: "d_young", indicator: "Young adults (22-40)", question: "What percent of the population is aged 22 to 40?", why: "This group is most inclined toward shared living for affordability and community.", sources: "data.census.gov" },
      { id: "d_income", indicator: "Median income", question: "Is the average income roughly $30K to $70K a year?", why: "Tells you whether the target renter can afford co-living rents.", sources: "datausa.io" },
      { id: "d_students", indicator: "Student population", question: "Are there major colleges nearby, and how large is enrollment?", why: "Students are a core room-rental demographic.", sources: "nces.ed.gov/collegenavigator" },
      { id: "d_single", indicator: "Single-person households", question: "What percent of households are single individuals?", why: "A higher rate signals interest in shared living for cost and connection.", sources: "censusreporter.org" },
      { id: "d_employment", indicator: "Employment sector", question: "Are many residents in service, tech, or gig jobs?", why: "These sectors skew younger and more transient.", sources: "bls.gov" },
      { id: "d_growth", indicator: "Population growth rate", question: "Is the 22-40 population growing or shrinking?", why: "Indicates whether demand is sustainable.", sources: "worldpopulationreview.com" },
      { id: "d_renters", indicator: "Renters vs. owners", question: "What percent of the area rents vs. owns?", why: "More renters means a market more receptive to co-living.", sources: "censusreporter.org" },
    ],
  },
  {
    id: "housing",
    label: "Housing Market Conditions",
    indicators: [
      { id: "h_vacancy", indicator: "Vacancy rate", question: "Is the rental vacancy rate below 7%?", why: "Low vacancy signals a tight market with room for more supply.", sources: "fred.stlouisfed.org" },
      { id: "h_trend", indicator: "Rental price trend (YoY)", question: "How have average rents moved over the past year?", why: "Stable or rising rents signal demand; falling rents signal oversupply.", sources: "zumper.com/research" },
      { id: "h_inventory", indicator: "Mid-size rental inventory", question: "Are 3 to 6 bedroom homes regularly available to rent?", why: "Larger homes are what make room-by-room co-living feasible.", sources: "zillow.com" },
      { id: "h_zoning", indicator: "Zoning for shared housing", question: "Any zoning restrictions on room rentals or co-living?", why: "Zoning can limit your ability to rent by the room legally.", sources: "local planning/zoning office" },
      { id: "h_development", indicator: "Recent development activity", question: "New multifamily or single-family development nearby?", why: "New building signals population growth and demand.", sources: "redfin.com/news/data-center" },
      { id: "h_turnover", indicator: "Rental turnover rate", question: "How often do tenants move out in this area?", why: "High turnover can reflect strong demand or instability.", sources: "Census ACS" },
      { id: "h_rentcontrol", indicator: "Rent control or caps", question: "Any policies limiting rent growth?", why: "Rent control caps your income potential and ROI.", sources: "local housing authority" },
      { id: "h_sharedrent", indicator: "Avg. rent for shared housing", question: "What is the average rent per private room in a shared home?", why: "Sets a competitive, profitable price for your rooms.", sources: "rentometer.com" },
    ],
  },
  {
    id: "demand",
    label: "Rental Demand Signals",
    indicators: [
      { id: "s_search", indicator: "Search activity", question: "Are people searching 'room for rent' here on Google/Facebook?", why: "High search volume shows real market interest.", sources: "trends.google.com" },
      { id: "s_listings", indicator: "'Room for rent' listings", question: "How many room-for-rent listings post weekly?", why: "Higher volume signals an active market segment.", sources: "craigslist.org" },
      { id: "s_forums", indicator: "Forums & discussions", question: "Are renters discussing shared housing on Reddit or local forums?", why: "Informal chatter is a demand signal among young adults.", sources: "Reddit, City-Data" },
      { id: "s_waitlists", indicator: "Public housing waitlists", question: "Are public/subsidized housing options backed up?", why: "Long waitlists push people toward private shared options.", sources: "hud.gov, local authorities" },
      { id: "s_facebook", indicator: "Facebook groups & listings", question: "Are there active rental groups on Facebook Marketplace?", why: "Active communities signal a vibrant shared-housing market.", sources: "facebook.com/marketplace" },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Amenities",
    indicators: [
      { id: "l_transit", indicator: "Work & transit access", question: "Large employers, transit, or universities nearby?", why: "Access to jobs and transit raises a property's appeal.", sources: "city-data.com" },
      { id: "l_cafes", indicator: "Cafes & coffee shops", question: "Multiple coffee shops within walking distance?", why: "Young renters value them as social and remote-work spaces.", sources: "walkscore.com" },
      { id: "l_grocery", indicator: "Grocery access", question: "A grocery store within a 10-minute walk or drive?", why: "Daily-need access boosts livability.", sources: "google.com/maps" },
      { id: "l_fitness", indicator: "Fitness centers", question: "Accessible gyms nearby?", why: "Appeals to health-conscious tenants.", sources: "yelp.com" },
      { id: "l_coworking", indicator: "Co-working spaces", question: "Co-working available for remote workers?", why: "Remote workers and nomads prioritize this.", sources: "coworker.com" },
      { id: "l_walk", indicator: "Walkability score", question: "What is the neighborhood's walkability score?", why: "Higher walkability raises desirability and rent.", sources: "walkscore.com" },
      { id: "l_safety", indicator: "Safety & crime rate", question: "Is the area considered safe by crime data and reviews?", why: "Safety drives livability and long-term retention.", sources: "neighborhoodscout.com" },
    ],
  },
  {
    id: "competition",
    label: "Competition Assessment",
    indicators: [
      { id: "c_price", indicator: "Price comparison", question: "What is the average per-room rate for shared housing here?", why: "Positions your rooms competitively and validates income potential.", sources: "facebook.com/marketplace" },
      { id: "c_differentiator", indicator: "Unique differentiator", question: "What will make your space stand out locally?", why: "A clear value prop reduces vacancy and justifies premium pricing.", sources: "Airbnb, PadSplit, FB" },
      { id: "c_operators", indicator: "Number of co-living operators", question: "How many established co-living operators are here?", why: "Shows how saturated or open the market is.", sources: "Airbnb, PadSplit, Roomi" },
      { id: "c_occupancy", indicator: "Occupancy of shared units", question: "What is the average occupancy of nearby shared rentals?", why: "High occupancy suggests strong demand or low supply.", sources: "AirDNA" },
      { id: "c_quality", indicator: "Competitor listing quality", question: "Do competitor listings look professional and complete?", why: "Poor listings are an opening for you to stand out.", sources: "Airbnb, Zillow, Furnished Finder" },
      { id: "c_amenities", indicator: "Amenities offered", question: "Do competitors offer furniture, cleaning, Wi-Fi, perks?", why: "Tells you what you must match or beat.", sources: "competitor listings" },
      { id: "c_length", indicator: "Length-of-stay rules", question: "Do listings allow flexible stays?", why: "Flexibility can be a differentiator by tenant type.", sources: "Airbnb, Roomster" },
      { id: "c_brands", indicator: "Branded co-living presence", question: "Are Common, Bungalow, or similar operating here?", why: "Big brands mean high demand or tough competition.", sources: "common.com, bungalow.com" },
      { id: "c_reviews", indicator: "Competitor reviews", question: "What do reviews say about competing listings?", why: "Reviews reveal service gaps you can win on.", sources: "Airbnb, Google, Yelp" },
    ],
  },
];

export const DEMAND_ALL_INDICATORS = DEMAND_SECTIONS.flatMap((s) => s.indicators);
