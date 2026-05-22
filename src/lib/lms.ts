// LMS access layer. The static sales-page catalog lives in src/lib/courses.ts
// and powers public marketing routes. This module is the runtime catalog —
// real DB rows for courses, lessons, enrollments, and progress — that gates
// the /account/courses/* surface.

import { sql } from "@/lib/db";

export type EnrollmentTier = "self-paced" | "cohort" | "operator" | "comp";
export type EnrollmentStatus = "active" | "paused" | "revoked";
export type LessonBodyKind = "text" | "bundle" | "video" | "workbook";
// Layout for bundle-type lessons. "slide" = 16:9 letterbox player (slide
// decks). "page" = full-width container with tall scroll area (workbooks,
// recap pages, articles).
export type BundleAspect = "slide" | "page";
export type MinTier = "self-paced" | "cohort" | "operator" | null;

export interface Course {
  id: number;
  slug: string;
  title: string;
  summary: string;
  heroImageUrl: string;
  isPublished: boolean;
  isPlaceholder: boolean;
}

export interface CourseModule {
  id: number;
  courseId: number;
  slug: string;
  title: string;
  summary: string;
  phaseLabel: string;
  position: number;
  isPublished: boolean;
}

export interface Lesson {
  id: number;
  courseId: number;
  moduleId: number | null;
  slug: string;
  title: string;
  summary: string;
  body: string;
  position: number;
  durationMin: number | null;
  bodyKind: LessonBodyKind;
  videoUrl: string | null;
  bundleMainFilename: string | null;
  bundleAspect: BundleAspect;
  minTier: MinTier;
  maxTier: MinTier;
  isPublished: boolean;
}

// Tier hierarchy for per-lesson gating. 'comp' counts as the highest tier
// since it's a complimentary all-access grant.
const TIER_RANK: Record<EnrollmentTier, number> = {
  "self-paced": 0,
  cohort: 1,
  operator: 2,
  comp: 2,
};

const MIN_TIER_RANK: Record<NonNullable<MinTier>, number> = {
  "self-paced": 0,
  cohort: 1,
  operator: 2,
};

export function userMeetsMinTier(
  userTier: EnrollmentTier | null,
  minTier: MinTier,
): boolean {
  if (!minTier) return true;
  if (!userTier) return false;
  return TIER_RANK[userTier] >= MIN_TIER_RANK[minTier];
}

// Format a lesson identifier as "M.L" (e.g. "1.4"). moduleIndex is the
// module's 1-based index in its course; lessonIndex is the lesson's 1-based
// index within its module. Orphan lessons (no module) collapse to "L".
export function formatLessonNumber(
  moduleIndex: number | null,
  lessonIndex: number,
): string {
  return moduleIndex ? `${moduleIndex}.${lessonIndex}` : `${lessonIndex}`;
}

// Combined access check for a lesson. Returns true when the user's tier sits
// between minTier and maxTier (inclusive). comp tier and admins bypass
// maxTier — admin bypass is handled at the call site via effectiveIsAdmin.
export function userCanAccessLesson(
  userTier: EnrollmentTier | null,
  minTier: MinTier,
  maxTier: MinTier,
): boolean {
  if (!userMeetsMinTier(userTier, minTier)) return false;
  if (!maxTier) return true;
  if (!userTier) return false;
  if (userTier === "comp") return true;
  return TIER_RANK[userTier] <= MIN_TIER_RANK[maxTier];
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  tier: EnrollmentTier;
  status: EnrollmentStatus;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
  totalLessons: number;
  completedLessons: number;
}

interface CourseRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  hero_image_url: string;
  is_published: boolean;
  is_placeholder: boolean;
}

interface LessonRow {
  id: number;
  course_id: number;
  module_id: number | null;
  slug: string;
  title: string;
  summary: string;
  body: string;
  position: number;
  duration_min: number | null;
  body_kind: LessonBodyKind;
  video_url: string | null;
  bundle_main_filename: string | null;
  bundle_aspect: BundleAspect;
  min_tier: MinTier;
  max_tier: MinTier;
  is_published: boolean;
}

interface ModuleRow {
  id: number;
  course_id: number;
  slug: string;
  title: string;
  summary: string;
  phase_label: string;
  position: number;
  is_published: boolean;
}

