import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import ChecklistTool from "@/components/resources/ChecklistTool";
import { COURSE_SECTIONS } from "@/lib/resources/course-outline-checklist/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("course-outline-checklist")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Co-living Launch Roadmap | BNHG` },
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
        <ChecklistTool
          canSync={access.canSync}
          slug={tool.slug}
          title={tool.name}
          sections={COURSE_SECTIONS}
          csvFilename="course-outline-checklist.csv"
        />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
