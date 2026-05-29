import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  createProduct,
  listAllProducts,
  VALID_BADGES,
  VALID_NETWORKS,
  VALID_STATUSES,
  VALID_TAB_IDS,
  type AffiliateNetwork,
  type MarketplaceTabId,
  type ProductBadge,
  type ProductStatus,
} from "@/lib/marketplace";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
}

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  const products = await listAllProducts();
  return NextResponse.json({ products });
}

interface PostBody {
  slug?: unknown;
  tabId?: unknown;
  name?: unknown;
  body?: unknown;
  bullets?: unknown;
  imageUrl?: unknown;
  imageAlt?: unknown;
  priceRange?: unknown;
  network?: unknown;
  affiliateUrl?: unknown;
  badge?: unknown;
  status?: unknown;
  tags?: unknown;
  position?: unknown;
  isPublished?: unknown;
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const body = (await request.json().catch(() => null)) as PostBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 3) {
    return NextResponse.json(
      { error: "name must be at least 3 characters" },
      { status: 400 },
    );
  }

  if (
    typeof body.tabId !== "string" ||
    !VALID_TAB_IDS.includes(body.tabId as MarketplaceTabId)
  ) {
    return NextResponse.json(
      { error: `tabId must be one of ${VALID_TAB_IDS.join(", ")}` },
      { status: 400 },
    );
  }
  if (
    typeof body.network !== "string" ||
    !VALID_NETWORKS.includes(body.network as AffiliateNetwork)
  ) {
    return NextResponse.json(
      { error: `network must be one of ${VALID_NETWORKS.join(", ")}` },
      { status: 400 },
    );
  }
  if (
    typeof body.status !== "string" ||
    !VALID_STATUSES.includes(body.status as ProductStatus)
  ) {
    return NextResponse.json(
      { error: `status must be one of ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }
  if (
    body.badge !== null &&
    body.badge !== undefined &&
    !(
      typeof body.badge === "string" &&
      VALID_BADGES.includes(body.badge as ProductBadge)
    )
  ) {
    return NextResponse.json(
      { error: `badge must be one of ${VALID_BADGES.join(", ")} or null` },
      { status: 400 },
    );
  }

  const affiliateUrl =
    typeof body.affiliateUrl === "string" ? body.affiliateUrl.trim() : "";
  if (!affiliateUrl) {
    return NextResponse.json(
      { error: "affiliateUrl is required" },
      { status: 400 },
    );
  }

  const slug =
    typeof body.slug === "string" && body.slug.trim().length > 0
      ? slugify(body.slug)
      : slugify(`${body.tabId}-${name}`);
  if (!slug) {
    return NextResponse.json({ error: "could not derive slug" }, { status: 400 });
  }

  try {
    const product = await createProduct({
      slug,
      tabId: body.tabId as MarketplaceTabId,
      name,
      body: typeof body.body === "string" ? body.body : "",
      bullets: asStringArray(body.bullets),
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
      imageAlt: typeof body.imageAlt === "string" ? body.imageAlt.trim() : "",
      priceRange:
        typeof body.priceRange === "string" ? body.priceRange.trim() : "",
      network: body.network as AffiliateNetwork,
      affiliateUrl,
      badge: (body.badge as ProductBadge | null | undefined) ?? null,
      status: body.status as ProductStatus,
      tags: asStringArray(body.tags),
      position: typeof body.position === "number" ? body.position : 0,
      isPublished:
        typeof body.isPublished === "boolean" ? body.isPublished : true,
    });
    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("marketplace_products_slug_key")) {
      return NextResponse.json(
        { error: `A product with slug "${slug}" already exists.` },
        { status: 409 },
      );
    }
    console.error("[admin/marketplace POST]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
