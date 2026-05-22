"use client";

import { useState, useEffect, useMemo } from "react";
import { relativeTime } from "@/lib/utils";
import { TIER_LABELS, type WaitlistTier } from "@/lib/validation/waitlist";

type WaitlistStatus = "pending" | "notified" | "enrolled" | "dismissed";

interface WaitlistSignup {
  id: number;
  name: string;
  email: string;
  course_slug: string;
  tier: WaitlistTier;
  status: WaitlistStatus;
  notes: string | null;
  created_at: string;
  notified_at: string | null;
}

type SortOption = "newest" | "oldest" | "name" | "email";

const TIER_BADGE: Record<WaitlistTier, string> = {
  self_paced: "bg-[#1A4D4F]/10 text-[#1A4D4F] border-[#1A4D4F]/30",
  cohort: "bg-[#B08D57]/15 text-[#7a5e36] border-[#B08D57]/40",
  operator: "bg-[#c0674a]/15 text-[#8a4a32] border-[#c0674a]/40",
  interest: "bg-[#5b9a2f]/12 text-[#3d6a1f] border-[#5b9a2f]/30",
};

const STATUS_BADGE: Record<WaitlistStatus, string> = {
  pending: "bg-[#1a1a1a]/5 text-[#1a1a1a]/70 border-[#1a1a1a]/15",
  notified: "bg-[#5b9a2f]/12 text-[#3d6a1f] border-[#5b9a2f]/30",
  enrolled: "bg-[#5b9a2f]/20 text-[#2d4f15] border-[#5b9a2f]/50",
  dismissed: "bg-[#c0674a]/10 text-[#8a4a32] border-[#c0674a]/25",
};

const STATUS_OPTIONS: WaitlistStatus[] = [
  "pending",
  "notified",
  "enrolled",
  "dismissed",
];

const TIER_OPTIONS: WaitlistTier[] = ["self_paced", "cohort", "operator"];

export default function WaitlistAdminPage() {
  const [signups, setSignups] = useState<WaitlistSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | WaitlistTier>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WaitlistStatus>(
    "all",
  );
  const [sort, setSort] = useState<SortOption>("newest");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/waitlist")
      .then((res) => res.json())
      .then((data) => setSignups(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = signups;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q),
      );
    }

    if (tierFilter !== "all") {
      result = result.filter((s) => s.tier === tierFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      if (sort === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.email.localeCompare(b.email);
    });

    return result;
  }, [signups, search, tierFilter, statusFilter, sort]);

  async function handleStatusChange(id: number, status: WaitlistStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSignups((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status,
                  notified_at:
                    status === "notified" && !s.notified_at
                      ? new Date().toISOString()
                      : s.notified_at,
                }
              : s,
          ),
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Remove ${email} from the waitlist?`)) return;
    setUpdating(id);
    const res = await fetch(`/api/admin/waitlist/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSignups((prev) => prev.filter((s) => s.id !== id));
    }
    setUpdating(null);
  }

  function handleExport() {
    window.open("/api/admin/waitlist?format=csv", "_blank");
  }

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
        : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd] hover:border-[#1a1a1a]/30"
    }`;

  const tierCounts: Record<WaitlistTier, number> = {
    self_paced: 0,
    cohort: 0,
    operator: 0,
    interest: 0,
  };
  for (const s of signups) tierCounts[s.tier]++;

  const statusCounts: Record<WaitlistStatus, number> = {
    pending: 0,
    notified: 0,
    enrolled: 0,
    dismissed: 0,
  };
  for (const s of signups) statusCounts[s.status]++;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
            Course Waitlist
          </h1>
          {!loading && (
            <p className="text-sm text-[#1a1a1a]/50 mt-1">
              {signups.length} signup{signups.length !== 1 ? "s" : ""}
              {signups.length > 0 && (
                <>
                  {" · "}
                  {tierCounts.self_paced} Self-paced
                  {" · "}
                  {tierCounts.cohort} Cohort
                  {" · "}
                  {tierCounts.operator} Operator
                </>
              )}
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#333] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-12 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading waitlist...
        </div>
      ) : signups.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#e8e4dd] rounded-lg">
          <svg
            className="w-12 h-12 mx-auto text-[#1a1a1a]/15 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm text-[#1a1a1a]/40">No signups yet.</p>
          <p className="text-xs text-[#1a1a1a]/30 mt-1">
            They&apos;ll appear here the moment someone joins the Room Rental
            Riches waitlist.
          </p>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#e8e4dd] rounded-lg p-4 mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
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
                <option value="name">Name A-Z</option>
                <option value="email">Email A-Z</option>
              </select>
            </div>

            {/* Tier filter pills */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/40 self-center mr-1">
                Tier:
              </span>
              <button
                onClick={() => setTierFilter("all")}
                className={filterBtnClass(tierFilter === "all")}
              >
                All
                <span className="ml-1.5 opacity-60">{signups.length}</span>
              </button>
              {TIER_OPTIONS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={filterBtnClass(tierFilter === tier)}
                >
                  {TIER_LABELS[tier]}
                  <span className="ml-1.5 opacity-60">{tierCounts[tier]}</span>
                </button>
              ))}
            </div>

            {/* Status filter pills */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/40 self-center mr-1">
                Status:
              </span>
              <button
                onClick={() => setStatusFilter("all")}
                className={filterBtnClass(statusFilter === "all")}
              >
                All
                <span className="ml-1.5 opacity-60">{signups.length}</span>
              </button>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={filterBtnClass(statusFilter === status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-1.5 opacity-60">
                    {statusCounts[status]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-[#1a1a1a]/40 mb-3">
            Showing {filtered.length} of {signups.length}
          </p>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#e8e4dd] rounded-lg">
              <p className="text-sm text-[#1a1a1a]/40">
                No signups match your filters.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
              {filtered.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 ${
                    i !== filtered.length - 1
                      ? "border-b border-[#e8e4dd]"
                      : ""
                  } hover:bg-[#f8f6f1]/50 transition-colors group`}
                >
                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-[#1a1a1a]/55 mt-0.5">
                      <a
                        href={`mailto:${s.email}`}
                        className="hover:text-[#5b9a2f] transition-colors"
                      >
                        {s.email}
                      </a>
                      {" · "}
                      {relativeTime(s.created_at)}
                    </p>
                  </div>

                  {/* Tier badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${TIER_BADGE[s.tier]}`}
                  >
                    {TIER_LABELS[s.tier]}
                  </span>

                  {/* Status selector */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${STATUS_BADGE[s.status]}`}
                    >
                      {s.status}
                    </span>
                    <select
                      value={s.status}
                      onChange={(e) =>
                        handleStatusChange(
                          s.id,
                          e.target.value as WaitlistStatus,
                        )
                      }
                      disabled={updating === s.id}
                      className="px-2 py-1 text-xs border border-[#e8e4dd] rounded bg-white focus:outline-none focus:border-[#5b9a2f] disabled:opacity-50"
                      aria-label={`Change status for ${s.email}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-[#1a1a1a]/35 hidden lg:block whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(s.id, s.email)}
                    disabled={updating === s.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#1a1a1a]/25 hover:text-red-500 transition-all disabled:opacity-50 self-start md:self-auto"
                    title="Remove signup"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
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
