"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CourseListItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  isPublished: boolean;
  isPurchasable: boolean;
  isPlaceholder: boolean;
  categorySlug: string | null;
  displayPosition: number;
  moduleCount: number;
  lessonCount: number;
}

export default function CoursesAdmin({
  initialCourses,
}: {
  initialCourses: CourseListItem[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data?.error || "Failed to create course.");
      return;
    }
    router.push(`/admin/courses/${data.id}/edit`);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#1a1a1a]">
            Courses
          </h1>
          <p className="font-sans text-sm text-charcoal/70 mt-1">
            Create and edit courses, modules, lessons, tiers, and uploaded
            content.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="bg-[#1a1a1a] text-white font-sans text-sm font-semibold rounded-md px-4 py-2 hover:bg-charcoal/90 transition-colors"
          >
            + New course
          </button>
        )}
      </header>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-light-gray rounded-lg p-5 mb-8"
        >
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65 mb-2">
            Course title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Room Rental Riches"
            className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2 mb-3 focus:outline-none focus:border-primary-green"
            autoFocus
          />
          {error && (
            <p className="font-sans text-xs text-red-600 mb-2">{error}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={busy || !title.trim()}
              className="bg-primary-green text-white font-sans text-sm font-semibold rounded-md px-4 py-2 hover:bg-primary-green-dark disabled:opacity-50 transition-colors"
            >
              {busy ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setTitle("");
                setError(null);
              }}
              className="font-sans text-sm text-charcoal/70 hover:text-charcoal px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream/50 border-b border-light-gray">
            <tr>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">
                Title
              </th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">
                Slug
              </th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">
                Modules / Lessons
              </th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">
                State
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {initialCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-sans text-sm text-charcoal/55">
                  No courses yet. Click <span className="font-semibold">New course</span> to start.
                </td>
              </tr>
            ) : (
              initialCourses.map((c) => (
                <tr key={c.id} className="border-b border-light-gray last:border-0 hover:bg-cream/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/courses/${c.id}/edit`}
                      className="font-display text-sm font-semibold text-deep-teal hover:text-primary-green"
                    >
                      {c.title}
                    </Link>
                    {c.summary && (
                      <p className="font-sans text-xs text-charcoal/60 mt-0.5 line-clamp-1 max-w-md">
                        {c.summary}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-charcoal/65">{c.slug}</td>
                  <td className="px-4 py-3 font-sans text-xs text-charcoal/70">
                    {c.moduleCount} modules · {c.lessonCount} lessons
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {c.isPublished ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary-green/15 text-primary-green-dark px-2 py-0.5 rounded">
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-charcoal/10 text-charcoal/60 px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                      {c.isPurchasable && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-warm-gold/20 text-warm-gold-dark px-2 py-0.5 rounded">
                          For sale
                        </span>
                      )}
                      {c.isPlaceholder && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-charcoal/10 text-charcoal/60 px-2 py-0.5 rounded">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/courses/${c.id}/edit`}
                      className="font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
