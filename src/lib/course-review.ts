// Admin review workflow for course content.
//
// Lessons and modules carry a review_status ('draft' | 'approved'); approving
// publishes them, unapproving unpublishes. A course only becomes publicly
// visible when the admin marks it ready, which is allowed once every lesson
// and every non-empty module is approved. Unapproving anything cascades
// upward: the containing module drops back to draft, and a ready course drops
// back to hidden — the course is never public with unapproved content in it.

import { sql } from "@/lib/db";

export type ReviewStatus = "draft" | "approved";

export interface ReviewLesson {
  id: number;
  slug: string;
  title: string;
  summary: string;
  position: number;
  bodyKind: string;
  isPublished: boolean;
  reviewStatus: ReviewStatus;
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface ReviewModule {
  id: number;
  slug: string;
  title: string;
  phaseLabel: string;
  position: number;
  isPublished: boolean;
  reviewStatus: ReviewStatus;
  approvedAt: string | null;
  approvedBy: string | null;
  lessons: ReviewLesson[];
}

export interface CourseReviewState {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  isReady: boolean;
  readyAt: string | null;
  isPublished: boolean;
  isPurchasable: boolean;
  modules: ReviewModule[];
  draftLessonCount: number;
  draftModuleCount: number; // non-empty modules still in draft
}

export async function getCourseReviewState(
  courseId: number,
): Promise<CourseReviewState | null> {
  const courseRows = (await sql`
    SELECT id, slug, title, is_ready, ready_at, is_published, is_purchasable
    FROM courses WHERE id = ${courseId} LIMIT 1
  `) as Array<{
    id: number;
    slug: string;
    title: string;
    is_ready: boolean;
    ready_at: string | null;
    is_published: boolean;
    is_purchasable: boolean;
  }>;
  if (!courseRows[0]) return null;
  const course = courseRows[0];

  const moduleRows = (await sql`
    SELECT m.id, m.slug, m.title, m.phase_label, m.position, m.is_published,
           m.review_status, m.approved_at, u.email AS approved_by
    FROM course_modules m
    LEFT JOIN users u ON u.id = m.approved_by_user_id
    WHERE m.course_id = ${courseId}
    ORDER BY m.position ASC, m.id ASC
  `) as Array<{
    id: number;
    slug: string;
    title: string;
    phase_label: string;
    position: number;
    is_published: boolean;
    review_status: ReviewStatus;
    approved_at: string | null;
    approved_by: string | null;
  }>;

  const lessonRows = (await sql`
    SELECT l.id, l.module_id, l.slug, l.title, l.summary, l.position,
           l.body_kind, l.is_published, l.review_status, l.approved_at,
           u.email AS approved_by
    FROM course_lessons l
    LEFT JOIN users u ON u.id = l.approved_by_user_id
    WHERE l.course_id = ${courseId}
    ORDER BY l.position ASC, l.id ASC
  `) as Array<{
    id: number;
    module_id: number | null;
    slug: string;
    title: string;
    summary: string;
    position: number;
    body_kind: string;
    is_published: boolean;
    review_status: ReviewStatus;
    approved_at: string | null;
    approved_by: string | null;
  }>;

  const byModule = new Map<number, ReviewLesson[]>();
  let draftLessonCount = 0;
  for (const l of lessonRows) {
    if (l.review_status !== "approved") draftLessonCount += 1;
    if (l.module_id === null) continue; // orphans never reach students
    const list = byModule.get(l.module_id) ?? [];
    list.push({
      id: l.id,
      slug: l.slug,
      title: l.title,
      summary: l.summary,
      position: l.position,
      bodyKind: l.body_kind,
      isPublished: l.is_published,
      reviewStatus: l.review_status,
      approvedAt: l.approved_at,
      approvedBy: l.approved_by,
    });
    byModule.set(l.module_id, list);
  }

  const modules: ReviewModule[] = moduleRows.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    phaseLabel: m.phase_label,
    position: m.position,
    isPublished: m.is_published,
    reviewStatus: m.review_status,
    approvedAt: m.approved_at,
    approvedBy: m.approved_by,
    lessons: byModule.get(m.id) ?? [],
  }));

  const draftModuleCount = modules.filter(
    (m) => m.lessons.length > 0 && m.reviewStatus !== "approved",
  ).length;

  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    isReady: course.is_ready,
    readyAt: course.ready_at,
    isPublished: course.is_published,
    isPurchasable: course.is_purchasable,
    modules,
    draftLessonCount,
    draftModuleCount,
  };
}

