"use client";

import { useState, useEffect, useMemo } from "react";

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  hotel_name: string;
  message: string | null;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  status: string;
  created_at: string;
}

type StatusFilter = "all" | "confirmed" | "cancelled";
type TimeFilter = "upcoming" | "past" | "all";

const STATUS_DOT: Record<string, string> = {
  confirmed: "bg-[#5b9a2f]",
  cancelled: "bg-[#1a1a1a]/25",
};

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-[#5b9a2f]/10 text-[#5b9a2f] border-[#5b9a2f]/20",
  cancelled: "bg-[#1a1a1a]/5 text-[#1a1a1a]/40 border-[#1a1a1a]/10",
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = bookings;
    const today = new Date().toLocaleDateString("en-CA");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.hotel_name.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (timeFilter === "upcoming") {
      result = result.filter((b) => b.booking_date >= today);
      result = [...result].sort((a, b) => {
        const dateCompare = a.booking_date.localeCompare(b.booking_date);
        return dateCompare !== 0 ? dateCompare : a.booking_time.localeCompare(b.booking_time);
      });
    } else if (timeFilter === "past") {
      result = result.filter((b) => b.booking_date < today);
    }

    return result;
  }, [bookings, search, statusFilter, timeFilter]);

  const statusCounts = useMemo(() => ({
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  async function handleStatusChange(id: number, status: string) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    }
  }

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
        : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd] hover:border-[#1a1a1a]/30"
    }`;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-12 justify-center">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading bookings...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-[#e8e4dd] rounded-lg">
        <svg className="w-12 h-12 mx-auto text-[#1a1a1a]/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-[#1a1a1a]/40">No bookings yet.</p>
        <p className="text-xs text-[#1a1a1a]/30 mt-1">They&apos;ll appear here when someone books a discovery call.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-4 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
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
          <div className="flex gap-2">
            {(["upcoming", "past", "all"] as TimeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={filterBtnClass(timeFilter === t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["all", "confirmed", "cancelled"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={filterBtnClass(statusFilter === s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1.5 opacity-60">{statusCounts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#1a1a1a]/40 mb-3">
        Showing {filtered.length} of {bookings.length}
      </p>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#e8e4dd] rounded-lg">
            <p className="text-sm text-[#1a1a1a]/40">No bookings match your filters.</p>
          </div>
        ) : (
          filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-[#e8e4dd] rounded-lg px-4 py-3.5 hover:border-[#1a1a1a]/15 transition-all"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[booking.status] || ""}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-[#1a1a1a]">
                      {booking.name}
                    </span>
                    <span className="text-[#1a1a1a]/25">&middot;</span>
                    <span className="text-sm text-[#1a1a1a]/50 truncate">
                      {booking.hotel_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-[#1a1a1a]/60 font-medium">
                      {formatDate(booking.booking_date.split("T")[0])}
                    </span>
                    <span className="text-[#1a1a1a]/20">&middot;</span>
                    <span className="text-xs text-[#5b9a2f] font-medium">
                      {formatTime(String(booking.booking_time).slice(0, 5))} ET
                    </span>
                    <span className="text-[#1a1a1a]/20">&middot;</span>
                    <span className="text-xs text-[#1a1a1a]/40">
                      {booking.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {booking.status === "confirmed" ? (
                    <button
                      onClick={() => handleStatusChange(booking.id, "cancelled")}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border text-red-500/70 border-red-500/20 hover:bg-red-500/5 transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[booking.status] || ""}`}
                    >
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
