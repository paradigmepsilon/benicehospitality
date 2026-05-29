import { listAllProducts } from "@/lib/marketplace";
import MarketplaceAdmin from "@/components/admin/MarketplaceAdmin";

export const dynamic = "force-dynamic";

export default async function MarketplaceAdminPage() {
  const products = await listAllProducts();
  return <MarketplaceAdmin initialProducts={products} />;
}
