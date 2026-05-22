import { sql } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { recordEvent } from "@/lib/analytics";
import type { Role } from "@/lib/community-auth";

// Forum data layer. Threads + replies; soft-delete only (deleted_at preserves
// history for moderation review). reply_count and last_reply_at are
// denormalized on threads — kept in sync inside createPost / softDeletePost.

export interface ForumCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  position: number;
}

export interface ForumThread {
  id: number;
  categoryId: number;
  authorUserId: number | null;
  slug: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ForumThreadWithMeta extends ForumThread {
  authorName: string | null;
  authorEmail: string | null;
  categorySlug: string;
  categoryName: string;
}

export interface ForumPost {
  id: number;
  threadId: number;
  authorUserId: number | null;
  authorName: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface CategoryRow {
  id: number;
  slug: string;
  name: string;
  description: string;
  position: number;
}

interface ThreadRow {
  id: number;
  category_id: number;
  author_user_id: number | null;
  slug: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  last_reply_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface PostRow {
  id: number;
  thread_id: number;
  author_user_id: number | null;
  author_name: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function rowToCategory(r: CategoryRow): ForumCategory {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    position: r.position,
  };
}

function rowToThread(r: ThreadRow): ForumThread {
  return {
    id: r.id,
    categoryId: r.category_id,
    authorUserId: r.author_user_id,
    slug: r.slug,
    title: r.title,
    body: r.body,
    isPinned: r.is_pinned,
    isLocked: r.is_locked,
    replyCount: r.reply_count,
    lastReplyAt: r.last_reply_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  };
}

function rowToPost(r: PostRow): ForumPost {
  return {
    id: r.id,
    threadId: r.thread_id,
    authorUserId: r.author_user_id,
    authorName: r.author_name,
    body: r.body,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  };
}

// =============================================================================
// Categories
// =============================================================================

export async function listCategories(): Promise<
  Array<ForumCategory & { threadCount: number; lastActivityAt: string | null }>
> {
  const rows = (await sql`
    SELECT
      c.id, c.slug, c.name, c.description, c.position,
      (SELECT COUNT(*) FROM forum_threads t
        WHERE t.category_id = c.id AND t.deleted_at IS NULL) AS thread_count,
      (SELECT MAX(GREATEST(t.last_reply_at, t.created_at))
        FROM forum_threads t
        WHERE t.category_id = c.id AND t.deleted_at IS NULL) AS last_activity_at
    FROM forum_categories c
    ORDER BY c.position ASC, c.id ASC
  `) as Array<
    CategoryRow & {
      thread_count: string | number;
      last_activity_at: string | null;
    }
  >;
  return rows.map((r) => ({
    ...rowToCategory(r),
    threadCount: Number(r.thread_count),
    lastActivityAt: r.last_activity_at,
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<ForumCategory | null> {
  const rows = (await sql`
    SELECT id, slug, name, description, position
    FROM forum_categories WHERE slug = ${slug} LIMIT 1
  `) as CategoryRow[];
  return rows[0] ? rowToCategory(rows[0]) : null;
}

// =============================================================================
// Threads
// =============================================================================

export async function listThreadsForCategory(
  categoryId: number,
  opts: { limit?: number; offset?: number } = {},
): Promise<ForumThreadWithMeta[]> {
  const limit = opts.limit ?? 25;
  const offset = opts.offset ?? 0;
  const rows = (await sql`
    SELECT t.*, u.name AS author_name, u.email AS author_email,
           c.slug AS category_slug, c.name AS category_name
    FROM forum_threads t
    LEFT JOIN users u ON u.id = t.author_user_id
    JOIN forum_categories c ON c.id = t.category_id
    WHERE t.category_id = ${categoryId} AND t.deleted_at IS NULL
    ORDER BY t.is_pinned DESC, COALESCE(t.last_reply_at, t.created_at) DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as Array<
    ThreadRow & {
      author_name: string | null;
      author_email: string | null;
      category_slug: string;
      category_name: string;
    }
  >;
  return rows.map((r) => ({
    ...rowToThread(r),
    authorName: r.author_name,
    authorEmail: r.author_email,
    categorySlug: r.category_slug,
    categoryName: r.category_name,
  }));
}

export async function getThreadBySlug(
  slug: string,
): Promise<ForumThreadWithMeta | null> {
  const rows = (await sql`
    SELECT t.*, u.name AS author_name, u.email AS author_email,
           c.slug AS category_slug, c.name AS category_name
    FROM forum_threads t
    LEFT JOIN users u ON u.id = t.author_user_id
    JOIN forum_categories c ON c.id = t.category_id
    WHERE t.slug = ${slug} AND t.deleted_at IS NULL
    LIMIT 1
  `) as Array<
    ThreadRow & {
      author_name: string | null;
      author_email: string | null;
      category_slug: string;
      category_name: string;
    }
  >;
  if (!rows[0]) return null;
  return {
    ...rowToThread(rows[0]),
    authorName: rows[0].author_name,
    authorEmail: rows[0].author_email,
    categorySlug: rows[0].category_slug,
    categoryName: rows[0].category_name,
  };
}

async function threadSlugExists(slug: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM forum_threads WHERE slug = ${slug} LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

export async function createThread(input: {
  categoryId: number;
  authorUserId: number;
  title: string;
  body: string;
}): Promise<ForumThread> {
  const slug = await uniqueSlug(input.title, threadSlugExists);
  const rows = (await sql`
    INSERT INTO forum_threads (category_id, author_user_id, slug, title, body)
    VALUES (${input.categoryId}, ${input.authorUserId}, ${slug}, ${input.title}, ${input.body})
    RETURNING *
  `) as ThreadRow[];
  const thread = rowToThread(rows[0]);
  void recordEvent({
    userId: input.authorUserId,
    eventType: "forum.thread_create",
    metadata: { threadId: thread.id, categoryId: thread.categoryId },
  });
  return thread;
}

export async function updateThread(
  threadId: number,
  patch: { title?: string; body?: string; isPinned?: boolean; isLocked?: boolean },
): Promise<void> {
  // Build the SET clause dynamically by issuing per-field updates. Keeps the
  // sql tag template simple and avoids dynamic string interpolation.
  if (typeof patch.title === "string") {
    await sql`UPDATE forum_threads SET title = ${patch.title}, updated_at = NOW() WHERE id = ${threadId}`;
  }
  if (typeof patch.body === "string") {
    await sql`UPDATE forum_threads SET body = ${patch.body}, updated_at = NOW() WHERE id = ${threadId}`;
  }
  if (typeof patch.isPinned === "boolean") {
    await sql`UPDATE forum_threads SET is_pinned = ${patch.isPinned}, updated_at = NOW() WHERE id = ${threadId}`;
  }
  if (typeof patch.isLocked === "boolean") {
    await sql`UPDATE forum_threads SET is_locked = ${patch.isLocked}, updated_at = NOW() WHERE id = ${threadId}`;
  }
}

export async function softDeleteThread(threadId: number): Promise<void> {
  await sql`UPDATE forum_threads SET deleted_at = NOW() WHERE id = ${threadId} AND deleted_at IS NULL`;
}

// =============================================================================
// Posts (replies)
// =============================================================================

export async function listPostsForThread(
  threadId: number,
): Promise<ForumPost[]> {
  const rows = (await sql`
    SELECT p.id, p.thread_id, p.author_user_id, u.name AS author_name,
           p.body, p.created_at, p.updated_at, p.deleted_at
    FROM forum_posts p
    LEFT JOIN users u ON u.id = p.author_user_id
    WHERE p.thread_id = ${threadId}
    ORDER BY p.created_at ASC, p.id ASC
  `) as PostRow[];
  return rows.map(rowToPost);
}

export async function getPostById(postId: number): Promise<ForumPost | null> {
  const rows = (await sql`
    SELECT p.id, p.thread_id, p.author_user_id, u.name AS author_name,
           p.body, p.created_at, p.updated_at, p.deleted_at
    FROM forum_posts p
    LEFT JOIN users u ON u.id = p.author_user_id
    WHERE p.id = ${postId} LIMIT 1
  `) as PostRow[];
  return rows[0] ? rowToPost(rows[0]) : null;
}

export async function createPost(input: {
  threadId: number;
  authorUserId: number;
  body: string;
}): Promise<ForumPost> {
  const rows = (await sql`
    INSERT INTO forum_posts (thread_id, author_user_id, body)
    VALUES (${input.threadId}, ${input.authorUserId}, ${input.body})
    RETURNING id, thread_id, author_user_id, body, created_at, updated_at, deleted_at
  `) as PostRow[];
  await sql`
    UPDATE forum_threads
    SET reply_count = reply_count + 1,
        last_reply_at = NOW(),
        updated_at = NOW()
    WHERE id = ${input.threadId}
  `;
  void recordEvent({
    userId: input.authorUserId,
    eventType: "forum.post_create",
    metadata: { postId: rows[0].id, threadId: input.threadId },
  });
  return rowToPost({ ...rows[0], author_name: null });
}

export async function updatePost(postId: number, body: string): Promise<void> {
  await sql`
    UPDATE forum_posts
    SET body = ${body}, updated_at = NOW()
    WHERE id = ${postId} AND deleted_at IS NULL
  `;
}

export async function softDeletePost(postId: number): Promise<void> {
  // Decrement reply_count on the parent thread atomically with the soft-delete
  // so the badge stays honest. last_reply_at left as-is — the latest visible
  // post might still be earlier; recomputing on every delete is overkill.
  const rows = (await sql`
    UPDATE forum_posts SET deleted_at = NOW()
    WHERE id = ${postId} AND deleted_at IS NULL
    RETURNING thread_id
  `) as { thread_id: number }[];
  if (rows[0]) {
    await sql`
      UPDATE forum_threads
      SET reply_count = GREATEST(reply_count - 1, 0)
      WHERE id = ${rows[0].thread_id}
    `;
  }
}

// =============================================================================
// Authorization
// =============================================================================

export interface ActorIdentity {
  userId: number;
  role: Role;
}

export function canEditThread(
  thread: { authorUserId: number | null },
  actor: ActorIdentity,
): boolean {
  if (actor.role === "admin") return true;
  return thread.authorUserId !== null && thread.authorUserId === actor.userId;
}

export function canEditPost(
  post: { authorUserId: number | null },
  actor: ActorIdentity,
): boolean {
  if (actor.role === "admin") return true;
  return post.authorUserId !== null && post.authorUserId === actor.userId;
}

export function canModerate(actor: ActorIdentity): boolean {
  return actor.role === "admin";
}
