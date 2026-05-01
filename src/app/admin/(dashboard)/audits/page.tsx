"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface AuditRow {
  id: number;
  token: string;
  hotel_url: string;
  hotel_name: string;
  hotel_location: string | null;
  overall_score: number;
  overall_grade: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  unique_emails: number;
  cta_clicks: number;
  bookings: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function gradeColor(grade: string): { bg: string; text: string } {
  if (grade === "A") return { bg: "bg-[#2D8A6E]/10", text: "text-[#2D8A6E]" };
  if (grade === "B" || grade === "C") return { bg: "bg-[#f5a623]/15", text: "text-[#d4891a]" };
  return { bg: "bg-[#c0674a]/10", text: "text-[#c0674a]" };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"created_at" | "hotel_name" | "overall_score">("created_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      sort,
      dir: direction,
    });
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/audits?${params}`);
    const data = await res.json();
    setAudits(data.audits || []);
    setPagination(data.pagination || null);
    setLoading(false);
  }, [page, sort, direction, search]);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  function toggleSort(col: typeof sort) {
    if (sort === col) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(col);
      setDirection(col === "hotel_name" ? "asc" : "desc");
    }
    setPage(1);
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/audit/${token}`;
    navigator.clipboard.writeText(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">Audits</h1>
          <p className="text-sm text-[#1a1a1a]/50 mt-1">
            {pagination ? `${pagination.total} audits total` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by hotel name, URL, or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-[10px] uppercase tracking-wider text-[#1a1a1a]/50">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:text-[#1a1a1a] select-none"
                  onClick={() => toggleSort("hotel_name")}
                >
                  Hotel {sort === "hotel_name" ? (direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:text-[#1a1a1a] select-none"
                  onClick={() => toggleSort("overall_score")}
                >
                  Score {sort === "overall_score" ? (direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3 text-center">Emails</th>
                <th className="px-4 py-3 text-center">CTAs</th>
                <th className="px-4 py-3 text-center">Booked</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:text-[#1a1a1a] select-none"
                  onClick={() => toggleSort("created_at")}
                >
                  Created {sort === "created_at" ? (direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <svg className="animate-spin h-5 w-5 mx-auto text-[#5b9a2f]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#1a1a1a]/40">
                    No audits found.
                  </td>
                </tr>
              ) : (
                audits.map((a) => {
                  const grade = gradeColor(a.overall_grade);
                  return (
                    <tr key={a.id} className="border-t border-[#e8e4dd] hover:bg-[#f8f6f1]/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/audits/${a.token}`}
                          className="font-medium text-[#1a1a1a] hover:text-[#5b9a2f]"
                        >
                          {a.hotel_name}
                        </Link>
                        <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                          {a.hotel_location || a.hotel_url}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-display font-semibold text-[#1a1a1a]">{a.overall_score}</span>
                        <span className={`ml-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${grade.bg} ${grade.text}`}>
                          {a.overall_grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[#1a1a1a]">{a.unique_emails}</td>
                      <td className="px-4 py-3 text-center text-[#1a1a1a]">{a.cta_clicks}</td>
                      <td className="px-4 py-3 text-center">
                        {a.bookings > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#5b9a2f]/10 text-[#5b9a2f] text-xs font-semibold rounded-full">
                            {a.bookings}
                          </span>
                        ) : (
                          <span className="text-[#1a1a1a]/30">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]/60 text-xs">{timeAgo(a.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => copyLink(a.token)}
                            className="text-xs text-[#1a1a1a]/50 hover:text-[#5b9a2f]"
                            title="Copy public link"
                          >
                            Copy link
                          </button>
                          <Link
                            href={`/audit/${a.token}`}
                            target="_blank"
                            className="text-xs text-[#1a1a1a]/50 hover:text-[#5b9a2f]"
                          >
                            Open
                          </Link>
                          <Link
                            href={`/admin/audits/${a.token}`}
                            className="text-xs text-[#5b9a2f] hover:text-[#4e8528] font-medium"
                          >
                            Detail →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-[#1a1a1a]/50">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-[#e8e4dd] rounded-lg text-sm hover:bg-[#f8f6f1] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 border border-[#e8e4dd] rounded-lg text-sm hover:bg-[#f8f6f1] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
