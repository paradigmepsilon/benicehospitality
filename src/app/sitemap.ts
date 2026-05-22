import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { TIER_ZERO_RESOURCES } from "@/lib/tier-zero-resources";
import { COURSES } from "@/lib/courses";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://benicehospitality.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/advisory`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/signal`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/labs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/labs/guestally`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/labs/build-log`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/insights`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/book`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/audit/request`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/resources/mtr-viability-scorecard`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const coursePages: MetadataRoute.Sitemap = COURSES.map((c) => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const resourcePages: MetadataRoute.Sitemap = TIER_ZERO_RESOURCES.map((r) => ({
    url: `${baseUrl}/resources/${r.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const posts = await sql`
    SELECT slug, updated_at, created_at FROM blog_posts
    WHERE published = true AND (published_at IS NULL OR published_at <= NOW())
  `;

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/insights/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...coursePages, ...resourcePages, ...blogPages];
}
