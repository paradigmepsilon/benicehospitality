import posthog from "posthog-js";

// Site-wide PostHog init (runs on every page before hydration). The token is
// the BNHG-website project's public ingestion key; events route through our
// own /ingest rewrite (next.config.ts) so ad blockers don't eat them. The
// server-side client (src/lib/posthog-server.ts) shares the same token, so
// client pageviews and webhook purchase events land in ONE project — the
// Unified Ops funnel depends on that.
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-05-30",
  // Only create person profiles for identified users; anonymous visitors
  // stay cheap event-only rows.
  person_profiles: "identified_only",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
