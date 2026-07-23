import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

// The blog has no "Co-living" category yet — today's published categories are
// Industry Trends, Revenue Strategy, Operations, Hotel Technology and Guest
// Experience. Linking straight to /insights?category=co-living would land
// visitors on an empty page.
//
// So: prefer a co-living category if one exists, otherwise fall back to the
// latest posts. The moment Della tags a post "Co-living" this section and its
// link retarget themselves with no code change.

const CO_LIVING_CATEGORY = "Co-living";

interface PostCard {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  featured_image_url: string | null;
}

async function fetchPosts(): Promise<{
  posts: PostCard[];
  usingCategory: boolean;
}> {
  const scoped = (await sql`
    SELECT slug, title, excerpt, category, featured_image_url
    FROM blog_posts
    WHERE published = true
      AND (published_at IS NULL OR published_at <= NOW())
      AND category = ${CO_LIVING_CATEGORY}
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT 3
  `) as PostCard[];

  if (scoped.length > 0) return { posts: scoped, usingCategory: true };

  const latest = (await sql`
    SELECT slug, title, excerpt, category, featured_image_url
    FROM blog_posts
    WHERE published = true
      AND (published_at IS NULL OR published_at <= NOW())
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT 3
  `) as PostCard[];

  return { posts: latest, usingCategory: false };
}

export default async function CoLivingInsights() {
  const { posts, usingCategory } = await fetchPosts();

  // Nothing published at all — render nothing rather than an empty shell.
  if (posts.length === 0) return null;

  const allHref = usingCategory
    ? `/insights?category=${encodeURIComponent(CO_LIVING_CATEGORY)}`
    : "/insights";

  return (
    <AnimatedSection theme="light" className="py-12 md:py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-14">
          <AnimatedItem>
            <SectionLabel>Insights</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              Written from the actual reps.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal leading-snug">
              Longer thinking than a live session allows. Market notes, pricing
              math, and the things that went wrong in my portfolio before they
              went right.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {posts.map((post) => (
            <AnimatedItem key={post.slug}>
              <Link
                href={`/insights/${post.slug}`}
                className="group flex flex-col h-full bg-off-white border border-charcoal/10 rounded-sm overflow-hidden hover:border-(--lane-accent,var(--color-warm-gold)) transition-colors duration-200"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-near-black">
                  {post.featured_image_url ? (
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: "saturate(0.85) contrast(1.05)" }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-near-black to-deep-teal">
                      <span className="font-display text-2xl italic text-white/30">
                        BNHG
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-3">
                    {post.category}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-3 group-hover:text-primary-green-dark transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="font-sans text-sm text-charcoal/80 leading-snug line-clamp-4">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <div className="mt-12 text-center">
            <Button href={allHref} variant="secondary" size="md">
              Read More Insights
            </Button>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
