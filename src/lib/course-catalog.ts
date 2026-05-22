import { sql } from "@/lib/db";

// Catalog/commerce data layer. Sits alongside src/lib/lms.ts (which handles
// runtime course access — lessons, enrollments, progress) and is responsible
// for the purchasable side of the course system: thumbnails, asset-class
// categorization, tier pricing, and Stripe price/product IDs.

export type CourseCategorySlug =
  | "str"
  | "mtr-ltr"
  | "co-living"
  | "auto-turo"
  | "hotels";

export const CATEGORY_LABEL: Record<CourseCategorySlug, string> = {
  str: "Short-Term Rentals",
  "mtr-ltr": "Mid- & Long-Term Rentals",
  "co-living": "Co-Living",
  "auto-turo": "Auto / Turo",
  hotels: "Hotels",
};

export const CATEGORY_ORDER: CourseCategorySlug[] = [
  "str",
  "mtr-ltr",
  "co-living",
  "auto-turo",
  "hotels",
];

export type TierSlug = "self-paced" | "cohort" | "operator";

export interface CourseTier {
  id: number;
  courseId: number;
  tier: TierSlug;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  isPublished: boolean;
  position: number;
}

export interface CatalogCourse {
  id: number;
  slug: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  heroImageUrl: string;
  categorySlug: CourseCategorySlug | null;
  isPurchasable: boolean;
  isPlaceholder: boolean;
  isPublished: boolean;
  displayPosition: number;
  tiers: CourseTier[];
}

interface CourseCatalogRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  thumbnail_url: string;
  hero_image_url: string;
  category_slug: CourseCategorySlug | null;
  is_purchasable: boolean;
  is_placeholder: boolean;
  is_published: boolean;
  display_position: number;
}

interface TierRow {
  id: number;
  course_id: number;
  tier: TierSlug;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_published: boolean;
  position: number;
}

function rowToTier(r: TierRow): CourseTier {
  return {
    id: r.id,
    courseId: r.course_id,
    tier: r.tier,
    name: r.name,
    description: r.description,
    priceCents: r.price_cents,
    currency: r.currency,
    stripeProductId: r.stripe_product_id,
    stripePriceId: r.stripe_price_id,
    isPublished: r.is_published,
    position: r.position,
  };
}

export async function listTiersForCourse(courseId: number): Promise<CourseTier[]> {
  const rows = (await sql`
    SELECT id, course_id, tier, name, description, price_cents, currency,
           stripe_product_id, stripe_price_id, is_published, position
    FROM course_tiers
    WHERE course_id = ${courseId} AND is_published = true
    ORDER BY position ASC, id ASC
  `) as TierRow[];
  return rows.map(rowToTier);
}

export async function getTierById(tierId: number): Promise<CourseTier | null> {
  const rows = (await sql`
    SELECT id, course_id, tier, name, description, price_cents, currency,
           stripe_product_id, stripe_price_id, is_published, position
    FROM course_tiers WHERE id = ${tierId} LIMIT 1
  `) as TierRow[];
  return rows[0] ? rowToTier(rows[0]) : null;
}

export async function getTierByStripePriceId(
  stripePriceId: string,
): Promise<CourseTier | null> {
  const rows = (await sql`
    SELECT id, course_id, tier, name, description, price_cents, currency,
           stripe_product_id, stripe_price_id, is_published, position
    FROM course_tiers WHERE stripe_price_id = ${stripePriceId} LIMIT 1
  `) as TierRow[];
  return rows[0] ? rowToTier(rows[0]) : null;
}

/**
 * Returns every published course that should appear in the catalog, with its
 * tiers attached. Includes both purchasable courses (live with prices) and
 * placeholder/coming-soon courses so the catalog can show "Notify me" cards
 * alongside buyable ones.
 */
export async function listCatalogCourses(): Promise<CatalogCourse[]> {
  const courseRows = (await sql`
    SELECT id, slug, title, summary, thumbnail_url, hero_image_url,
           category_slug, is_purchasable, is_placeholder, is_published,
           display_position
    FROM courses
    WHERE is_published = true OR is_placeholder = true
    ORDER BY display_position ASC, title ASC
  `) as CourseCatalogRow[];

  if (courseRows.length === 0) return [];

  const tierRows = (await sql`
    SELECT id, course_id, tier, name, description, price_cents, currency,
           stripe_product_id, stripe_price_id, is_published, position
    FROM course_tiers
    WHERE is_published = true
    ORDER BY course_id, position ASC, id ASC
  `) as TierRow[];

  const tiersByCourse = new Map<number, CourseTier[]>();
  for (const r of tierRows) {
    const t = rowToTier(r);
    const list = tiersByCourse.get(t.courseId) ?? [];
    list.push(t);
    tiersByCourse.set(t.courseId, list);
  }

  return courseRows.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    thumbnailUrl: c.thumbnail_url,
    heroImageUrl: c.hero_image_url,
    categorySlug: c.category_slug,
    isPurchasable: c.is_purchasable,
    isPlaceholder: c.is_placeholder,
    isPublished: c.is_published,
    displayPosition: c.display_position,
    tiers: tiersByCourse.get(c.id) ?? [],
  }));
}

