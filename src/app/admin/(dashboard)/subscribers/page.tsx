"use client";

import { useState, useEffect, useMemo } from "react";
import { relativeTime } from "@/lib/utils";

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
  source: string;
}

type SortOption = "newest" | "oldest" | "email";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then((res) => res.json())
      .then((data) => setSubscribers(data))
      .finally(() => setLoading(false));
  }, []);

  const sources = useMemo(() => {
    const set = new Set(subscribers.map((s) => s.source));
    return Array.from(set).sort();
  }, [subscribers]);

  const filtered = useMemo(() => {
    let result = subscribers;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.email.toLowerCase().includes(q));
    }

    if (sourceFilter !== "all") {
      result = result.filter((s) => s.source === sourceFilter);
    }

    result = [...result].sort((a, b) => {
      if (sort === "newest")
        return new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime();
      if (sort === "oldest")
        return new Date(a.subscribed_at).getTime() - new Date(b.subscribed_at).getTime();
      return a.email.localeCompare(b.email);
    });

    return result;
  }, [subscribers, search, sourceFilter, sort]);

  function handleExport() {
    window.open("/api/admin/subscribers?format=csv", "_blank");
  }

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Remove ${email} from subscribers?`)) return;
    setDeleting(id);

    const res = await fetch(`/api/admin/subscribers/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
    setDeleting(null);
  }

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
        : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd] hover:border-[#1a1a1a]/30"
    }`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
            Newsletter Subscribers
          </h1>
          {!loading && (
            <p className="text-sm text-[#1a1a1a]/50 mt-1">
              {subscribers.length} subscriber
              {subscribers.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#333] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-12 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading subscribers...
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#e8e4dd] rounded-lg">
          <svg className="w-12 h-12 mx-auto text-[#1a1a1a]/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-[#1a1a1a]/40">No subscribers yet.</p>
          <p className="text-xs text-[#1a1a1a]/30 mt-1">
            They&apos;ll appear here when someone subscribes on the Insights page.
          </p>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#e8e4dd] rounded-lg p-4 mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f] transition-colors"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg bg-white focus:outline-none focus:border-[#5b9a2f] transition-colors"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="email">Email A-Z</option>
              </select>
            </div>

            {/* Source filter pills */}
            {sources.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSourceFilter("all")}
                  className={filterBtnClass(sourceFilter === "all")}
                >
                  All
                  <span className="ml-1.5 opacity-60">{subscribers.length}</span>
                </button>
                {sources.map((source) => (
                  <button
                    key={source}
                    onClick={() => setSourceFilter(source)}
                    className={filterBtnClass(sourceFilter === source)}
                  >
                    {source}
                    <span className="ml-1.5 opacity-60">
                      {subscribers.filter((s) => s.source === source).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Result count */}
          <p className="text-xs text-[#1a1a1a]/40 mb-3">
            Showing {filtered.length} of {subscribers.length}
          </p>

          {/* Subscribers List */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#e8e4dd] rounded-lg">
              <p className="text-sm text-[#1a1a1a]/40">No subscribers match your search.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
              {filtered.map((sub, i) => (
                <div
                  key={sub.id}
                  className={`flex items-center gap-4 px-4 py-3 ${
                    i !== filtered.length - 1 ? "border-b border-[#e8e4dd]" : ""
                  } hover:bg-[#f8f6f1]/50 transition-colors group`}
                >
                  {/* Email icon */}
                  <div className="w-8 h-8 rounded-full bg-[#5b9a2f]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#5b9a2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>

                  {/* Email + source */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {sub.email}
                    </p>
                    <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                      via {sub.source} &middot; {relativeTime(sub.subscribed_at)}
                    </p>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-[#1a1a1a]/35 hidden sm:block">
                    {new Date(sub.subscribed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(sub.id, sub.email)}
                    disabled={deleting === sub.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#1a1a1a]/25 hover:text-red-500 transition-all disabled:opacity-50"
                    title="Remove subscriber"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
