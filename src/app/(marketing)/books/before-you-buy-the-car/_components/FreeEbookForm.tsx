"use client";

import { useState, useRef, FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import posthog from "posthog-js";
import { CARS_TODAY_OPTIONS, type CarsToday } from "@/lib/crr-free-ebook-options";

/**
 * FreeEbookForm: lead-magnet capture for "Before You Buy the Car".
 *
 * POSTs to /api/crr-free-ebook/request with the same defenses as the other
 * magnet forms (honeypot + invisible Turnstile). Two optional segmentation
 * fields ride along, metro and cars-today, per the lead-magnet plan: they
 * decide which nurture frame the reader gets (aspiring, first car, fleet).
 * Styled for the dark hero band.
 */
export default function FreeEbookForm({ source }: { source: string }) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [email, setEmail] = useState("");
  const [metro, setMetro] = useState("");
  const [carsToday, setCarsToday] = useState<CarsToday | "">("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    posthog.capture("crr_free_ebook_submitted", { source });

    try {
      const res = await fetch("/api/crr-free-ebook/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          metro,
          carsToday: carsToday || undefined,
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
      turnstileRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-warm-gold/40 bg-warm-gold/10 p-5">
        <p className="font-display text-xl font-semibold text-white">
          On its way.
        </p>
        <p className="mt-2 font-sans text-sm leading-relaxed text-white/75">
          Check your inbox for the PDF and ePub links. If it is not there in a
          couple of minutes, look in promotions or spam, then reply to the
          email and I will resend it.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 font-sans text-sm text-white placeholder:text-white/40 focus:border-warm-gold focus:outline-none transition-colors duration-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
        className={inputClass}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={metro}
          onChange={(e) => setMetro(e.target.value)}
          placeholder="Your metro (optional)"
          aria-label="Your metro area"
          maxLength={80}
          className={inputClass}
        />
        <select
          value={carsToday}
          onChange={(e) => setCarsToday(e.target.value as CarsToday | "")}
          aria-label="How many cars do you rent out today"
          className={`${inputClass} ${carsToday ? "text-white" : "text-white/40"}`}
        >
          <option value="" className="text-near-black">
            Cars you rent out today (optional)
          </option>
          {CARS_TODAY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="text-near-black">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-warm-gold px-7 py-3.5 font-sans text-sm font-semibold text-near-black transition-colors duration-200 hover:bg-gold-light disabled:opacity-50 sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Send me the free guide"}
      </button>

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          options={{ size: "invisible" }}
        />
      )}

      {status === "error" && (
        <p className="font-sans text-sm text-terracotta">
          Something went wrong. Please try again.
        </p>
      )}

      <p className="font-sans text-xs leading-relaxed text-white/50">
        You will also get the Car Rental Riches emails: operator notes, no
        hype, unsubscribe any time.
      </p>
    </form>
  );
}
