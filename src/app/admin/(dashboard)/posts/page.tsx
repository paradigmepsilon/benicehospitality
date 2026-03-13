"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

function getStatus(post: Post): { label: string; className: string } {
  if (!post.published) {
    return { label: "Draft", className: "bg-[#1a1a1a]/5 text-[#1a1a1a]/50" };
  }
  if (post.published_at && new Date(post.published_at) > new Date()) {
    return {
      label: `Scheduled · ${new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      className: "bg-[#f5a623]/10 text-[#d4891a]",
    };
  }
  return { label: "Published", className: "bg-[#5b9a2f]/10 text-[#5b9a2f]" };
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
          Blog Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="bg-[#5b9a2f] text-white px-5 py-2 text-sm font-semibold hover:bg-[#4a7d25] transition-colors"
        >
          New Post
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-[#1a1a1a]/50">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">No posts yet.</p>
      ) : (
        <div className="bg-white border border-[#e8e4dd] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e4dd] bg-[#f8f6f1]">
                <th className="text-left px-4 py-3 font-medium text-[#1a1a1a]">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#1a1a1a]">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#1a1a1a]">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#1a1a1a]">
                  Created
                </th>
                <th className="text-right px-4 py-3 font-medium text-[#1a1a1a]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const status = getStatus(post);
                return (
                  <tr
                    key={post.id}
                    onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                    className="border-b border-[#e8e4dd] last:border-0 cursor-pointer hover:bg-[#f8f6f1]/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#1a1a1a]">
                      {post.title}
                    </td>
                    <td className="px-4 py-3 text-[#1a1a1a]/60">
                      {post.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1a1a1a]/60">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => handleDelete(e, post.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
