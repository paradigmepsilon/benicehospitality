"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import posthog from "posthog-js";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import { personId } from "@/lib/posthog-identity";

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

export default function CoLivingLive() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Resolved after mount rather than during render: the next-session date
  // depends on "now", and computing it on the server would either bake a stale
  // date into a static page or desync from the client and trip hydration.
  const [sessionLabel, setSessionLabel] = useState<string | null>(null);
  useEffect(() => {
    setSessionLabel(nextLiveSessionLabel(new Date()));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "co-living-live",
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      if (!res.ok) throw new Error();

      // Another identity moment. Someone who wants reminders is a warmer lead
      // than a passing reader, so pin the person and flag the interest — this
      // is what the "Warm" cohort keys on.
      try {
        posthog.identify(personId(email), {
          email: personId(email),
          live_reminder_opted_in: true,
        });
      } catch {
        // Never let analytics break the signup.
      }

      setStatus("success");
      setEmail("");
      turnstileRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatedSection theme="dark" className="py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <AnimatedItem>
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
              Every week, live
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
              The five W&rsquo;s, live.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-white/75 leading-snug mb-6">
              Once a week I get on camera and walk through what is actually
              happening in my portfolio. Who is renting, what they are paying,
              when the demand shows up, where the markets are moving, and why.
              Bring questions. I answer them live.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-sm text-white/55 leading-snug mb-8">
              The how does not fit in a live session. That is what the tools and
              the course on this page are for.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="border-l-2 border-warm-gold pl-5">
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

        <AnimatedItem>
          <div className="bg-white/5 border border-white/15 rounded-sm p-7 md:p-8">
            {status === "success" ? (
              <div>
                <p className="font-display text-2xl text-warm-gold mb-3">
                  You&rsquo;re on the list.
                </p>
                <p className="font-sans text-sm text-white/70 leading-snug">
                  I&rsquo;ll send you a note before the next one. In the
                  meantime, the property score above is the best place to start.
                </p>
              </div>
            ) : (
              <>
                <p className="font-display text-xl text-white mb-2">
                  Get a reminder.
                </p>
                <p className="font-sans text-sm text-white/60 leading-snug mb-6">
                  One email before each session. Nothing else.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {/* Honeypot, hidden from real users */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      opacity: 0,
                      height: 0,
                      width: 0,
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    aria-label="Email address"
                    autoComplete="email"
                    className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3.5 font-sans text-sm rounded-md focus:outline-none focus:border-warm-gold transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-warm-gold text-near-black px-7 py-3.5 font-sans font-semibold text-sm rounded-md hover:bg-warm-gold-dark transition-colors duration-200 disabled:opacity-50 min-h-12"
                  >
                    {status === "loading" ? "Adding you..." : "Remind Me"}
                  </button>
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      options={{ size: "invisible" }}
                    />
                  )}
                </form>
                {status === "error" && (
                  <p className="font-sans text-red-400 text-sm mt-3">
                    Something went wrong. Please try again.
                  </p>
                )}
              </>
            )}
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
