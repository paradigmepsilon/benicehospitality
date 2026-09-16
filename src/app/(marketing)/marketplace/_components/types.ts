import type { MarketplaceTabId } from "@/lib/marketplace-categories";
import type { ImageAnchor } from "@/lib/image-anchor";
import type { Endorsements } from "@/lib/marketplace-endorsements";

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

/**
 * A listing. Most come from marketplace_products (affiliate links); first-party
 * books are mapped in from src/lib/featured-books.ts by page.tsx and carry
 * `firstParty`, which swaps the affiliate CTA and disclaimer for a link to the
 * book's own sales page.
 *
 * Endorsement fields are "" until approved. See marketplace-endorsements.ts.
 */
export interface Product extends Endorsements {
  /** Slug. Also the product id recorded by /api/marketplace/click. */
  id: string;
  name: string;
  body: string;
  bullets: string[];
  /**
   * `src` is empty for most rows. The card renders a designed plate in that
   * case rather than handing an empty string to next/image, which drops the
   * src attribute entirely and leaves a blank box.
   */
  image: { src: string; alt: string; anchor: ImageAnchor };
  priceRange: string;
  network: AffiliateNetwork;
  affiliateUrl: string;
  badge?: ProductBadge;
  status: ProductStatus;
  tags?: string[];
  /** Room or job id. See src/lib/marketplace-categories.ts. */
  category: string;
  /** Set on our own books. Never an affiliate link. */
  firstParty?: { author: string };
}

export interface MarketplaceTab {
  id: MarketplaceTabId;
  label: string;
  products: Product[];
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
