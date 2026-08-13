import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import DataTableTool from "@/components/resources/DataTableTool";
import { CONTRACTOR_COLUMNS } from "@/lib/resources/contractor-rolodex/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("contractor-rolodex")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Vendor Contact Tracker | BNHG` },
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
          columns={CONTRACTOR_COLUMNS}
          csvFilename="contractor-rolodex.csv"
          addLabel="Add contractor"
          canSync={canSync}
        />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
