import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getLessonById } from "@/lib/lms";

const bodySchema = z.object({ direction: z.enum(["up", "down"]) });

// Swaps the lesson's position with the immediate neighbor in the same module.
// Lessons without a module are reordered within the unassigned bucket.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { lessonId: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const lesson = await getLessonById(id);
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const moduleScope = lesson.moduleId === null
    ? sql`module_id IS NULL`
    : sql`module_id = ${lesson.moduleId}`;

  const neighborRows = (await sql`
    SELECT id, position FROM course_lessons
    WHERE course_id = ${lesson.courseId}
      AND ${moduleScope}
      AND ${body.direction === "up" ? sql`position < ${lesson.position}` : sql`position > ${lesson.position}`}
    ORDER BY ${body.direction === "up" ? sql`position DESC` : sql`position ASC`}
    LIMIT 1
  `) as Array<{ id: number; position: number }>;

  if (neighborRows.length === 0) {
    return NextResponse.json({ success: true, swapped: false });
  }

  const neighbor = neighborRows[0];
  await sql`UPDATE course_lessons SET position = ${neighbor.position}, updated_at = NOW() WHERE id = ${lesson.id}`;
  await sql`UPDATE course_lessons SET position = ${lesson.position}, updated_at = NOW() WHERE id = ${neighbor.id}`;

  return NextResponse.json({ success: true, swapped: true });
}
