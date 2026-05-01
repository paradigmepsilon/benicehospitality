"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGES, STAGE_COLORS, STAGE_LABELS, ACTIVITY_TYPES } from "@/lib/pipeline-stages";

interface PipelineContact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  hotel_name: string | null;
  hotel_location: string | null;
  room_count: string | null;
  company: string | null;
  pipeline_stage: string;
  source: string;
  notes: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  fit_quality: string | null;
  region: string | null;
  state: string | null;
  city: string | null;
  owner_role: string | null;
  created_at: string;
  updated_at: string;
  activity_count: number;
  last_activity_at: string | null;
}

interface Activity {
  id: number;
  contact_id: number;
  type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const STAGE_FILTERS = [
  { value: "all", label: "All", color: "#1a1a1a" },
  ...PIPELINE_STAGES.map((s) => ({ value: s.value, label: s.label, color: s.color })),
];

const SOURCE_LABELS: Record<string, string> = {
  contact_form: "Contact Form",
  booking: "Booking",
  manual: "Manual",
  csv_import: "CSV Import",
};

const ACTIVITY_ICONS: Record<string, string> = {
  contact_form_submitted: "📩",
  booking_scheduled: "📅",
  booking_cancelled: "❌",
  stage_changed: "🔄",
  note_added: "📝",
  manual: "✏️",
  csv_imported: "📥",
  email_sent: "✉️",
  linkedin_sent: "💼",
  replied: "💬",
  call_held: "📞",
  meeting_booked: "📅",
  meeting_held: "🤝",
  proposal_sent: "📄",
  closed_won: "🎉",
  closed_lost: "🛑",
  note: "📝",
  approved: "✅",
  rejected: "🚫",
  replenished: "♻️",
  sent: "✉️",
  delivered: "📬",
  delivery_delayed: "⏳",
  opened: "👀",
  clicked: "🔗",
  bounced: "↩️",
  complained: "🚨",
};

const FIT_QUALITY_COLORS: Record<string, string> = {
  A: "#5b9a2f",
  B: "#f5a623",
  C: "#9ca3af",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CrmPage() {
  const [contacts, setContacts] = useState<PipelineContact[]>([]);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", hotel_name: "", hotel_location: "", room_count: "", company: "", notes: "" });
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; updated: number; errors: { row: number; reason: string }[] } | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [activityForm, setActivityForm] = useState<{ type: string; description: string }>({ type: "email_sent", description: "" });
  const [loggingActivity, setLoggingActivity] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const router = useRouter();

  const notContactedCount = stageCounts.prospect || 0;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeStage !== "all") params.set("stage", activeStage);
    if (search) params.set("search", search);
    params.set("sort", sort);

