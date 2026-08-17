import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import TurnoverProtocolTool from "@/components/resources/turnover-photo-protocol/TurnoverProtocolTool";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("turnover-photo-protocol")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Per-Trip Turo Runbook | BNHG` },
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
        <TurnoverProtocolTool canSync={access.canSync} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