interface EnrollmentRow {
  id: number;
  user_id: number;
  course_id: number;
  tier: EnrollmentTier;
  status: EnrollmentStatus;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
}

function rowToCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    heroImageUrl: row.hero_image_url,
    isPublished: row.is_published,
    isPlaceholder: row.is_placeholder,
  };
}

function rowToLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    moduleId: row.module_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    position: row.position,
    durationMin: row.duration_min,
    bodyKind: row.body_kind,
    videoUrl: row.video_url,
    bundleMainFilename: row.bundle_main_filename,
    bundleAspect: row.bundle_aspect ?? "slide",
    minTier: row.min_tier,
    maxTier: row.max_tier,
    isPublished: row.is_published,
  };
}

function rowToModule(row: ModuleRow): CourseModule {
  return {
    id: row.id,
    courseId: row.course_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    phaseLabel: row.phase_label,
    position: row.position,
    isPublished: row.is_published,
  };
}

function rowToEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    tier: row.tier,
    status: row.status,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  };
}

// =============================================================================
// Catalog
// =============================================================================

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const rows = (await sql`
    SELECT id, slug, title, summary, hero_image_url, is_published, is_placeholder
    FROM courses WHERE slug = ${slug} LIMIT 1
  `) as CourseRow[];
  return rows[0] ? rowToCourse(rows[0]) : null;
}

export async function listLessonsForCourse(
  courseId: number,
): Promise<Lesson[]> {
  const rows = (await sql`
    SELECT cl.id, cl.course_id, cl.module_id, cl.slug, cl.title, cl.summary, cl.body,
           cl.position, cl.duration_min, cl.body_kind, cl.video_url,
           cl.bundle_main_filename, cl.bundle_aspect, cl.min_tier, cl.max_tier, cl.is_published
    FROM course_lessons cl
    JOIN course_modules cm ON cm.id = cl.module_id
    WHERE cl.course_id = ${courseId}
    ORDER BY cm.position ASC, cl.position ASC, cl.id ASC
  `) as LessonRow[];
  return rows.map(rowToLesson);
}

export async function getLessonByCourseAndSlug(
  courseId: number,
  lessonSlug: string,
): Promise<Lesson | null> {
  const rows = (await sql`
    SELECT id, course_id, module_id, slug, title, summary, body, position, duration_min,
           body_kind, video_url, bundle_main_filename, bundle_aspect, min_tier, max_tier, is_published
    FROM course_lessons WHERE course_id = ${courseId} AND slug = ${lessonSlug}
    LIMIT 1
  `) as LessonRow[];
  return rows[0] ? rowToLesson(rows[0]) : null;
}

// =============================================================================
// Enrollments
// =============================================================================

export async function getActiveEnrollment(
  userId: number,
  courseId: number,
): Promise<Enrollment | null> {
  const rows = (await sql`
    SELECT id, user_id, course_id, tier, status, granted_at, expires_at, revoked_at
    FROM enrollments
    WHERE user_id = ${userId} AND course_id = ${courseId}
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1
  `) as EnrollmentRow[];
  return rows[0] ? rowToEnrollment(rows[0]) : null;
}

export async function isUserEnrolled(
  userId: number,
  courseId: number,
): Promise<boolean> {
  return (await getActiveEnrollment(userId, courseId)) !== null;
}

/**
 * Returns every active enrollment for a user, plus the joined course and
 * a per-course progress count. Sorted with most recent enrollments first.
 */
export async function listEnrollmentsForUser(
  userId: number,
): Promise<EnrollmentWithCourse[]> {
  const rows = (await sql`
    SELECT
      e.id, e.user_id, e.course_id, e.tier, e.status,
      e.granted_at, e.expires_at, e.revoked_at,
      c.id AS c_id, c.slug, c.title, c.summary, c.hero_image_url,
      c.is_published, c.is_placeholder,
      (SELECT COUNT(*) FROM course_lessons cl WHERE cl.course_id = c.id) AS total_lessons,
      (
        SELECT COUNT(*) FROM lesson_progress lp
        JOIN course_lessons cl2 ON cl2.id = lp.lesson_id
        WHERE lp.user_id = ${userId} AND cl2.course_id = c.id
      ) AS completed_lessons
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = ${userId}
      AND e.status = 'active'
      AND (e.expires_at IS NULL OR e.expires_at > NOW())
    ORDER BY e.granted_at DESC
  `) as Array<
    EnrollmentRow & {
      c_id: number;
      slug: string;
      title: string;
      summary: string;
      hero_image_url: string;
      is_published: boolean;
      is_placeholder: boolean;
      total_lessons: string | number;
      completed_lessons: string | number;
    }
  >;

  return rows.map((row) => ({
    ...rowToEnrollment(row),
    course: rowToCourse({
      id: row.c_id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      hero_image_url: row.hero_image_url,
      is_published: row.is_published,
      is_placeholder: row.is_placeholder,
    }),
    totalLessons: Number(row.total_lessons),
    completedLessons: Number(row.completed_lessons),
  }));
}

