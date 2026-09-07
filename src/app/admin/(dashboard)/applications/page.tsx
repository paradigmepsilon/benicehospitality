"use client";

import { useState, useEffect, useMemo } from "react";
import { relativeTime } from "@/lib/utils";

type ManagedAsset = "car" | "rooms";

type ApplicationStatus =
  | "new"
  | "contacted"
  | "call_booked"
  | "qualified"
  | "declined"
  | "signed";

interface Application {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  asset: ManagedAsset;
  assetCount: number;
  state: string;
  city: string | null;
  currentStatus: string;
  timeline: string;
  wants: string | null;
  heardFrom: string | null;
  status: ApplicationStatus;
  bookingId: number | null;
  notes: string | null;
  createdAt: string;
}

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

const TIMELINE_LABELS: Record<string, string> = {
  now: "Ready now",
  "30_days": "Within 30 days",
  "90_days": "Within 90 days",
  exploring: "Just exploring",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  call_booked: "Call Booked",
  qualified: "Qualified",
  declined: "Declined",
  signed: "Signed",
};

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  new: "bg-[#1a1a1a]/5 text-[#1a1a1a]/70 border-[#1a1a1a]/15",
  contacted: "bg-[#f5a623]/15 text-[#8a6215] border-[#f5a623]/35",
  call_booked: "bg-[#5b9a2f]/12 text-[#3d6a1f] border-[#5b9a2f]/30",
  qualified: "bg-[#5b9a2f]/20 text-[#2d4f15] border-[#5b9a2f]/50",
  declined: "bg-[#c0674a]/10 text-[#8a4a32] border-[#c0674a]/25",
  signed: "bg-[#4a7d25] text-white border-[#4a7d25]",
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "new",
  "contacted",
  "call_booked",
  "qualified",
  "declined",
  "signed",
];

function formatLocation(city: string | null, state: string): string {
  return city ? `${city}, ${state}` : state;
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

  const filtered = useMemo(() => {
    let result = applications;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.email.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q),
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
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: application.status, notes }),
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

  const statusCounts: Record<ApplicationStatus, number> = {
    new: 0,
    contacted: 0,
    call_booked: 0,
    qualified: 0,
    declined: 0,
    signed: 0,
  };
  for (const a of applications) statusCounts[a.status]++;

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
                  placeholder="Search by name or email..."
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
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={filterBtnClass(statusFilter === status)}
                >
                  {STATUS_LABELS[status]}
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
              {filtered.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-3 ${
                    i !== filtered.length - 1
                      ? "border-b border-[#e8e4dd]"
                      : ""
                  } hover:bg-[#f8f6f1]/50 transition-colors`}
                >
                  {/* Identity */}
                  <div className="flex-1 min-w-0 lg:w-48 lg:flex-none">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {a.name}
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
                  <span className="text-xs text-[#1a1a1a]/60 whitespace-nowrap lg:w-32">
                    {TIMELINE_LABELS[a.timeline] ?? a.timeline}
                  </span>

                  {/* Status selector */}
                  <div className="flex items-center gap-2 lg:w-40">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${STATUS_BADGE[a.status]}`}
                    >
                      {STATUS_LABELS[a.status]}
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
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
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
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
