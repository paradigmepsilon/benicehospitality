"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface AuditDetail {
  audit: {
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
    audit_data: Record<string, unknown>;
  };
  views: Array<{
    id: number;
    email: string;
    first_viewed_at: string;
    last_viewed_at: string;
    view_count: number;
    ip_address: string | null;
    user_agent: string | null;
  }>;
  events: Array<{
    id: number;
    audit_view_id: number | null;
    event_type: string;
    metadata: Record<string, unknown> | null;
    occurred_at: string;
  }>;
  nurture: Array<{
    id: number;
    audit_view_id: number;
    email: string;
    sequence_step: string;
    scheduled_for: string;
    sent_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    resend_message_id: string | null;
  }>;
  funnel: {
    unique_emails: number;
    created_count: number;
    email_submissions: number;
    report_views: number;
    cta_clicks: number;
    bookings: number;
  };
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  audit_created: { label: "Audit created", color: "#9ca3af" },
  email_submitted: { label: "Email submitted", color: "#3b82f6" },
  report_viewed: { label: "Report re-viewed", color: "#3b82f6" },
  cta_clicked: { label: "CTA clicked", color: "#f5a623" },
  booked_call: { label: "Call booked", color: "#5b9a2f" },
  nurture_sent: { label: "Nurture sent", color: "#8b5cf6" },
  nurture_opened: { label: "Nurture opened", color: "#8b5cf6" },
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

export default function AdminAuditDetailPage() {
  const params = useParams();
  const token = (params?.token as string) || "";
  const [data, setData] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/admin/audits/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setError(res.status === 404 ? "Audit not found." : "Failed to load.");
          return null;
        }
        return res.json();
      })
      .then((d) => {
        if (d) setData(d as AuditDetail);
      })
      .finally(() => setLoading(false));
  }, [token]);

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

  if (error || !data) {
    return (
      <div className="max-w-2xl">
        <Link href="/admin/audits" className="text-sm text-[#5b9a2f] hover:text-[#4e8528]">
          ← Back to audits
        </Link>
        <p className="mt-6 text-sm text-[#1a1a1a]/60">{error || "Failed to load audit."}</p>
      </div>
    );
  }

  const { audit, views, events, nurture, funnel } = data;

  // Funnel steps with derived percentages from email_submissions baseline
  const baseline = funnel.email_submissions || 1;
  const steps = [
    { label: "Created", value: 1, color: "#9ca3af" },
    { label: "Email submissions", value: funnel.email_submissions, color: "#3b82f6" },
    { label: "Re-views", value: funnel.report_views, color: "#3b82f6" },
    { label: "CTA clicks", value: funnel.cta_clicks, color: "#f5a623" },
    { label: "Bookings", value: funnel.bookings, color: "#5b9a2f" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/audits" className="text-sm text-[#5b9a2f] hover:text-[#4e8528]">
          ← Back to audits
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">{audit.hotel_name}</h1>
            <p className="text-sm text-[#1a1a1a]/50 mt-1">
              {audit.hotel_location && `${audit.hotel_location} · `}
              <a href={audit.hotel_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#5b9a2f] underline">
                {audit.hotel_url}
              </a>
            </p>
            <p className="text-xs text-[#1a1a1a]/40 mt-2">
              Created {fmtDateTime(audit.created_at)}
              {audit.expires_at && ` · expires ${new Date(audit.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-display text-3xl font-semibold text-[#1a1a1a]">
                {audit.overall_score}
                <span className="text-base font-medium text-[#1a1a1a]/40">/100</span>
              </p>
              <p className="text-sm text-[#1a1a1a]/60 mt-0.5">Grade {audit.overall_grade}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/audit/${audit.token}`}
                target="_blank"
                className="px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528]"
              >
                Open public page
              </Link>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/audit/${audit.token}`)}
                className="px-3 py-1.5 border border-[#e8e4dd] text-xs font-medium rounded-lg hover:bg-[#f8f6f1]"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-5">Funnel</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {steps.map((step) => {
            const pct = step.label === "Email submissions" || step.value === 0 ? null : Math.round((step.value / baseline) * 100);
            return (
              <div key={step.label} className="rounded-lg border border-[#e8e4dd] p-4 bg-[#f8f6f1]/40">
                <p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/40 font-semibold">{step.label}</p>
                <p className="font-display text-2xl font-semibold mt-1" style={{ color: step.color }}>
                  {step.value}
                </p>
                {pct !== null && (
                  <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                    {pct}% of submitters
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[#1a1a1a]/40 mt-3">
          Unique emails who unlocked: <strong>{funnel.unique_emails}</strong>
        </p>
      </div>

      {/* Email submissions */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Email submissions</h2>
        {views.length === 0 ? (
          <p className="text-sm text-[#1a1a1a]/40">No one has unlocked this audit yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/40">
                <tr>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">First view</th>
                  <th className="px-3 py-2 text-left">Last view</th>
                  <th className="px-3 py-2 text-center">Views</th>
                </tr>
              </thead>
              <tbody>
                {views.map((v) => (
                  <tr key={v.id} className="border-t border-[#e8e4dd]">
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/leads/${encodeURIComponent(v.email)}`}
                        className="text-[#1a1a1a] hover:text-[#5b9a2f]"
                      >
                        {v.email}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[#1a1a1a]/60">{fmtDateTime(v.first_viewed_at)}</td>
                    <td className="px-3 py-2 text-[#1a1a1a]/60">{fmtDateTime(v.last_viewed_at)}</td>
                    <td className="px-3 py-2 text-center text-[#1a1a1a]">{v.view_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity timeline */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Activity</h2>
        {events.length === 0 ? (
          <p className="text-sm text-[#1a1a1a]/40">No events yet.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => {
              const meta = EVENT_LABELS[e.event_type] || { label: e.event_type, color: "#9ca3af" };
              return (
                <li key={e.id} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a]">
                      {meta.label}
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <span className="text-[#1a1a1a]/50 ml-2 text-xs">
                          {JSON.stringify(e.metadata)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#1a1a1a]/40 mt-0.5">{fmtDateTime(e.occurred_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Nurture queue */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Nurture queue</h2>
        {nurture.length === 0 ? (
          <p className="text-sm text-[#1a1a1a]/40">No nurture sequences scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/40">
                <tr>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Step</th>
                  <th className="px-3 py-2 text-left">Scheduled</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {nurture.map((n) => {
                  let status: { label: string; color: string };
                  if (n.sent_at) status = { label: `Sent ${fmtDateTime(n.sent_at)}`, color: "#5b9a2f" };
                  else if (n.cancelled_at) status = { label: `Cancelled (${n.cancellation_reason || "n/a"})`, color: "#9ca3af" };
                  else status = { label: "Pending", color: "#3b82f6" };

                  return (
                    <tr key={n.id} className="border-t border-[#e8e4dd]">
                      <td className="px-3 py-2 text-[#1a1a1a]">{n.email}</td>
                      <td className="px-3 py-2 text-[#1a1a1a]/60">{n.sequence_step.replace("_", " ")}</td>
                      <td className="px-3 py-2 text-[#1a1a1a]/60">{fmtDateTime(n.scheduled_for)}</td>
                      <td className="px-3 py-2 text-xs font-medium" style={{ color: status.color }}>
                        {status.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
