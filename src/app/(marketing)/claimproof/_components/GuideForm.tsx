"use client";

import { useState, useRef, FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import posthog from "posthog-js";

/**
 * GuideForm — lead-magnet capture for The 24-Hour Rule (free PDF).
 * POSTs to /api/claimproof/guide; same defenses as the newsletter form
 * (honeypot + invisible Turnstile). Styled for a dark band.
 */
export default function GuideForm() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    posthog.capture("claimproof_guide_submitted");

    try {
      const res = await fetch("/api/claimproof/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
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
      <p className="font-sans text-base font-semibold text-gold-light">
        On its way — check your inbox for The 24-Hour Rule.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md"
    >
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
        className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3.5 font-sans text-sm rounded-full focus:outline-none focus:border-warm-gold transition-colors duration-200"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-warm-gold text-near-black px-7 py-3.5 font-sans font-semibold text-sm hover:bg-gold-light transition-colors duration-200 whitespace-nowrap disabled:opacity-50"
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
        <p className="font-sans text-sm text-terracotta sm:w-full">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