/**
 * Returns one synthesized EnrollmentWithCourse per published course, all
 * stamped with the given tier. Used when an admin previews the member portal
 * "as a Tier N member" — they need the dashboard / course list to render as
 * if enrolled everywhere at that tier, but we don't want to write fake rows
 * to the real enrollments table. Progress is always 0 since the admin's
 * lesson_progress for these courses is intentionally empty.
 */
export async function synthesizeEnrollmentsForTier(
  tier: EnrollmentTier,
): Promise<EnrollmentWithCourse[]> {
  const rows = (await sql`
    SELECT
      c.id, c.slug, c.title, c.summary, c.hero_image_url,
      c.is_published, c.is_placeholder,
      (SELECT COUNT(*) FROM course_lessons cl WHERE cl.course_id = c.id) AS total_lessons
    FROM courses c
    WHERE c.is_published = true
    ORDER BY c.title ASC
  `) as Array<
    CourseRow & { total_lessons: string | number }
  >;

  return rows.map((row) => ({
    id: -row.id, // negative ids signal "synthesized, not a real enrollment row"
    userId: 0,
    courseId: row.id,
    tier,
    status: "active" as const,
    grantedAt: new Date(0).toISOString(),
    expiresAt: null,
    revokedAt: null,
    course: rowToCourse(row),
    totalLessons: Number(row.total_lessons),
    completedLessons: 0,
  }));
}

// =============================================================================
// Admin enrollment management
// =============================================================================

export async function grantEnrollment(opts: {
  userId: number;
  courseId: number;
  tier: EnrollmentTier;
  grantedByUserId: number | null;
  expiresAt?: Date | null;
  notes?: string;
}): Promise<Enrollment> {
  const expiresIso = opts.expiresAt ? opts.expiresAt.toISOString() : null;
  const rows = (await sql`
    INSERT INTO enrollments (user_id, course_id, tier, status, granted_by_user_id, expires_at, notes)
    VALUES (
      ${opts.userId}, ${opts.courseId}, ${opts.tier}, 'active',
      ${opts.grantedByUserId}, ${expiresIso}, ${opts.notes ?? null}
    )
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      tier = EXCLUDED.tier,
      status = 'active',
      granted_by_user_id = EXCLUDED.granted_by_user_id,
      expires_at = EXCLUDED.expires_at,
      notes = EXCLUDED.notes,
      revoked_at = NULL,
      granted_at = NOW()
    RETURNING id, user_id, course_id, tier, status, granted_at, expires_at, revoked_at
  `) as EnrollmentRow[];
  return rowToEnrollment(rows[0]);
}

export async function revokeEnrollmentById(
  enrollmentId: number,
): Promise<void> {
  await sql`
    UPDATE enrollments
    SET status = 'revoked', revoked_at = NOW()
    WHERE id = ${enrollmentId} AND status != 'revoked'
  `;
}

export async function listAllEnrollmentsForAdmin(): Promise<
  Array<
    Enrollment & {
      userEmail: string;
      userName: string;
      courseSlug: string;
      courseTitle: string;
    }
  >
> {
  const rows = (await sql`
    SELECT
      e.id, e.user_id, e.course_id, e.tier, e.status,
      e.granted_at, e.expires_at, e.revoked_at,
      u.email AS user_email, u.name AS user_name,
      c.slug AS course_slug, c.title AS course_title
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    JOIN courses c ON c.id = e.course_id
    ORDER BY e.granted_at DESC
  `) as Array<
    EnrollmentRow & {
      user_email: string;
      user_name: string;
      course_slug: string;
      course_title: string;
    }
  >;
  return rows.map((row) => ({
    ...rowToEnrollment(row),
    userEmail: row.user_email,
    userName: row.user_name,
    courseSlug: row.course_slug,
    courseTitle: row.course_title,
  }));
}

