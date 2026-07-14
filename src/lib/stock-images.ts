/**
 * Curated stock and local imagery used across the marketing site.
 *
 * Each entry pairs a stable image URL with descriptive alt text and a tag
 * for the slot it fills. The local entries point at images that already
 * live in /public/images. The remote entries point at Unsplash photos
 * served from images.unsplash.com (whitelisted in next.config.ts).
 *
 * These are placeholders. Replace by editing the `src` field. The keys
 * stay the same so consumers do not need to be updated.
 */

export interface StockImage {
  src: string;
  alt: string;
  /** Optional photographer/credit; surface when license requires attribution. */
  credit?: string;
}

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

// Hospitality / property operator imagery
export const STOCK_PROPERTY: StockImage = {
  src: "/images/lifestyle.jpeg",
  alt: "Co-living rental living room ready for a guest arrival",
};

export const STOCK_PROPERTY_ALT: StockImage = {
  src: "/images/lifestyle2.jpeg",
  alt: "Modern apartment interior styled for a co-living rental",
};

export const STOCK_BOUTIQUE_HOTEL: StockImage = {
  src: "/images/historic.jpeg",
  alt: "Historic boutique stay facade",
};

export const STOCK_RESORT: StockImage = {
  src: "/images/resort.jpeg",
  alt: "Independent resort at golden hour",
};

export const STOCK_URBAN: StockImage = {
  src: "/images/urban.jpeg",
  alt: "Urban skyline at dusk",
};

export const STOCK_OPERATIONS: StockImage = {
  src: "/images/staffshortage.jpeg",
  alt: "Hospitality operator at work behind the scenes",
};

export const STOCK_TECH: StockImage = {
  src: "/images/tech.jpeg",
  alt: "Operator workstation running modern hospitality software",
};

export const STOCK_OTA: StockImage = {
  src: "/images/ota.jpeg",
  alt: "Online travel agency listing on a laptop screen",
};

export const STOCK_ALL_HATS: StockImage = {
  src: "/images/allhats.jpeg",
  alt: "An operator wearing the many hats of a small hospitality business",
};

// Auto / fleet operator
export const STOCK_AUTO: StockImage = {
  src: u("photo-1492144534655-ae79c964c9d7"),
  alt: "Modern car interior detail of a fleet vehicle",
};

export const STOCK_AUTO_FLEET: StockImage = {
  src: u("photo-1502877338535-766e1452684a"),
  alt: "A small fleet of vehicles parked at a turnover bay",
};

// Co-living
export const STOCK_COLIVING: StockImage = {
  src: u("photo-1505691938895-1758d7feb511"),
  alt: "Shared co-living common room with natural light",
};

// Modern interior / luxury hotel
export const STOCK_HOTEL_ROOM: StockImage = {
  src: u("photo-1564501049412-61c2a3083791"),
  alt: "Boutique stay guest room styled for an independent operator",
};

export const STOCK_HOTEL_EXTERIOR: StockImage = {
  src: u("photo-1551882547-ff40c63fe5fa"),
  alt: "Independent boutique stay exterior at twilight",
};

// Workspace / operations / technology
export const STOCK_LAPTOP_WORK: StockImage = {
  src: u("photo-1517245386807-bb43f82c33c4"),
  alt: "Operator reviewing reports on a laptop",
};

export const STOCK_DASHBOARD: StockImage = {
  src: u("photo-1551288049-bebda4e38f71"),
  alt: "Analytics dashboard showing booking and revenue trends",
};

export const STOCK_CODE_SCREEN: StockImage = {
  src: u("photo-1555066931-4365d14bab8c"),
  alt: "Developer screen showing code that powers an automation",
};

// Community / meetings
export const STOCK_COMMUNITY: StockImage = {
  src: u("photo-1556761175-5973dc0f32e7"),
  alt: "Operators gathered around a table working through a problem",
};

export const STOCK_HANDSHAKE: StockImage = {
  src: u("photo-1521791136064-7986c2920216"),
  alt: "Two business partners sealing an engagement",
};

// Resource library / reading / insight
export const STOCK_LIBRARY: StockImage = {
  src: u("photo-1481627834876-b7833e8f5570"),
  alt: "A warm-lit library aisle lined with reference volumes",
};

// Stock portraits used as placeholder testimonial avatars. Replace with
// real client photos once releases are signed.
export const STOCK_PORTRAIT_F1: StockImage = {
  src: u("photo-1573497019940-1c28c88b4f3e", 256),
  alt: "Portrait of a hospitality operator",
};

export const STOCK_PORTRAIT_M1: StockImage = {
  src: u("photo-1500648767791-00dcc994a43e", 256),
  alt: "Portrait of a hotel general manager",
};

export const STOCK_PORTRAIT_F2: StockImage = {
  src: u("photo-1494790108377-be9c29b29330", 256),
  alt: "Portrait of a co-living operator",
};

export const STOCK_PORTRAIT_M2: StockImage = {
  src: u("photo-1599566150163-29194dcaad36", 256),
  alt: "Portrait of a fleet operator",
};
