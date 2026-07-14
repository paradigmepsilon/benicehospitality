import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Be Nice Hospitality Group",
    short_name: "Be Nice",
    description:
      "Training, services, and software for operators running co-living properties, boutique stays, and rental fleets.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f6f1",
    theme_color: "#5b9a2f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
