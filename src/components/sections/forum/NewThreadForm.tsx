"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

interface NewThreadFormProps {
  categories: Array<{ slug: string; name: string }>;
}

export default function NewThreadForm({ categories }: NewThreadFormProps) {
  const searchParams = useSearchParams();
  const initialCategory =
    searchParams.get("category") || categories[0]?.slug || "";

  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 4) {
      setError("Title must be at least 4 characters.");
      return;
    }
    if (body.trim().length < 4) {
      setError("Body must be at least 4 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug,
          title: title.trim(),
          body: body.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't post the thread. Try again.");
        setSubmitting(false);
        return;
      }
      const data = (await res.json()) as {
        thread: { slug: string };
        categorySlug: string;
      };
      window.location.assign(
        `/account/community/${data.categorySlug}/${data.thread.slug}`,
      );
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-light-gray rounded-lg p-7 md:p-8 space-y-5"
      noValidate
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-sans p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="category"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          Room
        </label>
        <select
          id="category"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black focus:outline-none focus:border-primary-green"
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="title"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's the one-line version?"
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green"
          maxLength={140}
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          The post
        </label>
        <textarea
          id="body"
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Specifics. Numbers, dates, what you tried, what didn't work.

Markdown isn't rendered in v1 — line breaks are preserved.`}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="font-sans text-xs text-charcoal/55">
          Posting as the signed-in user.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-6 py-3 transition-colors disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post thread"}
        </button>
      </div>
    </form>
  );
}
