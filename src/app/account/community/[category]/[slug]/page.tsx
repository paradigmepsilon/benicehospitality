import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getThreadBySlug,
  listPostsForThread,
} from "@/lib/forum";
import { getCurrentSession } from "@/lib/community-auth";
import ThreadView from "@/components/sections/forum/ThreadView";

export const metadata: Metadata = {
  title: "Thread",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function ThreadDetailPage({ params }: PageProps) {
  const { category: categorySlug, slug } = await params;

  const session = await getCurrentSession();
  // Layout already gates auth; but TypeScript doesn't know that.
  if (!session) notFound();

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const thread = await getThreadBySlug(slug);
  if (!thread || thread.categoryId !== category.id) notFound();

  const posts = await listPostsForThread(thread.id);

  return (
    <>
      <div className="max-w-3xl">
        <Link
          href={`/account/community/${category.slug}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
        >
          ← {category.name}
        </Link>
        <ThreadView
            thread={{
              id: thread.id,
              slug: thread.slug,
              title: thread.title,
              body: thread.body,
              authorUserId: thread.authorUserId,
              authorName: thread.authorName,
              isPinned: thread.isPinned,
              isLocked: thread.isLocked,
              createdAt: thread.createdAt,
            }}
            posts={posts.map((p) => ({
              id: p.id,
              authorUserId: p.authorUserId,
              authorName: p.authorName,
              body: p.body,
              createdAt: p.createdAt,
              deletedAt: p.deletedAt,
            }))}
          actor={{ userId: session.user.id, role: session.user.role }}
          categorySlug={category.slug}
        />
      </div>
    </>
  );
}
