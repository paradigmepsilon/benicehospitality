import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import {
  listModulesForCourse,
  listLessonsForCourse,
} from "@/lib/lms";
import CourseTabs from "@/components/admin/CourseTabs";
import CurriculumTree from "@/components/admin/CurriculumTree";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseCurriculumPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();

  const courseRows = (await sql`
    SELECT id, title FROM courses WHERE id = ${id} LIMIT 1
  `) as Array<{ id: number; title: string }>;
  if (courseRows.length === 0) notFound();

  const [modules, lessons] = await Promise.all([
    listModulesForCourse(id),
    listLessonsForCourse(id),
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <CourseTabs courseId={id} active="curriculum" courseTitle={courseRows[0].title} />
      <CurriculumTree
        courseId={id}
        initialModules={modules.map((m) => ({
          id: m.id,
          slug: m.slug,
          title: m.title,
          summary: m.summary,
          phaseLabel: m.phaseLabel,
          position: m.position,
          isPublished: m.isPublished,
        }))}
        initialLessons={lessons.map((l) => ({
          id: l.id,
          moduleId: l.moduleId,
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          position: l.position,
          bodyKind: l.bodyKind,
          isPublished: l.isPublished,
          minTier: l.minTier,
          durationMin: l.durationMin,
        }))}
      />
    </div>
  );
}
