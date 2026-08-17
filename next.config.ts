import type { NextConfig } from "next";

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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Allow any query string (e.g. ?v=2 cache-busters) on local public
    // images. Omitting `search` permits both no-query and any-query URLs.
    localPatterns: [
      {
        pathname: "/images/**",
      },
      // Blog/insight post covers are served through the DB-backed image route
      // (e.g. /api/images/5). Without this, any page that renders a post card
      // with such a cover 500s on next/image src validation.
      {
        pathname: "/api/images/**",
      },
    ],
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

  /**
   * IA migration redirects.
   *
   * Catalog page renamed from /courses to /education. Nested course detail
   * routes (/courses/room-rental-riches/*) are unaffected.
   */
  async redirects() {
    return [
      {
        source: "/courses",
        destination: "/education",
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
    ];
  },
};

export default nextConfig;
