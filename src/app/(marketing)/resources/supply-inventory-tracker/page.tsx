import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import DataTableTool from "@/components/resources/DataTableTool";
import { INVENTORY_COLUMNS } from "@/lib/resources/supply-inventory-tracker/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("supply-inventory-tracker")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Co-living Supply Tracker | BNHG` },
  description: tool.blurb,
  alternates: { canonical: `${SITE_URL}/resources/${tool.slug}` },
  openGraph: {
    title: `${tool.name} | Be Nice Hospitality Group`,
    description: tool.blurb,
    url: `${SITE_URL}/resources/${tool.slug}`,
    type: "website",
  },
};

export default async function Page() {
  const access = await getResourceAccess(tool);
  const canSync = access.canSync;

  return (
    <ResourceToolLayout tool={tool} access={access}>
      <ResourceGate slug={tool.slug} toolName={tool.name} access={access}>
        <DataTableTool
          slug={tool.slug}
          title={tool.name}
          columns={INVENTORY_COLUMNS}
          csvFilename="supply-inventory-tracker.csv"
          addLabel="Add item"
          canSync={canSync}
        />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
