import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { createCourse, listAllCourses } from "@/lib/lms";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  const courses = await listAllCourses();
  return NextResponse.json(courses);
}

const createSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
});

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  let parsed: z.infer<typeof createSchema>;
  try {
    parsed = createSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const slug = await uniqueSlug(parsed.title, async (s) => {
    const rows = (await sql`SELECT 1 FROM courses WHERE slug = ${s} LIMIT 1`) as unknown[];
    return rows.length > 0;
  });

  const course = await createCourse({
    slug,
    title: parsed.title,
    summary: parsed.summary ?? "",
    isPublished: false,
  });

  return NextResponse.json(course, { status: 201 });
}
