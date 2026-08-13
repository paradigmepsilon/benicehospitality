import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import { addressLookupLimiter, getClientIp } from "@/lib/rate-limit";
import { STATE_ABBR } from "@/lib/resources/address-lookup";
import type { AddressCandidate } from "@/lib/resources/address-lookup";

// Address autofill for the Co-Living Property Profitability Analysis Worksheet.
//
// TWO PROVIDERS, because neither one alone does the job. Both are free, public,
// and keyless.
//
//   Street alone            -> Nominatim (OpenStreetMap)
//   Street + city/state/ZIP -> US Census Bureau geocoder
//
// Measured against both live services:
//
//   query                              census      nominatim
//   "6470 Church St"                   0 matches   9 unique US candidates
//   "6470 Church St, 30134"            1 exact     not asked
//   "6470 Church St, Douglasville GA"  1 exact     not asked
//
// The split is decided by that first row alone: Census cannot search on a
// street without a city or ZIP, and searching on a street alone is the point of
// the feature. Nominatim can, and returns every US match for the picker.
//
// Census stays the provider once something narrows the query, because it holds
// the complete US address ranges and can interpolate a house number nobody has
// ever mapped, where OSM only knows addresses a human entered. Picking a
// Nominatim candidate lands its city and ZIP in the fields, so any later lookup
// takes the Census path anyway.
//
// WHAT NEITHER CAN DO: bedrooms, square footage, rent estimates, Walk Score.
// Not available from any source we can legally read — Zillow retired its public
// API in 2021, Bridge Interactive is gated behind MLS partner approval, and
// scraping either violates their terms. Those fields need a paid provider
// (Walk Score, Rentcast, ATTOM) and a decision to pay for one. Until then the
// tool asks for them, which is honest, rather than guessing.
//
// Proxied server-side rather than called from the browser: it keeps the
// member's typed address out of a cross-origin request they did not initiate,
// lets us rate limit, and means an outage degrades in one place.
//
// NOMINATIM IS A DONATED COMMUNITY SERVICE. Its usage policy allows this shape
// of use — a single lookup behind a button, an identifying User-Agent, well
// under 1 request/second — but explicitly not type-ahead or bulk querying. If
// this tool ever gets heavy traffic, the honest move is a paid geocoder or a
// self-hosted instance, not more requests.

const CENSUS_ENDPOINT = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
/** Nominatim's policy requires a real identifying agent with a contact. */
const USER_AGENT = "BeNiceHospitality-Worksheet/1.0 (+https://benicehospitality.com)";

/**
 * A street-only search legitimately returns nine or ten across the country, and
 * the member's property has to be visible in that list or the feature has not
 * done anything. Eight one-line buttons is still a glance, not a scroll.
 */
const MAX_CANDIDATES = 8;
/** Both services are occasionally slow; a hung fetch must not hold a route open. */
const TIMEOUT_MS = 7000;

/**
 * Only the locality fields are read. The house-number and street-name parts of
 * `addressComponents` are deliberately absent from this interface — see
 * `fromCensus` for why touching them produces a wrong address.
 */
interface CensusComponents {
  city?: string;
  state?: string;
  zip?: string;
}

interface CensusMatch {
  matchedAddress?: string;
  addressComponents?: CensusComponents;
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

interface NominatimMatch {
  address?: NominatimAddress;
}

/** Title Case. Census shouts everything back in caps. */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    // Directionals read wrong in Title Case.
    .replace(/\b(Nw|Ne|Sw|Se)\b/g, (m) => m.toUpperCase());
}

