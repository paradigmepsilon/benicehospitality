/**
 * The site-wide featured-book catalog: every first-party book we sell, in one
 * place, so promo surfaces (resources, marketplace, founder pages) never hand-
 * roll their own copy of a book's name, price, or route.
 *
 * Display data derives from the canonical product constants:
 *   - Room Rental Riches: The Blueprint  -> src/lib/blueprint.ts (BLUEPRINT)
 *   - The Car Rental Riches Blueprint    -> src/lib/crr-blueprint.ts (CRR_BLUEPRINT)
 *
 * Each book keeps ONE purchase funnel: its /books/... sales page, which owns
 * the Buy button, the Stripe checkout route, and the disclaimers. Promo bands
 * link INTO that page (with a ?src= tag for analytics) rather than starting
 * checkout directly, so pricing context and legal copy are never skipped.
 *
 * ROLLOUT SWITCH: `available`. The Car Rental Riches Blueprint is written into
 * the catalog now but held back with `available: false`. When the book is
 * finished, flip it to true and it appears on every surface that renders
 * publishedBooks() (resources + marketplace today). Before flipping, make sure:
 *   1. The cover asset exists at CRR_BLUEPRINT.coverImage (public/images).
 *   2. CRR_BLUEPRINT_STRIPE_PRICE_ID and the blob keys are set in production.
 * Della's page filters by author, so her page only ever shows her book; an
 * equivalent Alex-page section can filter author === "Alex Henry" later.
 */

import { BLUEPRINT } from "@/lib/blueprint";
import { CRR_BLUEPRINT } from "@/lib/crr-blueprint";

export interface FeaturedBook {
  /** Stable product tag, reused from the Stripe metadata tag. */
  tag: string;
  name: string;
  subtitle: string;
  author: "Della Henry" | "Alex Henry";
  /** Which operator audience the book serves; mirrors the resource registry lanes. */
  audience: "property" | "fleet";
  priceUsd: number;
  /** Strike-through list price; omitted when no researched list price exists. */
  priceListUsd?: number;
  /** The sales page the promo band links to. */
  path: string;
  coverImage: string;
  /** One-line ad hook used on promo bands (the sales page carries the rest). */
  hook: string;
  /** Short verifiable specs a buyer scans for. */
  specs: string[];
  /** The rollout switch described above. */
  available: boolean;
}

export const FEATURED_BOOKS: FeaturedBook[] = [
  {
    tag: BLUEPRINT.productTag,
    name: BLUEPRINT.name,
    subtitle: BLUEPRINT.subtitle,
    author: BLUEPRINT.author,
    audience: "property",
    priceUsd: BLUEPRINT.priceUsd,
    priceListUsd: BLUEPRINT.priceListUsd,
    path: BLUEPRINT.path,
    coverImage: BLUEPRINT.coverImage,
    hook: "The operating manual for a co-living business that runs on systems, not stress. The exact system Della and Alex run across their own homes, from property scoring to pricing to scaling.",
    specs: ["137 pages", "7 modules", "PDF + ePub", "Instant download"],
    available: true,
  },
  {
    tag: CRR_BLUEPRINT.productTag,
    name: CRR_BLUEPRINT.name,
    subtitle: CRR_BLUEPRINT.subtitle,
    author: CRR_BLUEPRINT.author,
    audience: "fleet",
    priceUsd: CRR_BLUEPRINT.priceUsd,
    path: CRR_BLUEPRINT.path,
    coverImage: CRR_BLUEPRINT.coverImage,
    hook: "How to start and underwrite a profitable Turo business in the 2026 earnings-plan era, from the operator running Be Nice Autos in the Atlanta metro.",
    specs: ["PDF + ePub", "Instant download"],
    // Held back until the book is finished. See the rollout checklist above.
    available: false,
  },
];

/** Books ready to promote site-wide. */
export function publishedBooks(): FeaturedBook[] {
  return FEATURED_BOOKS.filter((b) => b.available);
}

/** Published books by a single author, for founder pages. */
export function publishedBooksBy(
  author: FeaturedBook["author"],
): FeaturedBook[] {
  return publishedBooks().filter((b) => b.author === author);
}
