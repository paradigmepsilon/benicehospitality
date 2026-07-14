import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { hasResourceUnlock } from "@/lib/resources/unlock-cookie";
import { getCurrentSession } from "@/lib/community-auth";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import GuestTemplatesTool from "@/components/resources/guest-message-templates/GuestTemplatesTool";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("guest-message-templates")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Host Message Scripts | BNHG` },
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
        <GuestTemplatesTool />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
