/**
 * Which part of a product photo survives the crop.
 *
 * Product images render into fixed-aspect boxes. The marketplace card and
 * modal now use `object-contain` (the whole product shows, letterboxed on
 * white), where the anchor maps to CSS `object-position` and decides where
 * the image sits inside the frame. The small tracker thumbnail still crops
 * with `object-cover`, where the anchor keeps the part that identifies the
 * product.
 *
 * This lives in its own module on purpose. src/lib/marketplace.ts (server) and
 * the marketplace _components/types.ts (client) each declare their own copy of
 * AffiliateNetwork / ProductBadge / ProductStatus, so those two surfaces can
 * silently drift. Both import the anchor from here instead -- the same shape
 * marketplace-categories.ts uses, and the same drift the category work fixed.
 *
 * Dependency-free so either side can import it without pulling in a DB client.
 */

export const IMAGE_ANCHORS = ["center", "top", "bottom", "left", "right"] as const;

export type ImageAnchor = (typeof IMAGE_ANCHORS)[number];

/** Matches the column default. Also the behavior every row had before the column existed. */
export const DEFAULT_IMAGE_ANCHOR: ImageAnchor = "center";

export const IMAGE_ANCHOR_LABELS: Record<ImageAnchor, string> = {
  center: "Center",
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
};

export function isImageAnchor(value: unknown): value is ImageAnchor {
  return (
    typeof value === "string" &&
    (IMAGE_ANCHORS as readonly string[]).includes(value)
  );
}

/**
 * Never throws. Rows written before the column existed, or a value edited
 * directly in the DB, fall back to center rather than breaking a public page.
 */
export function coerceImageAnchor(value: unknown): ImageAnchor {
  return isImageAnchor(value) ? value : DEFAULT_IMAGE_ANCHOR;
}

/**
 * CSS object-position keyword. Each anchor name is already a valid keyword --
 * `top` resolves to `50% 0%`, which is the anchor-to-top behavior we want --
 * so this is an identity map today. It exists so callers never inline the
 * string, and so a future two-axis anchor (e.g. "top-left") has one place to
 * land.
 */
export function objectPositionFor(anchor: ImageAnchor): string {
  return anchor;
}
