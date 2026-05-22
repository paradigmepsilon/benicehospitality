import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { createLesson } from "@/lib/lms";

const createSchema = z.object({
  title: z.string().min(1),
  module_id: z.number().int().nullable().optional(),
  summary: z.string().optional(),
  body_kind: z.enum(["text", "bundle", "video", "workbook"]).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idRaw } = await params;
  const courseId = Number(idRaw);
  if (!Number.isFinite(courseId)) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const slug = await uniqueSlug(body.title, async (s) => {
    const rows = (await sql`
      SELECT 1 FROM course_lessons WHERE course_id = ${courseId} AND slug = ${s} LIMIT 1
    `) as unknown[];
    return rows.length > 0;
  });

  // Append at end of module's lesson list (or unassigned bucket).
  const moduleId = body.module_id ?? null;
  const posRows = (await sql`
    SELECT COALESCE(MAX(position), 0) + 10 AS next_pos
    FROM course_lessons
    WHERE course_id = ${courseId}
      AND ${moduleId === null ? sql`module_id IS NULL` : sql`module_id = ${moduleId}`}
  `) as Array<{ next_pos: number }>;

  const lesson = await createLesson({
    courseId,
    moduleId,
    slug,
    title: body.title,
    summary: body.summary ?? "",
    bodyKind: body.body_kind ?? "text",
    position: posRows[0]?.next_pos ?? 10,
  });

  return NextResponse.json(lesson, { status: 201 });
}
