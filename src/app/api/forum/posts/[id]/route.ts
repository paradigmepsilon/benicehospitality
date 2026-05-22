import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import {
  getPostById,
  updatePost,
  softDeletePost,
  canEditPost,
} from "@/lib/forum";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function loadPost(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getPostById(id);
}

export async function PATCH(request: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const post = await loadPost(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const actor = { userId: session.user.id, role: session.user.role };
  if (!canEditPost(post, actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const newBody =
    body && typeof body === "object" && typeof (body as { body?: unknown }).body === "string"
      ? ((body as { body: string }).body)
      : null;
  if (!newBody || newBody.trim().length < 1) {
    return NextResponse.json(
      { error: "body is required" },
      { status: 400 },
    );
  }
  await updatePost(post.id, newBody.trim());
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const post = await loadPost(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const actor = { userId: session.user.id, role: session.user.role };
  if (!canEditPost(post, actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await softDeletePost(post.id);
  return NextResponse.json({ success: true });
}
