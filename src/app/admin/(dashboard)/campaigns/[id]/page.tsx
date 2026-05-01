"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Target {
  id: number;
  hotel_url: string;
  hotel_name: string | null;
  contact_email: string;
  contact_name: string | null;
  contact_role: string | null;
  draft_subject: string | null;
  draft_body: string | null;
  scheduled_send_at: string | null;
  approved_at: string | null;
  sent_at: string | null;
  bounced_at: string | null;
  replied_at: string | null;
  unsubscribed_at: string | null;
  status: string;
  failure_reason: string | null;
  audit_id: number | null;
  audit_token: string | null;
  audit_is_stub: boolean | null;
  audit_has_html: boolean | null;
  pipeline_contact_id: number | null;
  last_event_type: string | null;
  last_event_at: string | null;
  event_count: number;
}

interface PreviewData {
  subject: string;
  to: string;
  from: string;
  replyTo: string;
  audit_url: string | null;
  unsubscribe_url: string;
  html: string;
  text: string;
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
  const [expandedTargetId, setExpandedTargetId] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);
  const [regenTargetId, setRegenTargetId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionTargetId, setActionTargetId] = useState<number | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [auditEditTargetId, setAuditEditTargetId] = useState<number | null>(null);
  const [auditHtmlDraft, setAuditHtmlDraft] = useState("");
  const [savingAuditHtml, setSavingAuditHtml] = useState(false);
  const [auditHtmlError, setAuditHtmlError] = useState<string | null>(null);

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

  function toggleSelect(targetId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(targetId)) next.delete(targetId);
      else next.add(targetId);
      return next;
    });
  }

  function selectAllPending() {
    if (!data) return;
    // Only select rows that can actually be approved — i.e. have audit HTML.
    // Rows still missing HTML aren't approvable yet, so don't pretend they are.
    const pending = data.targets
      .filter((t) => !t.approved_at && !t.sent_at && t.status === "scheduled" && t.audit_has_html === true)
      .map((t) => t.id);
    setSelectedIds(new Set(pending));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function approveTarget(targetId: number, force = false) {
    setActionTargetId(targetId);
    setBulkResult(null);
    const url = `/api/admin/campaigns/${id}/targets/${targetId}/approve${force ? "?force=true" : ""}`;
    const res = await fetch(url, { method: "POST" });
    const j = await res.json().catch(() => ({}));
    setActionTargetId(null);
    if (!res.ok) {
      // If stub, offer one-click force approve via prompt-style banner.
      if (j.error === "stub_audit" && !force) {
        if (confirm(`${j.message || "Stub audit"}\n\nApprove anyway?`)) {
          return approveTarget(targetId, true);
        }
        return;
      }
      setBulkResult(`Approve failed: ${j.error || res.statusText}${j.reason ? ` (${j.reason})` : ""}`);
      return;
    }
    fetchDetail();
  }

  async function rejectTarget(targetId: number) {
    if (!confirm("Reject this draft and replace it with the next prospect from the list?")) return;
    setActionTargetId(targetId);
    setBulkResult(null);
    const res = await fetch(`/api/admin/campaigns/${id}/targets/${targetId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replenish: true }),
    });
    const j = await res.json().catch(() => ({}));
    setActionTargetId(null);
    if (!res.ok) {
      setBulkResult(`Reject failed: ${j.error || res.statusText}`);
      return;
    }
    if (j.replacement) {
      setBulkResult("Rejected — replaced with next prospect.");
    } else {
      setBulkResult(`Rejected. No replacement available (${j.reason_no_replacement || "pool empty"}).`);
    }
    fetchDetail();
  }

  async function bulkAction(action: "approve" | "reject") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0 && action !== "approve") return;
    if (action === "reject" && !confirm(`Reject ${ids.length} drafts and replace each with a new prospect?`)) return;

    setBulkBusy(true);
    setBulkResult(null);
    const res = await fetch(`/api/admin/campaigns/${id}/targets/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, target_ids: ids }),
    });
    const j = await res.json().catch(() => ({}));
    setBulkBusy(false);
    if (!res.ok) {
      setBulkResult(`Bulk ${action} failed: ${j.error || res.statusText}`);
      return;
    }
    if (action === "approve") {
      setBulkResult(`Approved ${j.approved}${j.errors?.length ? ` · ${j.errors.length} errors` : ""}`);
    } else {
      setBulkResult(`Rejected ${j.rejected} · replaced ${j.replaced}${j.errors?.length ? ` · ${j.errors.length} errors` : ""}`);
    }
    setSelectedIds(new Set());
    fetchDetail();
  }

  async function copyWebsites() {
    if (!data) return;
    // The Tier 0 audit pipeline runs against hotel websites, not emails.
    // Skip cancelled targets and empty hotel_url values; dedupe so multi-property
    // groups (e.g. Charming Inns) don't show the same URL three times.
    const websites = data.targets
      .filter((t) => t.status !== "cancelled" && t.hotel_url && t.hotel_url.trim() !== "")
      .map((t) => t.hotel_url.trim())
      .filter((u, i, arr) => arr.indexOf(u) === i);
    if (websites.length === 0) return;
    const text = websites.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  function openAuditHtmlEditor(t: Target) {
    if (auditEditTargetId === t.id) {
      setAuditEditTargetId(null);
      setAuditHtmlDraft("");
      setAuditHtmlError(null);
      return;
    }
    if (!t.audit_token) {
      setAuditHtmlError("This target has no linked audit yet.");
      return;
    }
    setAuditEditTargetId(t.id);
    setAuditHtmlError(null);
    // Lazy-load current custom_html so we don't bloat the campaign GET payload.
    fetch(`/api/admin/audits/${t.audit_token}`)
      .then((r) => r.json())
      .then((j) => setAuditHtmlDraft(j.audit?.custom_html || ""))
      .catch(() => setAuditHtmlDraft(""));
  }

  async function saveAuditHtml(t: Target) {
    if (!t.audit_token) return;
    setSavingAuditHtml(true);
    setAuditHtmlError(null);
    const res = await fetch(`/api/admin/audits/${t.audit_token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ custom_html: auditHtmlDraft || null }),
    });
    setSavingAuditHtml(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setAuditHtmlError(j.error || "Save failed");
      return;
    }
    setAuditEditTargetId(null);
    setAuditHtmlDraft("");
    fetchDetail();
  }

  async function showPreview(targetId: number) {
    setPreviewLoading(true);
    setPreview(null);
    const res = await fetch(`/api/admin/campaigns/${id}/targets/${targetId}/preview`);
    setPreviewLoading(false);
    if (!res.ok) {
      setBulkResult("Preview failed");
      return;
    }
    setPreview(await res.json());
    setPreviewMode("html");
  }

  function openEditor(t: Target) {
    if (expandedTargetId === t.id) {
      setExpandedTargetId(null);
      setEditError(null);
      setQualityWarning(null);
      return;
    }
    setExpandedTargetId(t.id);
    setEditSubject(t.draft_subject || "");
    setEditBody(t.draft_body || "");
    setEditError(null);
    setQualityWarning(t.failure_reason);
  }

  async function saveDraft(targetId: number) {
    setSavingTarget(true);
    setEditError(null);
    const res = await fetch(`/api/admin/campaigns/${id}/targets/${targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_subject: editSubject, draft_body: editBody }),
    });
    const json = await res.json();
    setSavingTarget(false);
    if (!res.ok) {
      setEditError(json.error || "Save failed");
      return;
    }
    setQualityWarning(json.quality?.valid ? null : json.quality?.reason ?? null);
    fetchDetail();
  }

  async function regenerateDraft(targetId: number) {
    setRegenTargetId(targetId);
    setEditError(null);
    const res = await fetch(`/api/admin/campaigns/${id}/targets/${targetId}/regenerate`, { method: "POST" });
    const json = await res.json();
    setRegenTargetId(null);
    if (!res.ok) {
      setEditError(json.error || "Regenerate failed");
      return;
    }
    if (json.draft) {
      setEditSubject(json.draft.subject);
      setEditBody(json.draft.body);
    }
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
        <div className="px-6 py-4 border-b border-[#e8e4dd] flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-[#1a1a1a]">
              Targets ({targets.length})
              {(() => {
                const approvedCount = targets.filter((t) => t.approved_at).length;
                const pendingCount = targets.filter((t) => !t.approved_at && !t.sent_at && t.status === "scheduled").length;
                return (
                  <span className="ml-2 text-xs font-normal text-[#1a1a1a]/50">
                    · {approvedCount} approved · {pendingCount} pending
                  </span>
                );
              })()}
            </h2>
            {bulkResult && (
              <p className="text-xs text-[#1a1a1a]/60 mt-1">{bulkResult}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={copyWebsites}
              className="px-3 py-1.5 border border-[#e8e4dd] bg-white text-xs font-medium text-[#1a1a1a] rounded-lg hover:bg-[#f8f6f1]"
              title="Copy a newline-separated list of every prospect's hotel website. Paste into Claude when running the Tier 0 audit pipeline."
            >
              {copyState === "copied" ? "Copied!" : "Copy websites"}
            </button>
            <button
              onClick={selectAllPending}
              className="text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] underline"
            >
              Select all pending
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] underline"
              >
                Clear ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => bulkAction("approve")}
              disabled={bulkBusy}
              className="px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528] disabled:opacity-50"
              title={selectedIds.size === 0 ? "Approve all pending" : `Approve ${selectedIds.size} selected`}
            >
              {bulkBusy ? "Working..." : selectedIds.size === 0 ? "Approve all pending" : `Approve selected (${selectedIds.size})`}
            </button>
            <button
              onClick={() => bulkAction("reject")}
              disabled={bulkBusy || selectedIds.size === 0}
              className="px-3 py-1.5 border border-[#c0674a] text-[#c0674a] text-xs font-medium rounded-lg hover:bg-[#c0674a]/10 disabled:opacity-30"
            >
              Reject selected ({selectedIds.size})
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-[10px] uppercase tracking-wider text-[#1a1a1a]/50">
              <tr>
                <th className="px-3 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left">Hotel / Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Scheduled</th>
                <th className="px-4 py-3 text-left">Last event</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => {
                const color = STATUS_COLORS[t.status] || "#9ca3af";
                const canEdit = !t.approved_at && !t.sent_at && (t.status === "scheduled" || t.status === "imported" || t.status === "quality_rejected");
                const hasAuditHtml = t.audit_has_html === true;
                const canApprove = !t.approved_at && !t.sent_at && t.status === "scheduled" && hasAuditHtml;
                const needsAuditHtml = !t.approved_at && !t.sent_at && t.status === "scheduled" && !hasAuditHtml;
                const canReject = !t.sent_at && t.status !== "cancelled";
                const isExpanded = expandedTargetId === t.id;
                const checked = selectedIds.has(t.id);
                return (
                  <Fragment key={t.id}>
                    <tr className="border-t border-[#e8e4dd] hover:bg-[#f8f6f1]/40">
                      <td className="px-3 py-3 align-top">
                        {canApprove && (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(t.id)}
                            className="h-4 w-4 accent-[#5b9a2f] cursor-pointer"
                            aria-label={`Select ${t.hotel_name || t.contact_email}`}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1a1a1a] truncate max-w-xs">
                          {t.hotel_name || "(no hotel name)"}
                        </p>
                        <p className="text-xs text-[#1a1a1a]/50 mt-0.5">
                          {t.contact_name && <span>{t.contact_name} · </span>}{t.contact_email}
                        </p>
                        {t.draft_subject && (
                          <p className="text-xs text-[#1a1a1a]/40 mt-0.5 truncate max-w-md italic">{t.draft_subject}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          {t.status}
                        </span>
                        {t.failure_reason && (
                          <p className="text-[10px] text-[#c0674a] mt-1">{t.failure_reason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]/60 text-xs">{fmt(t.scheduled_send_at)}</td>
                      <td className="px-4 py-3 text-xs">
                        {t.last_event_type ? (
                          <>
                            <span className="font-medium text-[#1a1a1a]">{t.last_event_type}</span>
                            <span className="text-[#1a1a1a]/40"> · {fmt(t.last_event_at)}</span>
                            {t.event_count > 1 && (
                              <span className="text-[#1a1a1a]/40"> ({t.event_count})</span>
                            )}
                          </>
                        ) : (
                          <span className="text-[#1a1a1a]/30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2 items-center flex-wrap justify-end">
                          {t.draft_body && (
                            <button
                              onClick={() => showPreview(t.id)}
                              className="text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:underline"
                            >
                              Preview
                            </button>
                          )}
                          {canEdit && (
                            <>
                              <span className="text-[#1a1a1a]/20">·</span>
                              <button
                                onClick={() => openEditor(t)}
                                className="text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:underline"
                              >
                                {isExpanded ? "Close" : "Edit"}
                              </button>
                            </>
                          )}
                          {canApprove && (
                            <>
                              <span className="text-[#1a1a1a]/20">·</span>
                              <button
                                onClick={() => approveTarget(t.id)}
                                disabled={actionTargetId === t.id}
                                className="text-xs font-medium text-[#5b9a2f] hover:underline disabled:opacity-50"
                              >
                                {actionTargetId === t.id ? "..." : "Approve"}
                              </button>
                            </>
                          )}
                          {needsAuditHtml && (
                            <>
                              <span className="text-[#1a1a1a]/20">·</span>
                              <span
                                className="text-xs text-[#c0674a]"
                                title="Paste the Tier 0 audit HTML before this prospect can be approved"
                              >
                                Needs audit HTML
                              </span>
                            </>
                          )}
                          {canReject && (
                            <>
                              <span className="text-[#1a1a1a]/20">·</span>
                              <button
                                onClick={() => rejectTarget(t.id)}
                                disabled={actionTargetId === t.id}
                                className="text-xs text-[#c0674a] hover:underline disabled:opacity-50"
                              >
                                {actionTargetId === t.id ? "..." : "Reject"}
                              </button>
                            </>
                          )}
                          {t.audit_token && (
                            <>
                              <span className="text-[#1a1a1a]/20">·</span>
                              <button
                                onClick={() => openAuditHtmlEditor(t)}
                                className="text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:underline"
                                title="Paste the Tier 0 audit HTML that this prospect will see when they click the email link"
                              >
                                {auditEditTargetId === t.id ? "Close audit" : "Audit HTML"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#f8f6f1]/40 border-t border-[#e8e4dd]">
                        <td colSpan={6} className="px-6 py-5">
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/50 font-semibold block mb-1">Subject</label>
                              <input
                                type="text"
                                value={editSubject}
                                onChange={(e) => setEditSubject(e.target.value)}
                                className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f] bg-white"
                              />
                              <p className="text-[10px] text-[#1a1a1a]/40 mt-1">{editSubject.length} chars (10-120 required)</p>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/50 font-semibold block mb-1">Body</label>
                              <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                rows={14}
                                className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f] bg-white font-mono"
                              />
                              <p className="text-[10px] text-[#1a1a1a]/40 mt-1">
                                {editBody.split(/\s+/).filter(Boolean).length} words (60-350 required) ·
                                Must include <code className="bg-[#1a1a1a]/5 px-1 rounded">{"{{AUDIT_URL}}"}</code> and the hotel name.
                              </p>
                            </div>
                            {qualityWarning && (
                              <div className="p-2 bg-[#c0674a]/10 border border-[#c0674a]/20 rounded text-xs text-[#c0674a]">
                                Quality gate: <strong>{qualityWarning}</strong> — fix this before the daily approval will pass.
                              </div>
                            )}
                            {editError && (
                              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">{editError}</div>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => saveDraft(t.id)}
                                disabled={savingTarget}
                                className="px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528] disabled:opacity-50"
                              >
                                {savingTarget ? "Saving..." : "Save draft"}
                              </button>
                              {t.pipeline_contact_id && (
                                <button
                                  onClick={() => regenerateDraft(t.id)}
                                  disabled={regenTargetId === t.id}
                                  className="px-3 py-1.5 border border-[#e8e4dd] text-xs font-medium rounded-lg hover:bg-white disabled:opacity-50"
                                  title="Re-run AI draft for this prospect"
                                >
                                  {regenTargetId === t.id ? "Generating..." : "Regenerate with AI"}
                                </button>
                              )}
                              <button
                                onClick={() => { setExpandedTargetId(null); setEditError(null); setQualityWarning(null); }}
                                className="px-3 py-1.5 border border-[#e8e4dd] text-xs font-medium rounded-lg hover:bg-white"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {auditEditTargetId === t.id && (
                      <tr className="bg-[#f8f6f1]/40 border-t border-[#e8e4dd]">
                        <td colSpan={6} className="px-6 py-5">
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/50 font-semibold block mb-1">
                                Audit HTML for this prospect
                              </label>
                              <p className="text-xs text-[#1a1a1a]/50 mb-2">
                                Paste the full HTML for the Tier 0 audit landing page. The email&apos;s audit link will resolve to{" "}
                                <code className="bg-[#1a1a1a]/5 px-1 rounded">/audit/{(t.audit_token && t.audit_token.length < 24) ? t.audit_token : "<slug>"}</code>{" "}
                                and render this HTML directly. Leave blank to fall back to the structured audit page.
                              </p>
                              <textarea
                                value={auditHtmlDraft}
                                onChange={(e) => setAuditHtmlDraft(e.target.value)}
                                rows={16}
                                placeholder="<section>...</section>"
                                className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-xs font-mono focus:outline-none focus:border-[#5b9a2f] bg-white"
                              />
                              <p className="text-[10px] text-[#1a1a1a]/40 mt-1">
                                {auditHtmlDraft.length.toLocaleString()} characters · Saved verbatim, rendered with{" "}
                                <code className="bg-[#1a1a1a]/5 px-1 rounded">dangerouslySetInnerHTML</code>.
                              </p>
                            </div>
                            {auditHtmlError && (
                              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">{auditHtmlError}</div>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => saveAuditHtml(t)}
                                disabled={savingAuditHtml}
                                className="px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528] disabled:opacity-50"
                              >
                                {savingAuditHtml ? "Saving..." : "Save audit HTML"}
                              </button>
                              {t.audit_token && (
                                <a
                                  href={`/audit/${t.audit_token}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 border border-[#e8e4dd] text-xs font-medium rounded-lg hover:bg-white"
                                >
                                  Open landing page
                                </a>
                              )}
                              <button
                                onClick={() => { setAuditEditTargetId(null); setAuditHtmlDraft(""); setAuditHtmlError(null); }}
                                className="px-3 py-1.5 border border-[#e8e4dd] text-xs font-medium rounded-lg hover:bg-white"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview modal */}
      {(preview || previewLoading) && (
        <div
          className="fixed inset-0 z-50 bg-[#1a1a1a]/60 flex items-center justify-center p-4"
          onClick={() => { setPreview(null); }}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#e8e4dd] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-[#1a1a1a]">Email preview</h3>
                {preview && (
                  <p className="text-xs text-[#1a1a1a]/50 truncate">
                    To: {preview.to} · From: {preview.from}
                  </p>
                )}
              </div>
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => setPreviewMode("html")}
                  className={`px-2 py-1 text-xs rounded ${previewMode === "html" ? "bg-[#5b9a2f] text-white" : "border border-[#e8e4dd] text-[#1a1a1a]/60"}`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setPreviewMode("text")}
                  className={`px-2 py-1 text-xs rounded ${previewMode === "text" ? "bg-[#5b9a2f] text-white" : "border border-[#e8e4dd] text-[#1a1a1a]/60"}`}
                >
                  Text
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="ml-2 text-[#1a1a1a]/50 hover:text-[#1a1a1a] text-xl leading-none"
                  aria-label="Close preview"
                >
                  ×
                </button>
              </div>
            </div>
            {previewLoading && (
              <div className="flex-1 flex items-center justify-center text-sm text-[#1a1a1a]/50">Loading preview...</div>
            )}
            {preview && (
              <>
                <div className="px-6 py-3 border-b border-[#e8e4dd] bg-[#f8f6f1]/40">
                  <p className="text-xs text-[#1a1a1a]/40 uppercase tracking-wide font-semibold mb-1">Subject</p>
                  <p className="text-sm text-[#1a1a1a] font-medium">{preview.subject}</p>
                </div>
                <div className="flex-1 overflow-auto">
                  {previewMode === "html" ? (
                    <iframe
                      srcDoc={preview.html}
                      sandbox=""
                      className="w-full h-full min-h-[480px] border-0"
                      title="Email HTML preview"
                    />
                  ) : (
                    <pre className="p-6 text-xs whitespace-pre-wrap font-mono text-[#1a1a1a]/80">{preview.text}</pre>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
