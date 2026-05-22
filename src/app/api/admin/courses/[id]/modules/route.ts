import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { createModule } from "@/lib/lms";

const createSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  phase_label: z.string().optional(),
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
      SELECT 1 FROM course_modules WHERE course_id = ${courseId} AND slug = ${s} LIMIT 1
    `) as unknown[];
    return rows.length > 0;
  });

  // Append at end of current module list.
  const posRows = (await sql`
    SELECT COALESCE(MAX(position), 0) + 10 AS next_pos
    FROM course_modules WHERE course_id = ${courseId}
  `) as Array<{ next_pos: number }>;

  const mod = await createModule({
    courseId,
    slug,
    title: body.title,
    summary: body.summary,
    phaseLabel: body.phase_label,
    position: posRows[0]?.next_pos ?? 10,
  });

  return NextResponse.json(mod, { status: 201 });
}
