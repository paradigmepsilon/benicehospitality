// Visit-scoped attribution capture for the social funnel.
//
// The problem this solves: UTMs only ever appear on the ENTRY pageview. A
// visitor arrives from Della's bio page on /co-living?utm_source=della_bio,
// browses to a resource tool, and only then hands over an email. By that point
// the URL is bare, so the unlock would record no source at all and the lead
// would look like it came from nowhere.
//
// So we stash the entry attribution in sessionStorage on first load and read it
// back at capture time. Session scope is deliberate: it covers one visit, which
// is the window that matters, and it expires on its own without us managing a
// TTL. PostHog's $set_once handles the never-overwrite semantics for first-touch
// person properties, so this layer does not need to track that itself.

const STORAGE_KEY = "bnhg_attribution";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_path?: string;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

function readFromUrl(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const found: Attribution = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    // Cap length so a junk query string can't bloat the CRM row.
    if (value) found[key] = value.slice(0, 120);
  }
  if (Object.keys(found).length === 0) return {};
  found.landing_path = window.location.pathname.slice(0, 200);
  return found;
}

/**
 * Call once per full page load, before anything reads attribution. Records the
 * entry UTMs if this load carries any and nothing is stored yet. A later
 * UTM-bearing load in the same visit wins, since that reflects a genuinely new
 * campaign click rather than internal navigation.
 */
export function rememberAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const fromUrl = readFromUrl();
    if (Object.keys(fromUrl).length > 0) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    return getAttribution();
  } catch {
    // Private browsing and storage-blocked contexts throw. Attribution is
    // nice-to-have; never let it break a page load or a form submit.
    return {};
  }
}

/** Read the attribution recorded for this visit. Empty object if none. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Attribution;
  } catch {
    return {};
  }
}
