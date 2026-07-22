import posthog from "posthog-js";
import { rememberAttribution } from "@/lib/funnel-attribution";

// Cross-domain identity handoff. Della's bio page lives on its own domain, so
// PostHog's first-party cookie cannot follow a visitor here — without this they
// would land as a second, unrelated person and her social funnel would show a
// false drop-off at exactly the seam we care about. The bio page decorates every
// outbound BNHG link with its own distinct_id + session_id; we bootstrap them so
// the visitor stays ONE person from their very first pageview.
// https://posthog.com/tutorials/cross-domain-tracking
//
// Bootstrap only applies when this browser has no stored PostHog ID yet, which
// is the behaviour we want: a returning BNHG visitor keeps their existing
// identity rather than being overwritten by whatever the bio page handed us.
// Those two IDs get merged later anyway, when identify() fires at the resource
// email gate.
interface Handoff {
  distinctID: string;
  sessionID?: string;
}

function readHandoff(): Handoff | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    const distinctID = params.get("ph_did");
    if (!distinctID) return undefined;
    const sessionID = params.get("ph_sid");
    return sessionID ? { distinctID, sessionID } : { distinctID };
  } catch {
    return undefined;
  }
}

// Strip the handoff params once consumed. This is a correctness fix, not tidying:
// a URL carrying ph_did is a bearer token for someone's identity, so if it
// survives in the address bar and gets shared, every recipient is bootstrapped
// as the person who copied it. UTMs are deliberately left in place — those are
// real attribution and PostHog reads them off the pageview.
function stripHandoffParams(): void {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("ph_did") && !url.searchParams.has("ph_sid")) {
      return;
    }
    url.searchParams.delete("ph_did");
    url.searchParams.delete("ph_sid");
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    // Never let analytics hygiene break navigation.
  }
}

const handoff = readHandoff();

// Stash the entry UTMs before anything strips or navigates away from them. The
// resource email gate reads these back later so a lead that started on Della's
// bio page is still attributable to it several pages into the visit.
rememberAttribution();

// Site-wide PostHog init (runs on every page before hydration). The token is
// the BNHG-website project's public ingestion key; events route through our
// own /ingest rewrite (next.config.ts) so ad blockers don't eat them. The
// server-side client (src/lib/posthog-server.ts) shares the same token, so
// client pageviews and webhook purchase events land in ONE project — the
// Unified Ops funnel depends on that. Della's bio page uses the same token for
// the same reason.
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-05-30",
  // Only create person profiles for identified users; anonymous visitors
  // stay cheap event-only rows. The pre-identification chain still attaches
  // retroactively the moment identify() fires at the resource gate, so this
  // costs us no visibility into the funnel.
  person_profiles: "identified_only",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  ...(handoff ? { bootstrap: handoff } : {}),
});

stripHandoffParams();
