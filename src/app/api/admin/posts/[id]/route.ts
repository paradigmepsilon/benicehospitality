import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const posts = await sql`SELECT * FROM blog_posts WHERE id = ${id}`;

  if (posts.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(posts[0]);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const {
    title,
    slug,
    excerpt,
    content,
    category,
    featured_image_url,
    published,
    published_at,
  } = body;

  const result = await sql`
    UPDATE blog_posts
    SET
      title = COALESCE(${title}, title),
      slug = COALESCE(${slug}, slug),
      excerpt = COALESCE(${excerpt}, excerpt),
      content = COALESCE(${content}, content),
      category = COALESCE(${category}, category),
      featured_image_url = COALESCE(${featured_image_url}, featured_image_url),
      published = COALESCE(${published}, published),
      published_at = ${published_at !== undefined ? (published_at || null) : null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const result = await sql`DELETE FROM blog_posts WHERE id = ${id} RETURNING id`;

  if (result.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
