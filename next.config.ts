import type { NextConfig } from "next";
import {
  ALLOWED_IMAGE_HOSTS,
  ALLOWED_IMAGE_PATH_PREFIXES,
} from "./src/lib/image-sources";

const nextConfig: NextConfig = {
  images: {
    // AVIF + WebP cut the ~2 MB source PNGs in public/images/Website Images/
    // by 40–60% with zero component changes. Mobile devices fall back to
    // WebP if the browser doesn't accept AVIF.
    formats: ["image/avif", "image/webp"],
    // Next 16 rejects any per-image `quality` prop not listed here. Marketing
    // hero/detail art is served at q90 to avoid AVIF-over-WebP double-
    // compression softness; 75 stays for everything else (the default).
    qualities: [75, 90],
    // Add 360 and 414 to Next's defaults so the most common Android/iPhone
    // widths get a properly-sized source variant instead of upscaling from
    // 640.
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Derived from src/lib/image-sources.ts so this config and the admin API's
    // image_url validator can never disagree. An admin-saved URL on a host
    // missing from here makes next/image throw during server render, which is
    // a 500 on /marketplace and /resources/supply-inventory-tracker — both
    // force-dynamic with no error boundary.
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      port: "",
      pathname: "/**",
    })),
    // Allow any query string (e.g. ?v=2 cache-busters) on local public
    // images. Omitting `search` permits both no-query and any-query URLs.
    //
    // /images/** covers public/images/. /api/images/** covers blog and insight
    // post covers served through the DB-backed image route (e.g.
    // /api/images/5); without it, any page rendering such a cover 500s on
    // next/image src validation.
    localPatterns: ALLOWED_IMAGE_PATH_PREFIXES.map((prefix) => ({
      pathname: `${prefix}**`,
    })),
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // The admin partnership doc library streams rendered PDFs from docs/, which
  // file tracing would otherwise leave out of the serverless bundle.
  outputFileTracingIncludes: {
    "/api/admin/partnership/docs/[key]": [
      "./docs/co-living-launch-partnership/dist/**/*.pdf",
    ],
    "/api/admin/partnership/files/[...path]": [
      "./docs/co-living-launch-partnership/client/**/*",
      "./docs/co-living-launch-partnership/templates/**/*.{html,css,csv}",
    ],
    "/api/admin/partnership/docs": [
      "./docs/co-living-launch-partnership/client/*.html",
      "./docs/co-living-launch-partnership/templates/**/*.html",
    ],
    "/api/admin/partnership/[id]/email": [
      "./docs/co-living-launch-partnership/templates/sales/email_pack.md",
    ],
  },

  /**
   * IA migration redirects.
   *
   * Catalog page renamed from /courses to /education, then /education was
   * retired in favor of /training as the training hub. Both old paths land on
   * /training directly rather than chaining through the retired stub. Nested
   * course detail routes (/courses/room-rental-riches/*) are unaffected.
   */
  async redirects() {
    return [
      {
        source: "/education",
        destination: "/training",
        permanent: true,
      },
      // Moved here from Task 1 by controller ruling: /training only exists as
      // of this task, so this is the first point at which either redirect has
      // a live target. Replaces the prior "/courses" -> "/education" entry
      // rather than adding a second one, so the catalog rename no longer
      // chains through the retired /education stub.
      {
        source: "/courses",
        destination: "/training",
        permanent: true,
      },
      {
        // Public lead-magnet URL for the CRR funnel (emails, social, book CTA).
        // Not permanent: the short link may someday point at a dedicated
        // landing page instead of the resource tool.
        source: "/turo-calculator",
        destination: "/resources/vehicle-profitability-calculator",
        permanent: false,
      },
      {
        // Short link for the free Car Rental Riches ebook (emails, social,
        // the paid book's back matter). Not permanent for the same reason.
        source: "/before-you-buy-the-car",
        destination: "/books/before-you-buy-the-car",
        permanent: false,
      },
      {
        // The middle course tier was renamed Cohort -> Masterclass. Only the
        // label and the route changed: the stored tier value in course_tiers,
        // the WaitlistTier enum, and every /account and /admin path still use
        // the string "cohort".
        source: "/courses/room-rental-riches/cohort",
        destination: "/courses/room-rental-riches/masterclass",
        permanent: true,
      },
      // The tool has been renamed three times: "MTR Viability Scorecard" ->
      // "Co-living Property Calculator" -> "Co-living Viability Calculator".
      // Every legacy slug points straight at the CURRENT one rather than
      // chaining through the intermediate name. Next.js emits each redirect as
      // its own 308, so a chain would cost every old link an extra round trip.
      {
        // Future free/paid tool suite lives under /tools. The calculator keeps
        // its canonical /resources URL; /tools/property-viability is the
        // memorable alias.
        source: "/tools/property-viability",
        destination: "/resources/co-living-viability-calculator",
        permanent: true,
      },
      {
        source: "/resources/mtr-viability-scorecard",
        destination: "/resources/co-living-viability-calculator",
        permanent: true,
      },
      {
        // ...including deep links to saved results (/results/:token).
        source: "/resources/mtr-viability-scorecard/:path*",
        destination: "/resources/co-living-viability-calculator/:path*",
        permanent: true,
      },
      {
        source: "/resources/co-living-property-calculator",
        destination: "/resources/co-living-viability-calculator",
        permanent: true,
      },
      {
        // Keeps /results/:token links alive in scorecard emails already sent.
        source: "/resources/co-living-property-calculator/:path*",
        destination: "/resources/co-living-viability-calculator/:path*",
        permanent: true,
      },
      // The Room Rental Price Calculator and the Start-Up Cost Projection
      // Worksheet merged into the Co-Living Property Profitability Analysis
      // Worksheet: one priced
      // a single room and stopped, the other budgeted a launch with no idea
      // what the property earned. Both slugs point straight at the merged tool.
      {
        source: "/resources/room-rental-price-calculator",
        destination: "/resources/breakeven-analysis-worksheet",
        permanent: true,
      },
      {
        source: "/resources/room-rental-price-calculator/:path*",
        destination: "/resources/breakeven-analysis-worksheet/:path*",
        permanent: true,
      },
      {
        source: "/resources/startup-cost-calculator",
        destination: "/resources/breakeven-analysis-worksheet",
        permanent: true,
      },
      {
        source: "/resources/startup-cost-calculator/:path*",
        destination: "/resources/breakeven-analysis-worksheet/:path*",
        permanent: true,
      },
      // Four fleet tools retired in August 2026 with no replacement: the
      // Claims-Day Playbook, the Risk & Coverage Guide, the Market
      // Underwriting Scorecard, and the Fleet Business Plan Builder. Never in
      // the sitemap (sitemap.ts only walks the property lane), but they were
      // linked from /resources for a week and a member could have bookmarked
      // one, so the slugs land on the resource index rather than 404ing.
      // Saved-shelf rows pointing at them are already filtered on read by
      // saved.ts.
      {
        source: "/resources/claims-day-playbook",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/resources/risk-coverage-guide",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/resources/market-underwriting-scorecard",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/resources/fleet-business-plan-builder",
        destination: "/resources",
        permanent: true,
      },
      // Lane pages became management offers. The old pages sold a lane; these
      // sell a service, so the mapping is by asset class, not by name.
      {
        source: "/co-living",
        destination: "/management/co-living",
        permanent: true,
      },
      {
        source: "/fleet",
        destination: "/management/fleet",
        permanent: true,
      },
      {
        source: "/boutique-stays",
        destination: "/management",
        permanent: true,
      },
      // Retired offers. Signal, the services tiers, and Labs were the boutique
      // consulting era. Management is the closest live destination.
      {
        source: "/signal",
        destination: "/management",
        permanent: true,
      },
      {
        source: "/signal/free-audit",
        destination: "/management",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/management",
        permanent: true,
      },
      {
        source: "/labs",
        destination: "/",
        permanent: true,
      },
      {
        source: "/labs/guestally",
        destination: "/",
        permanent: true,
      },
      {
        source: "/labs/build-log",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/audit/request",
        destination: "/management",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
