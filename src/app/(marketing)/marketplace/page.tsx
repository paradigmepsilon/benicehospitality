import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { STOCK_LIBRARY } from "@/lib/stock-images";
import { listPublishedProducts } from "@/lib/marketplace";
import { publishedBooks, type FeaturedBook } from "@/lib/featured-books";
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
    label: "Homes",
    sectionLabel: "Gear for co-living operators",
    headline: "What we put in every unit.",
    body: "Everything that goes into furnishing and running a by-the-room house, grouped the way you actually buy it. Start with the room you are working on.",
    image: {
      src: "/images/Website Images/pexels-curtis-adams-1694007-16641323.jpg",
      alt: "Co-living and short-term rental property interior",
    },
  },
  {
    id: "auto",
    label: "Vehicles",
    sectionLabel: "Gear for fleet operators",
    headline: "What lives in every Be Nice Auto vehicle.",
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

// Which tab each book audience surfaces in. Co-living books land in the
// property tab; when The Car Rental Riches Blueprint flips to available in
// src/lib/featured-books.ts it lands in the Autos tab with no change here.
const BOOK_AUDIENCE_TAB: Record<FeaturedBook["audience"], MarketplaceTabId> = {
  property: "property",
  fleet: "auto",
};

function booksForTab(id: MarketplaceTabId): FeaturedBook[] {
  return publishedBooks().filter((b) => BOOK_AUDIENCE_TAB[b.audience] === id);
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
      }));
    return {
      id: meta.id,
      label: meta.label,
      sectionLabel: meta.sectionLabel,
      headline: meta.headline,
      body: meta.body,
      image: meta.image,
      products,
      books: booksForTab(meta.id),
    };
  });

  return (
    <>
      <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-10 md:pb-14 px-6 md:px-12 lg:px-20 overflow-hidden">
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
            companies. Organized room by room, vetted by us.
          </p>
          <p className="font-sans text-sm text-white/55 italic max-w-2xl">
            We earn a commission on some of these links. We only recommend what
            we use ourselves.{" "}
            <Link
              href="/affiliate-disclosure"
              className="not-italic text-warm-gold hover:underline"
            >
              How this works
            </Link>
            .
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      <MarketplaceCatalog tabs={TABS} />

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
