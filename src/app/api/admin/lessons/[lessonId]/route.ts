import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { updateLesson, deleteLesson } from "@/lib/lms";

const patchSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  body: z.string().optional(),
  position: z.number().int().optional(),
  duration_min: z.number().int().nullable().optional(),
  body_kind: z.enum(["text", "bundle", "video", "workbook"]).optional(),
  video_url: z.string().nullable().optional(),
  bundle_main_filename: z.string().nullable().optional(),
  bundle_aspect: z.enum(["slide", "page"]).optional(),
  min_tier: z
    .enum(["self-paced", "cohort", "operator"])
    .nullable()
    .optional(),
  is_published: z.boolean().optional(),
  module_id: z.number().int().nullable().optional(),
});

export async function PATCH(
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

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await updateLesson(id, {
    title: body.title,
    slug: body.slug,
    summary: body.summary,
    body: body.body,
    position: body.position,
    durationMin: body.duration_min,
    bodyKind: body.body_kind,
    videoUrl: body.video_url,
    bundleMainFilename: body.bundle_main_filename,
    bundleAspect: body.bundle_aspect,
    minTier: body.min_tier,
    isPublished: body.is_published,
    moduleId: body.module_id,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
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
  await deleteLesson(id);
  return NextResponse.json({ success: true });
}
