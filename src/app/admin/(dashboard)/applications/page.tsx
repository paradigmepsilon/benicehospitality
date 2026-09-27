"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { relativeTime } from "@/lib/utils";
import type { ApplicationRow } from "@/lib/management/applications";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  CURRENT_STATUS_LABELS,
  TIMELINE_LABELS,
  isApplicationStatus,
  type ApplicationStatus,
} from "@/lib/management/statuses";
import { engagementHandoffHref, openEngagementHref } from "@/lib/management/handoff";

type ManagedAsset = "car" | "rooms";
type Application = ApplicationRow;

type SortOption = "newest" | "oldest" | "name" | "email";

const ASSET_LABELS: Record<ManagedAsset, string> = {
  car: "Car",
  rooms: "Rooms",
};

const ASSET_BADGE: Record<ManagedAsset, string> = {
  car: "bg-[#1A4D4F]/10 text-[#1A4D4F] border-[#1A4D4F]/30",
  rooms: "bg-[#B08D57]/15 text-[#7a5e36] border-[#B08D57]/40",
};

const ASSET_OPTIONS: ManagedAsset[] = ["car", "rooms"];

/** Where a card for this asset lives, in the words the nav uses. */
const TRACKER_LABEL: Record<ManagedAsset, string> = {
  car: "fleet",
  rooms: "partnership",
};

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  new: "bg-[#1a1a1a]/5 text-[#1a1a1a]/70 border-[#1a1a1a]/15",
  contacted: "bg-[#f5a623]/15 text-[#8a6215] border-[#f5a623]/35",
  call_booked: "bg-[#5b9a2f]/12 text-[#3d6a1f] border-[#5b9a2f]/30",
  qualified: "bg-[#5b9a2f]/20 text-[#2d4f15] border-[#5b9a2f]/50",
  declined: "bg-[#c0674a]/10 text-[#8a4a32] border-[#c0674a]/25",
  signed: "bg-[#4a7d25] text-white border-[#4a7d25]",
};

function formatLocation(city: string | null, state: string): string {
  return city ? `${city}, ${state}` : state;
}