// =============================================================================
// Progress
// =============================================================================

export async function listCompletedLessonIds(
  userId: number,
  courseId: number,
): Promise<Set<number>> {
  const rows = (await sql`
    SELECT lp.lesson_id
    FROM lesson_progress lp
    JOIN course_lessons cl ON cl.id = lp.lesson_id
    WHERE lp.user_id = ${userId} AND cl.course_id = ${courseId}
  `) as { lesson_id: number }[];
  return new Set(rows.map((r) => r.lesson_id));
}

export async function markLessonComplete(
  userId: number,
  lessonId: number,
): Promise<void> {
  await sql`
    INSERT INTO lesson_progress (user_id, lesson_id)
    VALUES (${userId}, ${lessonId})
    ON CONFLICT (user_id, lesson_id) DO NOTHING
  `;
}

export async function unmarkLessonComplete(
  userId: number,
  lessonId: number,
): Promise<void> {
  await sql`
    DELETE FROM lesson_progress
    WHERE user_id = ${userId} AND lesson_id = ${lessonId}
  `;
}

// =============================================================================
// Admin helpers
// =============================================================================

export async function listAllCourses(): Promise<Course[]> {
  const rows = (await sql`
    SELECT id, slug, title, summary, hero_image_url, is_published, is_placeholder
    FROM courses
    ORDER BY title ASC
  `) as CourseRow[];
  return rows.map(rowToCourse);
}

export async function listAllUsersBasic(): Promise<
  Array<{ id: number; email: string; name: string; role: string }>
> {
  const rows = (await sql`
    SELECT id, email, name, role FROM users
    WHERE disabled_at IS NULL
    ORDER BY name ASC
  `) as Array<{ id: number; email: string; name: string; role: string }>;
  return rows;
}

// =============================================================================
// Modules
// =============================================================================

export async function listModulesForCourse(
  courseId: number,
): Promise<CourseModule[]> {
  const rows = (await sql`
    SELECT id, course_id, slug, title, summary, phase_label, position, is_published
    FROM course_modules WHERE course_id = ${courseId}
    ORDER BY position ASC, id ASC
  `) as ModuleRow[];
  return rows.map(rowToModule);
}

export async function getModuleById(
  moduleId: number,
): Promise<CourseModule | null> {
  const rows = (await sql`
    SELECT id, course_id, slug, title, summary, phase_label, position, is_published
    FROM course_modules WHERE id = ${moduleId} LIMIT 1
  `) as ModuleRow[];
  return rows[0] ? rowToModule(rows[0]) : null;
}

export async function getModuleByCourseAndSlug(
  courseId: number,
  slug: string,
): Promise<CourseModule | null> {
  const rows = (await sql`
    SELECT id, course_id, slug, title, summary, phase_label, position, is_published
    FROM course_modules WHERE course_id = ${courseId} AND slug = ${slug} LIMIT 1
  `) as ModuleRow[];
  return rows[0] ? rowToModule(rows[0]) : null;
}

export async function listLessonsForModule(
  moduleId: number,
): Promise<Lesson[]> {
  const rows = (await sql`
    SELECT id, course_id, module_id, slug, title, summary, body, position, duration_min,
           body_kind, video_url, bundle_main_filename, bundle_aspect, min_tier, max_tier, is_published
    FROM course_lessons
    WHERE module_id = ${moduleId}
    ORDER BY position ASC, id ASC
  `) as LessonRow[];
  return rows.map(rowToLesson);
}

export async function getLessonById(lessonId: number): Promise<Lesson | null> {
  const rows = (await sql`
    SELECT id, course_id, module_id, slug, title, summary, body, position, duration_min,
           body_kind, video_url, bundle_main_filename, bundle_aspect, min_tier, max_tier, is_published
    FROM course_lessons WHERE id = ${lessonId} LIMIT 1
  `) as LessonRow[];
  return rows[0] ? rowToLesson(rows[0]) : null;
}

// =============================================================================
// Module + lesson admin writes
// =============================================================================