export async function getCatalogCourseBySlug(
  slug: string,
): Promise<CatalogCourse | null> {
  const rows = (await sql`
    SELECT id, slug, title, summary, thumbnail_url, hero_image_url,
           category_slug, is_purchasable, is_placeholder, is_published,
           display_position
    FROM courses WHERE slug = ${slug} LIMIT 1
  `) as CourseCatalogRow[];
  if (rows.length === 0) return null;
  const c = rows[0];
  const tiers = await listTiersForCourse(c.id);
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    thumbnailUrl: c.thumbnail_url,
    heroImageUrl: c.hero_image_url,
    categorySlug: c.category_slug,
    isPurchasable: c.is_purchasable,
    isPlaceholder: c.is_placeholder,
    isPublished: c.is_published,
    displayPosition: c.display_position,
    tiers,
  };
}

export function priceRange(tiers: CourseTier[]): { fromCents: number; toCents: number } | null {
  if (tiers.length === 0) return null;
  const cents = tiers.map((t) => t.priceCents);
  return { fromCents: Math.min(...cents), toCents: Math.max(...cents) };
}

export function formatPriceCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// =============================================================================
// Purchase records (Stripe checkout sessions)
// =============================================================================

export interface CoursePurchase {
  id: number;
  userId: number;
  courseId: number;
  courseTierId: number;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amountCents: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  createdAt: string;
  completedAt: string | null;
}

interface PurchaseRow {
  id: number;
  user_id: number;
  course_id: number;
  course_tier_id: number;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  created_at: string;
  completed_at: string | null;
}

function rowToPurchase(r: PurchaseRow): CoursePurchase {
  return {
    id: r.id,
    userId: r.user_id,
    courseId: r.course_id,
    courseTierId: r.course_tier_id,
    stripeSessionId: r.stripe_session_id,
    stripePaymentIntentId: r.stripe_payment_intent_id,
    amountCents: r.amount_cents,
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  };
}

export async function recordPendingPurchase(opts: {
  userId: number;
  courseId: number;
  courseTierId: number;
  stripeSessionId: string;
  amountCents: number;
  currency: string;
}): Promise<CoursePurchase> {
  const rows = (await sql`
    INSERT INTO course_purchases
      (user_id, course_id, course_tier_id, stripe_session_id,
       amount_cents, currency, status)
    VALUES
      (${opts.userId}, ${opts.courseId}, ${opts.courseTierId},
       ${opts.stripeSessionId}, ${opts.amountCents}, ${opts.currency}, 'pending')
    RETURNING id, user_id, course_id, course_tier_id, stripe_session_id,
              stripe_payment_intent_id, amount_cents, currency, status,
              created_at, completed_at
  `) as PurchaseRow[];
  return rowToPurchase(rows[0]);
}

export async function getPurchaseBySessionId(
  sessionId: string,
): Promise<CoursePurchase | null> {
  const rows = (await sql`
    SELECT id, user_id, course_id, course_tier_id, stripe_session_id,
           stripe_payment_intent_id, amount_cents, currency, status,
           created_at, completed_at
    FROM course_purchases WHERE stripe_session_id = ${sessionId} LIMIT 1
  `) as PurchaseRow[];
  return rows[0] ? rowToPurchase(rows[0]) : null;
}

export async function markPurchaseSucceeded(
  sessionId: string,
  paymentIntentId: string | null,
): Promise<void> {
  await sql`
    UPDATE course_purchases
    SET status = 'succeeded',
        stripe_payment_intent_id = ${paymentIntentId},
        completed_at = NOW()
    WHERE stripe_session_id = ${sessionId} AND status = 'pending'
  `;
}

export async function markPurchaseFailed(sessionId: string): Promise<void> {
  await sql`
    UPDATE course_purchases
    SET status = 'failed', completed_at = NOW()
    WHERE stripe_session_id = ${sessionId} AND status = 'pending'
  `;
}

// =============================================================================
// User stripe customer id
// =============================================================================

export async function getStripeCustomerIdForUser(
  userId: number,
): Promise<string | null> {
  const rows = (await sql`
    SELECT stripe_customer_id FROM users WHERE id = ${userId} LIMIT 1
  `) as Array<{ stripe_customer_id: string | null }>;
  return rows[0]?.stripe_customer_id ?? null;
}

export async function setStripeCustomerIdForUser(
  userId: number,
  customerId: string,
): Promise<void> {
  await sql`
    UPDATE users SET stripe_customer_id = ${customerId}, updated_at = NOW()
    WHERE id = ${userId}
  `;
}
