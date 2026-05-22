import { listResourcesForTier } from "@/lib/resources";
import ResourcesAdmin from "@/components/admin/ResourcesAdmin";

export const dynamic = "force-dynamic";

export default async function ResourcesAdminPage() {
  const resources = await listResourcesForTier("admin");
  return (
    <ResourcesAdmin
      initialResources={resources.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        summary: r.summary,
        body: r.body,
        externalUrl: r.externalUrl,
        requiredTier: r.requiredTier,
        isPublished: r.isPublished,
        createdAt: r.createdAt,
      }))}
    />
  );
}
