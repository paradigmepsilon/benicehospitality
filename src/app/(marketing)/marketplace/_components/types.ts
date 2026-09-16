import { type FeaturedBook } from "@/lib/featured-books";
import type { MarketplaceTabId } from "@/lib/marketplace-categories";

export type { MarketplaceTabId };

export type AffiliateNetwork =
  | "amazon"
  | "lowes"
  | "wayfair"
  | "direct"
  | "other";

export type ProductBadge =
  | "Della Uses This"
  | "New"
  | "Best Value"
  | "Editor's Pick";

export type ProductStatus = "live" | "out-of-stock" | "soon";

export interface Product {
  id: string;
  name: string;
  body: string;
  bullets: string[];
  /**
   * `src` is empty for most rows. The card renders a designed plate in that
   * case rather than handing an empty string to next/image, which drops the
   * src attribute entirely and leaves a blank box.
   */
  image: { src: string; alt: string };
  priceRange: string;
  network: AffiliateNetwork;
  affiliateUrl: string;
  badge?: ProductBadge;
  status: ProductStatus;
  tags?: string[];
  /** Room or job id. See src/lib/marketplace-categories.ts. */
  category: string;
}

export interface MarketplaceTab {
  id: MarketplaceTabId;
  label: string;
  sectionLabel: string;
  headline: string;
  body: string;
  image: { src: string; alt: string };
  products: Product[];
  /**
   * First-party books promoted at the top of this tab's panel, matched to the
   * tab's audience in page.tsx. Deliberately NOT part of `products`: books are
   * ours, not affiliate listings, so they sit above the grid and stay out of
   * the search, sort, network filter, and the tab count badge.
   */
  books?: FeaturedBook[];
}

export const NETWORK_LABEL: Record<AffiliateNetwork, string> = {
  amazon: "Amazon",
  lowes: "Lowe's",
  wayfair: "Wayfair",
  direct: "Direct",
  other: "Partner",
};

export const NETWORK_CTA: Record<AffiliateNetwork, string> = {
  amazon: "View on Amazon",
  lowes: "View on Lowe's",
  wayfair: "View on Wayfair",
  direct: "Buy direct",
  other: "View product",
};
