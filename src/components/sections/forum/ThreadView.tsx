"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pin, Lock, Unlock, Trash2, Pencil } from "lucide-react";

interface ActorInfo {
  userId: number;
  role: "admin" | "user";
}

interface ThreadDTO {
  id: number;
  slug: string;
  title: string;
  body: string;
  authorUserId: number | null;
  authorName: string | null;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

interface PostDTO {
  id: number;
  authorUserId: number | null;
  authorName: string | null;
  body: string;
  createdAt: string;
  deletedAt: string | null;
}

interface ThreadViewProps {
  thread: ThreadDTO;
  posts: PostDTO[];
  actor: ActorInfo;
  categorySlug: string;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function ThreadView({
  thread: initialThread,
  posts: initialPosts,
  actor,
  categorySlug,
}: ThreadViewProps) {
  const router = useRouter();
  const [thread, setThread] = useState(initialThread);
  const [posts, setPosts] = useState(initialPosts);
  const [pending, startTransition] = useTransition();

  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canEditThread =
    actor.role === "admin" || actor.userId === thread.authorUserId;
  const canModerate = actor.role === "admin";

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function submitReply(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!reply.trim()) {
      setError("Reply can't be empty.");
      return;
    }
    if (thread.isLocked && !canModerate) {
      setError("This thread is locked.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/forum/threads/${thread.slug}/posts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: reply.trim() }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Reply failed.");
        return;
      }
      const data = (await res.json()) as { post: PostDTO };
      setPosts((prev) => [
        ...prev,
        {
          ...data.post,
          authorName: actor.role === "admin" ? "Admin" : "You",
        },
      ]);
      setReply("");
      refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePin() {
    const next = !thread.isPinned;
    const res = await fetch(`/api/forum/threads/${thread.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: next }),
    });
    if (res.ok) {
      setThread((t) => ({ ...t, isPinned: next }));
      refresh();
    }
  }

  async function toggleLock() {
    const next = !thread.isLocked;
    const res = await fetch(`/api/forum/threads/${thread.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLocked: next }),
    });
    if (res.ok) {
      setThread((t) => ({ ...t, isLocked: next }));
      refresh();
    }
  }

  async function deleteThread() {
    if (!confirm("Delete this thread? Replies will be hidden too.")) return;
    const res = await fetch(`/api/forum/threads/${thread.slug}`, {
      method: "DELETE",
    });
    if (res.ok) {
      window.location.assign(`/account/community/${categorySlug}`);
    }
  }

  async function editPost(postId: number, currentBody: string) {
    const next = window.prompt("Edit your reply:", currentBody);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/forum/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, body: trimmed } : p)),
      );
      refresh();
    }
  }

  async function deletePost(postId: number) {
    if (!confirm("Delete this reply?")) return;
    const res = await fetch(`/api/forum/posts/${postId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, deletedAt: new Date().toISOString() }
            : p,
        ),
      );
      refresh();
    }
  }

  return (
    <>
      {/* Thread header */}
      <div className="bg-white border border-light-gray rounded-lg p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {thread.isPinned && (
              <span className="inline-flex items-center gap-1 bg-warm-gold/15 text-warm-gold-dark px-2 py-0.5 rounded text-xs font-semibold">
                <Pin className="w-3 h-3" aria-hidden /> Pinned
              </span>
            )}
            {thread.isLocked && (
              <span className="inline-flex items-center gap-1 bg-charcoal/10 text-charcoal/70 px-2 py-0.5 rounded text-xs font-semibold">
                <Lock className="w-3 h-3" aria-hidden /> Locked
              </span>
            )}
          </div>
          {(canModerate || canEditThread) && (
            <div className="flex items-center gap-2">
              {canModerate && (
                <>
                  <button
                    type="button"
                    onClick={togglePin}
                    className="text-xs font-semibold text-charcoal/70 hover:text-primary-green inline-flex items-center gap-1"
                    title={thread.isPinned ? "Unpin" : "Pin"}
                  >
                    <Pin className="w-3.5 h-3.5" aria-hidden />
                    {thread.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleLock}
                    className="text-xs font-semibold text-charcoal/70 hover:text-primary-green inline-flex items-center gap-1"
                    title={thread.isLocked ? "Unlock" : "Lock"}
                  >
                    {thread.isLocked ? (
                      <Unlock className="w-3.5 h-3.5" aria-hidden />
                    ) : (
                      <Lock className="w-3.5 h-3.5" aria-hidden />
                    )}
                    {thread.isLocked ? "Unlock" : "Lock"}
                  </button>
                </>
              )}
              {canEditThread && (
                <button
                  type="button"
                  onClick={deleteThread}
                  className="text-xs font-semibold text-red-700 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mb-3">
          {thread.title}
        </h1>
        <p className="font-sans text-xs text-charcoal/60 mb-5">
          by {thread.authorName ?? "former member"} · {fmtDate(thread.createdAt)}
        </p>
        <div className="font-sans text-base text-charcoal leading-relaxed whitespace-pre-wrap">
          {thread.body}
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4 mb-6">
        {posts.map((p) => {
          const isAuthor = actor.userId === p.authorUserId;
          const canEdit = canModerate || isAuthor;
          if (p.deletedAt) {
            return (
              <div
                key={p.id}
                className="bg-cream border border-dashed border-light-gray rounded-lg p-5 text-sm text-charcoal/55 italic"
              >
                [reply deleted]
              </div>
            );
          }
          return (
            <article
              key={p.id}
              className="bg-white border border-light-gray rounded-lg p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-sans text-xs text-charcoal/60">
                  <span className="font-semibold text-deep-teal">
                    {p.authorName ?? "former member"}
                  </span>
                  {" · "}
                  {fmtDate(p.createdAt)}
                </p>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editPost(p.id, p.body)}
                      className="text-xs font-semibold text-charcoal/60 hover:text-primary-green inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" aria-hidden /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePost(p.id)}
                      className="text-xs font-semibold text-red-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden /> Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="font-sans text-base text-charcoal leading-relaxed whitespace-pre-wrap">
                {p.body}
              </div>
            </article>
          );
        })}
      </div>

      {/* Reply form */}
      {thread.isLocked && !canModerate ? (
        <div className="bg-cream border border-dashed border-light-gray rounded-lg p-6 text-center">
          <p className="font-sans text-sm text-charcoal/70">
            This thread is locked. New replies are disabled.
          </p>
        </div>
      ) : (
        <form
          onSubmit={submitReply}
          className="bg-white border border-light-gray rounded-lg p-5 md:p-6"
        >
          <label
            htmlFor="reply"
            className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
          >
            Your reply
          </label>
          <textarea
            id="reply"
            rows={5}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Stay specific. Numbers, screenshots-via-link, the actual situation."
            className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors resize-y"
          />
          {error && (
            <p className="text-sm text-red-700 mt-3">{error}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <p className="font-sans text-xs text-charcoal/55">
              {pending ? "Refreshing…" : ""}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post reply"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
