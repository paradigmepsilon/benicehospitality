import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const posts = await sql`
    SELECT * FROM blog_posts ORDER BY created_at DESC
  `;
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      category,
      featured_image_url,
      published,
      published_at,
    } = body;

    if (!title || !excerpt || !category) {
      return NextResponse.json(
        { error: "Title, excerpt, and category are required" },
        { status: 400 }
      );
    }

    const slug = customSlug || slugify(title);

    const result = await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, category, featured_image_url, published, published_at)
      VALUES (${title}, ${slug}, ${excerpt}, ${content || ""}, ${category}, ${featured_image_url || ""}, ${published ?? false}, ${published_at || null})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