async function unreadyCourse(courseId: number): Promise<void> {
  await sql`
    UPDATE courses
    SET is_ready = false, ready_at = NULL, ready_by_user_id = NULL,
        is_published = false, is_purchasable = false, updated_at = NOW()
    WHERE id = ${courseId} AND is_ready = true
  `;
}

export async function setLessonApproval(
  lessonId: number,
  approved: boolean,
  adminUserId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const rows = (await sql`
    SELECT id, course_id, module_id FROM course_lessons WHERE id = ${lessonId} LIMIT 1
  `) as Array<{ id: number; course_id: number; module_id: number | null }>;
  if (!rows[0]) return { ok: false, error: "Lesson not found" };
  const lesson = rows[0];

  if (approved) {
    await sql`
      UPDATE course_lessons
      SET review_status = 'approved', approved_at = NOW(),
          approved_by_user_id = ${adminUserId}, is_published = true,
          updated_at = NOW()
      WHERE id = ${lessonId}
    `;
  } else {
    await sql`
      UPDATE course_lessons
      SET review_status = 'draft', approved_at = NULL,
          approved_by_user_id = NULL, is_published = false,
          updated_at = NOW()
      WHERE id = ${lessonId}
    `;
    // A module is only "complete" while every lesson in it is approved.
    if (lesson.module_id !== null) {
      await sql`
        UPDATE course_modules
        SET review_status = 'draft', approved_at = NULL,
            approved_by_user_id = NULL, updated_at = NOW()
        WHERE id = ${lesson.module_id} AND review_status = 'approved'
      `;
    }
    await unreadyCourse(lesson.course_id);
  }
  return { ok: true };
}

export async function setModuleApproval(
  moduleId: number,
  approved: boolean,
  adminUserId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const rows = (await sql`
    SELECT id, course_id FROM course_modules WHERE id = ${moduleId} LIMIT 1
  `) as Array<{ id: number; course_id: number }>;
  if (!rows[0]) return { ok: false, error: "Module not found" };

  if (approved) {
    const draft = (await sql`
      SELECT COUNT(*)::int AS n FROM course_lessons
      WHERE module_id = ${moduleId} AND review_status <> 'approved'
    `) as Array<{ n: number }>;
    if (draft[0].n > 0) {
      return {
        ok: false,
        error: `${draft[0].n} lesson(s) in this module still need approval`,
      };
    }
    await sql`
      UPDATE course_modules
      SET review_status = 'approved', approved_at = NOW(),
          approved_by_user_id = ${adminUserId}, is_published = true,
          updated_at = NOW()
      WHERE id = ${moduleId}
    `;
  } else {
    await sql`
      UPDATE course_modules
      SET review_status = 'draft', approved_at = NULL,
          approved_by_user_id = NULL, updated_at = NOW()
      WHERE id = ${moduleId}
    `;
    await unreadyCourse(rows[0].course_id);
  }
  return { ok: true };
}

export async function setCourseReady(
  courseId: number,
  ready: boolean,
  adminUserId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (ready) {
    const state = await getCourseReviewState(courseId);
    if (!state) return { ok: false, error: "Course not found" };
    if (state.draftLessonCount > 0 || state.draftModuleCount > 0) {
      return {
        ok: false,
        error:
          `Course is not fully approved yet: ${state.draftLessonCount} draft ` +
          `lesson(s), ${state.draftModuleCount} unapproved module(s).`,
      };
    }
    await sql`
      UPDATE courses
      SET is_ready = true, ready_at = NOW(), ready_by_user_id = ${adminUserId},
          is_published = true, is_purchasable = true, is_placeholder = false,
          updated_at = NOW()
      WHERE id = ${courseId}
    `;
  } else {
    await sql`
      UPDATE courses
      SET is_ready = false, ready_at = NULL, ready_by_user_id = NULL,
          is_published = false, is_purchasable = false, is_placeholder = true,
          updated_at = NOW()
      WHERE id = ${courseId}
    `;
  }
  return { ok: true };
}
