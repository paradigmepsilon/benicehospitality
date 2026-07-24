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
        // The middle course tier was renamed Cohort -> Masterclass. Only the
        // label and the route changed: the stored tier value in course_tiers,
        // the WaitlistTier enum, and every /account and /admin path still use
        // the string "cohort".
        source: "/courses/room-rental-riches/cohort",
        destination: "/courses/room-rental-riches/masterclass",
        permanent: true,
      },
      {
        // Future free/paid tool suite lives under /tools. The Co-living Property
        // Calculator keeps its canonical /resources URL; /tools/property-viability
        // is the memorable alias.
        source: "/tools/property-viability",
        destination: "/resources/co-living-property-calculator",
        permanent: true,
      },
      {
        // Legacy slug: the tool was renamed from "MTR Viability Calculator" to
        // "Co-living Property Calculator". Preserve old links + SEO.
        source: "/resources/mtr-viability-scorecard",
        destination: "/resources/co-living-property-calculator",
        permanent: true,
      },
      {
        // ...including deep links to saved results (/results/:token).
        source: "/resources/mtr-viability-scorecard/:path*",
        destination: "/resources/co-living-property-calculator/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
