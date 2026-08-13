import { Suspense } from "react";
import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import MarketDemandTool from "@/components/resources/market-demand-worksheet/MarketDemandTool";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("market-demand-worksheet")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Co-living Market Analysis | BNHG` },
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
        {/* MarketDemandTool reads ?example=1 to open the completed example,
            and useSearchParams needs a Suspense boundary — same pattern as
            the breakeven planner's ?a= deep link. */}
        <Suspense
          fallback={
            <p className="font-sans text-sm text-charcoal/60 py-8 text-center">
              Loading the worksheet…
            </p>
          }
        >
          <MarketDemandTool canSync={canSync} />
        </Suspense>
      </ResourceGate>
    </ResourceToolLayout>
  );
}
