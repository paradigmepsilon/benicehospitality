// Smoke tests for the booking slot generator and conflict detection.
//
// Mirrors the algorithm in src/app/api/bookings/slots/route.ts and
// src/app/api/bookings/route.ts, then exercises it with synthetic inputs.
// Catches regressions in the range-overlap math when call_type widths differ.
//
// Run with: npx tsx scripts/smoke/booking-conflict.ts

const CALL_TYPE_DURATIONS: Record<string, number> = {
  advisory_discovery_60: 60,
  signal_discovery_40: 40,
};

interface ExistingBooking {
  booking_time: string;
  call_type: string;
}

interface BlockedRange {
  start: number;
  end: number;
}

interface AvailabilityWindow {
  start_time: string;
  end_time: string;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function blockedRangesFromBookings(bookings: ExistingBooking[]): BlockedRange[] {
  return bookings.map((b) => {
    const start = toMinutes(b.booking_time);
    const dur = CALL_TYPE_DURATIONS[b.call_type] ?? 60;
    return { start, end: start + dur };
  });
}

function generateSlots(
  windows: AvailabilityWindow[],
  blocked: BlockedRange[],
  callType: keyof typeof CALL_TYPE_DURATIONS,
): string[] {
  const slotDuration = CALL_TYPE_DURATIONS[callType];
  const out: string[] = [];

  for (const w of windows) {
    let cursor = toMinutes(w.start_time);
    const end = toMinutes(w.end_time);

    while (cursor + slotDuration <= end) {
      const slotEnd = cursor + slotDuration;
      const collides = blocked.some((r) => cursor < r.end && slotEnd > r.start);
      if (!collides) out.push(toHHMM(cursor));
      cursor += slotDuration;
    }
  }

  return out;
}

function hasConflict(
  existing: ExistingBooking[],
  requestedTime: string,
  callType: keyof typeof CALL_TYPE_DURATIONS,
): boolean {
  const reqStart = toMinutes(requestedTime);
  const reqEnd = reqStart + CALL_TYPE_DURATIONS[callType];
  return existing.some((b) => {
    const start = toMinutes(b.booking_time);
    const end = start + (CALL_TYPE_DURATIONS[b.call_type] ?? 60);
    return reqStart < end && reqEnd > start;
  });
}

const window9to17 = [{ start_time: "09:00", end_time: "17:00" }];

interface Case {
  name: string;
  run: () => boolean;
  expect: string;
}

const cases: Case[] = [
  {
    name: "60-min advisory on an empty day yields 09:00..16:00 hourly",
    expect: "09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00",
    run: () => {
      const got = generateSlots(window9to17, [], "advisory_discovery_60");
      return got.join(", ") === "09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00";
    },
  },
  {
    name: "40-min Signal on an empty day strides 09:00, 09:40, 10:20...",
    expect: "09:00, 09:40, 10:20 are first three",
    run: () => {
      const got = generateSlots(window9to17, [], "signal_discovery_40");
      return got[0] === "09:00" && got[1] === "09:40" && got[2] === "10:20";
    },
  },
  {
    name: "40-min Signal grid stops before 17:00 (last viable: 16:20 ends 17:00)",
    expect: "last slot is 16:20",
    run: () => {
      const got = generateSlots(window9to17, [], "signal_discovery_40");
      return got[got.length - 1] === "16:20";
    },
  },
  {
    // The 40-min grid is 09:00, 09:40, 10:20, 11:00... Note 10:00 is NOT on the
    // grid. A 60-min booking at 09:00 occupies [09:00, 10:00), which overlaps the
    // first two 40-min slots. The next free slot is 10:20.
    name: "60-min advisory at 09:00 blocks the 09:00 and 09:40 Signal slots; 10:20 is free",
    expect: "09:00, 09:40 missing; 10:20 present",
    run: () => {
      const blocked = blockedRangesFromBookings([
        { booking_time: "09:00", call_type: "advisory_discovery_60" },
      ]);
      const got = generateSlots(window9to17, blocked, "signal_discovery_40");
      return !got.includes("09:00") && !got.includes("09:40") && got.includes("10:20");
    },
  },
  {
    name: "40-min Signal at 09:00 blocks 60-min advisory at 09:00 only (10:00 is free)",
    expect: "09:00 missing; 10:00 present",
    run: () => {
      const blocked = blockedRangesFromBookings([
        { booking_time: "09:00", call_type: "signal_discovery_40" },
      ]);
      const got = generateSlots(window9to17, blocked, "advisory_discovery_60");
      return !got.includes("09:00") && got.includes("10:00");
    },
  },
  {
    name: "Two non-overlapping 40-min slots stay available",
    expect: "09:00 and 10:20 both present",
    run: () => {
      const got = generateSlots(window9to17, [], "signal_discovery_40");
      return got.includes("09:00") && got.includes("10:20");
    },
  },
  {
    name: "POST conflict check: 60-min advisory at 09:30 conflicts with 40-min Signal at 09:00",
    expect: "conflict=true",
    run: () =>
      hasConflict(
        [{ booking_time: "09:00", call_type: "signal_discovery_40" }],
        "09:30",
        "advisory_discovery_60",
      ),
  },
  {
    name: "POST conflict check: 40-min Signal at 10:00 does NOT conflict with 60-min advisory at 09:00",
    expect: "conflict=false",
    run: () =>
      !hasConflict(
        [{ booking_time: "09:00", call_type: "advisory_discovery_60" }],
        "10:00",
        "signal_discovery_40",
      ),
  },
  {
    name: "POST conflict check: 40-min Signal at 09:30 conflicts with 60-min advisory at 09:00",
    expect: "conflict=true",
    run: () =>
      hasConflict(
        [{ booking_time: "09:00", call_type: "advisory_discovery_60" }],
        "09:30",
        "signal_discovery_40",
      ),
  },
  {
    name: "POST conflict check: same call_type at same time is a conflict",
    expect: "conflict=true",
    run: () =>
      hasConflict(
        [{ booking_time: "10:00", call_type: "advisory_discovery_60" }],
        "10:00",
        "advisory_discovery_60",
      ),
  },
];

let pass = 0;
let fail = 0;

for (const c of cases) {
  const ok = (() => {
    try {
      return c.run();
    } catch (err) {
      console.error(`  threw: ${err}`);
      return false;
    }
  })();
  if (ok) {
    console.log(`PASS  ${c.name}`);
    pass++;
  } else {
    console.error(`FAIL  ${c.name}`);
    console.error(`      expected: ${c.expect}`);
    fail++;
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
