import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth";
import { setLessonApproval } from "@/lib/course-review";

const bodySchema = z.object({ approved: z.boolean() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const auth = await requireAdminUser(request);
  if (auth.error) return auth.error;

  const { lessonId: idRaw } = await params;
  const lessonId = Number(idRaw);
  if (!Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = await setLessonApproval(lessonId, body.approved, auth.userId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ success: true });
}