export async function createModule(opts: {
  courseId: number;
  slug: string;
  title: string;
  summary?: string;
  phaseLabel?: string;
  position?: number;
}): Promise<CourseModule> {
  const rows = (await sql`
    INSERT INTO course_modules (course_id, slug, title, summary, phase_label, position)
    VALUES (
      ${opts.courseId}, ${opts.slug}, ${opts.title},
      ${opts.summary ?? ""}, ${opts.phaseLabel ?? ""}, ${opts.position ?? 0}
    )
    RETURNING id, course_id, slug, title, summary, phase_label, position, is_published
  `) as ModuleRow[];
  return rowToModule(rows[0]);
}

export async function updateModule(
  moduleId: number,
  patch: Partial<{
    title: string;
    slug: string;
    summary: string;
    phaseLabel: string;
    position: number;
    isPublished: boolean;
  }>,
): Promise<void> {
  if (typeof patch.title === "string")
    await sql`UPDATE course_modules SET title = ${patch.title}, updated_at = NOW() WHERE id = ${moduleId}`;
  if (typeof patch.slug === "string")
    await sql`UPDATE course_modules SET slug = ${patch.slug}, updated_at = NOW() WHERE id = ${moduleId}`;
  if (typeof patch.summary === "string")
    await sql`UPDATE course_modules SET summary = ${patch.summary}, updated_at = NOW() WHERE id = ${moduleId}`;
  if (typeof patch.phaseLabel === "string")
    await sql`UPDATE course_modules SET phase_label = ${patch.phaseLabel}, updated_at = NOW() WHERE id = ${moduleId}`;
  if (typeof patch.position === "number")
    await sql`UPDATE course_modules SET position = ${patch.position}, updated_at = NOW() WHERE id = ${moduleId}`;
  if (typeof patch.isPublished === "boolean")
    await sql`UPDATE course_modules SET is_published = ${patch.isPublished}, updated_at = NOW() WHERE id = ${moduleId}`;
}

export async function deleteModule(moduleId: number): Promise<void> {
  await sql`DELETE FROM course_modules WHERE id = ${moduleId}`;
}

export async function createLesson(opts: {
  courseId: number;
  moduleId: number | null;
  slug: string;
  title: string;
  summary?: string;
  body?: string;
  position?: number;
  durationMin?: number | null;
  bodyKind?: LessonBodyKind;
  videoUrl?: string | null;
  bundleMainFilename?: string | null;
  bundleAspect?: BundleAspect;
  minTier?: MinTier;
  maxTier?: MinTier;
  isPublished?: boolean;
}): Promise<Lesson> {
  const rows = (await sql`
    INSERT INTO course_lessons
      (course_id, module_id, slug, title, summary, body, position, duration_min,
       body_kind, video_url, bundle_main_filename, bundle_aspect, min_tier, max_tier, is_published)
    VALUES (
      ${opts.courseId}, ${opts.moduleId}, ${opts.slug}, ${opts.title},
      ${opts.summary ?? ""}, ${opts.body ?? ""}, ${opts.position ?? 0},
      ${opts.durationMin ?? null}, ${opts.bodyKind ?? "text"},
      ${opts.videoUrl ?? null}, ${opts.bundleMainFilename ?? null},
      ${opts.bundleAspect ?? "slide"},
      ${opts.minTier ?? null}, ${opts.maxTier ?? null}, ${opts.isPublished ?? true}
    )
    RETURNING id, course_id, module_id, slug, title, summary, body, position, duration_min,
              body_kind, video_url, bundle_main_filename, bundle_aspect, min_tier, max_tier, is_published
  `) as LessonRow[];
  return rowToLesson(rows[0]);
}

