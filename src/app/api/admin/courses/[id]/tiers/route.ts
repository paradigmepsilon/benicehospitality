import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { listTiersForCourse } from "@/lib/course-catalog";

const createSchema = z.object({
  tier: z.enum(["self-paced", "cohort", "operator"]),
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().positive(),
});

export async function GET(
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
  const tiers = await listTiersForCourse(courseId);
  return NextResponse.json(tiers);
}

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

  const posRows = (await sql`
    SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
    FROM course_tiers WHERE course_id = ${courseId}
  `) as Array<{ next_pos: number }>;

  const inserted = (await sql`
    INSERT INTO course_tiers (course_id, tier, name, description, price_cents, position)
    VALUES (
      ${courseId}, ${body.tier}, ${body.name}, ${body.description ?? ""},
      ${body.price_cents}, ${posRows[0]?.next_pos ?? 0}
    )
    RETURNING id, course_id, tier, name, description, price_cents, currency,
              stripe_product_id, stripe_price_id, is_published, position
  `) as Array<{ id: number }>;

  return NextResponse.json({ id: inserted[0].id }, { status: 201 });
}
