"use client";

import { useState, useEffect, use } from "react";
import PostEditor from "@/components/admin/PostEditor";

interface PostData {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image_url: string;
  published: boolean;
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-sm text-[#1a1a1a]/50">Loading...</p>;
  }

  if (error || !post) {
    return (
      <p className="text-sm text-red-500">{error || "Post not found"}</p>
    );
  }

  return <PostEditor post={post} />;
}
