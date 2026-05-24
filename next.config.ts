import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF + WebP cut the ~2 MB source PNGs in public/images/Website Images/
    // by 40–60% with zero component changes. Mobile devices fall back to
    // WebP if the browser doesn't accept AVIF.
    formats: ["image/avif", "image/webp"],
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
    ],
  },

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
    ];
  },
};

export default nextConfig;
