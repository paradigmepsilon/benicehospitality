import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { listTiersForCourse } from "@/lib/course-catalog";
import CourseTabs from "@/components/admin/CourseTabs";
import TiersEditor from "@/components/admin/TiersEditor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseTiersPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();

  const courseRows = (await sql`
    SELECT id, title FROM courses WHERE id = ${id} LIMIT 1
  `) as Array<{ id: number; title: string }>;
  if (courseRows.length === 0) notFound();

  const tiers = await listTiersForCourse(id);

  return (
    <div className="max-w-5xl mx-auto">
      <CourseTabs courseId={id} active="tiers" courseTitle={courseRows[0].title} />
      <TiersEditor
        courseId={id}
        initialTiers={tiers.map((t) => ({
          id: t.id,
          tier: t.tier,
          name: t.name,
          description: t.description,
          priceCents: t.priceCents,
          currency: t.currency,
          stripePriceId: t.stripePriceId,
          isPublished: t.isPublished,
          position: t.position,
        }))}
      />
    </div>
  );
}
