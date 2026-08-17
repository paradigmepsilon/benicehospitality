import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import DepreciationExitAnalyzer from "@/components/resources/depreciation-exit-analyzer/DepreciationExitAnalyzer";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("depreciation-exit-analyzer")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free 5-Year Hold or Sell Model | BNHG` },
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
        <DepreciationExitAnalyzer canSync={access.canSync} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
