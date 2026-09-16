import type { Metadata } from "next";
import Image from "next/image";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { listPublishedProducts } from "@/lib/marketplace";
import { publishedBooks } from "@/lib/featured-books";
import { BLUEPRINT } from "@/lib/blueprint";
import { EMPTY_ENDORSEMENTS } from "@/lib/marketplace-endorsements";
import MarketplaceCatalog from "./_components/MarketplaceCatalog";
import type {
  MarketplaceTab,
  MarketplaceTabId,
  Product,
} from "./_components/types";

export const metadata: Metadata = {
  title: "The Marketplace",
  description:
    "The gear, books, and software we actually use to run our co-living properties and fleets. Organized room by room, vetted by us.",
  alternates: { canonical: "https://www.benicehospitality.com/marketplace" },
  openGraph: {
    title: "The Marketplace | Be Nice Hospitality Group",
    description:
      "Curated gear, books, and software for co-living operators and fleet operators. The stuff we actually use.",
    url: "https://www.benicehospitality.com/marketplace",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

// Tab labels stay in code — only the products inside each tab are
// admin-managed via /admin/marketplace.
const TAB_META: Array<{ id: MarketplaceTabId; label: string }> = [
  { id: "property", label: "Homes" },
  { id: "auto", label: "Vehicles" },
  { id: "back-office", label: "Back Office" },
];

// Decorative hero panels, one per department. Not links: the department
// switcher lives in the catalog's sticky control bar.
const HERO_PANELS = [
  "/images/marketplace/hero/homes.webp",
  "/images/marketplace/hero/vehicles-turnover.webp",
  "/images/marketplace/hero/back-office.webp",
] as const;

// Our own books become ordinary Back Office listings rather than a promo band.
// Everything shown is derived from the featured-book catalog, so the price,
// name, and route can't drift from the sales page. The CTA links into that page
// with a ?src= tag; checkout and legal copy stay there.
function bookListings(): Product[] {
  return publishedBooks().map((b) => ({
    id: `book-${b.tag}`,
    name: b.name,
    body: b.hook,
    // The card promotes bullets[0] as its one-line lead, so the subtitle goes first.
    bullets: [b.subtitle, `By ${b.author}`, ...b.specs],
    image: {
      src: b.tag === BLUEPRINT.productTag ? "/images/blueprint_book_3d.webp" : b.coverImage,
      alt: `${b.name} book`,
      anchor: "center",
    },
    priceRange: `$${b.priceUsd}`,
    network: "direct",
    affiliateUrl: `${b.path}?src=marketplace-listing`,
    status: "live",
    category: "books",
    firstParty: { author: b.author },
    ...EMPTY_ENDORSEMENTS,
  }));
}

export default async function MarketplacePage() {
  const dbProducts = await listPublishedProducts();

  const TABS: MarketplaceTab[] = TAB_META.map((meta) => {
    const products: Product[] = dbProducts
      .filter((p) => p.tabId === meta.id)
      .map((p) => ({
        id: p.slug,
        name: p.name,
        body: p.body,
        bullets: p.bullets,
        image: { src: p.imageUrl, alt: p.imageAlt, anchor: p.imageAnchor },
        priceRange: p.priceRange,
        network: p.network,
        affiliateUrl: p.affiliateUrl,
        badge: p.badge ?? undefined,
        status: p.status,
        tags: p.tags,
        category: p.category,
        dellaUse: p.dellaUse,
        dellaTake: p.dellaTake,
        alexUse: p.alexUse,
        alexTake: p.alexTake,
      }));
    return {
      id: meta.id,
      label: meta.label,
      products:
        meta.id === "back-office" ? [...bookListings(), ...products] : products,
    };
  });

  return (
    <>
      <section className="relative bg-near-black h-[400px] md:h-[460px] overflow-hidden">
        <div aria-hidden className="absolute inset-0 grid grid-cols-3">
          {HERO_PANELS.map((src, i) => (
            <div
              key={src}
              className={[
                "relative overflow-hidden",
                i > 0 ? "border-l border-white/15" : "",
              ].join(" ")}
            >
              <Image
                src={src}
                alt=""
                fill
                priority
                sizes="34vw"
                className="object-cover"
                style={{ filter: "saturate(0.85) contrast(1.05)" }}
              />
              <div className="absolute inset-0 bg-near-black/45" />
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-near-black/90 via-near-black/70 to-transparent"
        />
        <div className="relative z-10 pt-28 md:pt-32 px-6 md:px-12 lg:px-20 text-center">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
            The Marketplace
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white leading-[1.1] tracking-tight">
            What we actually use to run the work.
          </h1>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      <MarketplaceCatalog tabs={TABS} />

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
