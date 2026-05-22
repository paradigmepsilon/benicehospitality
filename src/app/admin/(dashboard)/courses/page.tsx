import { sql } from "@/lib/db";
import CoursesAdmin from "@/components/admin/CoursesAdmin";

export const dynamic = "force-dynamic";

interface CourseRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  is_published: boolean;
  is_purchasable: boolean;
  is_placeholder: boolean;
  category_slug: string | null;
  display_position: number;
  module_count: string | number;
  lesson_count: string | number;
}

export default async function CoursesAdminPage() {
  const rows = (await sql`
    SELECT c.id, c.slug, c.title, c.summary, c.is_published, c.is_purchasable,
           c.is_placeholder, c.category_slug, c.display_position,
           (SELECT COUNT(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
           (SELECT COUNT(*) FROM course_lessons l WHERE l.course_id = c.id) AS lesson_count
    FROM courses c
    ORDER BY c.display_position ASC, c.title ASC
  `) as CourseRow[];

  const courses = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    isPublished: r.is_published,
    isPurchasable: r.is_purchasable,
    isPlaceholder: r.is_placeholder,
    categorySlug: r.category_slug,
    displayPosition: r.display_position,
    moduleCount: Number(r.module_count),
    lessonCount: Number(r.lesson_count),
  }));

  return <CoursesAdmin initialCourses={courses} />;
}
