import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { sql } from "@/lib/db";

const POSTS_PER_PAGE = 10;

const categoryColors: Record<string, string> = {
  "Revenue Strategy": "bg-primary-green text-white",
  "Guest Experience": "bg-warm-gold text-near-black",
  "Hotel Technology": "bg-near-black text-white",
  Operations: "bg-deep-teal text-white",
  "Industry Trends": "bg-warm-gold text-near-black",
  "Co-living": "bg-terracotta text-white",
};

type PostRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featured_image_url: string | null;
  created_at: string;
  published_at: string | null;
};

async function fetchPosts({
  category,
  order,
  limit,
  offset,
}: {
  category: string | undefined;
  order: "ASC" | "DESC";
  limit: number;
  offset: number;
}): Promise<PostRow[]> {
  // Neon's tagged template can't inline raw SQL fragments, so branch the four
  // variants (category set/unset × ASC/DESC) explicitly. All user input is
  // parameterized.
  if (category && order === "ASC") {
    return (await sql`
      SELECT id, title, slug, excerpt, category, featured_image_url, created_at, published_at
      FROM blog_posts
      WHERE published = true
        AND (published_at IS NULL OR published_at <= NOW())
        AND category = ${category}
      ORDER BY COALESCE(published_at, created_at) ASC
      LIMIT ${limit} OFFSET ${offset}
    `) as PostRow[];
  }
  if (category) {
    return (await sql`
      SELECT id, title, slug, excerpt, category, featured_image_url, created_at, published_at
      FROM blog_posts
      WHERE published = true
        AND (published_at IS NULL OR published_at <= NOW())
        AND category = ${category}
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as PostRow[];
  }
  if (order === "ASC") {
    return (await sql`
      SELECT id, title, slug, excerpt, category, featured_image_url, created_at, published_at
      FROM blog_posts
      WHERE published = true
        AND (published_at IS NULL OR published_at <= NOW())
      ORDER BY COALESCE(published_at, created_at) ASC
      LIMIT ${limit} OFFSET ${offset}
    `) as PostRow[];
  }
  return (await sql`
    SELECT id, title, slug, excerpt, category, featured_image_url, created_at, published_at
    FROM blog_posts
    WHERE published = true
      AND (published_at IS NULL OR published_at <= NOW())
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as PostRow[];
}

async function fetchCount(category: string | undefined): Promise<number> {
  const rows = category
    ? await sql`
        SELECT COUNT(*)::int AS count
        FROM blog_posts
        WHERE published = true
          AND (published_at IS NULL OR published_at <= NOW())
          AND category = ${category}
      `
    : await sql`
        SELECT COUNT(*)::int AS count
        FROM blog_posts
        WHERE published = true
          AND (published_at IS NULL OR published_at <= NOW())
      `;
  return Number(rows[0]?.count ?? 0);
}

async function fetchCategories(): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT category
    FROM blog_posts
    WHERE published = true
      AND (published_at IS NULL OR published_at <= NOW())
    ORDER BY category ASC
  `;
  return rows.map((r) => r.category as string);
}

function buildHref(params: {
  category?: string;
  sort?: string;
  page?: number;
}): string {
  const usp = new URLSearchParams();
  if (params.category) usp.set("category", params.category);
  if (params.sort && params.sort !== "newest") usp.set("sort", params.sort);
  if (params.page && params.page > 1) usp.set("page", String(params.page));
  const qs = usp.toString();
  return qs ? `/insights?${qs}` : "/insights";
}

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "…")[] = [1];
  if (current > 3) items.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) items.push(i);
  if (current < total - 2) items.push("…");
  items.push(total);
  return items;
}

interface InsightsGridProps {
  category?: string;
  sort?: string;
  page?: string;
}

export default async function InsightsGrid({
  category,
  sort,
  page,
}: InsightsGridProps) {
  const order: "ASC" | "DESC" = sort === "oldest" ? "ASC" : "DESC";
  const sortKey = order === "ASC" ? "oldest" : "newest";
  const requestedPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const [allCategories, totalCount] = await Promise.all([
    fetchCategories(),
    fetchCount(category),
  ]);

  // If the URL has a category that doesn't exist, treat it as unfiltered.
  const activeCategory =
    category && allCategories.includes(category) ? category : undefined;

  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
  const safePage = Math.min(requestedPage, totalPages);
  const offset = (safePage - 1) * POSTS_PER_PAGE;

  const posts = await fetchPosts({
    category: activeCategory,
    order,
    limit: POSTS_PER_PAGE,
    offset,
  });

  const pillBase =
    "inline-flex items-center font-sans text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase px-3.5 py-1.5 rounded-full transition-colors duration-150";
  const pillActive = "bg-near-black text-white border border-near-black";
  const pillInactive =
    "bg-white text-charcoal/70 border border-light-gray hover:border-near-black hover:text-near-black";

  return (
    <AnimatedSection theme="off-white" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <AnimatedItem>
            <SectionLabel>Latest Thinking</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-near-black leading-tight">
              From the BNHG Desk
            </h2>
          </AnimatedItem>
        </div>

        {/* Filter + sort controls */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ sort: sortKey })}
              className={`${pillBase} ${!activeCategory ? pillActive : pillInactive}`}
              aria-current={!activeCategory ? "page" : undefined}
            >
              All
            </Link>
            {allCategories.map((c) => (
              <Link
                key={c}
                href={buildHref({ category: c, sort: sortKey })}
                className={`${pillBase} ${activeCategory === c ? pillActive : pillInactive}`}
                aria-current={activeCategory === c ? "page" : undefined}
              >
                {c}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 text-charcoal/65">
            <span className="font-sans text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase">
              Sort
            </span>
            <div className="inline-flex rounded-full border border-light-gray bg-white overflow-hidden">
              <Link
                href={buildHref({ category: activeCategory, sort: "newest" })}
                className={`font-sans text-[11px] md:text-xs font-semibold tracking-[0.12em] uppercase px-3.5 py-1.5 transition-colors ${
                  sortKey === "newest"
                    ? "bg-near-black text-white"
                    : "text-charcoal/70 hover:text-near-black"
                }`}
                aria-current={sortKey === "newest" ? "page" : undefined}
              >
                Newest
              </Link>
              <Link
                href={buildHref({ category: activeCategory, sort: "oldest" })}
                className={`font-sans text-[11px] md:text-xs font-semibold tracking-[0.12em] uppercase px-3.5 py-1.5 transition-colors ${
                  sortKey === "oldest"
                    ? "bg-near-black text-white"
                    : "text-charcoal/70 hover:text-near-black"
                }`}
                aria-current={sortKey === "oldest" ? "page" : undefined}
              >
                Oldest
              </Link>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="text-center font-sans text-base text-charcoal/60 py-16">
            No posts {activeCategory ? `in ${activeCategory}` : "found"} yet.
            Check back soon.
          </p>
        ) : (
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post) => (
              <AnimatedItem key={post.id}>
                <Link href={`/insights/${post.slug}`} className="block h-full">
                  <article className="bg-white border border-light-gray rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
                    <div className="relative h-44 sm:h-52 overflow-hidden bg-near-black">
                      {post.featured_image_url ? (
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-near-black via-charcoal to-near-black"
                        >
                          <span className="font-display italic text-warm-gold/70 text-2xl tracking-tight">
                            BNHG
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span
                          className={[
                            "inline-flex items-center font-sans text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase px-3.5 py-1.5 rounded-full shadow-md",
                            categoryColors[post.category] ||
                              "bg-white text-near-black",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <p className="font-sans text-xs text-charcoal/40 mb-3">
                        {new Date(
                          post.published_at || post.created_at,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-near-black mb-3 leading-snug group-hover:text-primary-green transition-colors duration-200">
                        {post.title}
                      </h3>
                      <p className="font-sans text-sm text-charcoal/65 leading-relaxed flex-1 mb-6">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto">
                        <span className="font-sans text-sm font-semibold text-primary-green group-hover:gap-2 flex items-center gap-1 transition-all duration-200">
                          Read More
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-14 flex items-center justify-center gap-1.5"
          >
            <Link
              href={buildHref({
                category: activeCategory,
                sort: sortKey,
                page: Math.max(1, safePage - 1),
              })}
              aria-disabled={safePage === 1}
              className={`font-sans text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                safePage === 1
                  ? "border-light-gray text-charcoal/30 pointer-events-none"
                  : "border-light-gray text-charcoal/70 hover:border-near-black hover:text-near-black"
              }`}
            >
              ← Prev
            </Link>
            {pageRange(safePage, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="font-sans text-sm text-charcoal/40 px-2"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Link
                  key={p}
                  href={buildHref({
                    category: activeCategory,
                    sort: sortKey,
                    page: p,
                  })}
                  aria-current={p === safePage ? "page" : undefined}
                  className={`font-sans text-sm font-semibold w-10 h-10 inline-flex items-center justify-center rounded-full border transition-colors ${
                    p === safePage
                      ? "bg-near-black text-white border-near-black"
                      : "border-light-gray text-charcoal/70 hover:border-near-black hover:text-near-black"
                  }`}
                >
                  {p}
                </Link>
              ),
            )}
            <Link
              href={buildHref({
                category: activeCategory,
                sort: sortKey,
                page: Math.min(totalPages, safePage + 1),
              })}
              aria-disabled={safePage === totalPages}
              className={`font-sans text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                safePage === totalPages
                  ? "border-light-gray text-charcoal/30 pointer-events-none"
                  : "border-light-gray text-charcoal/70 hover:border-near-black hover:text-near-black"
              }`}
            >
              Next →
            </Link>
          </nav>
        )}

        <AnimatedItem>
          <p className="text-center font-sans text-sm text-charcoal/40 mt-12 italic">
            New insights published monthly. Subscribe below to get them
            delivered to your inbox.
          </p>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
