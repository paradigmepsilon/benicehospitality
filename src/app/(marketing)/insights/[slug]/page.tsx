import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";
import FAQSchema from "@/components/sections/faq/FAQSchema";

const categoryColors: Record<string, string> = {
  "Revenue Strategy": "bg-[#5b9a2f]/10 text-[#5b9a2f]",
  "Guest Experience": "bg-[#f5a623]/15 text-[#d4891a]",
  "Hotel Technology": "bg-[#1a1a1a]/10 text-[#1a1a1a]",
  Operations: "bg-[#5b9a2f]/10 text-[#5b9a2f]",
  "Industry Trends": "bg-[#f5a623]/15 text-[#d4891a]",
  "Co-living": "bg-[#c0674a]/15 text-[#c0674a]",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = await sql`
    SELECT title, excerpt, featured_image_url, published_at, created_at, updated_at, category,
           meta_description, target_keyword, secondary_keywords
    FROM blog_posts WHERE slug = ${slug} AND published = true AND (published_at IS NULL OR published_at <= NOW())
  `;

  if (posts.length === 0) return { title: "Post Not Found" };

  const post = posts[0];
  const description = post.meta_description || post.excerpt;
  const keywords = [post.target_keyword, ...(post.secondary_keywords || [])].filter(Boolean);

  return {
    title: post.title,
    description,
    ...(keywords.length > 0 && { keywords }),
    alternates: {
      canonical: `https://benicehospitality.com/insights/${slug}`,
    },
    openGraph: {
      type: "article",
      title: `${post.title} | Be Nice Hospitality Group`,
      description,
      url: `https://benicehospitality.com/insights/${slug}`,
      images: post.featured_image_url ? [{ url: post.featured_image_url }] : undefined,
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: ["Be Nice Hospitality Group"],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.featured_image_url && { images: [post.featured_image_url] }),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await sql`
    SELECT * FROM blog_posts WHERE slug = ${slug} AND published = true AND (published_at IS NULL OR published_at <= NOW())
  `;

  if (posts.length === 0) notFound();

  const post = posts[0];

  const allKeywords = [post.target_keyword, ...(post.secondary_keywords || []), ...(post.tags || [])].filter(Boolean);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.featured_image_url,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    ...(allKeywords.length > 0 && { keywords: allKeywords.join(", ") }),
    author: {
      "@type": "Organization",
      name: "Be Nice Hospitality Group",
    },
    publisher: {
      "@type": "Organization",
      name: "Be Nice Hospitality Group",
      logo: {
        "@type": "ImageObject",
        url: "https://benicehospitality.com/images/logo.png",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://benicehospitality.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: "https://benicehospitality.com/insights",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://benicehospitality.com/insights/${slug}`,
      },
    ],
  };

  // FAQ block (AEO): stored as a JSONB array of {question, answer} on the post.
  // Renders both a visible FAQ section and FAQPage JSON-LD from the same source.
  const faqItems: { question: string; answer: string }[] = Array.isArray(post.faq)
    ? post.faq
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqItems.length > 0 && <FAQSchema items={faqItems} />}
      {/* Hero */}
      <section className="bg-near-black pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span
            className={`inline-block font-sans text-xs font-semibold px-3 py-1 mb-6 ${
              categoryColors[post.category] || "bg-white/10 text-white/80"
            }`}
          >
            {post.category}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="font-sans text-sm text-white/40">
            {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="relative h-48 sm:h-64 md:h-96 -mt-1">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <article className="py-16 px-6">
        <div
          className="max-w-3xl mx-auto prose prose-base md:prose-lg prose-headings:font-display prose-headings:text-[#1a1a1a] prose-p:text-[#1a1a1a]/70 prose-a:text-[#5b9a2f] prose-blockquote:border-[#5b9a2f]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="px-6">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-block font-sans text-xs font-medium px-3 py-1 bg-[#f8f6f1] border border-[#e8e4dd] text-[#1a1a1a]/70 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FAQ (visible + feeds FAQPage schema above) */}
      {faqItems.length > 0 && (
        <section className="pb-4 px-6">
          <div className="max-w-3xl mx-auto border-t border-[#e8e4dd] pt-12">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-8">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-[#e8e4dd] border-t border-[#e8e4dd]">
              {faqItems.map((item) => (
                <div key={item.question} className="py-5">
                  <h3 className="font-sans text-lg font-semibold text-[#1a1a1a] mb-2">
                    {item.question}
                  </h3>
                  <p className="font-sans text-base text-[#1a1a1a]/70 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/insights"
            className="font-sans text-sm font-semibold text-[#5b9a2f] hover:underline flex items-center gap-1"
          >
            <span aria-hidden="true">←</span>
            Back to Insights
          </Link>
        </div>
      </div>
    </>
  );
}
