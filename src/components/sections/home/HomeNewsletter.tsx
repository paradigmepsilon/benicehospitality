"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

/**
 * The newsletter form, with no section of its own. The footer places it inside
 * the photo band as a glass card, so this component owns only the heading, the
 * two fields, and the submit disc. Posts to /api/newsletter with source "home"
 * exactly as before; nothing about the request changed.
 */
export default function HomeNewsletter() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          source: "home",
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "w-full bg-white/10 border border-white/20 text-white placeholder:text-white/45 px-5 py-3.5 font-sans text-sm rounded-full focus:outline-none focus:border-warm-gold transition-colors duration-200";

  return (
    <div className="rounded-card border border-white/15 bg-near-black/55 backdrop-blur-xl p-6 md:p-8">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight">
        Join the Be Nice list.
      </h2>
      <p className="font-sans text-sm md:text-[15px] text-white/70 leading-relaxed mt-3">
        Operator-level thinking on running co-living properties and rental
        fleets like a business. Sent when we have something worth saying.
      </p>

      {status === "success" ? (
        <p className="font-sans text-warm-gold-dark font-semibold mt-6">
          You&rsquo;re in. Look for our next issue in your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
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
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            aria-label="Name"
            autoComplete="name"
            className={fieldClass}
          />
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              aria-label="Email address"
              autoComplete="email"
              className={`${fieldClass} pr-16`}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label={status === "loading" ? "Subscribing" : "Subscribe"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-warm-gold text-near-black flex items-center justify-center hover:bg-warm-gold-dark transition-colors duration-200 disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              options={{ size: "invisible" }}
            />
          )}
        </form>
      )}
      {status === "error" && (
        <p className="font-sans text-red-300 text-sm mt-3">
          Something went wrong. Please try again.
        </p>
      )}
      <p className="font-sans text-xs text-white/40 mt-4">
        No spam. Unsubscribe at any time.
      </p>
    </div>
  );
}
