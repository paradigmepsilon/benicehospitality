import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { parseEndorsementFields } from "@/lib/marketplace-endorsements";
import {
  MARKETPLACE_CATEGORY_IDS,
  findCategory,
  normalizeCategory,
} from "@/lib/marketplace-categories";
import {
  describeAllowedImageSources,
  isRenderableImageUrl,
} from "@/lib/image-sources";
import { IMAGE_ANCHORS, isImageAnchor } from "@/lib/image-anchor";
import {
  deleteProduct,
  updateProduct,
  VALID_BADGES,
  VALID_NETWORKS,
  VALID_STATUSES,
  VALID_TAB_IDS,
  type AffiliateNetwork,
  type MarketplaceTabId,
  type ProductBadge,
  type ProductStatus,
  type UpdateProductPatch,
} from "@/lib/marketplace";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface PatchBody extends Record<string, unknown> {
  slug?: unknown;
  tabId?: unknown;
  category?: unknown;
  name?: unknown;
  body?: unknown;
  bullets?: unknown;
  imageUrl?: unknown;
  imageAnchor?: unknown;
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

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
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

export async function PATCH(request: Request, ctx: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as PatchBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: UpdateProductPatch = {};

  if (typeof body.slug === "string" && body.slug.trim().length > 0) {
    patch.slug = body.slug.trim();
  }
  if (typeof body.tabId === "string") {
    if (!VALID_TAB_IDS.includes(body.tabId as MarketplaceTabId)) {
      return NextResponse.json(
        { error: `tabId must be one of ${VALID_TAB_IDS.join(", ")}` },
        { status: 400 },
      );
    }
    patch.tabId = body.tabId as MarketplaceTabId;
  }
  // Guarded on !== undefined rather than typeof string so togglePublish's
  // one-key body ({ isPublished }) keeps working untouched.
  if (body.category !== undefined) {
    const category = normalizeCategory(body.category);
    if (!findCategory(category)) {
      return NextResponse.json(
        { error: `category must be one of ${MARKETPLACE_CATEGORY_IDS.join(", ")}` },
        { status: 400 },
      );
    }
    patch.category = category;
  }
  // Moving a product between tabs without also setting a category would strand
  // it: categories are disjoint per tab, so the old value no longer applies.
  // groupByCategory would file it under "More gear" rather than crash, but this
  // is the point where it is still cheap to refuse.
  if (patch.tabId !== undefined && patch.category === undefined) {
    return NextResponse.json(
      { error: "changing tabId requires a category belonging to the new tab" },
      { status: 400 },
    );
  }
  if (patch.tabId !== undefined && patch.category !== undefined) {
    const def = findCategory(patch.category);
    if (def && def.tabId !== patch.tabId) {
      return NextResponse.json(
        { error: `category "${patch.category}" does not belong to tab "${patch.tabId}"` },
        { status: 400 },
      );
    }
  }
  if (typeof body.name === "string" && body.name.trim().length >= 3) {
    patch.name = body.name.trim();
  }
  if (typeof body.body === "string") patch.body = body.body;
  if (body.bullets !== undefined) patch.bullets = asStringArray(body.bullets);
  if (typeof body.imageUrl === "string") {
    const trimmed = body.imageUrl.trim();
    // See the POST route: a non-empty, un-allowlisted src makes next/image
    // throw during server render on two public, error-boundary-less pages.
    if (trimmed && !isRenderableImageUrl(trimmed)) {
      return NextResponse.json(
        { error: `imageUrl must be empty, or ${describeAllowedImageSources()}` },
        { status: 400 },
      );
    }
    patch.imageUrl = trimmed;
  }
  if (body.imageAnchor !== undefined) {
    if (!isImageAnchor(body.imageAnchor)) {
      return NextResponse.json(
        { error: `imageAnchor must be one of ${IMAGE_ANCHORS.join(", ")}` },
        { status: 400 },
      );
    }
    patch.imageAnchor = body.imageAnchor;
  }
  if (typeof body.imageAlt === "string") patch.imageAlt = body.imageAlt.trim();
  const endorsements = parseEndorsementFields(body);
  if (!endorsements.ok) {
    return NextResponse.json({ error: endorsements.error }, { status: 400 });
  }
  Object.assign(patch, endorsements.values);
  if (typeof body.priceRange === "string")
    patch.priceRange = body.priceRange.trim();
  if (typeof body.network === "string") {
    if (!VALID_NETWORKS.includes(body.network as AffiliateNetwork)) {
      return NextResponse.json(
        { error: `network must be one of ${VALID_NETWORKS.join(", ")}` },
        { status: 400 },
      );
    }
    patch.network = body.network as AffiliateNetwork;
  }
  if (typeof body.affiliateUrl === "string") {
    const trimmed = body.affiliateUrl.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "affiliateUrl cannot be empty" },
        { status: 400 },
      );
    }
    patch.affiliateUrl = trimmed;
  }
  if (body.badge !== undefined) {
    if (body.badge === null) {
      patch.badge = null;
    } else if (
      typeof body.badge === "string" &&
      VALID_BADGES.includes(body.badge as ProductBadge)
    ) {
      patch.badge = body.badge as ProductBadge;
    } else {
      return NextResponse.json(
        { error: `badge must be one of ${VALID_BADGES.join(", ")} or null` },
        { status: 400 },
      );
    }
  }
  if (typeof body.status === "string") {
    if (!VALID_STATUSES.includes(body.status as ProductStatus)) {
      return NextResponse.json(
        { error: `status must be one of ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }
    patch.status = body.status as ProductStatus;
  }
  if (body.tags !== undefined) patch.tags = asStringArray(body.tags);
  if (typeof body.position === "number") patch.position = body.position;
  if (typeof body.isPublished === "boolean")
    patch.isPublished = body.isPublished;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  try {
    const product = await updateProduct(id, patch);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("marketplace_products_slug_key")) {
      return NextResponse.json(
        { error: `Slug already in use.` },
        { status: 409 },
      );
    }
    console.error("[admin/marketplace PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, ctx: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