function label(c: Omit<AddressCandidate, "label">): string {
  const tail = [c.city, [c.state, c.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [c.street, tail].filter(Boolean).join(", ");
}

/**
 * `matchedAddress` is the ONLY field carrying the real house number.
 *
 * `addressComponents.fromAddress` and `toAddress` are the endpoints of the
 * TIGER block range the address sits in, not the address itself. An earlier
 * version of this function assembled the street from `fromAddress`, so every
 * result rendered as the low end of its own block:
 *
 *   typed                    fromAddress   matchedAddress
 *   540 Hutchens Rd SE       500           540 HUTCHENS RD SE   (range 500-598)
 *   6470 Church St           6450          6470 CHURCH ST       (range 6450-6498)
 *   233 S Wacker Dr          201           233 S WACKER DR      (range 201-299)
 *
 * The match was correct in all three; the number shown was not. It only ever
 * looked right when a building sat at the start of its block, which is how the
 * bug survived testing on 1600 Pennsylvania Ave.
 *
 * So the street line comes from `matchedAddress` and only the locality fields
 * come from the components, where they are clean and unambiguous. No
 * `matchedAddress` means no trustworthy house number: drop the candidate rather
 * than offer one whose number is a guess.
 */
function fromCensus(m: CensusMatch): AddressCandidate | null {
  // "540 HUTCHENS RD SE, ATLANTA, GA, 30354" — street, city, state, zip.
  const parts = (m.matchedAddress ?? "").split(",").map((p) => p.trim());
  const street = parts[0] ?? "";
  if (!street) return null;
  const c = m.addressComponents ?? {};
  const base = {
    street: titleCase(street),
    city: titleCase((c.city || parts[1] || "").trim()),
    state: (c.state || parts[2] || "").trim().toUpperCase(),
    zip: (c.zip || parts[3] || "").trim(),
  };
  return { ...base, label: label(base) };
}

function fromNominatim(m: NominatimMatch): AddressCandidate | null {
  const a = m.address;
  if (!a?.road) return null;
  const street = [a.house_number, a.road].filter(Boolean).join(" ").trim();
  if (!street) return null;
  const city = a.city || a.town || a.village || a.hamlet || a.municipality || "";
  // OSM gives the full state name; Census gives the code. Normalize to the code
  // so the State field reads the same whichever provider answered.
  const stateRaw = (a.state ?? "").trim();
  const base = {
    street,
    city: city.trim(),
    state: STATE_ABBR[stateRaw.toLowerCase()] ?? stateRaw.slice(0, 2).toUpperCase(),
    zip: (a.postcode ?? "").trim(),
  };
  return { ...base, label: label(base) };
}

/** OSM routinely returns the same address twice from different objects. */
function dedupe(list: AddressCandidate[]): AddressCandidate[] {
  const seen = new Set<string>();
  const out: AddressCandidate[] = [];
  for (const c of list) {
    const key = `${c.street}|${c.city}|${c.state}|${c.zip}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function str(v: unknown, max = 120): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json", ...headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.json();
}

export async function POST(request: Request) {
  // The worksheet is account-gated, so this is too. An open geocoding proxy is
  // someone else's donated capacity being spent through our domain.
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!addressLookupLimiter.check(getClientIp(request)).success) {
    return NextResponse.json(
      { error: "Too many lookups. Wait a moment and try again." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const street = str(body.street);
  const city = str(body.city, 80);
  const state = str(body.state, 40);
  const zip = str(body.zip, 12);

  if (street.length < 3) {
    return NextResponse.json({ error: "Enter a street address first." }, { status: 400 });
  }

  const narrowed = Boolean(city || state || zip);
  let candidates: AddressCandidate[] = [];

  try {
    if (narrowed) {
      const oneLine = [street, city, [state, zip].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");
      const json = (await getJson(
        `${CENSUS_ENDPOINT}?address=${encodeURIComponent(oneLine)}&benchmark=Public_AR_Current&format=json`,
      )) as { result?: { addressMatches?: CensusMatch[] } };
      candidates = (json.result?.addressMatches ?? [])
        .map(fromCensus)
        .filter((c): c is AddressCandidate => c !== null);
    } else {
      const json = (await getJson(
        `${NOMINATIM_ENDPOINT}?q=${encodeURIComponent(street)}&countrycodes=us&addressdetails=1&limit=10&format=jsonv2`,
        { "User-Agent": USER_AGENT },
      )) as NominatimMatch[];
      candidates = (Array.isArray(json) ? json : [])
        .map(fromNominatim)
        .filter((c): c is AddressCandidate => c !== null);
    }
  } catch (err) {
    console.error("[address-lookup] upstream failed:", err);
    // Never a 500. The lookup is a convenience; typing the address by hand is
    // always still available, and the copy says so.
    return NextResponse.json(
      { error: "Lookup is unavailable right now. Fill the fields in by hand." },
      { status: 503 },
    );
  }

  const unique = dedupe(candidates);

  return NextResponse.json({
    candidates: unique.slice(0, MAX_CANDIDATES),
    truncated: unique.length > MAX_CANDIDATES,
    total: unique.length,
    /**
     * Which service answered. The client uses it for one honest sentence when a
     * street-only search finds nothing: OSM coverage is patchy, and adding a ZIP
     * moves the query onto the complete Census data rather than being a
     * pointless retry of the same question.
     */
    source: narrowed ? "census" : "osm",
  });
}
