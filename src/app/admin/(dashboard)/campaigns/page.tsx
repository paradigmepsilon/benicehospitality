"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Campaign {
  id: number;
  name: string;
  batch_id: string | null;
  status: string;
  total_targets: number;
  scheduled_count: number;
  sent_count: number;
  sent_count_real: number;
  bounced_count: number;
  replied_count: number;
  paused_at: string | null;
  paused_reason: string | null;
  created_at: string;
}

const STATUSES = [
  { value: "all", label: "All", color: "#1a1a1a" },
  { value: "scheduled", label: "Scheduled", color: "#3b82f6" },
  { value: "sending", label: "Sending", color: "#5b9a2f" },
  { value: "paused", label: "Paused", color: "#f5a623" },
  { value: "complete", label: "Complete", color: "#9ca3af" },
  { value: "cancelled", label: "Cancelled", color: "#9ca3af" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6",
  sending: "#5b9a2f",
  paused: "#f5a623",
  complete: "#9ca3af",
  cancelled: "#9ca3af",
  created: "#9ca3af",
};

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

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: filter });
    const res = await fetch(`/api/admin/campaigns?${params}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">Campaigns</h1>
          <p className="text-sm text-[#1a1a1a]/50 mt-1">
            Bulk outreach campaigns. Click into a campaign to see targets and health.
          </p>
        </div>
        <Link
          href="/admin/campaigns/import"
          className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528] transition-colors"
        >
          + Import Batch
        </Link>
      </div>

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
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-[10px] uppercase tracking-wider text-[#1a1a1a]/50">
              <tr>
                <th className="px-4 py-3 text-left">Campaign</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Targets</th>
                <th className="px-4 py-3 text-center">Sent</th>
                <th className="px-4 py-3 text-center">Bounced</th>
                <th className="px-4 py-3 text-center">Replied</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <svg className="animate-spin h-5 w-5 mx-auto text-[#5b9a2f]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#1a1a1a]/40">
                    No campaigns yet. <Link href="/admin/campaigns/import" className="text-[#5b9a2f] hover:underline">Import your first batch</Link>.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const color = STATUS_COLORS[c.status] || "#9ca3af";
                  return (
                    <tr key={c.id} className="border-t border-[#e8e4dd] hover:bg-[#f8f6f1]/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/campaigns/${c.id}`}
                          className="font-medium text-[#1a1a1a] hover:text-[#5b9a2f]"
                        >
                          {c.name}
                        </Link>
                        {c.batch_id && (
                          <p className="text-xs text-[#1a1a1a]/40 mt-0.5 font-mono">
                            {c.batch_id}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          {c.status}
                        </span>
                        {c.paused_reason && (
                          <p className="text-[10px] text-[#1a1a1a]/40 mt-1">{c.paused_reason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-[#1a1a1a]">
                        {c.scheduled_count} / {c.total_targets}
                      </td>
                      <td className="px-4 py-3 text-center text-[#1a1a1a]">{c.sent_count_real}</td>
                      <td className="px-4 py-3 text-center text-[#1a1a1a]/60">{c.bounced_count}</td>
                      <td className="px-4 py-3 text-center">
                        {c.replied_count > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#5b9a2f]/10 text-[#5b9a2f] text-xs font-semibold rounded-full">
                            {c.replied_count}
                          </span>
                        ) : (
                          <span className="text-[#1a1a1a]/30">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]/60 text-xs">{timeAgo(c.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/campaigns/${c.id}`}
                          className="text-xs text-[#5b9a2f] hover:text-[#4e8528] font-medium"
                        >
                          Detail →
                        </Link>
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
