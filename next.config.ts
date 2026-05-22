import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    ],
  },

  /**
   * IA migration redirects.
   *
   * /services retired in favor of the four primary product surfaces
   * (Courses, Advisory, Signal, Labs). The closest semantic match for
   * paid engagement seekers is /advisory, so /services 301s there.
   * The Tier 0 resources at /resources/[slug] are unaffected.
   */
  async redirects() {
    return [
      {
        source: "/services",
        destination: "/advisory",
        permanent: true,
      },
      // Catalog page renamed from /courses to /education. Nested course
      // detail routes (/courses/room-rental-riches/*) are unaffected.
      {
        source: "/courses",
        destination: "/education",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
