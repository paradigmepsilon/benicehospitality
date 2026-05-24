import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageSquare, Pin, Lock } from "lucide-react";
import {
  getCategoryBySlug,
  listThreadsForCategory,
} from "@/lib/forum";

export const metadata: Metadata = {
  title: "Community category",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string }>;
}

function fmtRelative(iso: string | null): string {
  if (!iso) return "-";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d`;
  return new Date(iso).toISOString().split("T")[0];
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const threads = await listThreadsForCategory(category.id, { limit: 50 });

  return (
    <>
      <div className="max-w-5xl">
        <Link
          href="/account/community"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
        >
          ← All rooms
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
              Community room
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight">
              {category.name}
            </h1>
            <p className="font-sans text-base text-charcoal/85 leading-relaxed mt-3 max-w-2xl">
              {category.description}
            </p>
          </div>
          <Link
            href={`/account/community/new?category=${category.slug}`}
            className="inline-flex items-center gap-2 bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-5 py-2.5 transition-colors whitespace-nowrap"
          >
            New thread
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div>
          {threads.length === 0 ? (
            <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
              <MessageSquare
                className="w-6 h-6 text-charcoal/40 mx-auto mb-3"
                aria-hidden
              />
              <p className="font-display text-xl font-semibold text-deep-teal mb-2">
                No threads yet.
              </p>
              <p className="font-sans text-sm text-charcoal/70 mb-5 max-w-md mx-auto">
                Start the conversation. Pose a question, share a setup,
                document something that broke and how you fixed it.
              </p>
              <Link
                href={`/account/community/new?category=${category.slug}`}
                className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
              >
                Start the first thread
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/account/community/${category.slug}/${t.slug}`}
                    className="block bg-white border border-light-gray rounded-lg p-5 hover:border-primary-green/40 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {t.isPinned && (
                            <Pin
                              className="w-3.5 h-3.5 text-warm-gold"
                              aria-label="Pinned"
                            />
                          )}
                          {t.isLocked && (
                            <Lock
                              className="w-3.5 h-3.5 text-charcoal/50"
                              aria-label="Locked"
                            />
                          )}
                          <h3 className="font-display text-lg md:text-xl font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors truncate">
                            {t.title}
                          </h3>
                        </div>
                        <p className="font-sans text-xs text-charcoal/60">
                          by {t.authorName ?? "former member"} ·{" "}
                          {fmtRelative(t.createdAt)}
                          {" · "}
                          {t.replyCount} repl
                          {t.replyCount === 1 ? "y" : "ies"}
                        </p>
                      </div>
                      <p className="font-sans text-xs text-charcoal/55 whitespace-nowrap mt-0.5">
                        {fmtRelative(t.lastReplyAt ?? t.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
