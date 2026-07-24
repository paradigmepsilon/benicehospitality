"use client";

import { useSyncExternalStore } from "react";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";

// ── Cadence ──────────────────────────────────────────────────────────────────
// ASSUMPTION, easy to change: Della's weekly live is Thursday at 7:00 PM ET.
// Nothing in the codebase records the real slot, so it is declared once here
// rather than hardcoded into copy. Change these two constants and every label
// on the page follows.
const LIVE_WEEKDAY = 4; // 0 = Sunday
const LIVE_HOUR_ET = 19;
const LIVE_TIME_LABEL = "7:00 PM ET";

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * The next live session as a display label, e.g. "Thursday, August 6".
 *
 * All reasoning happens in ET wall-clock terms via Intl, so this never has to
 * do UTC offset math by hand. Stepping forward from a UTC-noon anchor keeps the
 * day arithmetic clear of any daylight-saving transition.
 */
export function nextLiveSessionLabel(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(now);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const weekday = WEEKDAY_INDEX[get("weekday")] ?? 0;

  let daysAhead = (LIVE_WEEKDAY - weekday + 7) % 7;
  // Today is the day but the session has already started: roll to next week.
  if (daysAhead === 0 && hour >= LIVE_HOUR_ET) daysAhead = 7;

  const anchor = new Date(Date.UTC(year, month - 1, day, 12));
  anchor.setUTCDate(anchor.getUTCDate() + daysAhead);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(anchor);
}

// The label depends on "now", so server and client must deliberately disagree:
// rendering it on the server would either bake a stale date into the page or
// desync from the client and trip hydration. useSyncExternalStore is the
// supported way to diverge on purpose — the server snapshot is null (the copy
// falls back to "Weekly"), and the client fills in the real date after mount.
//
// There is no store to subscribe to: the date is read once and never changes
// for the life of the page, so subscribe is a no-op and the snapshot is cached
// to stay referentially stable across re-renders.
const subscribeToNothing = () => () => {};
let cachedSessionLabel: string | null = null;
const getClientSessionLabel = () =>
  (cachedSessionLabel ??= nextLiveSessionLabel(new Date()));
const getServerSessionLabel = () => null;

export default function CoLivingLive() {
  const sessionLabel = useSyncExternalStore(
    subscribeToNothing,
    getClientSessionLabel,
    getServerSessionLabel,
  );

  return (
    <AnimatedSection theme="dark" className="py-12 md:py-16 px-6">
      {/* Single column since the reminder form moved to the page's closing
          "Stay Connected" section. Centered so the band does not read as a
          two-column layout with an empty right half. */}
      <div className="max-w-3xl mx-auto text-center">
        <AnimatedItem>
          <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-(--lane-accent-on-dark,var(--color-warm-gold)) mb-4">
            Every week, live
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
            Join Us Live
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-base md:text-lg text-white/75 leading-snug mb-6">
            Join us for live conversations where we answer questions, share what
            is working inside our own portfolio, and discuss the systems behind
            successful room rental businesses.
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-display italic text-xl md:text-2xl text-white mb-2">
            Bring your questions.
          </p>
          <p className="font-display italic text-xl md:text-2xl text-(--lane-accent-on-dark,var(--color-warm-gold)) mb-8">
            We&rsquo;ll answer them live.
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-sm text-white/55 leading-snug mb-10">
            The how does not fit in a live session. That is what the tools and
            the course on this page are for.
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <div className="inline-block border-t-2 border-warm-gold pt-5">
            <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-white/45 mb-1.5">
              Next session
            </p>
            <p className="font-display text-xl md:text-2xl text-white">
              {sessionLabel ? (
                <>
                  {sessionLabel}
                  <span className="text-white/60"> · {LIVE_TIME_LABEL}</span>
                </>
              ) : (
                <span className="text-white/60">
                  Weekly · {LIVE_TIME_LABEL}
                </span>
              )}
            </p>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
