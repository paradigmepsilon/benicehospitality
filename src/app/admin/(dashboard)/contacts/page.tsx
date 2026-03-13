"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { relativeTime } from "@/lib/utils";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  hotel_name: string;
  hotel_location: string | null;
  room_count: string | null;
  interests: string | null;
  message: string | null;
  notes: string | null;
  submitted_at: string;
  status: string;
}

type StatusFilter = "all" | "new" | "contacted" | "closed";
type SortOption = "newest" | "oldest" | "name";

const STATUS_DOT: Record<string, string> = {
  new: "bg-[#5b9a2f]",
  contacted: "bg-[#f5a623]",
  closed: "bg-[#1a1a1a]/25",
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-[#5b9a2f]/10 text-[#5b9a2f] border-[#5b9a2f]/20",
  contacted: "bg-[#f5a623]/10 text-[#d4891a] border-[#f5a623]/20",
  closed: "bg-[#1a1a1a]/5 text-[#1a1a1a]/40 border-[#1a1a1a]/10",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((res) => res.json())
      .then((data) => setContacts(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = contacts;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.hotel_name.toLowerCase().includes(q) ||
          (c.hotel_location && c.hotel_location.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sort === "newest")
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      if (sort === "oldest")
        return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [contacts, search, statusFilter, sort]);

  const statusCounts = useMemo(() => {
    return {
      all: contacts.length,
      new: contacts.filter((c) => c.status === "new").length,
      contacted: contacts.filter((c) => c.status === "contacted").length,
      closed: contacts.filter((c) => c.status === "closed").length,
    };
  }, [contacts]);

  async function handleStatusChange(id: number, status: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    }
  }

  async function handleSaveNotes(id: number) {
    setSavingNotes(id);
    const notes = editingNotes[id] ?? "";
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    if (res.ok) {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, notes } : c))
      );
    }
    setSavingNotes(null);
  }

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const contact = contacts.find((c) => c.id === id);
      if (contact && !(id in editingNotes)) {
        setEditingNotes((prev) => ({ ...prev, [id]: contact.notes || "" }));
      }
    }
  }

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
        : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd] hover:border-[#1a1a1a]/30"
    }`;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
          Contact Submissions
        </h1>
        {!loading && (
          <p className="text-sm text-[#1a1a1a]/50 mt-1">
            {contacts.length} submission{contacts.length !== 1 ? "s" : ""}
            {statusCounts.new > 0 && (
              <span className="text-[#5b9a2f] font-medium">
                {" "}
                &middot; {statusCounts.new} new
              </span>
            )}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-12 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading contacts...
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#e8e4dd] rounded-lg">
          <svg className="w-12 h-12 mx-auto text-[#1a1a1a]/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-[#1a1a1a]/40">No contact submissions yet.</p>
          <p className="text-xs text-[#1a1a1a]/30 mt-1">They&apos;ll appear here when someone fills out the contact form.</p>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#e8e4dd] rounded-lg p-4 mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or hotel..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f] transition-colors"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg bg-white focus:outline-none focus:border-[#5b9a2f] transition-colors"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* Status filter pills */}
            <div className="flex gap-2 flex-wrap">
              {(["all", "new", "contacted", "closed"] as StatusFilter[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={filterBtnClass(statusFilter === s)}
                  >
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    <span className="ml-1.5 opacity-60">{statusCounts[s]}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-[#1a1a1a]/40 mb-3">
            Showing {filtered.length} of {contacts.length}
          </p>

          {/* Contact Cards */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-white border border-[#e8e4dd] rounded-lg">
                <p className="text-sm text-[#1a1a1a]/40">No contacts match your filters.</p>
              </div>
            ) : (
              filtered.map((contact) => (
                <Fragment key={contact.id}>
                  <div
                    className={`bg-white border rounded-lg transition-all ${
                      expandedId === contact.id
                        ? "border-[#5b9a2f]/30 shadow-sm"
                        : "border-[#e8e4dd] hover:border-[#1a1a1a]/15"
                    }`}
                  >
                    {/* Summary Row */}
                    <div
                      className="px-4 py-3.5 cursor-pointer flex items-center gap-4"
                      onClick={() => toggleExpand(contact.id)}
                    >
                      {/* Status dot */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[contact.status] || ""}`}
                      />

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-[#1a1a1a]">
                            {contact.name}
                          </span>
                          <span className="text-[#1a1a1a]/25">&middot;</span>
                          <span className="text-sm text-[#1a1a1a]/50 truncate">
                            {contact.hotel_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#1a1a1a]/40">
                            {contact.email}
                          </span>
                          {contact.room_count && (
                            <>
                              <span className="text-[#1a1a1a]/20">&middot;</span>
                              <span className="text-xs text-[#1a1a1a]/40">
                                {contact.room_count} rooms
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-[#1a1a1a]/35 hidden sm:block">
                          {relativeTime(contact.submitted_at)}
                        </span>
                        <select
                          value={contact.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(contact.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer appearance-none text-center ${
                            STATUS_BADGE[contact.status] || ""
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                        <svg
                          className={`w-4 h-4 text-[#1a1a1a]/30 transition-transform ${
                            expandedId === contact.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {expandedId === contact.id && (
                      <div className="border-t border-[#e8e4dd] px-4 py-4 bg-[#f8f6f1]/30">
                        {/* Detail grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                          <div>
                            <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                              Email
                            </span>
                            <p className="text-[#1a1a1a] mt-0.5">
                              <a href={`mailto:${contact.email}`} className="text-[#5b9a2f] hover:underline">
                                {contact.email}
                              </a>
                            </p>
                          </div>
                          {contact.phone && (
                            <div>
                              <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                                Phone
                              </span>
                              <p className="text-[#1a1a1a] mt-0.5">{contact.phone}</p>
                            </div>
                          )}
                          {contact.hotel_location && (
                            <div>
                              <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                                Location
                              </span>
                              <p className="text-[#1a1a1a] mt-0.5">{contact.hotel_location}</p>
                            </div>
                          )}
                          {contact.room_count && (
                            <div>
                              <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                                Room Count
                              </span>
                              <p className="text-[#1a1a1a] mt-0.5">{contact.room_count}</p>
                            </div>
                          )}
                          {contact.interests && (
                            <div className="sm:col-span-2">
                              <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                                Interests
                              </span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {contact.interests.split(",").map((interest, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-[#5b9a2f]/8 text-[#5b9a2f] px-2 py-0.5 rounded-full"
                                  >
                                    {interest.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                              Submitted
                            </span>
                            <p className="text-[#1a1a1a] mt-0.5">
                              {new Date(contact.submitted_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Message */}
                        {contact.message && (
                          <div className="mt-4 pt-4 border-t border-[#e8e4dd]/50">
                            <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                              Message
                            </span>
                            <p className="text-sm text-[#1a1a1a]/70 mt-1 leading-relaxed whitespace-pre-wrap">
                              {contact.message}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="mt-4 pt-4 border-t border-[#e8e4dd]/50">
                          <span className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
                            Admin Notes
                          </span>
                          <div className="mt-1.5 flex gap-2">
                            <textarea
                              value={editingNotes[contact.id] ?? contact.notes ?? ""}
                              onChange={(e) =>
                                setEditingNotes((prev) => ({
                                  ...prev,
                                  [contact.id]: e.target.value,
                                }))
                              }
                              placeholder="Add notes about this contact..."
                              rows={2}
                              className="flex-1 text-sm border border-[#e8e4dd] rounded-lg px-3 py-2 focus:outline-none focus:border-[#5b9a2f] transition-colors resize-y bg-white"
                            />
                            <button
                              onClick={() => handleSaveNotes(contact.id)}
                              disabled={savingNotes === contact.id}
                              className="self-end px-4 py-2 text-xs font-medium bg-[#5b9a2f] text-white rounded-lg hover:bg-[#4a7d25] transition-colors disabled:opacity-50"
                            >
                              {savingNotes === contact.id ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Fragment>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
