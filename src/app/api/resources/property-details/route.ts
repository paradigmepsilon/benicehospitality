import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import { propertyDetailsLimiter, getClientIp } from "@/lib/rate-limit";
import {
  ALL_DETAIL_FIELDS,
  sanitizeDetails,
  type DetailSource,
  type PropertyDetailField,
  type PropertyDetails,
  type PropertyDetailsResponse,
} from "@/lib/resources/property-details";
import {
  getCachedDetails,
  putCachedDetails,
  type CachedDetails,
} from "@/lib/resources/property-detail-cache";

// Web-grounded property lookup: Gemini + Google Search grounding.
//
// WHY THIS AND NOT AN API. There is no free source for bedrooms, bathrooms or
// square footage. Zillow retired its public API in 2021 and forbids scraping;
// Bridge Interactive needs MLS partner approval; Google sells no residential
// attribute data. The paid aggregators (Rentcast, ATTOM) do have it. This route
// is the third path: Google runs the search, the model reads what the public
// pages surface, and we keep the citations. No scraper to maintain and no ToS
// violation, because Google is doing the page-reading through its own product.
//
// TWO THINGS MEASURED THE HARD WAY, both encoded below.
//
// 1. DEMANDING JSON SUPPRESSES THE SEARCH. A prompt ending "reply ONLY with
//    JSON" came back with zero grounding chunks — the model answered from
//    memory. Two models asked the same ungrounded question returned Walk Score
//    18 and Walk Score 70 for the same address. So the prompt tells it to
//    search first and puts the JSON in a fenced block at the END, and the
//    handler REFUSES the answer if no grounding chunks came back.
//
// 2. "DO NOT GUESS" IS LOAD-BEARING. With it, a grounded run returned null for
//    most fields and one rent figure it had actually read. Without it, the same
//    model fills every field confidently and some of it is invented. Fewer
//    numbers that are real beats a full form that is fiction — this output ends
//    up in front of a lender.
//
// Everything returned is an ESTIMATE WITH A CITATION. The client marks each
// filled field as such, never overwrites something the member typed, and shows
// the sources. Google's grounding terms also require displaying their Search
// Suggestions markup, which is passed through as searchSuggestionHtml.

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
/**
 * Overridable because Google retires model ids without much warning — both
 * gemini-2.5-flash and gemini-2.0-flash already 404 for new keys. The
 * "-latest" alias is the one that keeps resolving.
 */
const MODEL = process.env.GEMINI_PROPERTY_MODEL || "gemini-flash-latest";
const TIMEOUT_MS = 30_000;

interface GroundingChunk {
  web?: { title?: string; uri?: string };
}

/** What to ask for, per field. Only the requested ones reach the prompt. */
const FIELD_ASKS: Record<PropertyDetailField, string> = {
  bedrooms: "the number of bedrooms (listing sites or county assessor records)",
  bathrooms: "the number of bathrooms (listing sites or county assessor records)",
  squareFeet: "the finished square footage (listing sites or county assessor records)",
  // Named sources because a bare "its Walk Score" made the model run one search
  // and stop. Listing pages print all three and are indexed; walkscore.com's own
  // per-address pages are not, which is why the form also links straight to them.
  walkScore: "its Walk Score (walkscore.com, or a Redfin/Zillow/Realtor listing page, which print it)",
  transitScore: "its Transit Score (same sources)",
  bikeScore: "its Bike Score (same sources)",
  oneBedroomRent: "the typical monthly rent for a 1-bedroom apartment in that ZIP code",
  wholeHouseRent: "an estimated whole-house monthly rent for a property that size in that area",
};

/**
 * The prompt asks ONLY for fields the member left blank.
 *
 * Anything they typed is treated as true and never looked up — it is their
 * property and they know it better than a search result does. It also makes the
 * lookup cheaper and faster: fewer fields means fewer searches, and searches
 * are both the billable event and the twenty seconds of waiting.
 */
