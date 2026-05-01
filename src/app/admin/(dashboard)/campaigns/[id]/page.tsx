"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Target {
  id: number;
  hotel_url: string;
  hotel_name: string | null;
  contact_email: string;
  draft_subject: string | null;
  scheduled_send_at: string | null;
  approved_at: string | null;
  sent_at: string | null;
  bounced_at: string | null;
  replied_at: string | null;
  unsubscribed_at: string | null;
  status: string;
  failure_reason: string | null;
  audit_id: number | null;
}

interface CampaignDetail {
  campaign: {
    id: number;
    name: string;
    batch_id: string | null;
    status: string;
    send_schedule: { daily_window: { start: string; end: string; timezone: string }; daily_cap: number; send_days: string[]; start_date: string };
    total_targets: number;
    scheduled_count: number;
    sent_count: number;
    paused_at: string | null;
    paused_reason: string | null;
    created_at: string;
  };
  targets: Target[];
  health: {
    sent_24h: number;
    bounced_24h: number;
    complained_24h: number;
    bounce_rate: number;
    complaint_rate: number;
    exceeds_bounce_threshold: boolean;
    exceeds_complaint_threshold: boolean;
  };
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6",
  approved: "#5b9a2f",
  sent: "#5b9a2f",
  bounced: "#c0674a",
  complained: "#c0674a",
  replied: "#5b9a2f",
  unsubscribed: "#9ca3af",
  cancelled: "#9ca3af",
  quality_rejected: "#c0674a",
  imported: "#9ca3af",
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminCampaignDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/campaigns/${id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);

  async function action(path: string) {
    setBusy(true);
    await fetch(path, { method: "POST" });
    setBusy(false);
    fetchDetail();
  }

  async function skipTarget(targetId: number) {
    setBusy(true);
    await fetch(`/api/admin/targets/${targetId}/skip`, { method: "POST" });
    setBusy(false);
    fetchDetail();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <svg className="animate-spin h-6 w-6 text-[#5b9a2f]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Link href="/admin/campaigns" className="text-sm text-[#5b9a2f] hover:underline">← Back</Link>
        <p className="mt-6 text-sm text-[#1a1a1a]/60">Campaign not found.</p>
      </div>
    );
  }

  const { campaign, targets, health } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/campaigns" className="text-sm text-[#5b9a2f] hover:underline">← Back to campaigns</Link>
      </div>

      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">{campaign.name}</h1>
            <p className="text-xs text-[#1a1a1a]/40 mt-1 font-mono">{campaign.batch_id}</p>
            <p className="text-sm text-[#1a1a1a]/60 mt-2">
              Status: <strong>{campaign.status}</strong> · {campaign.send_schedule.daily_cap}/day · {campaign.send_schedule.send_days.join(", ")} · {campaign.send_schedule.daily_window.start}–{campaign.send_schedule.daily_window.end} {campaign.send_schedule.daily_window.timezone}
            </p>
            {campaign.paused_reason && (
              <p className="text-xs text-[#c0674a] mt-2">Paused: {campaign.paused_reason}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {campaign.status === "paused" ? (
              <button
                onClick={() => action(`/api/admin/campaigns/${id}/resume`)}
                disabled={busy}
                className="px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528] disabled:opacity-50"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={() => action(`/api/admin/campaigns/${id}/pause`)}
                disabled={busy || campaign.status === "cancelled" || campaign.status === "complete"}
                className="px-3 py-1.5 border border-[#e8e4dd] text-xs font-medium rounded-lg hover:bg-[#f8f6f1] disabled:opacity-50"
              >
                Pause
              </button>
            )}
            <button
              onClick={() => {
                if (confirm("Cancel all unsent targets? This cannot be undone.")) {
                  action(`/api/admin/campaigns/${id}/cancel`);
                }
              }}
              disabled={busy || campaign.status === "cancelled"}
              className="px-3 py-1.5 border border-[#c0674a] text-[#c0674a] text-xs font-medium rounded-lg hover:bg-[#c0674a]/10 disabled:opacity-50"
            >
              Cancel campaign
            </button>
          </div>
        </div>
      </div>

      {/* Health */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Health (last 24h)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-[#e8e4dd] rounded-lg p-4 bg-[#f8f6f1]/40">
            <p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/40 font-semibold">Sent</p>
            <p className="font-display text-2xl font-semibold text-[#1a1a1a] mt-1">{health.sent_24h}</p>
          </div>
          <div className="border border-[#e8e4dd] rounded-lg p-4 bg-[#f8f6f1]/40">
            <p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/40 font-semibold">Bounced</p>
            <p className="font-display text-2xl font-semibold mt-1" style={{ color: health.exceeds_bounce_threshold ? "#c0674a" : "#1a1a1a" }}>
              {health.bounced_24h}
            </p>
            <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
              {(health.bounce_rate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="border border-[#e8e4dd] rounded-lg p-4 bg-[#f8f6f1]/40">
            <p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/40 font-semibold">Complained</p>
            <p className="font-display text-2xl font-semibold mt-1" style={{ color: health.exceeds_complaint_threshold ? "#c0674a" : "#1a1a1a" }}>
              {health.complained_24h}
            </p>
            <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
              {(health.complaint_rate * 100).toFixed(2)}%
            </p>
          </div>
          <div className="border border-[#e8e4dd] rounded-lg p-4 bg-[#f8f6f1]/40">
            <p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/40 font-semibold">Progress</p>
            <p className="font-display text-2xl font-semibold text-[#1a1a1a] mt-1">
              {campaign.sent_count}<span className="text-base text-[#1a1a1a]/40">/{campaign.scheduled_count}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Targets table */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e4dd]">
          <h2 className="font-display text-base font-semibold text-[#1a1a1a]">Targets ({targets.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-[10px] uppercase tracking-wider text-[#1a1a1a]/50">
              <tr>
                <th className="px-4 py-3 text-left">Hotel / Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Scheduled</th>
                <th className="px-4 py-3 text-left">Sent</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => {
                const color = STATUS_COLORS[t.status] || "#9ca3af";
                const canSkip = t.sent_at === null && (t.status === "scheduled" || t.status === "approved");
                return (
                  <tr key={t.id} className="border-t border-[#e8e4dd] hover:bg-[#f8f6f1]/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1a1a1a] truncate max-w-xs">
                        {t.hotel_name || "(no hotel name)"}
                      </p>
                      <p className="text-xs text-[#1a1a1a]/50 mt-0.5">{t.contact_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded"
                        style={{ backgroundColor: `${color}1A`, color }}
                      >
                        {t.status}
                      </span>
                      {t.failure_reason && (
                        <p className="text-[10px] text-[#1a1a1a]/40 mt-1">{t.failure_reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#1a1a1a]/60 text-xs">{fmt(t.scheduled_send_at)}</td>
                    <td className="px-4 py-3 text-[#1a1a1a]/60 text-xs">{fmt(t.sent_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2 items-center">
                        {t.audit_id && (
                          <Link
                            href={`/admin/audits/${t.audit_id}`}
                            className="text-xs text-[#1a1a1a]/50 hover:text-[#5b9a2f]"
                          >
                            Audit
                          </Link>
                        )}
                        {canSkip && (
                          <>
                            <span className="text-[#1a1a1a]/20">·</span>
                            <button
                              onClick={() => skipTarget(t.id)}
                              disabled={busy}
                              className="text-xs text-[#c0674a] hover:underline disabled:opacity-50"
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
