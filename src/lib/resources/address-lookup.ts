// Shared shape for the address autofill.
//
// Lives here rather than in the route because Next validates what a route file
// may export, and because the client component needs the type without pulling
// the handler into its module graph.

export interface AddressCandidate {
  street: string;
  city: string;
  state: string;
  zip: string;
  /** The geocoder's own one-line rendering, for display in the picker. */
  label: string;
}

export interface AddressLookupResponse {
  candidates: AddressCandidate[];
  /** More matched than we render — a signal to narrow, not a list to scroll. */
  truncated: boolean;
  total: number;
  /** "osm" for a street-only search, "census" once a city/state/ZIP narrows it. */
  source: "osm" | "census";
}

/**
 * Full state name to postal code. OpenStreetMap returns "Georgia" where the
 * Census geocoder returns "GA", and the State field should read the same
 * whichever service answered.
 */
export const STATE_ABBR: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  "district of columbia": "DC",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "puerto rico": "PR",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};