export async function updateLesson(
  lessonId: number,
  patch: Partial<{
    title: string;
    slug: string;
    summary: string;
    body: string;
    position: number;
    durationMin: number | null;
    bodyKind: LessonBodyKind;
    videoUrl: string | null;
    bundleMainFilename: string | null;
    bundleAspect: BundleAspect;
    minTier: MinTier;
    maxTier: MinTier;
    isPublished: boolean;
    moduleId: number | null;
  }>,
): Promise<void> {
  if (typeof patch.title === "string")
    await sql`UPDATE course_lessons SET title = ${patch.title}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (typeof patch.slug === "string")
    await sql`UPDATE course_lessons SET slug = ${patch.slug}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (typeof patch.summary === "string")
    await sql`UPDATE course_lessons SET summary = ${patch.summary}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (typeof patch.body === "string")
    await sql`UPDATE course_lessons SET body = ${patch.body}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (typeof patch.position === "number")
    await sql`UPDATE course_lessons SET position = ${patch.position}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.durationMin !== undefined)
    await sql`UPDATE course_lessons SET duration_min = ${patch.durationMin}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.bodyKind !== undefined)
    await sql`UPDATE course_lessons SET body_kind = ${patch.bodyKind}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.videoUrl !== undefined)
    await sql`UPDATE course_lessons SET video_url = ${patch.videoUrl}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.bundleMainFilename !== undefined)
    await sql`UPDATE course_lessons SET bundle_main_filename = ${patch.bundleMainFilename}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.bundleAspect !== undefined)
    await sql`UPDATE course_lessons SET bundle_aspect = ${patch.bundleAspect}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.minTier !== undefined)
    await sql`UPDATE course_lessons SET min_tier = ${patch.minTier}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.maxTier !== undefined)
    await sql`UPDATE course_lessons SET max_tier = ${patch.maxTier}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (typeof patch.isPublished === "boolean")
    await sql`UPDATE course_lessons SET is_published = ${patch.isPublished}, updated_at = NOW() WHERE id = ${lessonId}`;
  if (patch.moduleId !== undefined)
    await sql`UPDATE course_lessons SET module_id = ${patch.moduleId}, updated_at = NOW() WHERE id = ${lessonId}`;
}

export async function deleteLesson(lessonId: number): Promise<void> {
  await sql`DELETE FROM course_lessons WHERE id = ${lessonId}`;
}

// =============================================================================
// Course admin writes
// =============================================================================

export async function createCourse(opts: {
  slug: string;
  title: string;
  summary?: string;
  heroImageUrl?: string;
  isPublished?: boolean;
  isPlaceholder?: boolean;
}): Promise<Course> {
  const rows = (await sql`
    INSERT INTO courses (slug, title, summary, hero_image_url, is_published, is_placeholder)
    VALUES (
      ${opts.slug}, ${opts.title}, ${opts.summary ?? ""},
      ${opts.heroImageUrl ?? ""}, ${opts.isPublished ?? false},
      ${opts.isPlaceholder ?? false}
    )
    RETURNING id, slug, title, summary, hero_image_url, is_published, is_placeholder
  `) as CourseRow[];
  return rowToCourse(rows[0]);
}

export async function updateCourse(
  courseId: number,
  patch: Partial<{
    title: string;
    slug: string;
    summary: string;
    heroImageUrl: string;
    thumbnailUrl: string;
    categorySlug: string | null;
    displayPosition: number;
    isPublished: boolean;
    isPlaceholder: boolean;
    isPurchasable: boolean;
  }>,
): Promise<void> {
  if (typeof patch.title === "string")
    await sql`UPDATE courses SET title = ${patch.title}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.slug === "string")
    await sql`UPDATE courses SET slug = ${patch.slug}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.summary === "string")
    await sql`UPDATE courses SET summary = ${patch.summary}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.heroImageUrl === "string")
    await sql`UPDATE courses SET hero_image_url = ${patch.heroImageUrl}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.thumbnailUrl === "string")
    await sql`UPDATE courses SET thumbnail_url = ${patch.thumbnailUrl}, updated_at = NOW() WHERE id = ${courseId}`;
  if (patch.categorySlug !== undefined)
    await sql`UPDATE courses SET category_slug = ${patch.categorySlug}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.displayPosition === "number")
    await sql`UPDATE courses SET display_position = ${patch.displayPosition}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.isPublished === "boolean")
    await sql`UPDATE courses SET is_published = ${patch.isPublished}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.isPlaceholder === "boolean")
    await sql`UPDATE courses SET is_placeholder = ${patch.isPlaceholder}, updated_at = NOW() WHERE id = ${courseId}`;
  if (typeof patch.isPurchasable === "boolean")
    await sql`UPDATE courses SET is_purchasable = ${patch.isPurchasable}, updated_at = NOW() WHERE id = ${courseId}`;
}

export async function deleteCourse(courseId: number): Promise<void> {
  await sql`DELETE FROM courses WHERE id = ${courseId}`;
}