    const res = await fetch(`/api/admin/crm?${params}`);
    const data = await res.json();
    setContacts(data.contacts || []);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const row of data.counts || []) {
      counts[row.pipeline_stage] = row.count;
      total += row.count;
    }
    counts.all = total;
    setStageCounts(counts);
    setLoading(false);
  }, [activeStage, search, sort]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  async function loadActivities(contactId: number) {
    setActivitiesLoading(true);
    const res = await fetch(`/api/admin/crm/${contactId}`);
    const data = await res.json();

    // Merge pipeline_activities (manual/CRM events) with outreach_events
    // (email send/delivery/open/click/reply) into one timeline. Both types
    // share the Activity shape so the existing renderer reads them uniformly.
    const manual: Activity[] = (data.activities || []).map((a: Activity) => ({ ...a }));
    type OutEvt = {
      id: number;
      target_id: number;
      event_type: string;
      occurred_at: string;
      metadata: Record<string, unknown> | null;
      campaign_id: number | null;
      draft_subject: string | null;
    };
    const outbound: Activity[] = ((data.outreach_events as OutEvt[] | undefined) || []).map((e) => ({
      id: -e.id, // negative ids prevent React key collisions with pipeline_activities
      contact_id: contactId,
      type: e.event_type,
      title: humanizeEventType(e.event_type, e.draft_subject),
      description: e.campaign_id ? `Campaign #${e.campaign_id}` : null,
      metadata: e.metadata,
      created_at: e.occurred_at,
    }));

    const merged = [...manual, ...outbound].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    setActivities(merged);
    setEditNotes(data.contact?.notes || "");
    setActivitiesLoading(false);
  }

  function humanizeEventType(t: string, subject: string | null): string {
    const subj = subject ? ` — "${subject}"` : "";
    switch (t) {
      case "approved": return `Email approved${subj}`;
      case "rejected": return `Email rejected${subj}`;
      case "replenished": return `Queued in campaign (replenish)${subj}`;
      case "sent": return `Email sent${subj}`;
      case "delivered": return `Email delivered${subj}`;
      case "delivery_delayed": return `Delivery delayed${subj}`;
      case "opened": return `Prospect opened email${subj}`;
      case "clicked": return `Prospect clicked link${subj}`;
      case "bounced": return `Email bounced${subj}`;
      case "complained": return `Marked as spam${subj}`;
      case "replied": return `Prospect replied${subj}`;
      default: return `${t}${subj}`;
    }
  }

  function toggleExpand(contact: PipelineContact) {
    if (expandedId === contact.id) {
      setExpandedId(null);
      setActivities([]);
    } else {
      setExpandedId(contact.id);
      loadActivities(contact.id);
    }
  }

  async function updateStage(contactId: number, newStage: string) {
    await fetch(`/api/admin/crm/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_stage: newStage }),
    });
    fetchContacts();
    if (expandedId === contactId) loadActivities(contactId);
  }

  async function saveNotes(contactId: number) {
    setSavingNotes(true);
    await fetch(`/api/admin/crm/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: editNotes }),
    });
    setSavingNotes(false);
    fetchContacts();
  }

  async function deleteContact(contactId: number) {
    await fetch(`/api/admin/crm/${contactId}`, { method: "DELETE" });
    setDeleteConfirm(null);
    setExpandedId(null);
    fetchContacts();
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    const file = importFileRef.current?.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append("csv", file);
    const res = await fetch("/api/admin/crm/import", { method: "POST", body: fd });
    const data = await res.json();
    setImporting(false);
    if (!res.ok) {
      setImportResult({ inserted: 0, updated: 0, errors: [{ row: 0, reason: data.error || "Import failed" }] });
      return;
    }
    setImportResult({ inserted: data.inserted || 0, updated: data.updated || 0, errors: data.errors || [] });
    fetchContacts();
  }

  async function createCampaignFromTopProspects() {
    if (notContactedCount === 0) {
      setCampaignError("No prospects at stage 'Not Contacted'. Import a CSV first or move contacts back to that stage.");
      return;
    }
    setCreatingCampaign(true);
    setCampaignError(null);
    const res = await fetch("/api/admin/campaigns/from-prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 10 }),
    });
    const data = await res.json();
    setCreatingCampaign(false);
    if (!res.ok) {
      setCampaignError(data.error || "Failed to create campaign.");
      return;
    }
    if (data.next) {
      router.push(data.next);
    } else if (data.campaign_id) {
      router.push(`/admin/campaigns/${data.campaign_id}`);
    }
  }

  async function logActivity(contactId: number) {
    setLoggingActivity(true);
    await fetch(`/api/admin/crm/${contactId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activityForm.type, description: activityForm.description || undefined }),
    });
    setLoggingActivity(false);
    setActivityForm({ type: activityForm.type, description: "" });
    loadActivities(contactId);
    fetchContacts();
  }

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/admin/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    setCreating(false);
    setShowCreateForm(false);
    setCreateForm({ name: "", email: "", phone: "", hotel_name: "", hotel_location: "", room_count: "", company: "", notes: "" });
    fetchContacts();
  }

  const total = stageCounts.all || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
            CRM Pipeline
          </h1>
          <p className="text-sm text-[#1a1a1a]/50 mt-1">{total} contacts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowImport(!showImport); setImportResult(null); }}
            className="px-4 py-2 border border-[#e8e4dd] bg-white text-sm font-medium text-[#1a1a1a] rounded-lg hover:bg-[#f8f6f1] transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={createCampaignFromTopProspects}
            disabled={creatingCampaign || notContactedCount === 0}
            className="px-4 py-2 border border-[#5b9a2f] bg-white text-sm font-medium text-[#5b9a2f] rounded-lg hover:bg-[#5b9a2f]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={notContactedCount === 0 ? "No 'Not Contacted' prospects available" : `Pull the top 10 prospects (A-tier first) and draft a campaign`}
          >
            {creatingCampaign ? "Creating campaign..." : `Create Campaign (Top 10)`}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528] transition-colors"
          >
            + Add Contact
          </button>
        </div>
      </div>
      {campaignError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {campaignError}
        </div>
      )}

      {/* Import CSV Panel */}
      {showImport && (
        <div className="bg-white border border-[#e8e4dd] rounded-lg p-5 mb-6">
          <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-2">Import Prospects from CSV</h2>
          <p className="text-xs text-[#1a1a1a]/50 mb-4">
            Expected columns: region, state, city, property_name, url, room_count, owner_name, owner_role, contact_email, linkedin, notes, fit_quality. Re-uploading the same file is safe — existing rows update in place.
          </p>
          <form onSubmit={handleImport} className="flex flex-wrap items-center gap-3">
            <input
              ref={importFileRef}
              type="file"
              accept=".csv,text/csv"
              required
              className="text-sm file:mr-3 file:px-3 file:py-1.5 file:border-0 file:rounded-lg file:bg-[#5b9a2f] file:text-white file:text-xs file:font-medium hover:file:bg-[#4e8528]"
            />
            <button
              type="submit"
              disabled={importing}
              className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528] transition-colors disabled:opacity-50"
            >
              {importing ? "Uploading..." : "Upload"}
            </button>
            <button
              type="button"
              onClick={() => { setShowImport(false); setImportResult(null); }}
              className="px-4 py-2 border border-[#e8e4dd] text-sm rounded-lg hover:bg-[#f8f6f1] transition-colors"
            >
              Close
            </button>
          </form>
          {importResult && (
            <div className="mt-4 p-3 bg-[#f8f6f1] rounded-lg text-sm">
              <p className="font-medium text-[#1a1a1a]">
                {importResult.inserted} new · {importResult.updated} updated · {importResult.errors.length} errors
              </p>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-1">
                  {importResult.errors.slice(0, 10).map((err, idx) => (
                    <li key={idx}>Row {err.row}: {err.reason}</li>
                  ))}
                  {importResult.errors.length > 10 && (
                    <li>...and {importResult.errors.length - 10} more.</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-[#e8e4dd] rounded-lg p-5 mb-6">
          <h2 className="font-display text-base font-semibold text-[#1a1a1a] mb-4">New Contact</h2>
          <form onSubmit={createContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Name *"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
            />
            <input
              required
              type="email"
              placeholder="Email *"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
            />
            <input
              placeholder="Phone"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
            />
            <input
              placeholder="Hotel Name"
              value={createForm.hotel_name}
              onChange={(e) => setCreateForm({ ...createForm, hotel_name: e.target.value })}
              className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
            />
            <input
              placeholder="Location"
              value={createForm.hotel_location}
              onChange={(e) => setCreateForm({ ...createForm, hotel_location: e.target.value })}
              className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
            />
            <input
              placeholder="Company"
              value={createForm.company}
              onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
              className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
            />
            <textarea
              placeholder="Notes"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f] md:col-span-2"
              rows={2}
            />
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528] transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Contact"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-[#e8e4dd] text-sm rounded-lg hover:bg-[#f8f6f1] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stage Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STAGE_FILTERS.map((stage) => (
          <button
            key={stage.value}
            onClick={() => setActiveStage(stage.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeStage === stage.value
                ? "text-white"
                : "bg-white border border-[#e8e4dd] text-[#1a1a1a]/60 hover:border-[#1a1a1a]/20"
            }`}
            style={
              activeStage === stage.value
                ? { backgroundColor: stage.color || "#1a1a1a" }
                : undefined
            }
          >
            {stage.label}
            <span className="ml-1.5 opacity-70">{stageCounts[stage.value] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 bg-white border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Contact List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-6 w-6 text-[#5b9a2f]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-[#1a1a1a]/15 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-[#1a1a1a]/40">No contacts found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden"
            >
              {/* Contact Card Header */}
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#f8f6f1]/50 transition-colors"
                onClick={() => toggleExpand(contact)}
              >
                {/* Stage dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STAGE_COLORS[contact.pipeline_stage as keyof typeof STAGE_COLORS] || "#9ca3af" }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {contact.name}
                    </p>
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide"
                      style={{
                        backgroundColor: (STAGE_COLORS[contact.pipeline_stage as keyof typeof STAGE_COLORS] || "#9ca3af") + "15",
                        color: STAGE_COLORS[contact.pipeline_stage as keyof typeof STAGE_COLORS] || "#9ca3af",
                      }}
                    >
                      {STAGE_LABELS[contact.pipeline_stage as keyof typeof STAGE_LABELS] || contact.pipeline_stage.replace(/_/g, " ")}
                    </span>
                    {contact.fit_quality && (
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded"
                        style={{
                          backgroundColor: (FIT_QUALITY_COLORS[contact.fit_quality] || "#9ca3af") + "20",
                          color: FIT_QUALITY_COLORS[contact.fit_quality] || "#9ca3af",
                        }}
                        title="Fit quality"
                      >
                        {contact.fit_quality}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#1a1a1a]/40 truncate">
                    {contact.email}
                    {contact.hotel_name && ` · ${contact.hotel_name}`}
                  </p>
                </div>

                {/* Source badge */}
                <span className="px-2 py-0.5 text-[10px] font-medium bg-[#f8f6f1] text-[#1a1a1a]/50 rounded-full flex-shrink-0">
                  {SOURCE_LABELS[contact.source] || contact.source}
                </span>

                {/* Stage selector (click stops propagation) */}
                <select
                  value={contact.pipeline_stage}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateStage(contact.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 text-xs border border-[#e8e4dd] rounded-lg bg-white focus:outline-none focus:border-[#5b9a2f] flex-shrink-0"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                {/* Time */}
                <span className="text-xs text-[#1a1a1a]/30 flex-shrink-0">
                  {timeAgo(contact.updated_at)}
                </span>

                {/* Expand arrow */}
                <svg
                  className={`w-4 h-4 text-[#1a1a1a]/30 transition-transform ${expandedId === contact.id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded Detail */}
              {expandedId === contact.id && (
                <div className="border-t border-[#e8e4dd] px-5 py-5">
                  {/* Contact Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Email</p>
                      <p className="text-sm text-[#1a1a1a]">{contact.email}</p>
                    </div>
                    {contact.phone && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Phone</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.phone}</p>
                      </div>
                    )}
                    {contact.hotel_name && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Hotel</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.hotel_name}</p>
                      </div>
                    )}
                    {contact.hotel_location && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Location</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.hotel_location}</p>
                      </div>
                    )}
                    {contact.room_count && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Rooms</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.room_count}</p>
                      </div>
                    )}
                    {contact.company && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Owner</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.company}</p>
                      </div>
                    )}
                    {contact.owner_role && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Role</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.owner_role}</p>
                      </div>
                    )}
                    {contact.website_url && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Website</p>
                        <a href={contact.website_url} target="_blank" rel="noreferrer" className="text-sm text-[#5b9a2f] hover:underline truncate block">
                          {contact.website_url.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {contact.linkedin_url && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">LinkedIn</p>
                        <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-[#5b9a2f] hover:underline truncate block">
                          View profile
                        </a>
                      </div>
                    )}
                    {contact.region && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Region</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.region}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Created</p>
                      <p className="text-sm text-[#1a1a1a]">
                        {new Date(contact.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-2">Notes</p>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes about this contact..."
                      className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f] resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => saveNotes(contact.id)}
                      disabled={savingNotes}
                      className="mt-2 px-3 py-1.5 bg-[#5b9a2f] text-white text-xs font-medium rounded-lg hover:bg-[#4e8528] transition-colors disabled:opacity-50"
                    >
                      {savingNotes ? "Saving..." : "Save Notes"}
                    </button>
                  </div>

                  {/* Log Activity */}
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-2">Log Activity</p>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={activityForm.type}
                        onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                        className="px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm bg-white focus:outline-none focus:border-[#5b9a2f]"
                      >
                        {ACTIVITY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Optional note (e.g. subject line, who you spoke with)"
                        value={activityForm.description}
                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                        className="flex-1 min-w-[200px] px-3 py-2 border border-[#e8e4dd] rounded-lg text-sm focus:outline-none focus:border-[#5b9a2f]"
                      />
                      <button
                        onClick={() => logActivity(contact.id)}
                        disabled={loggingActivity}
                        className="px-3 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528] transition-colors disabled:opacity-50"
                      >
                        {loggingActivity ? "Logging..." : "Log"}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#1a1a1a]/40 mt-1.5">
                      Logging email, LinkedIn, reply, meeting, or proposal activity will auto-advance the pipeline stage forward.
                    </p>
                  </div>

                  {/* Activity Timeline */}
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-3">Activity Timeline</p>
                    {activitiesLoading ? (
                      <p className="text-sm text-[#1a1a1a]/40">Loading activities...</p>
                    ) : activities.length === 0 ? (
                      <p className="text-sm text-[#1a1a1a]/40">No activity yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 py-2 border-b border-[#e8e4dd] last:border-0"
                          >
                            <span className="text-sm flex-shrink-0 mt-0.5">
                              {ACTIVITY_ICONS[activity.type] || "📌"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#1a1a1a]">{activity.title}</p>
                              {activity.description && (
                                <p className="text-xs text-[#1a1a1a]/40 mt-0.5 truncate">{activity.description}</p>
                              )}
                            </div>
                            <span className="text-xs text-[#1a1a1a]/30 flex-shrink-0">
                              {timeAgo(activity.created_at)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="pt-3 border-t border-[#e8e4dd]">
                    {deleteConfirm === contact.id ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-red-600">Delete this contact permanently?</span>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 border border-[#e8e4dd] text-xs rounded-lg hover:bg-[#f8f6f1] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(contact.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete Contact
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
