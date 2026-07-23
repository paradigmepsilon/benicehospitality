import Link from "next/link";
import { sql } from "@/lib/db";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

// Generalized from CoLivingInsights. The blog has no per-lane categories yet —
// today's published ones are Industry Trends, Revenue Strategy, Operations,
// Hotel Technology and Guest Experience — so linking a door page straight at
// /insights?category=Fleet would land visitors on an empty page.
//
// So: prefer the lane's category if any post carries it, otherwise fall back to
// the latest posts. The moment a post is tagged with the lane category, this
// section and its "read more" link retarget themselves with no code change.

interface PostCard {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
}

async function fetchPosts(
  category: string,
): Promise<{ posts: PostCard[]; usingCategory: boolean }> {
  const scoped = (await sql`
    SELECT slug, title, excerpt, category
    FROM blog_posts
    WHERE published = true
      AND (published_at IS NULL OR published_at <= NOW())
      AND category = ${category}
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT 3
  `) as PostCard[];

  if (scoped.length > 0) return { posts: scoped, usingCategory: true };

  const latest = (await sql`
    SELECT slug, title, excerpt, category
    FROM blog_posts
    WHERE published = true
      AND (published_at IS NULL OR published_at <= NOW())
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT 3
  `) as PostCard[];

  return { posts: latest, usingCategory: false };
}

interface OfferingInsightsProps {
  /** Blog category to prefer, e.g. "Co-living" or "Fleet". */
  category: string;
  headline: string;
  body: string;
}

export default async function OfferingInsights({
  category,
  headline,
  body,
}: OfferingInsightsProps) {
  const { posts, usingCategory } = await fetchPosts(category);

  // Nothing published at all — render nothing rather than an empty shell.
  if (posts.length === 0) return null;

  const allHref = usingCategory
    ? `/insights?category=${encodeURIComponent(category)}`
    : "/insights";

  return (
    <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-14">
          <AnimatedItem>
            <SectionLabel>Insights</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              {headline}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal leading-snug">
              {body}
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
                className="group block h-full bg-off-white border border-charcoal/10 rounded-sm p-7 hover:border-(--lane-accent,var(--color-warm-gold)) transition-colors duration-200"
              >
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
