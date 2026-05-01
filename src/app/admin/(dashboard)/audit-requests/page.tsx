"use client";

import { useEffect, useState, useCallback } from "react";

interface AuditRequest {
  id: number;
  hotel_url: string;
  email: string;
  role: string | null;
  status: string;
  audit_id: number | null;
  created_at: string;
  fulfilled_at: string | null;
}

const STATUSES = [
  { value: "all", label: "All", color: "#1a1a1a" },
  { value: "pending", label: "Pending", color: "#f5a623" },
  { value: "fulfilled", label: "Fulfilled", color: "#5b9a2f" },
  { value: "skipped", label: "Skipped", color: "#9ca3af" },
] as const;

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  gm: "GM",
  operator: "Operator",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f5a623",
  fulfilled: "#5b9a2f",
  skipped: "#9ca3af",
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

export default function AdminAuditRequestsPage() {
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: filter });
    const res = await fetch(`/api/admin/audit-requests?${params}`);
    const data = await res.json();
    setRequests(data.requests || []);
    const next: Record<string, number> = {};
    let total = 0;
    for (const row of data.counts || []) {
      next[row.status] = row.count;
      total += row.count;
    }
    next.all = total;
    setCounts(next);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function setStatus(id: number, status: "fulfilled" | "skipped" | "pending") {
    setBusyId(id);
    await fetch(`/api/admin/audit-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    fetchRequests();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">Audit Requests</h1>
          <p className="text-sm text-[#1a1a1a]/50 mt-1">
            Inbound requests from the public /audit/request form.
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === s.value
                ? "text-white"
                : "bg-white border border-[#e8e4dd] text-[#1a1a1a]/60 hover:border-[#1a1a1a]/20"
            }`}
            style={filter === s.value ? { backgroundColor: s.color } : undefined}
          >
            {s.label}
            <span className="ml-1.5 opacity-70">{counts[s.value] || 0}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-[10px] uppercase tracking-wider text-[#1a1a1a]/50">
              <tr>
                <th className="px-4 py-3 text-left">Hotel URL</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <svg className="animate-spin h-5 w-5 mx-auto text-[#5b9a2f]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#1a1a1a]/40">
                    No requests in this view.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const color = STATUS_COLORS[r.status] || "#9ca3af";
                  const isPending = r.status === "pending";
                  return (
                    <tr key={r.id} className="border-t border-[#e8e4dd] hover:bg-[#f8f6f1]/40">
                      <td className="px-4 py-3">
                        <a
                          href={r.hotel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1a1a1a] hover:text-[#5b9a2f] underline-offset-2 hover:underline truncate max-w-xs inline-block"
                        >
                          {r.hotel_url}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]">{r.email}</td>
                      <td className="px-4 py-3 text-[#1a1a1a]/70 text-xs">
                        {r.role ? ROLE_LABELS[r.role] || r.role : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]/60 text-xs" title={fmtDateTime(r.created_at)}>
                        {timeAgo(r.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2 items-center">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => setStatus(r.id, "fulfilled")}
                                disabled={busyId === r.id}
                                className="text-xs text-[#5b9a2f] hover:text-[#4e8528] font-medium disabled:opacity-50"
                              >
                                Mark Fulfilled
                              </button>
                              <span className="text-[#1a1a1a]/20">·</span>
                              <button
                                onClick={() => setStatus(r.id, "skipped")}
                                disabled={busyId === r.id}
                                className="text-xs text-[#1a1a1a]/50 hover:text-red-600 disabled:opacity-50"
                              >
                                Skip
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setStatus(r.id, "pending")}
                              disabled={busyId === r.id}
                              className="text-xs text-[#1a1a1a]/50 hover:text-[#5b9a2f] disabled:opacity-50"
                            >
                              Reopen
                            </button>
                          )}
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
    </div>
  );
}
