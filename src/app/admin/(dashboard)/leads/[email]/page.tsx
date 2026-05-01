"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface LeadDetail {
  email: string;
  stage: "cold" | "engaged" | "booked";
  audits: Array<{
    token: string;
    hotel_name: string;
    hotel_url: string;
    overall_score: number;
    overall_grade: string;
    created_at: string;
    audit_view_id: number;
    first_viewed_at: string;
    last_viewed_at: string;
    view_count: number;
  }>;
  events: Array<{
    id: number;
    event_type: string;
    metadata: Record<string, unknown> | null;
    occurred_at: string;
    hotel_name: string;
    audit_token: string;
  }>;
  bookings: Array<{
    id: number;
    hotel_name: string;
    booking_date: string;
    booking_time: string;
    focus_dimension: string | null;
    audit_id: number | null;
    status: string;
    created_at: string;
  }>;
  notes: Array<{
    id: number;
    note: string;
    author_admin_id: string;
    created_at: string;
  }>;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  audit_created: { label: "Audit created", color: "#9ca3af" },
  email_submitted: { label: "Unlocked audit", color: "#3b82f6" },
  report_viewed: { label: "Re-viewed report", color: "#3b82f6" },
  cta_clicked: { label: "Clicked CTA", color: "#f5a623" },
  booked_call: { label: "Booked call", color: "#5b9a2f" },
  nurture_sent: { label: "Nurture sent", color: "#8b5cf6" },
};

const STAGE_COLORS: Record<string, string> = {
  cold: "#9ca3af",
  engaged: "#f5a623",
  booked: "#5b9a2f",
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

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminLeadDetailPage() {
  const params = useParams();
  const emailParam = (params?.email as string) || "";
  const email = decodeURIComponent(emailParam);

  const [data, setData] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/leads/${encodeURIComponent(email)}`);
    if (!res.ok) {
      setError(res.status === 404 ? "Lead not found." : "Failed to load.");
      setLoading(false);
      return;
    }
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [email]);

  useEffect(() => {
    if (email) fetchData();
  }, [email, fetchData]);

  async function addNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: newNote }),
    });
    setSaving(false);
    if (res.ok) {
      setNewNote("");
      fetchData();
    }
  }

  async function deleteNote(id: number) {
    await fetch(`/api/admin/leads/${encodeURIComponent(email)}?note_id=${id}`, {
      method: "DELETE",
    });
    fetchData();
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

  if (error || !data) {
    return (
      <div className="max-w-2xl">
        <Link href="/admin/leads" className="text-sm text-[#5b9a2f] hover:text-[#4e8528]">
          ← Back to leads
        </Link>
        <p className="mt-6 text-sm text-[#1a1a1a]/60">{error || "Failed to load lead."}</p>
      </div>
    );
  }

  const stageColor = STAGE_COLORS[data.stage];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/leads" className="text-sm text-[#5b9a2f] hover:text-[#4e8528]">
          ← Back to leads
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">{data.email}</h1>
          <span
            className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded"
            style={{ backgroundColor: `${stageColor}1A`, color: stageColor }}
          >
            {data.stage}
          </span>
        </div>
        <p className="text-sm text-[#1a1a1a]/50">
          {data.audits.length} audit{data.audits.length === 1 ? "" : "s"} · {data.events.length} event{data.events.length === 1 ? "" : "s"} · {data.bookings.length} booking{data.bookings.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Audits viewed */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Audits viewed</h2>
        <div className="space-y-2">
          {data.audits.map((a) => (
            <div key={a.token} className="flex items-center justify-between gap-3 px-4 py-3 border border-[#e8e4dd] rounded-lg">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/audits/${a.token}`}
                  className="text-sm font-medium text-[#1a1a1a] hover:text-[#5b9a2f]"
                >
                  {a.hotel_name}
                </Link>
                <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                  Score {a.overall_score}/100, Grade {a.overall_grade} · viewed {a.view_count} time{a.view_count === 1 ? "" : "s"} · last view {fmtDateTime(a.last_viewed_at)}
                </p>
              </div>
              <Link
                href={`/audit/${a.token}`}
                target="_blank"
                className="text-xs text-[#1a1a1a]/50 hover:text-[#5b9a2f]"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings */}
      {data.bookings.length > 0 && (
        <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Bookings</h2>
          <div className="space-y-2">
            {data.bookings.map((b) => (
              <div key={b.id} className="px-4 py-3 border border-[#e8e4dd] rounded-lg">
                <p className="text-sm text-[#1a1a1a]">
                  {fmtDate(b.booking_date)} at {b.booking_time} ET — {b.hotel_name}
                </p>
                {b.focus_dimension && (
                  <p className="text-xs text-[#1a1a1a]/50 mt-1">
                    Focus: <strong>{b.focus_dimension.replace(/_/g, " ")}</strong>
                    {b.audit_id && " · linked to audit"}
                  </p>
                )}
                <p className="text-xs text-[#1a1a1a]/40 mt-0.5">Status: {b.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Activity</h2>
        {data.events.length === 0 ? (
          <p className="text-sm text-[#1a1a1a]/40">No events yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.events.map((e) => {
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
                      <Link
                        href={`/admin/audits/${e.audit_token}`}
                        className="text-[#1a1a1a]/50 ml-2 text-xs hover:text-[#5b9a2f]"
                      >
                        {e.hotel_name}
                      </Link>
                    </p>
                    <p className="text-xs text-[#1a1a1a]/40 mt-0.5">{fmtDateTime(e.occurred_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">Notes</h2>
        <div className="mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this lead..."
            rows={3}
            className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f] resize-none"
          />
          <button
            onClick={addNote}
            disabled={saving || !newNote.trim()}
            className="mt-2 px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Add Note"}
          </button>
        </div>

        {data.notes.length === 0 ? (
          <p className="text-sm text-[#1a1a1a]/40">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.notes.map((n) => (
              <li key={n.id} className="border-l-2 border-[#5b9a2f]/30 pl-4 py-1">
                <p className="text-sm text-[#1a1a1a] whitespace-pre-wrap">{n.note}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-xs text-[#1a1a1a]/40">
                    {n.author_admin_id} · {fmtDateTime(n.created_at)}
                  </p>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
