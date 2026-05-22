import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import { getThreadBySlug, createPost } from "@/lib/forum";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const thread = await getThreadBySlug(slug);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }
  if (thread.isLocked && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Thread is locked" },
      { status: 423 },
    );
  }
  const body = await request.json().catch(() => null);
  const replyBody =
    body && typeof body === "object" && typeof (body as { body?: unknown }).body === "string"
      ? ((body as { body: string }).body)
      : null;
  if (!replyBody || replyBody.trim().length < 1) {
    return NextResponse.json(
      { error: "body is required" },
      { status: 400 },
    );
  }
  const post = await createPost({
    threadId: thread.id,
    authorUserId: session.user.id,
    body: replyBody.trim(),
  });
  return NextResponse.json({ post });
}
