import { neon } from "@neondatabase/serverless";

const SEED_POSTS = [
  {
    title: "What 10 to 50 Room Hotels Get Wrong About Direct Bookings",
    excerpt:
      "Most boutique hotels have a direct booking problem they don't know how to solve, or worse, one they don't know they have. Here's where the money is hiding and how to reclaim it.",
    category: "Revenue Strategy",
    date: "2026-02-01",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    slug: "direct-booking-mistakes-boutique-hotels",
  },
  {
    title:
      "Why Your Boutique Hotel's Tech Stack Is Costing You More Than You Think",
    excerpt:
      "The average independent hotel pays for 6–8 technology tools. Fewer than half are configured correctly. The overlap is costing you time, money, and data you'll never get back.",
    category: "Hotel Technology",
    date: "2026-01-01",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    slug: "boutique-hotel-tech-stack-costs",
  },
  {
    title:
      "The Service Recovery Framework That Turns Complaints Into Loyalty",
    excerpt:
      "How you handle a problem tells a guest more about your hotel than anything they experienced when things were going right. Here's the framework that transforms complaints into your most loyal advocates.",
    category: "Guest Experience",
    date: "2025-12-01",
    image:
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80",
    slug: "service-recovery-framework-boutique-hotels",
  },
];

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Seeding blog posts...");

  for (const post of SEED_POSTS) {
    await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, category, featured_image_url, published, created_at)
      VALUES (${post.title}, ${post.slug}, ${post.excerpt}, ${`<p>${post.excerpt}</p>`}, ${post.category}, ${post.image}, true, ${post.date})
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`  ✓ ${post.slug}`);
  }

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
