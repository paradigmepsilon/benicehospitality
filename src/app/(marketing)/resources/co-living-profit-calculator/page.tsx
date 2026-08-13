import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import ProfitCalculator from "@/components/resources/co-living-profit-calculator/ProfitCalculator";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("co-living-profit-calculator")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free 12-Month P&L | BNHG` },
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
        <ProfitCalculator canSync={access.canSync} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
