import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import {
  deleteAsset,
  updateAsset,
  getAssetById,
  type LessonAssetRole,
} from "@/lib/lesson-assets";
import { updateLesson } from "@/lib/lms";

const patchSchema = z.object({
  filename: z.string().min(1).optional(),
  relative_path: z.string().min(1).optional(),
  role: z
    .enum(["main_html", "audio", "image", "attachment", "other"])
    .optional(),
  position: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idRaw } = await params;
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

  const existing = await getAssetById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await updateAsset(id, {
    filename: body.filename,
    relativePath: body.relative_path,
    role: body.role as LessonAssetRole | undefined,
    position: body.position,
  });

  // Promoting an asset to main_html updates the lesson row pointer too;
  // demoting from main_html to something else clears the pointer if this
  // asset was the registered main file.
  if (body.role === "main_html") {
    await updateLesson(existing.lessonId, {
      bundleMainFilename: body.relative_path ?? existing.relativePath,
      bodyKind: "bundle",
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getAssetById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteAsset(id);

  // If the deleted asset was the lesson's main HTML, clear the pointer.
  if (existing.role === "main_html") {
    await updateLesson(existing.lessonId, {
      bundleMainFilename: null,
    });
  }

  return NextResponse.json({ success: true });
}
