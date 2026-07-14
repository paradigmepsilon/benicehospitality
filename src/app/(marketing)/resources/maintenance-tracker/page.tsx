import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { hasResourceUnlock } from "@/lib/resources/unlock-cookie";
import { getCurrentSession } from "@/lib/community-auth";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import DataTableTool from "@/components/resources/DataTableTool";
import { MAINTENANCE_COLUMNS } from "@/lib/resources/maintenance-tracker/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("maintenance-tracker")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Co-living Repair Log | BNHG` },
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
  const loggedIn = Boolean(session);
  const unlocked = loggedIn || cookieUnlock;

  return (
    <ResourceToolLayout tool={tool}>
      <ResourceGate slug={tool.slug} toolName={tool.name} unlocked={unlocked}>
        <DataTableTool
          slug={tool.slug}
          title={tool.name}
          columns={MAINTENANCE_COLUMNS}
          csvFilename="maintenance-tracker.csv"
          addLabel="Add issue"
          loggedIn={loggedIn}
          variant="cards"
          entryNoun="issue"
        />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
