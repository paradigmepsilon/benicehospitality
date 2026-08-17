import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import ClaimsDayPlaybook from "@/components/resources/claims-day-playbook/ClaimsDayPlaybook";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("claims-day-playbook")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Turo Damage Claim Steps | BNHG` },
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
        <ClaimsDayPlaybook canSync={access.canSync} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
