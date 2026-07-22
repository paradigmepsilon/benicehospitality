import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { hasResourceUnlock } from "@/lib/resources/unlock-cookie";
import { getCurrentSession } from "@/lib/community-auth";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import ReferenceTool from "@/components/resources/ReferenceTool";
import { COMPARISON_CONTENT } from "@/lib/resources/rental-type-comparison-chart/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("rental-type-comparison-chart")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: STR vs MTR vs LTR | BNHG` },
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
  const [session, cookieUnlock] = await Promise.all([
    getCurrentSession(),
    hasResourceUnlock(),
  ]);
  const unlocked = Boolean(session) || cookieUnlock;

  return (
    <ResourceToolLayout tool={tool}>
      <ResourceGate slug={tool.slug} toolName={tool.name} unlocked={unlocked}>
        <ReferenceTool title={tool.name} content={COMPARISON_CONTENT} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
