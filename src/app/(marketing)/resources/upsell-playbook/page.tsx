import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import ReferenceTool from "@/components/resources/ReferenceTool";
import { PLAYBOOK_CONTENT } from "@/lib/resources/upsell-playbook/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("upsell-playbook")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Co-living Revenue Guide | BNHG` },
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

  return (
    <ResourceToolLayout tool={tool} access={access}>
      <ResourceGate slug={tool.slug} toolName={tool.name} access={access}>
        <ReferenceTool title={tool.name} content={PLAYBOOK_CONTENT} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
