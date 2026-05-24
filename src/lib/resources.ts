import { sql } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { listEnrollmentsForUser, type EnrollmentTier } from "@/lib/lms";

// Member-resources data layer. Each row is a downloadable template / reference
// doc gated by enrollment tier. Files live in the existing `uploads` table.
// This table only stores the metadata + a FK to the upload row.

export type ResourceTier = "any" | "cohort" | "operator";

export interface MemberResource {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  fileUploadId: number | null;
  fileUrl: string | null;
  fileFilename: string | null;
  externalUrl: string | null;
  requiredTier: ResourceTier;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResourceRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  file_upload_id: number | null;
  file_filename: string | null;
  external_url: string | null;
  required_tier: ResourceTier;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Uploads are served by /api/images/[id] regardless of content-type. That
// route just streams whatever bytes the upload row holds with the stored
// content_type header.
function uploadUrlFor(id: number | null): string | null {
  return id === null ? null : `/api/images/${id}`;
}

function rowToResource(r: ResourceRow): MemberResource {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    body: r.body,
    fileUploadId: r.file_upload_id,
    fileUrl: uploadUrlFor(r.file_upload_id),
    fileFilename: r.file_filename,
    externalUrl: r.external_url,
    requiredTier: r.required_tier,
    isPublished: r.is_published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Highest tier a user has across all their active enrollments. */
export type EffectiveTier = "anonymous" | "any" | "cohort" | "operator";

const TIER_RANK: Record<EnrollmentTier | ResourceTier, number> = {
  any: 0,
  "self-paced": 0,
  comp: 0,
  cohort: 1,
  operator: 2,
};

function tierIncludes(
  effective: EffectiveTier,
  required: ResourceTier,
): boolean {
  if (effective === "anonymous") return false;
  return TIER_RANK[effective] >= TIER_RANK[required];
}

/**
 * Maps an LMS EnrollmentTier (from a synthesized "preview as tier" view) to
 * the resources access tier. Resources only differentiate three levels:
 * "any" (logged-in member at the lowest paid tier or below), "cohort", and
 * "operator", so self-paced collapses to "any".
 */
export function effectiveTierFromEnrollmentTier(
  tier: EnrollmentTier,
): EffectiveTier {
  if (tier === "operator") return "operator";
  if (tier === "cohort") return "cohort";
  return "any"; // self-paced + comp
}

export async function getEffectiveTierForUser(
  userId: number,
): Promise<EffectiveTier> {
  const enrollments = await listEnrollmentsForUser(userId);
  if (enrollments.length === 0) return "any"; // logged-in but not enrolled
  let highest: EffectiveTier = "any";
  for (const e of enrollments) {
    const rank = TIER_RANK[e.tier];
    if (rank >= TIER_RANK.operator) return "operator";
    if (rank >= TIER_RANK.cohort) highest = "cohort";
  }
  return highest;
}

// =============================================================================
// Member-facing reads
// =============================================================================

export async function listResourcesForTier(
  effective: EffectiveTier | "admin",
): Promise<MemberResource[]> {
  // Admin sentinel returns everything (published + unpublished) so admins can
  // preview drafts. Members only see published resources their tier allows.
  if (effective === "admin") {
    const rows = (await sql`
      SELECT r.id, r.slug, r.title, r.summary, r.body,
             r.file_upload_id, r.external_url, r.required_tier,
             r.is_published, r.created_at, r.updated_at,
             u.filename AS file_filename
      FROM member_resources r
      LEFT JOIN uploads u ON u.id = r.file_upload_id
      ORDER BY r.created_at DESC
    `) as ResourceRow[];
    return rows.map(rowToResource);
  }

  const rows = (await sql`
    SELECT r.id, r.slug, r.title, r.summary, r.body,
           r.file_upload_id, r.external_url, r.required_tier,
           r.is_published, r.created_at, r.updated_at,
           u.filename AS file_filename
    FROM member_resources r
    LEFT JOIN uploads u ON u.id = r.file_upload_id
    WHERE r.is_published = true
    ORDER BY r.created_at DESC
  `) as ResourceRow[];
  return rows.map(rowToResource).filter((r) => tierIncludes(effective, r.requiredTier));
}

export async function getResourceBySlug(
  slug: string,
): Promise<MemberResource | null> {
  const rows = (await sql`
    SELECT r.id, r.slug, r.title, r.summary, r.body,
           r.file_upload_id, r.external_url, r.required_tier,
           r.is_published, r.created_at, r.updated_at,
           u.filename AS file_filename
    FROM member_resources r
    LEFT JOIN uploads u ON u.id = r.file_upload_id
    WHERE r.slug = ${slug}
    LIMIT 1
  `) as ResourceRow[];
  return rows[0] ? rowToResource(rows[0]) : null;
}

export function userCanAccessResource(
  effective: EffectiveTier | "admin",
  resource: MemberResource,
): boolean {
  if (effective === "admin") return true;
  if (!resource.isPublished) return false;
  return tierIncludes(effective, resource.requiredTier);
}

// =============================================================================
// Admin CRUD
// =============================================================================

async function resourceSlugExists(slug: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM member_resources WHERE slug = ${slug} LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

export async function createResource(input: {
  title: string;
  summary: string;
  body: string;
  fileUploadId: number | null;
  externalUrl: string | null;
  requiredTier: ResourceTier;
  isPublished: boolean;
  createdByUserId: number;
}): Promise<MemberResource> {
  const slug = await uniqueSlug(input.title, resourceSlugExists);
  const rows = (await sql`
    INSERT INTO member_resources
      (slug, title, summary, body, file_upload_id, external_url,
       required_tier, is_published, created_by_user_id)
    VALUES
      (${slug}, ${input.title}, ${input.summary}, ${input.body},
       ${input.fileUploadId}, ${input.externalUrl},
       ${input.requiredTier}, ${input.isPublished}, ${input.createdByUserId})
    RETURNING id, slug, title, summary, body, file_upload_id, external_url,
              required_tier, is_published, created_at, updated_at
  `) as Array<Omit<ResourceRow, "file_url" | "file_filename">>;
  return rowToResource({
    ...rows[0],
    file_filename: null,
  });
}

export async function updateResource(
  id: number,
  patch: Partial<{
    title: string;
    summary: string;
    body: string;
    fileUploadId: number | null;
    externalUrl: string | null;
    requiredTier: ResourceTier;
    isPublished: boolean;
  }>,
): Promise<void> {
  if (typeof patch.title === "string")
    await sql`UPDATE member_resources SET title = ${patch.title}, updated_at = NOW() WHERE id = ${id}`;
  if (typeof patch.summary === "string")
    await sql`UPDATE member_resources SET summary = ${patch.summary}, updated_at = NOW() WHERE id = ${id}`;
  if (typeof patch.body === "string")
    await sql`UPDATE member_resources SET body = ${patch.body}, updated_at = NOW() WHERE id = ${id}`;
  if (patch.fileUploadId !== undefined)
    await sql`UPDATE member_resources SET file_upload_id = ${patch.fileUploadId}, updated_at = NOW() WHERE id = ${id}`;
  if (patch.externalUrl !== undefined)
    await sql`UPDATE member_resources SET external_url = ${patch.externalUrl}, updated_at = NOW() WHERE id = ${id}`;
  if (patch.requiredTier !== undefined)
    await sql`UPDATE member_resources SET required_tier = ${patch.requiredTier}, updated_at = NOW() WHERE id = ${id}`;
  if (typeof patch.isPublished === "boolean")
    await sql`UPDATE member_resources SET is_published = ${patch.isPublished}, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteResource(id: number): Promise<void> {
  await sql`DELETE FROM member_resources WHERE id = ${id}`;
}

export async function getResourceById(
  id: number,
): Promise<MemberResource | null> {
  const rows = (await sql`
    SELECT r.id, r.slug, r.title, r.summary, r.body,
           r.file_upload_id, r.external_url, r.required_tier,
           r.is_published, r.created_at, r.updated_at,
           u.filename AS file_filename
    FROM member_resources r
    LEFT JOIN uploads u ON u.id = r.file_upload_id
    WHERE r.id = ${id} LIMIT 1
  `) as ResourceRow[];
  return rows[0] ? rowToResource(rows[0]) : null;
}
