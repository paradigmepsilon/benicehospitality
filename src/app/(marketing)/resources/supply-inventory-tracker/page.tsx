import type { Metadata } from "next";
import { getResourceTool } from "@/lib/resources/registry";
import { getResourceAccess } from "@/lib/resources/access";
import { listPublishedProducts } from "@/lib/marketplace";
import ResourceToolLayout from "@/components/resources/ResourceToolLayout";
import ResourceGate from "@/components/resources/ResourceGate";
import SupplyInventoryTool from "@/components/resources/supply-inventory-tracker/SupplyInventoryTool";
import type { SuggestedProduct } from "@/lib/resources/supply-inventory-tracker/config";

const SITE_URL = "https://benicehospitality.com";
const tool = getResourceTool("supply-inventory-tracker")!;

export const metadata: Metadata = {
  title: { absolute: `${tool.name}: Free Co-living Supply Tracker | BNHG` },
  description: tool.blurb,
  alternates: { canonical: `${SITE_URL}/resources/${tool.slug}` },
  openGraph: {
    title: `${tool.name} | Be Nice Hospitality Group`,
    description: tool.blurb,
    url: `${SITE_URL}/resources/${tool.slug}`,
    type: "website",
  },
};

/**
 * Restock suggestions come from the live marketplace catalog, so products stay
 * managed in /admin/marketplace and never need a deploy. Property-tab products
 * only: nothing in the boutique-stay or fleet tabs belongs in a co-living
 * supply closet. A catalog read failure must not take the tracker down, so it
 * degrades to no suggestions.
 */
async function loadSuggestions(): Promise<SuggestedProduct[]> {
  try {
    const products = await listPublishedProducts();
    return products
      .filter((p) => p.tabId === "property" && p.status === "live")
      .map((p) => ({
        id: p.slug,
        name: p.name,
        body: p.body,
        priceRange: p.priceRange,
        network: p.network,
        affiliateUrl: p.affiliateUrl,
        imageUrl: p.imageUrl,
        imageAlt: p.imageAlt,
        badge: p.badge,
        tags: p.tags,
      }));
  } catch (err) {
    console.error("[supply-inventory-tracker] product load failed:", err);
    return [];
  }
}

export default async function Page() {
  const [access, products] = await Promise.all([
    getResourceAccess(tool),
    loadSuggestions(),
  ]);

  return (
    <ResourceToolLayout tool={tool} access={access}>
      <ResourceGate slug={tool.slug} toolName={tool.name} access={access}>
        <SupplyInventoryTool canSync={access.canSync} products={products} />
      </ResourceGate>
    </ResourceToolLayout>
  );
}
