import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { sql } from "@/lib/db";

const categoryColors: Record<string, string> = {
  "Revenue Strategy": "bg-primary-green/10 text-primary-green",
  "Guest Experience": "bg-warm-gold/15 text-warm-gold-dark",
  "Hotel Technology": "bg-charcoal/10 text-charcoal",
  Operations: "bg-primary-green/10 text-primary-green",
  "Industry Trends": "bg-warm-gold/15 text-warm-gold-dark",
};

export default async function InsightsGrid() {
  const posts = await sql`
    SELECT id, title, slug, excerpt, category, featured_image_url, created_at, published_at
    FROM blog_posts
    WHERE published = true AND (published_at IS NULL OR published_at <= NOW())
    ORDER BY created_at DESC
  `;

  return (
    <AnimatedSection theme="off-white" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel>Latest Thinking</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-near-black leading-tight">
              From the BNHG Desk
            </h2>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {posts.map((post) => (
            <AnimatedItem key={post.id}>
              <Link href={`/insights/${post.slug}`} className="block h-full">
                <article className="bg-white border border-light-gray rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
                  <div className="relative h-44 sm:h-52 overflow-hidden">
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={[
                          "font-sans text-xs font-semibold px-3 py-1",
                          categoryColors[post.category] ||
                            "bg-white/80 text-charcoal",
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
                      {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
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
