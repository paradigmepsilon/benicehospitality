import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import { isEstimatorEnabled } from "@/lib/estimate/flag";
import { getManagementFeeModel } from "@/lib/management/constants";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import EarningsEstimator from "@/components/resources/earnings-estimator/EarningsEstimator";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("car-earnings-estimator")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Car Earnings Range | BNHG` },
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
  // Mirrors /estimate: this tool must be as unreachable as the front door
  // while the metro rate table is empty, not just hidden behind a link.
  if (!isEstimatorEnabled()) redirect("/management");

  const access = await getResourceAccess(tool);
  const feeModel = getManagementFeeModel("car");

  return (
    <ResourceToolLayout tool={tool} access={access}>
      <ResourceGate slug={tool.slug} toolName={tool.name} access={access}>
        <EarningsEstimator
          asset="car"
          canSync={access.canSync}
          feePct={feeModel?.grossPct}
        />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
