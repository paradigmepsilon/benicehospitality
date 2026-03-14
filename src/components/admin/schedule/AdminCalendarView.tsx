"use client";

import { useState, useEffect, useCallback } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  feed_id: number;
  feed_name: string;
  uid: string;
  summary: string;
  event_date: string;
  start_time: string;
  end_time: string;
}

interface DayData {
  bookings: Booking[];
  overrides: DateOverride[];
  calendarEvents: CalendarEvent[];
}

interface AdminCalendarViewProps {
  onDaySelect: (date: string, data: DayData) => void;
  selectedDate: string | null;
}

export default function AdminCalendarView({ onDaySelect, selectedDate }: AdminCalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(true);
  const [dayDataMap, setDayDataMap] = useState<Record<string, DayData>>({});

  const fetchScheduleData = useCallback(async () => {
    setLoading(true);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const from = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const to = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    try {
      const res = await fetch(`/api/admin/schedule?from=${from}&to=${to}`);
      const data = await res.json();

      const map: Record<string, DayData> = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        map[dateStr] = { bookings: [], overrides: [], calendarEvents: [] };
      }

      for (const b of data.bookings || []) {
        const dateStr = b.booking_date.split("T")[0];
        if (map[dateStr]) map[dateStr].bookings.push(b);
      }

      for (const o of data.overrides || []) {
        const dateStr = o.override_date.split("T")[0];
        if (map[dateStr]) map[dateStr].overrides.push(o);
      }

      for (const e of data.calendarEvents || []) {
        const dateStr = e.event_date.split("T")[0];
        if (map[dateStr]) map[dateStr].calendarEvents.push(e);
      }

      setDayDataMap(map);
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-[#e8e4dd]/50 transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-[#1a1a1a]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-display text-lg font-semibold text-[#1a1a1a]">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-[#e8e4dd]/50 transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-[#1a1a1a]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-12 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading schedule...
        </div>
      ) : (
        <div className="bg-white border border-[#e8e4dd] rounded-lg overflow-hidden">
          {/* Day names header */}
          <div className="grid grid-cols-7 border-b border-[#e8e4dd]">
            {DAY_NAMES.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wider py-2.5 border-r border-[#e8e4dd] last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-r border-b border-[#e8e4dd] last:border-r-0 bg-[#f8f6f1]/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const data = dayDataMap[dateStr] || { bookings: [], overrides: [], calendarEvents: [] };
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const confirmedBookings = data.bookings.filter((b) => b.status === "confirmed");
              const hasBlocks = data.overrides.some((o) => !o.is_available);
              const hasEvents = data.calendarEvents.length > 0;
              const colIndex = (firstDayOfMonth + i) % 7;

              return (
                <button
                  key={day}
                  onClick={() => onDaySelect(dateStr, data)}
                  className={[
                    "min-h-[90px] p-2 text-left border-b transition-colors relative",
                    colIndex < 6 ? "border-r" : "",
                    "border-[#e8e4dd]",
                    isSelected
                      ? "bg-[#5b9a2f]/5 ring-2 ring-inset ring-[#5b9a2f]/30"
                      : "hover:bg-[#f8f6f1]/50",
                  ].join(" ")}
                >
                  {/* Day number */}
                  <span
                    className={[
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                      isToday
                        ? "bg-[#5b9a2f] text-white"
                        : "text-[#1a1a1a]",
                    ].join(" ")}
                  >
                    {day}
                  </span>

                  {/* Indicators */}
                  <div className="mt-1 space-y-0.5">
                    {confirmedBookings.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5b9a2f] flex-shrink-0" />
                        <span className="text-[10px] text-[#5b9a2f] font-medium truncate">
                          {confirmedBookings.length} booking{confirmedBookings.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {hasBlocks && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        <span className="text-[10px] text-red-400 font-medium truncate">
                          {data.overrides.find((o) => !o.start_time)
                            ? "Blocked"
                            : "Partial block"}
                        </span>
                      </div>
                    )}
                    {hasEvents && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="text-[10px] text-amber-600 font-medium truncate">
                          {data.calendarEvents.length} event{data.calendarEvents.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-[#1a1a1a]/40">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#5b9a2f]" /> Bookings
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Blocked
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Calendar events
        </div>
      </div>
    </div>
  );
}
