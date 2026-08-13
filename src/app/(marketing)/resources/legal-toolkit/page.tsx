import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import ReferenceTool from "@/components/resources/ReferenceTool";
import { LEGAL_CONTENT } from "@/lib/resources/legal-toolkit/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("legal-toolkit")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Co-living Legal Documents | BNHG` },
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
        <ReferenceTool title={tool.name} content={LEGAL_CONTENT} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
