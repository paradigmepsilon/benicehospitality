"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface BatchTarget {
  id: number;
  hotel_name: string | null;
  contact_email: string;
  contact_name: string | null;
  draft_subject: string;
  draft_body: string;
  scheduled_send_at: string;
  approved_at: string | null;
  status: string;
  audit_id: number | null;
}

interface Batch {
  id: number;
  send_date: string;
  campaign_id: number;
  campaign_name: string;
  campaign_status: string;
  target_count: number;
  approved_at: string | null;
  expired_at: string | null;
  notification_sent_at: string | null;
  targets: BatchTarget[];
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function DailyApprovalTodayPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/daily-approval");
    const data = await res.json();
    setBatches(data.batches || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  async function approveBatch(batchId: number) {
    setBusy(batchId);
    await fetch(`/api/admin/daily-approval/${batchId}/approve`, { method: "POST" });
    setBusy(null);
    fetchBatches();
  }

  async function skipAll(batchId: number) {
    if (!confirm("Skip every target in this batch? This cannot be undone.")) return;
    setBusy(batchId);
    await fetch(`/api/admin/daily-approval/${batchId}/skip-all`, { method: "POST" });
    setBusy(null);
    fetchBatches();
  }

  async function skipTarget(targetId: number) {
    setBusy(targetId);
    await fetch(`/api/admin/targets/${targetId}/skip`, { method: "POST" });
    setBusy(null);
    fetchBatches();
  }

  function startEdit(t: BatchTarget) {
    setEditingId(t.id);
    setEditSubject(t.draft_subject);
    setEditBody(t.draft_body);
  }

  async function saveEditAndApprove(targetId: number) {
    setBusy(targetId);
    await fetch(`/api/admin/targets/${targetId}/edit-then-approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_subject: editSubject, draft_body: editBody }),
    });
    setBusy(null);
    setEditingId(null);
    fetchBatches();
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

  if (batches.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">Daily Approval</h1>
        <p className="text-sm text-[#1a1a1a]/50 mt-1 mb-8">
          Today: {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div className="bg-white border border-[#e8e4dd] rounded-lg p-12 text-center">
          <svg className="w-12 h-12 text-[#1a1a1a]/15 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-[#1a1a1a]/60 mb-2">No pending approval batches today.</p>
          <p className="text-xs text-[#1a1a1a]/40">
            Batches are created each morning by the prepare-daily-batches cron. Visit{" "}
            <Link href="/admin/campaigns" className="text-[#5b9a2f] hover:underline">campaigns</Link>
            {" "}to see scheduled sends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">Daily Approval</h1>
        <p className="text-sm text-[#1a1a1a]/50 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{" "}
          · Nothing sends until you approve.
        </p>
      </div>

      {batches.map((b) => {
        const isApproved = !!b.approved_at;
        const isExpired = !!b.expired_at;
        return (
          <div key={b.id} className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8e4dd] flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#1a1a1a]">{b.campaign_name}</h2>
                <p className="text-sm text-[#1a1a1a]/50 mt-0.5">
                  {b.target_count} sends pending · campaign status: <strong>{b.campaign_status}</strong>
                </p>
              </div>
              <div className="flex gap-2">
                {isApproved ? (
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-[#5b9a2f]/10 text-[#5b9a2f] rounded">
                    Approved {new Date(b.approved_at!).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-[#9ca3af]/10 text-[#9ca3af] rounded">
                    Expired
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => approveBatch(b.id)}
                      disabled={busy === b.id}
                      className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-semibold rounded-lg hover:bg-[#4e8528] disabled:opacity-50"
                    >
                      Approve all ({b.target_count})
                    </button>
                    <button
                      onClick={() => skipAll(b.id)}
                      disabled={busy === b.id}
                      className="px-4 py-2 border border-[#c0674a] text-[#c0674a] text-sm font-medium rounded-lg hover:bg-[#c0674a]/10 disabled:opacity-50"
                    >
                      Skip all
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="divide-y divide-[#e8e4dd]">
              {b.targets.map((t) => {
                const isEditing = editingId === t.id;
                const targetApproved = !!t.approved_at;
                return (
                  <div key={t.id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1a1a1a]/40 uppercase tracking-wider">
                          Sending {fmtTime(t.scheduled_send_at)}
                        </p>
                        <p className="font-medium text-[#1a1a1a] mt-1">
                          {t.hotel_name || "(no hotel name)"}
                        </p>
                        <p className="text-sm text-[#1a1a1a]/60">{t.contact_email}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {targetApproved ? (
                          <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold bg-[#5b9a2f]/10 text-[#5b9a2f] rounded uppercase">
                            Approved
                          </span>
                        ) : (
                          <>
                            {!isEditing && t.audit_id && (
                              <Link
                                href={`/admin/audits/${t.audit_id}`}
                                className="text-xs text-[#1a1a1a]/50 hover:text-[#5b9a2f]"
                              >
                                View audit
                              </Link>
                            )}
                            {!isEditing && (
                              <button
                                onClick={() => startEdit(t)}
                                disabled={busy === t.id}
                                className="text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] underline-offset-2 hover:underline disabled:opacity-50"
                              >
                                Edit
                              </button>
                            )}
                            {!isEditing && (
                              <button
                                onClick={() => skipTarget(t.id)}
                                disabled={busy === t.id}
                                className="text-xs text-[#c0674a] hover:underline disabled:opacity-50"
                              >
                                Skip
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
                        />
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={10}
                          className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-xs font-mono focus:outline-none focus:border-[#5b9a2f]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditAndApprove(t.id)}
                            disabled={busy === t.id}
                            className="px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528] disabled:opacity-50"
                          >
                            Save & approve
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={busy === t.id}
                            className="px-3 py-1.5 border border-[#e8e4dd] text-xs rounded-lg hover:bg-[#f8f6f1]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f8f6f1] border border-[#e8e4dd] rounded-lg p-4">
                        <p className="text-xs font-semibold text-[#1a1a1a] mb-2">{t.draft_subject}</p>
                        <p className="text-xs text-[#1a1a1a]/70 whitespace-pre-wrap leading-relaxed">
                          {t.draft_body}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
