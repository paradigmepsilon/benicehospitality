import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { updateModule, deleteModule } from "@/lib/lms";

const patchSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  phase_label: z.string().optional(),
  position: z.number().int().optional(),
  is_published: z.boolean().optional(),
});

export async function PATCH(
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

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await updateModule(id, {
    title: body.title,
    slug: body.slug,
    summary: body.summary,
    phaseLabel: body.phase_label,
    position: body.position,
    isPublished: body.is_published,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
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
  await deleteModule(id);
  return NextResponse.json({ success: true });
}