function buildPrompt(address: string, fields: PropertyDetailField[]): string {
  const asks = fields.map((f) => `- ${FIELD_ASKS[f]}`).join("\n");
  const skeleton = `{${fields.map((f) => `"${f}":null`).join(",")}}`;
  return `Search the web for the US residential property at "${address}" and for rental market data in its ZIP code.

Find, if published anywhere:
${asks}

Rules:
- Search before answering. Use only figures you actually saw on a page.
- Do NOT guess, infer, average, or carry over a number from a similar property. If you did not read it, it is null.
- A score published for the surrounding neighbourhood, the city, or a different house on the same street is NOT this property's score. Return null instead.
- Prefer the specific property over the neighbourhood for bedrooms, bathrooms and square footage. Prefer the ZIP or city for rent figures.
- Rents are monthly US dollars, digits only.
- Report ONLY the fields listed above. Nothing else is wanted.

Write one short paragraph saying what you found and what you could not, then end your reply with a fenced json block and nothing after it:
\`\`\`json
${skeleton}
\`\`\``;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  if (!key) {
    // Not an error state for the member — the feature is simply off.
    return NextResponse.json({ error: "Lookup is not configured.", unavailable: true }, { status: 501 });
  }

  if (!propertyDetailsLimiter.check(getClientIp(request)).success) {
    return NextResponse.json(
      { error: "Too many lookups. Wait a minute and try again." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    address?: unknown;
    fields?: unknown;
  } | null;
  const address = typeof body?.address === "string" ? body.address.trim().slice(0, 200) : "";
  if (address.length < 8) {
    return NextResponse.json({ error: "Find the address first." }, { status: 400 });
  }

  // Absent means "everything", which keeps the endpoint usable on its own; the
  // client always sends the blank ones.
  const requested = Array.isArray(body?.fields)
    ? ALL_DETAIL_FIELDS.filter((f) => (body.fields as unknown[]).includes(f))
    : ALL_DETAIL_FIELDS;
  if (requested.length === 0) {
    return NextResponse.json({ error: "Nothing left to look up." }, { status: 400 });
  }

  // CACHE FIRST. A cached null counts as an answer, which is the point: an
  // address with no published listing is the most expensive thing to look up
  // repeatedly and the least likely to change. Only fields nobody has ever
  // searched for this address reach the model. See property-detail-cache.ts,
  // including the note on the Gemini terms this knowingly departs from.
  let cached: CachedDetails | null = null;
  try {
    cached = await getCachedDetails(address);
  } catch (err) {
    // A cache miss is always survivable; a cache outage must not take the
    // feature down with it.
    console.error("[property-details] cache read failed:", err);
  }

  const stillNeeded = cached
    ? requested.filter((f) => !cached.searched.includes(f))
    : requested;

  if (cached && stillNeeded.length === 0) {
    const fromCache: PropertyDetails = { ...cached.details };
    for (const f of ALL_DETAIL_FIELDS) {
      if (!requested.includes(f)) fromCache[f] = null;
    }
    return NextResponse.json({
      details: fromCache,
      sources: cached.sources.slice(0, 8),
      notes: cached.notes,
      cached: true,
    } satisfies PropertyDetailsResponse);
  }

  /**
   * Whatever the cache already holds for the requested fields.
   *
   * Also the answer when the live call fails. A partial result the member can
   * use beats an error banner over fields we already know, so both the network
   * failure and the ungrounded refusal fall back to this rather than throwing
   * away good cached values.
   */
  function cachedOnly(): PropertyDetails {
    const out = sanitizeDetails(null);
    if (!cached) return out;
    for (const f of requested) {
      if (cached.searched.includes(f)) out[f] = cached.details[f];
    }
    return out;
  }
  const haveSomethingCached = cached !== null && requested.some((f) => cached.searched.includes(f));

  let text = "";
  let chunks: GroundingChunk[] = [];

  try {
    const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      body: JSON.stringify({
        // stillNeeded, not requested: anything the cache has already answered
        // is not worth a search, and a shorter ask means fewer searches and
        // less waiting.
        contents: [{ parts: [{ text: buildPrompt(address, stillNeeded) }] }],
        // Snake case also works; camel is what the current docs use.
        tools: [{ googleSearch: {} }],
      }),
    });
    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        groundingMetadata?: { groundingChunks?: GroundingChunk[] };
      }>;
    };
    const cand = json.candidates?.[0];
    text = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("");
    chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  } catch (err) {
    console.error("[property-details] gemini failed:", err);
    if (haveSomethingCached) {
      return NextResponse.json({
        details: cachedOnly(),
        sources: cached!.sources.slice(0, 8),
        notes: cached!.notes,
        cached: true,
      } satisfies PropertyDetailsResponse);
    }
    return NextResponse.json(
      { error: "Lookup is unavailable right now. Enter the numbers by hand." },
      { status: 503 },
    );
  }

  // The guard that makes this feature honest. No grounding chunks means the
  // model did not search and is answering from memory — which is exactly how
  // it produced two different Walk Scores for one address in testing. Refuse
  // rather than pass unsourced numbers off as a lookup result. Nothing is
  // written to the cache either: an ungrounded answer must not become the
  // stored answer for the next member.
  if (chunks.length === 0) {
    if (haveSomethingCached) {
      return NextResponse.json({
        details: cachedOnly(),
        sources: cached!.sources.slice(0, 8),
        notes: cached!.notes,
        cached: true,
      } satisfies PropertyDetailsResponse);
    }
    return NextResponse.json(
      { error: "Could not find sources for that address. Enter the numbers by hand.", ungrounded: true },
      { status: 422 },
    );
  }

  const match = text.match(/```json\s*([\s\S]*?)```/);
  let parsed: unknown = null;
  if (match) {
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      parsed = null;
    }
  }

  const sources: DetailSource[] = [];
  const seen = new Set<string>();
  for (const c of chunks) {
    const title = c.web?.title?.trim();
    const uri = c.web?.uri?.trim();
    if (!title || !uri || seen.has(title)) continue;
    seen.add(title);
    sources.push({ title, uri });
  }

  // Blank out anything not asked for, so a chatty model cannot slip a value
  // into a field the member has already answered.
  const fresh = sanitizeDetails(parsed);
  for (const f of ALL_DETAIL_FIELDS) {
    if (!stillNeeded.includes(f)) fresh[f] = null;
  }

  const notes = text.replace(/```json[\s\S]*?```/g, "").trim().slice(0, 600);

  // Store before responding. Fields that came back null are stored too — a
  // confirmed "nothing published" is the answer most worth not paying for
  // twice, and `searched` is what lets the next call tell it apart from a
  // field nobody has asked about yet.
  try {
    await putCachedDetails(address, stillNeeded, fresh, sources, notes);
  } catch (err) {
    // Losing the write costs the next member a lookup. It must not cost this
    // one their result.
    console.error("[property-details] cache write failed:", err);
  }

  // Cached answers underneath, this call's answers on top.
  const merged = cachedOnly();
  for (const f of stillNeeded) merged[f] = fresh[f];

  const mergedSources = [...(cached?.sources ?? [])];
  for (const s of sources) {
    if (!mergedSources.some((m) => m.uri === s.uri)) mergedSources.push(s);
  }

  return NextResponse.json({
    details: merged,
    sources: mergedSources.slice(0, 8),
    // The prose before the JSON block, which is where the model explains what
    // it could not find. Worth showing — "this parcel is commercial" is more
    // useful than eight nulls.
    notes,
    cached: false,
  } satisfies PropertyDetailsResponse);
}
