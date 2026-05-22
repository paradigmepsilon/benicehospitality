import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import CourseEditor from "@/components/admin/CourseEditor";
import CourseTabs from "@/components/admin/CourseTabs";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CourseRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  hero_image_url: string;
  thumbnail_url: string;
  category_slug: string | null;
  display_position: number;
  is_published: boolean;
  is_placeholder: boolean;
  is_purchasable: boolean;
}

export default async function CourseEditPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();

  const rows = (await sql`
    SELECT id, slug, title, summary, hero_image_url, thumbnail_url, category_slug,
           display_position, is_published, is_placeholder, is_purchasable
    FROM courses WHERE id = ${id} LIMIT 1
  `) as CourseRow[];
  if (rows.length === 0) notFound();
  const c = rows[0];

  return (
    <div className="max-w-5xl mx-auto">
      <CourseTabs courseId={id} active="basics" courseTitle={c.title} />
      <CourseEditor
        course={{
          id: c.id,
          slug: c.slug,
          title: c.title,
          summary: c.summary,
          heroImageUrl: c.hero_image_url,
          thumbnailUrl: c.thumbnail_url,
          categorySlug: c.category_slug,
          displayPosition: c.display_position,
          isPublished: c.is_published,
          isPlaceholder: c.is_placeholder,
          isPurchasable: c.is_purchasable,
        }}
      />
    </div>
  );
}
