import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import {
  getThreadBySlug,
  listPostsForThread,
  updateThread,
  softDeleteThread,
  canEditThread,
  canModerate,
} from "@/lib/forum";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const thread = await getThreadBySlug(slug);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }
  const posts = await listPostsForThread(thread.id);
  return NextResponse.json({ thread, posts });
}

export async function PATCH(request: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const thread = await getThreadBySlug(slug);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }
  const actor = { userId: session.user.id, role: session.user.role };
  const body = (await request.json().catch(() => null)) as {
    title?: unknown;
    body?: unknown;
    isPinned?: unknown;
    isLocked?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: {
    title?: string;
    body?: string;
    isPinned?: boolean;
    isLocked?: boolean;
  } = {};

  // Title/body edits: author or admin.
  if (typeof body.title === "string" || typeof body.body === "string") {
    if (!canEditThread(thread, actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (typeof body.title === "string" && body.title.trim().length >= 4) {
      patch.title = body.title.trim();
    }
    if (typeof body.body === "string" && body.body.trim().length >= 4) {
      patch.body = body.body.trim();
    }
  }
  // Pin/lock: admin only.
  if (typeof body.isPinned === "boolean" || typeof body.isLocked === "boolean") {
    if (!canModerate(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (typeof body.isPinned === "boolean") patch.isPinned = body.isPinned;
    if (typeof body.isLocked === "boolean") patch.isLocked = body.isLocked;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }
  await updateThread(thread.id, patch);
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const thread = await getThreadBySlug(slug);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }
  const actor = { userId: session.user.id, role: session.user.role };
  if (!canEditThread(thread, actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await softDeleteThread(thread.id);
  return NextResponse.json({ success: true });
}
