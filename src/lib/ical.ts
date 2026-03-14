export interface ParsedEvent {
  uid: string;
  summary: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

/**
 * Parse an iCal (.ics) string and extract VEVENT blocks as busy time entries.
 * Only returns events from today forward.
 */
export function parseICalEvents(icsContent: string): ParsedEvent[] {
  // Unfold continuation lines (RFC 5545: lines starting with space/tab are continuations)
  const unfolded = icsContent.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const events: ParsedEvent[] = [];
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  let inEvent = false;
  let uid = "";
  let summary = "";
  let dtStart = "";
  let dtEnd = "";

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      uid = "";
      summary = "";
      dtStart = "";
      dtEnd = "";
      continue;
    }

    if (line === "END:VEVENT") {
      inEvent = false;
      if (dtStart) {
        const parsed = parseEventDates(dtStart, dtEnd);
        if (parsed) {
          // Expand multi-day events into separate daily entries
          for (const day of parsed) {
            if (day.date >= todayStr) {
              events.push({
                uid: uid || `generated-${day.date}-${day.startTime}`,
                summary: summary || "Busy",
                ...day,
              });
            }
          }
        }
      }
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith("UID:")) {
      uid = line.slice(4).trim();
    } else if (line.startsWith("SUMMARY:")) {
      summary = line.slice(8).trim();
    } else if (line.startsWith("DTSTART")) {
      dtStart = extractDateValue(line);
    } else if (line.startsWith("DTEND")) {
      dtEnd = extractDateValue(line);
    }
  }

  return events;
}

function extractDateValue(line: string): string {
  // Handle DTSTART;TZID=...:20240101T090000 or DTSTART:20240101T090000Z or DTSTART;VALUE=DATE:20240101
  const colonIdx = line.indexOf(":");
  return colonIdx >= 0 ? line.slice(colonIdx + 1).trim() : "";
}

function parseEventDates(
  dtStart: string,
  dtEnd: string
): Array<{ date: string; startTime: string; endTime: string }> | null {
  const startDate = parseICalDate(dtStart);
  if (!startDate) return null;

  const endDate = dtEnd ? parseICalDate(dtEnd) : null;

  // All-day event (date only, no time component)
  if (dtStart.length === 8) {
    const results: Array<{ date: string; startTime: string; endTime: string }> = [];
    const start = new Date(startDate.date + "T00:00:00");
    const end = endDate ? new Date(endDate.date + "T00:00:00") : new Date(start.getTime() + 86400000);

    // For multi-day all-day events, create one entry per day
    const current = new Date(start);
    while (current < end) {
      results.push({
        date: current.toLocaleDateString("en-CA"),
        startTime: "00:00",
        endTime: "23:59",
      });
      current.setDate(current.getDate() + 1);
    }
    return results;
  }

  // Timed event
  if (!endDate) {
    return [{ date: startDate.date, startTime: startDate.time, endTime: startDate.time }];
  }

  // If start and end are on the same day
  if (startDate.date === endDate.date) {
    return [{ date: startDate.date, startTime: startDate.time, endTime: endDate.time }];
  }

  // Multi-day timed event: first day partial, middle days full, last day partial
  const results: Array<{ date: string; startTime: string; endTime: string }> = [];
  const current = new Date(startDate.date + "T00:00:00");
  const endDateObj = new Date(endDate.date + "T00:00:00");

  while (current <= endDateObj) {
    const dateStr = current.toLocaleDateString("en-CA");
    if (dateStr === startDate.date) {
      results.push({ date: dateStr, startTime: startDate.time, endTime: "23:59" });
    } else if (dateStr === endDate.date) {
      if (endDate.time !== "00:00") {
        results.push({ date: dateStr, startTime: "00:00", endTime: endDate.time });
      }
    } else {
      results.push({ date: dateStr, startTime: "00:00", endTime: "23:59" });
    }
    current.setDate(current.getDate() + 1);
  }

  return results;
}

function parseICalDate(value: string): { date: string; time: string } | null {
  // Date only: 20240101
  if (/^\d{8}$/.test(value)) {
    return {
      date: `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
      time: "00:00",
    };
  }

  // DateTime: 20240101T090000 or 20240101T090000Z
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!match) return null;

  return {
    date: `${match[1]}-${match[2]}-${match[3]}`,
    time: `${match[4]}:${match[5]}`,
  };
}
