"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Lead {
  email: string;
  audits_viewed: number;
  last_viewed_at: string;
  last_activity_at: string;
  cta_clicks: number;
  bookings: number;
  first_audit_hotel: string | null;
  stage: "cold" | "engaged" | "booked";
}

const STAGES = [
  { value: "all", label: "All", color: "#1a1a1a" },
  { value: "cold", label: "Cold", color: "#9ca3af" },
  { value: "engaged", label: "Engaged", color: "#f5a623" },
  { value: "booked", label: "Booked", color: "#5b9a2f" },
] as const;

const STAGE_COLORS: Record<string, string> = {
  cold: "#9ca3af",
  engaged: "#f5a623",
  booked: "#5b9a2f",
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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<{ all: number; cold: number; engaged: number; booked: number }>({
    all: 0,
    cold: 0,
    engaged: 0,
    booked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ stage });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads || []);
    setCounts(data.counts || { all: 0, cold: 0, engaged: 0, booked: 0 });
    setLoading(false);
  }, [stage, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">Leads</h1>
          <p className="text-sm text-[#1a1a1a]/50 mt-1">
            {counts.all} unique emails across all audits
          </p>
        </div>
      </div>

      {/* Stage filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STAGES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStage(s.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              stage === s.value
                ? "text-white"
                : "bg-white border border-[#e8e4dd] text-[#1a1a1a]/60 hover:border-[#1a1a1a]/20"
            }`}
            style={stage === s.value ? { backgroundColor: s.color } : undefined}
          >
            {s.label}
            <span className="ml-1.5 opacity-70">{counts[s.value as keyof typeof counts] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Stage</th>
                <th className="px-4 py-3 text-left">First audit</th>
                <th className="px-4 py-3 text-center">Audits viewed</th>
                <th className="px-4 py-3 text-center">CTAs</th>
                <th className="px-4 py-3 text-center">Booked</th>
                <th className="px-4 py-3 text-left">Last activity</th>
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
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#1a1a1a]/40">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const color = STAGE_COLORS[lead.stage];
                  return (
                    <tr key={lead.email} className="border-t border-[#e8e4dd] hover:bg-[#f8f6f1]/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/leads/${encodeURIComponent(lead.email)}`}
                          className="font-medium text-[#1a1a1a] hover:text-[#5b9a2f]"
                        >
                          {lead.email}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]/70 text-xs">
                        {lead.first_audit_hotel || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-[#1a1a1a]">{lead.audits_viewed}</td>
                      <td className="px-4 py-3 text-center text-[#1a1a1a]">{lead.cta_clicks}</td>
                      <td className="px-4 py-3 text-center">
                        {lead.bookings > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#5b9a2f]/10 text-[#5b9a2f] text-xs font-semibold rounded-full">
                            {lead.bookings}
                          </span>
                        ) : (
                          <span className="text-[#1a1a1a]/30">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]/60 text-xs">
                        {timeAgo(lead.last_activity_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/leads/${encodeURIComponent(lead.email)}`}
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
