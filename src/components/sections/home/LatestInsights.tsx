import Button from "@/components/ui/Button";
import PhotoCard from "@/components/ui/PhotoCard";
import SectionIntro from "@/components/ui/SectionIntro";
import { sql } from "@/lib/db";

export type PostRow = {
  title: string;
  slug: string;
  category: string;
  featured_image_url: string | null;
};

// Same visibility rule as InsightsGrid: published, and not scheduled for a
// future date.
export async function fetchLatestInsights(limit = 3): Promise<PostRow[]> {
  try {
    const rows = (await sql`
      SELECT title, slug, category, featured_image_url
      FROM blog_posts
      WHERE published = true
        AND (published_at IS NULL OR published_at <= NOW())
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT ${limit}
    `) as PostRow[];
    return rows;
  } catch {
    // Without a database (local dev, a build with no DATABASE_URL) the
    // section simply does not render. Never a placeholder post.
    return [];
  }
}

const FALLBACK_COVER = "/images/insights/what-is-co-living-2026.webp";

/**
 * The three most recent insights as photo cards. The page fetches the rows
 * (fetchLatestInsights) so it can also decide whether the divider before the
 * footer leaves from this section or from the one above it.
 */
export default function LatestInsights({ posts }: { posts: PostRow[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-cream px-3 md:px-5 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-3 md:px-5">
        <SectionIntro
          label="Insights"
          heading="Latest from the operators."
          action={
            <Button href="/insights" variant="secondary" size="md" arrow>
              All insights
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {posts.map((post) => (
            <PhotoCard
              key={post.slug}
              image={{ src: post.featured_image_url ?? FALLBACK_COVER, alt: "" }}
              kicker={post.category}
              title={post.title}
              href={`/insights/${post.slug}`}
              aspect="aspect-[4/3]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
