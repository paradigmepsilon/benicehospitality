import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import {
  listThreadsForCategory,
  getCategoryBySlug,
  createThread,
} from "@/lib/forum";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const categorySlug = url.searchParams.get("category");
  if (!categorySlug) {
    return NextResponse.json(
      { error: "category query param required" },
      { status: 400 },
    );
  }
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 404 });
  }
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit")) || 25, 1),
    100,
  );
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
  const threads = await listThreadsForCategory(category.id, { limit, offset });
  return NextResponse.json({ threads });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { categorySlug, title, body: threadBody } = body as {
      categorySlug?: unknown;
      title?: unknown;
      body?: unknown;
    };
    if (typeof categorySlug !== "string" || !categorySlug.trim()) {
      return NextResponse.json(
        { error: "categorySlug is required" },
        { status: 400 },
      );
    }
    if (typeof title !== "string" || title.trim().length < 4) {
      return NextResponse.json(
        { error: "title must be at least 4 characters" },
        { status: 400 },
      );
    }
    if (typeof threadBody !== "string" || threadBody.trim().length < 4) {
      return NextResponse.json(
        { error: "body must be at least 4 characters" },
        { status: 400 },
      );
    }
    const category = await getCategoryBySlug(categorySlug);
    if (!category) {
      return NextResponse.json({ error: "Unknown category" }, { status: 404 });
    }
    const thread = await createThread({
      categoryId: category.id,
      authorUserId: session.user.id,
      title: title.trim(),
      body: threadBody.trim(),
    });
    return NextResponse.json({ thread, categorySlug: category.slug });
  } catch (err) {
    console.error("[forum/threads POST]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
