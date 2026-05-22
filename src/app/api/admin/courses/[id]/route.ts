import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { updateCourse, deleteCourse } from "@/lib/lms";

const patchSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  hero_image_url: z.string().optional(),
  thumbnail_url: z.string().optional(),
  category_slug: z.string().nullable().optional(),
  display_position: z.number().int().optional(),
  is_published: z.boolean().optional(),
  is_placeholder: z.boolean().optional(),
  is_purchasable: z.boolean().optional(),
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

  await updateCourse(id, {
    title: body.title,
    slug: body.slug,
    summary: body.summary,
    heroImageUrl: body.hero_image_url,
    thumbnailUrl: body.thumbnail_url,
    categorySlug: body.category_slug,
    displayPosition: body.display_position,
    isPublished: body.is_published,
    isPlaceholder: body.is_placeholder,
    isPurchasable: body.is_purchasable,
  });

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
  await deleteCourse(id);
  return NextResponse.json({ success: true });
}
