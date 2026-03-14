"use client";

import { useState, useEffect, useCallback } from "react";

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

const STAGES = [
  { value: "all", label: "All" },
  { value: "prospect", label: "Prospect", color: "#5b9a2f" },
  { value: "qualified", label: "Qualified", color: "#3b82f6" },
  { value: "proposal", label: "Proposal", color: "#f5a623" },
  { value: "client", label: "Client", color: "#8b5cf6" },
  { value: "closed_lost", label: "Closed Lost", color: "#9ca3af" },
];

const STAGE_COLORS: Record<string, string> = {
  prospect: "#5b9a2f",
  qualified: "#3b82f6",
  proposal: "#f5a623",
  client: "#8b5cf6",
  closed_lost: "#9ca3af",
};

const SOURCE_LABELS: Record<string, string> = {
  contact_form: "Contact Form",
  booking: "Booking",
  manual: "Manual",
};

const ACTIVITY_ICONS: Record<string, string> = {
  contact_form_submitted: "📩",
  booking_scheduled: "📅",
  booking_cancelled: "❌",
  stage_changed: "🔄",
  note_added: "📝",
  manual: "✏️",
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
    setActivities(data.activities || []);
    setEditNotes(data.contact?.notes || "");
    setActivitiesLoading(false);
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
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528] transition-colors"
        >
          + Add Contact
        </button>
      </div>

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
        {STAGES.map((stage) => (
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
                  style={{ backgroundColor: STAGE_COLORS[contact.pipeline_stage] || "#9ca3af" }}
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
                        backgroundColor: STAGE_COLORS[contact.pipeline_stage] + "15",
                        color: STAGE_COLORS[contact.pipeline_stage],
                      }}
                    >
                      {contact.pipeline_stage.replace("_", " ")}
                    </span>
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
                  <option value="prospect">Prospect</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="client">Client</option>
                  <option value="closed_lost">Closed Lost</option>
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
                        <p className="text-[10px] uppercase tracking-wide text-[#1a1a1a]/40 mb-1">Company</p>
                        <p className="text-sm text-[#1a1a1a]">{contact.company}</p>
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
