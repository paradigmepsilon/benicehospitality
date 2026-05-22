import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getModuleById } from "@/lib/lms";

const bodySchema = z.object({ direction: z.enum(["up", "down"]) });

// Swaps the module's position with the immediate neighbor in the same course.
// We use this instead of writing arbitrary new positions so the up/down
// buttons can't drift positions over time.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { moduleId: idRaw } = await params;
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

  const mod = await getModuleById(id);
  if (!mod) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const neighborRows = (await sql`
    SELECT id, position FROM course_modules
    WHERE course_id = ${mod.courseId}
      AND ${body.direction === "up" ? sql`position < ${mod.position}` : sql`position > ${mod.position}`}
    ORDER BY ${body.direction === "up" ? sql`position DESC` : sql`position ASC`}
    LIMIT 1
  `) as Array<{ id: number; position: number }>;

  if (neighborRows.length === 0) {
    // Already at the edge — no-op.
    return NextResponse.json({ success: true, swapped: false });
  }

  const neighbor = neighborRows[0];
  await sql`UPDATE course_modules SET position = ${neighbor.position}, updated_at = NOW() WHERE id = ${mod.id}`;
  await sql`UPDATE course_modules SET position = ${mod.position}, updated_at = NOW() WHERE id = ${neighbor.id}`;

  return NextResponse.json({ success: true, swapped: true });
}
