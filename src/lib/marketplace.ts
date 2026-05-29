import { sql } from "./db";

export type MarketplaceTabId = "property" | "hotel" | "auto" | "back-office";
export type AffiliateNetwork =
  | "amazon"
  | "lowes"
  | "wayfair"
  | "direct"
  | "other";
export type ProductStatus = "live" | "out-of-stock" | "soon";
export type ProductBadge =
  | "Della Uses This"
  | "New"
  | "Best Value"
  | "Editor's Pick";

export const VALID_TAB_IDS: MarketplaceTabId[] = [
  "property",
  "hotel",
  "auto",
  "back-office",
];
export const VALID_NETWORKS: AffiliateNetwork[] = [
  "amazon",
  "lowes",
  "wayfair",
  "direct",
  "other",
];
export const VALID_STATUSES: ProductStatus[] = ["live", "out-of-stock", "soon"];
export const VALID_BADGES: ProductBadge[] = [
  "Della Uses This",
  "New",
  "Best Value",
  "Editor's Pick",
];

export interface MarketplaceProduct {
  id: number;
  slug: string;
  tabId: MarketplaceTabId;
  name: string;
  body: string;
  bullets: string[];
  imageUrl: string;
  imageAlt: string;
  priceRange: string;
  network: AffiliateNetwork;
  affiliateUrl: string;
  badge: ProductBadge | null;
  status: ProductStatus;
  tags: string[];
  position: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductRow {
  id: number;
  slug: string;
  tab_id: string;
  name: string;
  body: string;
  bullets: string[] | null;
  image_url: string;
  image_alt: string;
  price_range: string;
  network: string;
  affiliate_url: string;
  badge: string | null;
  status: string;
  tags: string[] | null;
  position: number;
  is_published: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

function rowToProduct(r: ProductRow): MarketplaceProduct {
  return {
    id: r.id,
    slug: r.slug,
    tabId: r.tab_id as MarketplaceTabId,
    name: r.name,
    body: r.body,
    bullets: r.bullets ?? [],
    imageUrl: r.image_url,
    imageAlt: r.image_alt,
    priceRange: r.price_range,
    network: r.network as AffiliateNetwork,
    affiliateUrl: r.affiliate_url,
    badge: (r.badge as ProductBadge | null) ?? null,
    status: r.status as ProductStatus,
    tags: r.tags ?? [],
    position: r.position,
    isPublished: r.is_published,
    createdAt:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at),
    updatedAt:
      r.updated_at instanceof Date
        ? r.updated_at.toISOString()
        : String(r.updated_at),
  };
}

/** Public catalog — published rows only, ordered by tab then position. */
export async function listPublishedProducts(): Promise<MarketplaceProduct[]> {
  const rows = (await sql`
    SELECT * FROM marketplace_products
    WHERE is_published = true
    ORDER BY tab_id, position, id
  `) as ProductRow[];
  return rows.map(rowToProduct);
}

/** Admin view — every row, including drafts. */
export async function listAllProducts(): Promise<MarketplaceProduct[]> {
  const rows = (await sql`
    SELECT * FROM marketplace_products
    ORDER BY tab_id, position, id
  `) as ProductRow[];
  return rows.map(rowToProduct);
}

export interface CreateProductInput {
  slug: string;
  tabId: MarketplaceTabId;
  name: string;
  body: string;
  bullets: string[];
  imageUrl: string;
  imageAlt: string;
  priceRange: string;
  network: AffiliateNetwork;
  affiliateUrl: string;
  badge: ProductBadge | null;
  status: ProductStatus;
  tags: string[];
  position: number;
  isPublished: boolean;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<MarketplaceProduct> {
  const rows = (await sql`
    INSERT INTO marketplace_products (
      slug, tab_id, name, body, bullets, image_url, image_alt,
      price_range, network, affiliate_url, badge, status, tags,
      position, is_published
    )
    VALUES (
      ${input.slug}, ${input.tabId}, ${input.name}, ${input.body},
      ${input.bullets}, ${input.imageUrl}, ${input.imageAlt},
      ${input.priceRange}, ${input.network}, ${input.affiliateUrl},
      ${input.badge}, ${input.status}, ${input.tags},
      ${input.position}, ${input.isPublished}
    )
    RETURNING *
  `) as ProductRow[];
  return rowToProduct(rows[0]!);
}

export type UpdateProductPatch = Partial<Omit<CreateProductInput, "slug">> & {
  slug?: string;
};

export async function updateProduct(
  id: number,
  patch: UpdateProductPatch,
): Promise<MarketplaceProduct | null> {
  // Build the row using current state for any field the caller didn't pass,
  // so a single UPDATE handles all combinations without dynamic SQL string
  // composition.
  const existingRows = (await sql`
    SELECT * FROM marketplace_products WHERE id = ${id}
  `) as ProductRow[];
  const existing = existingRows[0];
  if (!existing) return null;
  const next = {
    slug: patch.slug ?? existing.slug,
    tab_id: patch.tabId ?? existing.tab_id,
    name: patch.name ?? existing.name,
    body: patch.body ?? existing.body,
    bullets: patch.bullets ?? existing.bullets ?? [],
    image_url: patch.imageUrl ?? existing.image_url,
    image_alt: patch.imageAlt ?? existing.image_alt,
    price_range: patch.priceRange ?? existing.price_range,
    network: patch.network ?? existing.network,
    affiliate_url: patch.affiliateUrl ?? existing.affiliate_url,
    badge: patch.badge === undefined ? existing.badge : patch.badge,
    status: patch.status ?? existing.status,
    tags: patch.tags ?? existing.tags ?? [],
    position: patch.position ?? existing.position,
    is_published:
      patch.isPublished === undefined
        ? existing.is_published
        : patch.isPublished,
  };
  const rows = (await sql`
    UPDATE marketplace_products SET
      slug = ${next.slug},
      tab_id = ${next.tab_id},
      name = ${next.name},
      body = ${next.body},
      bullets = ${next.bullets},
      image_url = ${next.image_url},
      image_alt = ${next.image_alt},
      price_range = ${next.price_range},
      network = ${next.network},
      affiliate_url = ${next.affiliate_url},
      badge = ${next.badge},
      status = ${next.status},
      tags = ${next.tags},
      position = ${next.position},
      is_published = ${next.is_published},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as ProductRow[];
  return rows[0] ? rowToProduct(rows[0]) : null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const rows = (await sql`
    DELETE FROM marketplace_products WHERE id = ${id} RETURNING id
  `) as { id: number }[];
  return rows.length > 0;
}
