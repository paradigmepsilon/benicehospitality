import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { getLessonById, listModulesForCourse } from "@/lib/lms";
import { listAssetsForLesson } from "@/lib/lesson-assets";
import LessonEditor from "@/components/admin/LessonEditor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function LessonEditorPage({ params }: PageProps) {
  const { id: courseIdRaw, lessonId: lessonIdRaw } = await params;
  const courseId = Number(courseIdRaw);
  const lessonId = Number(lessonIdRaw);
  if (!Number.isFinite(courseId) || !Number.isFinite(lessonId)) notFound();

  const courseRows = (await sql`
    SELECT id, title, slug FROM courses WHERE id = ${courseId} LIMIT 1
  `) as Array<{ id: number; title: string; slug: string }>;
  if (courseRows.length === 0) notFound();
  const course = courseRows[0];

  const lesson = await getLessonById(lessonId);
  if (!lesson || lesson.courseId !== courseId) notFound();

  const [modules, assets] = await Promise.all([
    listModulesForCourse(courseId),
    listAssetsForLesson(lessonId),
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href={`/admin/courses/${courseId}/curriculum`}
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-3"
      >
        ← {course.title} curriculum
      </Link>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-6">
        Lesson editor
      </h1>
      <LessonEditor
        courseSlug={course.slug}
        lesson={{
          id: lesson.id,
          courseId: lesson.courseId,
          moduleId: lesson.moduleId,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          body: lesson.body,
          position: lesson.position,
          durationMin: lesson.durationMin,
          bodyKind: lesson.bodyKind,
          videoUrl: lesson.videoUrl,
          bundleMainFilename: lesson.bundleMainFilename,
          bundleAspect: lesson.bundleAspect,
          minTier: lesson.minTier,
          isPublished: lesson.isPublished,
        }}
        modules={modules.map((m) => ({
          id: m.id,
          title: m.title,
        }))}
        initialAssets={assets.map((a) => ({
          id: a.id,
          filename: a.filename,
          relativePath: a.relativePath,
          contentType: a.contentType,
          sizeBytes: a.sizeBytes,
          role: a.role,
        }))}
      />
    </div>
  );
}
