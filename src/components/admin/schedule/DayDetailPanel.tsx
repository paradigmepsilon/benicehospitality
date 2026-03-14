"use client";

import { useState } from "react";

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
}

interface DateOverride {
  id: number;
  override_date: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  label: string | null;
}

interface CalendarEvent {
  id: number;
  feed_name: string;
  summary: string;
  event_date: string;
  start_time: string;
  end_time: string;
}

interface DayDetailPanelProps {
  date: string;
  bookings: Booking[];
  overrides: DateOverride[];
  calendarEvents: CalendarEvent[];
  onClose: () => void;
  onDataChange: () => void;
}

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
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DayDetailPanel({
  date,
  bookings,
  overrides,
  calendarEvents,
  onClose,
  onDataChange,
}: DayDetailPanelProps) {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockFullDay, setBlockFullDay] = useState(true);
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("17:00");
  const [blockLabel, setBlockLabel] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCancelBooking(id: number) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) onDataChange();
  }

  async function handleDeleteOverride(id: number) {
    const res = await fetch(`/api/admin/overrides/${id}`, { method: "DELETE" });
    if (res.ok) onDataChange();
  }

  async function handleBlockTime() {
    setSaving(true);
    const res = await fetch("/api/admin/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        override_date: date,
        start_time: blockFullDay ? null : blockStart,
        end_time: blockFullDay ? null : blockEnd,
        is_available: false,
        label: blockLabel || null,
      }),
    });
    if (res.ok) {
      setShowBlockForm(false);
      setBlockLabel("");
      onDataChange();
    }
    setSaving(false);
  }

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e8e4dd] flex items-center justify-between bg-[#f8f6f1]/50">
        <div>
          <h3 className="font-display text-base font-semibold text-[#1a1a1a]">
            {formatDate(date)}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
              Bookings ({confirmedBookings.length})
            </h4>
          </div>
          {confirmedBookings.length === 0 && cancelledBookings.length === 0 ? (
            <p className="text-sm text-[#1a1a1a]/30">No bookings</p>
          ) : (
            <div className="space-y-2">
              {confirmedBookings.map((b) => (
                <div key={b.id} className="border border-[#e8e4dd] rounded-lg px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#5b9a2f]" />
                        <span className="text-sm font-medium text-[#1a1a1a]">{b.name}</span>
                      </div>
                      <div className="text-xs text-[#1a1a1a]/50 mt-0.5 ml-4">
                        {formatTime(String(b.booking_time).slice(0, 5))} ET &middot; {b.hotel_name}
                      </div>
                      <div className="text-xs text-[#1a1a1a]/40 mt-0.5 ml-4">
                        {b.email}{b.phone ? ` · ${b.phone}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs text-red-500/60 hover:text-red-500 transition-colors px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
              {cancelledBookings.map((b) => (
                <div key={b.id} className="border border-[#e8e4dd] rounded-lg px-3 py-2.5 opacity-40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1a1a1a]/20" />
                    <span className="text-sm text-[#1a1a1a] line-through">{b.name}</span>
                    <span className="text-xs text-[#1a1a1a]/40">
                      {formatTime(String(b.booking_time).slice(0, 5))} — Cancelled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blocked Times */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide">
              Blocked Times ({overrides.filter((o) => !o.is_available).length})
            </h4>
          </div>
          {overrides.filter((o) => !o.is_available).length === 0 ? (
            <p className="text-sm text-[#1a1a1a]/30">No blocks</p>
          ) : (
            <div className="space-y-2">
              {overrides.filter((o) => !o.is_available).map((o) => (
                <div key={o.id} className="border border-red-200 bg-red-50/50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        {o.start_time ? `${formatTime(o.start_time)} — ${formatTime(o.end_time!)}` : "Full day"}
                      </span>
                    </div>
                    {o.label && (
                      <span className="text-xs text-[#1a1a1a]/50 ml-4">{o.label}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteOverride(o.id)}
                    className="text-xs text-red-500/60 hover:text-red-500 transition-colors px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Events */}
        {calendarEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wide mb-2">
              Calendar Events ({calendarEvents.length})
            </h4>
            <div className="space-y-2">
              {calendarEvents.map((e) => (
                <div key={e.id} className="border border-amber-200 bg-amber-50/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-[#1a1a1a]">{e.summary}</span>
                  </div>
                  <div className="text-xs text-[#1a1a1a]/50 mt-0.5 ml-4">
                    {formatTime(String(e.start_time).slice(0, 5))} — {formatTime(String(e.end_time).slice(0, 5))}
                    <span className="text-[#1a1a1a]/30 ml-2">via {e.feed_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block Time Form */}
        {showBlockForm ? (
          <div className="border border-[#e8e4dd] rounded-lg p-4 bg-[#f8f6f1]/30">
            <h4 className="text-sm font-medium text-[#1a1a1a] mb-3">Block Time</h4>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setBlockFullDay(true)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    blockFullDay
                      ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                      : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd]"
                  }`}
                >
                  Full Day
                </button>
                <button
                  onClick={() => setBlockFullDay(false)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    !blockFullDay
                      ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                      : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd]"
                  }`}
                >
                  Time Range
                </button>
              </div>

              {!blockFullDay && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[#1a1a1a]/50 mb-1">Start</label>
                    <input
                      type="time"
                      value={blockStart}
                      onChange={(e) => setBlockStart(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#1a1a1a]/50 mb-1">End</label>
                    <input
                      type="time"
                      value={blockEnd}
                      onChange={(e) => setBlockEnd(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-[#1a1a1a]/50 mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={blockLabel}
                  onChange={(e) => setBlockLabel(e.target.value)}
                  placeholder="e.g. Vacation, Conference"
                  className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBlockTime}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {saving ? "Blocking..." : "Block This Time"}
                </button>
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="px-4 py-2 text-sm text-[#1a1a1a]/60 border border-[#e8e4dd] rounded-lg hover:bg-[#f8f6f1] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowBlockForm(true)}
            className="w-full px-4 py-2.5 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Block Time on This Day
          </button>
        )}
      </div>
    </div>
  );
}
