"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminCalendarView from "@/components/admin/schedule/AdminCalendarView";
import DayDetailPanel from "@/components/admin/schedule/DayDetailPanel";
import BookingsList from "@/components/admin/schedule/BookingsList";
import CalendarFeedsPanel from "@/components/admin/schedule/CalendarFeedsPanel";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type View = "calendar" | "list" | "settings";

export default function SchedulePageWrapper() {
  return (
    <Suspense>
      <SchedulePage />
    </Suspense>
  );
}

interface AvailabilityWindow {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface DayData {
  bookings: Array<{
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
  }>;
  overrides: Array<{
    id: number;
    override_date: string;
    start_time: string | null;
    end_time: string | null;
    is_available: boolean;
    label: string | null;
  }>;
  calendarEvents: Array<{
    id: number;
    feed_name: string;
    summary: string;
    event_date: string;
    start_time: string;
    end_time: string;
  }>;
}

function SchedulePage() {
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as View) || "calendar";
  const [view, setView] = useState<View>(initialView);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);

  // Availability settings state
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [windowsLoading, setWindowsLoading] = useState(true);
  const [showWindowForm, setShowWindowForm] = useState(false);
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  const [windowSaving, setWindowSaving] = useState(false);

  useEffect(() => {
    if (view === "settings") {
      fetch("/api/admin/availability")
        .then((res) => res.json())
        .then((data) => setWindows(data))
        .finally(() => setWindowsLoading(false));
    }
  }, [view]);

  const handleDaySelect = useCallback((date: string, data: DayData) => {
    setSelectedDate(date);
    setSelectedDayData(data);
  }, []);

  const handleDataChange = useCallback(() => {
    setCalendarKey((k) => k + 1);
    // Re-fetch the selected day's data
    if (selectedDate) {
      fetch(`/api/admin/schedule?from=${selectedDate}&to=${selectedDate}`)
        .then((res) => res.json())
        .then((data) => {
          setSelectedDayData({
            bookings: data.bookings || [],
            overrides: data.overrides || [],
            calendarEvents: data.calendarEvents || [],
          });
        });
    }
  }, [selectedDate]);

  async function handleAddWindow() {
    setWindowSaving(true);
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day_of_week: newDay, start_time: newStart, end_time: newEnd }),
    });
    if (res.ok) {
      const created = await res.json();
      setWindows((prev) =>
        [...prev, created].sort((a, b) =>
          a.day_of_week !== b.day_of_week
            ? a.day_of_week - b.day_of_week
            : a.start_time.localeCompare(b.start_time)
        )
      );
      setShowWindowForm(false);
    }
    setWindowSaving(false);
  }

  async function handleToggleWindow(id: number, is_active: boolean) {
    const res = await fetch(`/api/admin/availability/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    });
    if (res.ok) {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, is_active } : w)));
    }
  }

  async function handleDeleteWindow(id: number) {
    const res = await fetch(`/api/admin/availability/${id}`, { method: "DELETE" });
    if (res.ok) {
      setWindows((prev) => prev.filter((w) => w.id !== id));
    }
  }

  function formatTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${m} ${ampm}`;
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white"
        : "text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-[#e8e4dd]/30"
    }`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
          Schedule
        </h1>
        <div className="flex gap-1 bg-white border border-[#e8e4dd] rounded-lg p-1">
          <button onClick={() => setView("calendar")} className={tabClass(view === "calendar")}>
            Calendar
          </button>
          <button onClick={() => setView("list")} className={tabClass(view === "list")}>
            List
          </button>
          <button onClick={() => setView("settings")} className={tabClass(view === "settings")}>
            Settings
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdminCalendarView
              key={calendarKey}
              onDaySelect={handleDaySelect}
              selectedDate={selectedDate}
            />
          </div>
          <div>
            {selectedDate && selectedDayData ? (
              <DayDetailPanel
                date={selectedDate}
                bookings={selectedDayData.bookings}
                overrides={selectedDayData.overrides}
                calendarEvents={selectedDayData.calendarEvents}
                onClose={() => { setSelectedDate(null); setSelectedDayData(null); }}
                onDataChange={handleDataChange}
              />
            ) : (
              <div className="bg-white border border-[#e8e4dd] rounded-lg p-6 text-center">
                <svg className="w-10 h-10 mx-auto text-[#1a1a1a]/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-[#1a1a1a]/40">
                  Select a day to view details
                </p>
                <p className="text-xs text-[#1a1a1a]/25 mt-1">
                  Click any day to see bookings, blocks, and calendar events
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && <BookingsList />}

      {/* Settings View */}
      {view === "settings" && (
        <div className="space-y-8">
          {/* Weekly Availability */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#1a1a1a]">
                  Weekly Availability
                </h2>
                <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                  Set your recurring weekly schedule for discovery calls.
                </p>
              </div>
              <button
                onClick={() => setShowWindowForm(!showWindowForm)}
                className="px-3 py-1.5 text-xs font-medium bg-[#5b9a2f] text-white rounded-lg hover:bg-[#4a7d25] transition-colors"
              >
                {showWindowForm ? "Cancel" : "Add Window"}
              </button>
            </div>

            {showWindowForm && (
              <div className="bg-white border border-[#e8e4dd] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">Day</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg bg-white focus:outline-none focus:border-[#5b9a2f]"
                    >
                      {DAY_NAMES.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">Start</label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">End</label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f]"
                    />
                  </div>
                  <button
                    onClick={handleAddWindow}
                    disabled={windowSaving}
                    className="px-4 py-2 text-sm font-medium bg-[#5b9a2f] text-white rounded-lg hover:bg-[#4a7d25] transition-colors disabled:opacity-50"
                  >
                    {windowSaving ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            )}

            {windowsLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-8 justify-center">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </div>
            ) : windows.length === 0 ? (
              <div className="text-center py-8 bg-white border border-[#e8e4dd] rounded-lg">
                <p className="text-sm text-[#1a1a1a]/40">No availability windows configured.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {windows.map((w) => (
                  <div
                    key={w.id}
                    className={`bg-white border rounded-lg px-4 py-3 flex items-center gap-4 ${
                      w.is_active ? "border-[#e8e4dd]" : "border-[#e8e4dd] opacity-50"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${w.is_active ? "bg-[#5b9a2f]" : "bg-[#1a1a1a]/20"}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-[#1a1a1a]">{DAY_NAMES[w.day_of_week]}</span>
                      <span className="text-sm text-[#1a1a1a]/50 ml-3">
                        {formatTime(w.start_time)} — {formatTime(w.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleWindow(w.id, !w.is_active)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          w.is_active
                            ? "bg-[#5b9a2f]/10 text-[#5b9a2f] border-[#5b9a2f]/20 hover:bg-[#5b9a2f]/20"
                            : "bg-[#1a1a1a]/5 text-[#1a1a1a]/40 border-[#1a1a1a]/10 hover:bg-[#1a1a1a]/10"
                        }`}
                      >
                        {w.is_active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleDeleteWindow(w.id)}
                        className="text-xs text-red-500/60 hover:text-red-500 transition-colors px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#e8e4dd]" />

          {/* Calendar Feeds */}
          <CalendarFeedsPanel />
        </div>
      )}
    </div>
  );
}
