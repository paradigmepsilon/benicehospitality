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
  image: { src: string; alt: string };
  priceRange: string;
  network: AffiliateNetwork;
  affiliateUrl: string;
  badge?: ProductBadge;
  status: ProductStatus;
  tags?: string[];
}

export type MarketplaceTabId = "property" | "hotel" | "auto" | "back-office";

export interface MarketplaceTab {
  id: MarketplaceTabId;
  label: string;
  sectionLabel: string;
  headline: string;
  body: string;
  image: { src: string; alt: string };
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