function submittedOn(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

export default function ApplicationsAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState<"all" | ManagedAsset>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>(
    "all",
  );
  const [sort, setSort] = useState<SortOption>("newest");
  const [updating, setUpdating] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  // The row a tracker card or the dashboard linked to (?id=N). Opened and
  // scrolled into view once the list arrives, then highlighted.
  const [focusId, setFocusId] = useState<number | null>(null);

  // ?status=new comes from the dashboard card; ?id=N from a tracker card's
  // "Application #N" link. Read off window rather than useSearchParams so the
  // page needs no Suspense boundary (same as the two tracker boards).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const status = q.get("status");
    if (isApplicationStatus(status)) setStatusFilter(status);
    const id = Number(q.get("id"));
    if (Number.isInteger(id) && id > 0) {
      setFocusId(id);
      setExpanded(new Set([id]));
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((res) => res.json())
      .then((data: Application[]) => {
        setApplications(data);
        const drafts: Record<number, string> = {};
        for (const a of data) drafts[a.id] = a.notes ?? "";
        setNoteDrafts(drafts);
      })
      .finally(() => setLoading(false));
  }, []);

  // A deep-linked row may be hidden by the status filter it arrived with, so
  // clear the filter for it, then scroll once it is on screen.
  useEffect(() => {
    if (loading || focusId === null) return;
    const row = applications.find((a) => a.id === focusId);
    if (!row) return;
    if (statusFilter !== "all" && row.status !== statusFilter) setStatusFilter("all");
    const t = setTimeout(() => {
      document.getElementById(`application-${focusId}`)?.scrollIntoView({ block: "center" });
    }, 50);
    return () => clearTimeout(t);
    // statusFilter is read, not a trigger: re-running on every filter click
    // would keep yanking the page back to the focused row.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, focusId, applications]);

  const filtered = useMemo(() => {
    let result = applications;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.email.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.city ?? "").toLowerCase().includes(q),
      );
    }

    if (assetFilter !== "all") {
      result = result.filter((a) => a.asset === assetFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      if (sort === "newest")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.email.localeCompare(b.email);
    });

    return result;
  }, [applications, search, assetFilter, statusFilter, sort]);

  function toggleExpanded(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleStatusChange(id: number, status: ApplicationStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a)),
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  async function handleNotesSave(id: number) {
    const application = applications.find((a) => a.id === id);
    if (!application) return;
    const notes = noteDrafts[id] ?? "";
    if (notes === (application.notes ?? "")) return;

    setUpdating(id);
    try {
      // Send notes only, never this tab's last-known status. The page
      // fetches once on mount and never polls, so re-sending status here
      // could silently revert a change that happened elsewhere in the
      // meantime (the automatic new -> call_booked transition a booking
      // triggers, or new -> qualified when a tracker card is started).
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, notes } : a)),
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  function handleExport() {
    window.open("/api/admin/applications?format=csv", "_blank");
  }

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
        : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd] hover:border-[#1a1a1a]/30"
    }`;

  const assetCounts: Record<ManagedAsset, number> = { car: 0, rooms: 0 };
  for (const a of applications) assetCounts[a.asset]++;

  const statusCounts = Object.fromEntries(
    APPLICATION_STATUSES.map((s) => [s, 0]),
  ) as Record<ApplicationStatus, number>;
  for (const a of applications) statusCounts[a.status]++;

  const detailLabel = "text-[10px] font-semibold uppercase tracking-wide text-[#1a1a1a]/40";
  const detailValue = "text-sm text-[#1a1a1a]/80 mt-0.5 break-words";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
            Management Applications
          </h1>
          {!loading && (
            <p className="text-sm text-[#1a1a1a]/50 mt-1">
              {applications.length} application
              {applications.length !== 1 ? "s" : ""}
              {applications.length > 0 && (
                <>
                  {" · "}
                  {assetCounts.car} Car
                  {" · "}
                  {assetCounts.rooms} Rooms
                  {statusCounts.new > 0 && (
                    <>
                      {" · "}
                      <span className="font-medium text-[#1a1a1a]/80">
                        {statusCounts.new} new
                      </span>
                    </>
                  )}
                </>
              )}
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#333] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* How intake flows, in one line, so a new admin knows where a row goes next. */}
      {!loading && applications.length > 0 && (
        <p className="text-xs text-[#1a1a1a]/45 mb-4">
          Every row came from the public form at /management/apply. A booking from the
          same email moves it to Call Booked on its own. When you start a card from it,
          it moves to Qualified and the card links back here. Cars go to{" "}
          <Link href="/admin/fleet" className="underline hover:text-[#1a1a1a]">Fleet Management</Link>,
          rooms go to{" "}
          <Link href="/admin/partnership" className="underline hover:text-[#1a1a1a]">Partnership</Link>.
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-12 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#e8e4dd] rounded-lg">
          <svg
            className="w-12 h-12 mx-auto text-[#1a1a1a]/15 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-3.5 3.5a2 2 0 01-1.4.6h-4.2a2 2 0 01-1.4-.6L4 13m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
            />
          </svg>
          <p className="text-sm text-[#1a1a1a]/40">No applications yet.</p>
          <p className="text-xs text-[#1a1a1a]/30 mt-1">
            They&apos;ll appear here the moment someone submits the
            management application form.
          </p>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#e8e4dd] rounded-lg p-4 mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or city..."
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
                <option value="email">Email A-Z</option>
              </select>
            </div>

            {/* Asset filter pills */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/40 self-center mr-1">
                Asset:
              </span>
              <button
                onClick={() => setAssetFilter("all")}
                className={filterBtnClass(assetFilter === "all")}
              >
                All
                <span className="ml-1.5 opacity-60">
                  {applications.length}
                </span>
              </button>
              {ASSET_OPTIONS.map((asset) => (
                <button
                  key={asset}
                  onClick={() => setAssetFilter(asset)}
                  className={filterBtnClass(assetFilter === asset)}
                >
                  {ASSET_LABELS[asset]}
                  <span className="ml-1.5 opacity-60">
                    {assetCounts[asset]}
                  </span>
                </button>
              ))}
            </div>

            {/* Status filter pills */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/40 self-center mr-1">
                Status:
              </span>
              <button
                onClick={() => setStatusFilter("all")}
                className={filterBtnClass(statusFilter === "all")}
              >
                All
                <span className="ml-1.5 opacity-60">
                  {applications.length}
                </span>
              </button>
              {APPLICATION_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={filterBtnClass(statusFilter === status)}
                >
                  {APPLICATION_STATUS_LABELS[status]}
                  <span className="ml-1.5 opacity-60">
                    {statusCounts[status]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-[#1a1a1a]/40 mb-3">
            Showing {filtered.length} of {applications.length}
          </p>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#e8e4dd] rounded-lg">
              <p className="text-sm text-[#1a1a1a]/40">
                No applications match your filters.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {filtered.map((a, i) => {
                  const isOpen = expanded.has(a.id);
                  const isFocused = focusId === a.id;
                  const existingCard = openEngagementHref(a);
                  return (
                    <div
                      key={a.id}
                      id={`application-${a.id}`}
                      className={`${
                        i !== filtered.length - 1 ? "border-b border-[#e8e4dd]" : ""
                      } ${isFocused ? "bg-[#5b9a2f]/5" : ""}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-3 lg:min-w-fit hover:bg-[#f8f6f1]/50 transition-colors">
                        {/* Identity */}
                        <div className="flex-1 min-w-0 lg:w-48 lg:flex-none">
                          <p className="text-sm font-medium text-[#1a1a1a] truncate">
                            {a.name}
                            <span className="ml-1.5 text-xs font-normal text-[#1a1a1a]/35">#{a.id}</span>
                          </p>
                          <p className="text-xs text-[#1a1a1a]/55 mt-0.5 truncate">
                            <a
                              href={`mailto:${a.email}`}
                              className="hover:text-[#5b9a2f] transition-colors"
                            >
                              {a.email}
                            </a>
                            {" · "}
                            {relativeTime(a.createdAt)}
                          </p>
                        </div>

                        {/* Asset badge */}
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap self-start lg:self-center ${ASSET_BADGE[a.asset]}`}
                        >
                          {ASSET_LABELS[a.asset]}
                        </span>

                        {/* Count */}
                        <span className="text-xs text-[#1a1a1a]/60 whitespace-nowrap lg:w-14">
                          x{a.assetCount}
                        </span>

                        {/* Location */}
                        <span className="text-xs text-[#1a1a1a]/60 whitespace-nowrap lg:w-32 truncate">
                          {formatLocation(a.city, a.state)}
                        </span>

                        {/* Timeline */}
                        <span className="text-xs text-[#1a1a1a]/60 whitespace-nowrap lg:w-32 truncate">
                          {TIMELINE_LABELS[a.timeline] ?? a.timeline}
                        </span>

                        {/* Status selector */}
                        <div className="flex items-center gap-2 lg:w-40">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${STATUS_BADGE[a.status]}`}
                          >
                            {APPLICATION_STATUS_LABELS[a.status]}
                          </span>
                          <select
                            value={a.status}
                            onChange={(e) =>
                              handleStatusChange(
                                a.id,
                                e.target.value as ApplicationStatus,
                              )
                            }
                            disabled={updating === a.id}
                            className="px-2 py-1 text-xs border border-[#e8e4dd] rounded bg-white focus:outline-none focus:border-[#5b9a2f] disabled:opacity-50"
                            aria-label={`Change status for ${a.email}`}
                          >
                            {APPLICATION_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {APPLICATION_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Notes */}
                        <input
                          type="text"
                          value={noteDrafts[a.id] ?? ""}
                          onChange={(e) =>
                            setNoteDrafts((prev) => ({
                              ...prev,
                              [a.id]: e.target.value,
                            }))
                          }
                          onBlur={() => handleNotesSave(a.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                          }}
                          disabled={updating === a.id}
                          placeholder="Add a note..."
                          aria-label={`Notes for ${a.email}`}
                          className="flex-1 min-w-[10rem] px-2 py-1.5 text-xs border border-[#e8e4dd] rounded bg-white focus:outline-none focus:border-[#5b9a2f] disabled:opacity-50"
                        />

                        {/* Hand off to the tracker for this asset. Opens that
                            board's New form prefilled and creates nothing
                            until it is saved. Once a card exists, link to it
                            instead so nobody starts a second one. */}
                        {existingCard ? (
                          <Link
                            href={existingCard}
                            className="text-xs font-medium text-[#3d6a1f] hover:underline whitespace-nowrap"
                          >
                            Open {TRACKER_LABEL[a.asset]} card →
                          </Link>
                        ) : (
                          <a
                            href={engagementHandoffHref(a)}
                            className="text-xs font-medium text-[#1A4D4F] hover:underline whitespace-nowrap"
                          >
                            Start a {TRACKER_LABEL[a.asset]} engagement →
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleExpanded(a.id)}
                          aria-expanded={isOpen}
                          aria-controls={`application-${a.id}-details`}
                          className="text-xs font-medium text-[#1a1a1a]/55 hover:text-[#1a1a1a] whitespace-nowrap"
                        >
                          {isOpen ? "Hide details" : "Details"}
                        </button>
                      </div>

                      {isOpen && (
                        <div
                          id={`application-${a.id}-details`}
                          className="px-4 pb-4 pt-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 bg-[#f8f6f1]/40 border-t border-[#e8e4dd]"
                        >
                          <div>
                            <p className={detailLabel}>Phone</p>
                            <p className={detailValue}>
                              {a.phone ? (
                                <a href={`tel:${a.phone}`} className="hover:text-[#5b9a2f]">{a.phone}</a>
                              ) : (
                                "not given"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className={detailLabel}>Used today</p>
                            <p className={detailValue}>{CURRENT_STATUS_LABELS[a.currentStatus] ?? a.currentStatus}</p>
                          </div>
                          <div>
                            <p className={detailLabel}>Submitted</p>
                            <p className={detailValue}>{submittedOn(a.createdAt)} ET</p>
                          </div>
                          <div>
                            <p className={detailLabel}>Came from</p>
                            <p className={detailValue}>
                              {a.clickSource ?? "not recorded"}
                              {a.heardFrom && (
                                <span className="block text-xs text-[#1a1a1a]/55">Heard about us: {a.heardFrom}</span>
                              )}
                            </p>
                          </div>
                          <div className="col-span-2 md:col-span-3">
                            <p className={detailLabel}>What they want from management</p>
                            <p className={`${detailValue} whitespace-pre-wrap`}>{a.wants || "not given"}</p>
                          </div>
                          <div>
                            <p className={detailLabel}>Linked records</p>
                            <p className={`${detailValue} space-y-0.5`}>
                              {a.bookingId ? (
                                <Link href="/admin/bookings" className="block hover:text-[#5b9a2f]">Booking #{a.bookingId}</Link>
                              ) : (
                                <span className="block">No call booked yet</span>
                              )}
                              {a.fleetEngagementId && (
                                <Link href={`/admin/fleet/${a.fleetEngagementId}`} className="block hover:text-[#5b9a2f]">Fleet card #{a.fleetEngagementId}</Link>
                              )}
                              {a.partnershipEngagementId && (
                                <Link href={`/admin/partnership/${a.partnershipEngagementId}`} className="block hover:text-[#5b9a2f]">Partnership card #{a.partnershipEngagementId}</Link>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
