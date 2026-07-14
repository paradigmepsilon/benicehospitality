import type { Metadata } from "next";
import Image from "next/image";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { STOCK_LIBRARY } from "@/lib/stock-images";
import {
  listPublishedProducts,
  type MarketplaceTabId as DbTabId,
} from "@/lib/marketplace";
import MarketplaceCatalog from "./_components/MarketplaceCatalog";
import type {
  MarketplaceTab,
  MarketplaceTabId,
  Product,
} from "./_components/types";

export const metadata: Metadata = {
  title: "The Marketplace",
  description:
    "The gear, books, and software we actually use to run our co-living properties, boutique stays, and fleets. Curated by audience, vetted by us.",
  alternates: { canonical: "https://benicehospitality.com/marketplace" },
  openGraph: {
    title: "The Marketplace | Be Nice Hospitality Group",
    description:
      "Curated gear, books, and software for co-living operators, boutique stays, and fleet operators. The stuff we actually use.",
    url: "https://benicehospitality.com/marketplace",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

// Tab metadata (audience copy, hero image) stays in code — only the products
// inside each tab are admin-managed via /admin/marketplace.
interface TabMeta {
  id: MarketplaceTabId;
  label: string;
  sectionLabel: string;
  headline: string;
  body: string;
  image: { src: string; alt: string };
}

const TAB_META: TabMeta[] = [
  {
    id: "property",
    label: "Co-living Properties",
    sectionLabel: "Gear for co-living operators",
    headline: "What we put in every unit.",
    body: "Lockboxes, linen, mattress upgrades, smart-home gear, and the consumables we replace on every turnover. If it lives at the property and we'd buy it again, it's here.",
    image: {
      src: "/images/Website Images/pexels-curtis-adams-1694007-16641323.jpg",
      alt: "Co-living and short-term rental property interior",
    },
  },
  {
    id: "hotel",
    label: "Boutique Stays",
    sectionLabel: "Gear for boutique stays",
    headline: "Front-of-house and back-of-house.",
    body: "Amenity programs, front-desk tech, lobby touches, and operational tools sized for independent boutique stays, from 10 to 50 room hotels to design-forward inns. The stuff Signal members ask about most.",
    image: {
      src: "/images/Website Images/hf_20260312_051512_fbdd9c4e-fc8a-41fa-8575-219882dfe238.jpeg",
      alt: "Boutique stay exterior in warm light",
    },
  },
  {
    id: "auto",
    label: "Autos",
    sectionLabel: "Gear for auto operators",
    headline: "What lives in every Be Nice Auto car.",
    body: "Dashcams, OBD-II readers, turnover detail kits, and the small upgrades that keep guest reviews high and dispute resolution easy. Built around what works for Turo hosts and small fleets today.",
    image: {
      src: "/images/Website Images/Alex Turo Shot.png",
      alt: "Auto operator vehicle in a peer-to-peer rental fleet setting",
    },
  },
  {
    id: "back-office",
    label: "Back Office",
    sectionLabel: "Books, software, paper",
    headline: "What runs the business behind the business.",
    body: "Books we recommend to every operator. Software with affiliate links worth using. Paper planners that survive a real operator's week. Cross-company, cross-audience.",
    image: {
      src: "/images/Website Images/Workspace Nook.png",
      alt: "Warmly lit operator workspace with books, a planner, and a laptop",
    },
  },
];

function tabIdMatches(
  uiId: MarketplaceTabId,
  dbId: DbTabId,
): boolean {
  return uiId === dbId;
}

export default async function MarketplacePage() {
  const dbProducts = await listPublishedProducts();

  const TABS: MarketplaceTab[] = TAB_META.map((meta) => {
    const products: Product[] = dbProducts
      .filter((p) => tabIdMatches(meta.id, p.tabId))
      .map((p) => ({
        id: p.slug,
        name: p.name,
        body: p.body,
        bullets: p.bullets,
        image: { src: p.imageUrl, alt: p.imageAlt },
        priceRange: p.priceRange,
        network: p.network,
        affiliateUrl: p.affiliateUrl,
        badge: p.badge ?? undefined,
        status: p.status,
        tags: p.tags,
      }));
    return {
      id: meta.id,
      label: meta.label,
      sectionLabel: meta.sectionLabel,
      headline: meta.headline,
      body: meta.body,
      image: meta.image,
      products,
    };
  });

  return (
    <>
      <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <Image
          src={STOCK_LIBRARY.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-near-black via-near-black/85 to-near-black/60"
        />
        <div className="relative z-10 max-w-4xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-8">
            The Marketplace
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            What we actually use to run the work.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mb-6">
            The gear, books, and software we&rsquo;ve picked across our
            companies. Sorted by audience, vetted by us.
          </p>
          <p className="font-sans text-sm text-white/55 italic max-w-2xl">
            We earn a commission on some of these links. We only recommend what
            we use ourselves.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      <MarketplaceCatalog tabs={TABS} />

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
