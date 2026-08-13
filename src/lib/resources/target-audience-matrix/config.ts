// Target Audience Identification Matrix — reference data. Digitized from Della's
// handout: two lookup tables of co-living tenant segments. The how-to guidance
// lives in the registry's howItWorks tiles at the top of the page, not here.

export interface MatrixTable {
  id: string;
  label: string;
  columns: string[];
  rows: string[][];
  /**
   * Column rendered as the emphasized block at the bottom of each segment
   * card — the "so what" of the row. Must match a `columns` entry exactly;
   * omit for tables where no single column deserves the spotlight.
   */
  highlightColumn?: string;
}

export const SEGMENT_TABLE: MatrixTable = {
  id: "segments",
  label: "Audience segments — needs, channels & messaging",
  highlightColumn: "Messaging Strategy",
  columns: [
    "Audience Segment",
    "Demographics",
    "Psychographics",
    "Behaviors",
    "Needs & Pain Points",
    "Preferred Channels",
    "Messaging Strategy",
  ],
  rows: [
    ["Young Professionals", "25-35, $40K-$80K, urban", "Convenience, career-oriented, work-life balance", "Frequent renters, relocate for work", "Affordable, convenient housing near work with good amenities", "Social media, email", "Highlight convenience and community-focused features"],
    ["Remote Workers", "22-45, $50K-$90K, digital nomads", "Tech-savvy, value flexibility and freedom", "Long-term rentals, sometimes short leases", "High-speed internet, workspace, flexible lease terms", "Social media, LinkedIn, website", "Emphasize flexibility, Wi-Fi, and workspace"],
    ["Students", "18-24, low/loan income, near campus", "Budget-conscious, social, academic focus", "Short-term rentals, shared spaces", "Affordable housing near campus with social access", "Social media, campus ads, email", "Focus on affordability, proximity, community vibe"],
    ["Empty Nesters / Retirees", "55+, $50K+, suburban & urban", "Value safety, comfort, low change", "Long-term rentals, quiet neighborhoods", "Safety, privacy, convenience, easy maintenance", "Email, Facebook, real-estate listings", "Highlight safety, quiet, low-maintenance features"],
    ["Eco-conscious Renters", "25-45, $40K-$100K, various", "Environmentally aware, value sustainability", "Choose green-certified properties", "Eco-friendly, energy-efficient features", "Social media, website, influencers", "Promote sustainability: recycling, green spaces"],
    ["Young Families", "30-45, $50K-$100K, suburban/urban", "Family-focused, safety-conscious, community-minded", "Family-friendly spaces, long-term leases", "Nearby schools, playgrounds, safe neighborhood", "Social media, community centers, local ads", "Emphasize safety, family amenities, nearby schools"],
  ],
};

export const FIT_TABLE: MatrixTable = {
  id: "fit",
  label: "Audience fit — amenities, stay length & budget",
  columns: [
    "Audience Segment",
    "Key Need",
    "Preferred Amenities",
    "Location Preference",
    "Length of Stay",
    "Budget Range",
    "Common Interests",
  ],
  rows: [
    ["Interns", "High affordability", "Shared kitchen, Wi-Fi", "Near public transport", "Mid-term", "$800-$1,200", "Networking events"],
    ["Students", "Affordable", "Private bathrooms", "Close to campus", "Long-term", "$500-$1,000", "Social activities"],
    ["Traveling Professionals", "Convenience, privacy", "Gym, kitchen", "Near business centers", "Short-term", "$150-$300/night", "Local attractions"],
    ["Military Personnel", "Affordability, short stays", "Parking, laundry", "Near bases", "Mid-term", "$1,200-$1,800", "Outdoor activities"],
    ["Families", "Space, convenience", "Family-friendly amenities", "Schools nearby", "Long-term", "$1,800-$2,500", "Family activities"],
    ["Tourists", "Experience", "Unique stays, guided tours", "Tourist hotspots", "Short-term", "$100-$250/night", "Sightseeing"],
  ],
};

export const MATRIX_TABLES = [SEGMENT_TABLE, FIT_TABLE];
