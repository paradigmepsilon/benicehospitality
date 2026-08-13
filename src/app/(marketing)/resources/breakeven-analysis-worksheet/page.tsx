import type { Metadata } from "next";
import { Suspense } from "react";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import PlannerTool from "@/components/resources/breakeven-analysis-worksheet/PlannerTool";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import { listCostOverrides } from "@/lib/resources/planner-cost-overrides";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("breakeven-analysis-worksheet")!;

export const metadata: Metadata = {
  title: {
    // No descriptive suffix here, unlike its siblings. The name already runs
    // 50 characters and already says "Co-Living"; the usual
    // `${tool.name}: Free …` pattern would push this past 90 and repeat the
    // keyword, both of which get a title rewritten in the SERP.
    absolute: `${tool.name} | BNHG`,
  },
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
  // The page is already dynamic for the cookie-based access check, so reading
  // the admin's cost overrides here costs one small extra query and keeps the
  // first paint correct. A DB failure degrades to the config defaults rather
  // than to a broken tool.
  const [access, costOverrides] = await Promise.all([
    getResourceAccess(tool),
    listCostOverrides().catch(() => []),
  ]);

  return (
    <ResourceToolLayout tool={tool} access={access}>
      <ResourceGate slug={tool.slug} toolName={tool.name} access={access}>
        {/* PlannerTool reads ?a=<id> to deep-link a saved analysis, and
            useSearchParams needs a Suspense boundary to keep the rest of the
            page static. */}
        <Suspense
          fallback={
            <p className="font-sans text-sm text-charcoal/60 py-8 text-center">
              Loading your analyses…
            </p>
          }
        >
          <PlannerTool
            canSync={access.canSync}
            isPreview={access.isReadOnlyPreview} costOverrides={costOverrides} />
        </Suspense>
      </ResourceGate>
    </ResourceToolLayout>
  );
}
