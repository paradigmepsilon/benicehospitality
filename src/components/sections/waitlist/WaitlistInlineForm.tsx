"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { WaitlistTier } from "@/lib/validation/waitlist";

interface WaitlistInlineFormProps {
  courseSlug: string;
  tier: WaitlistTier;
  onCancel: () => void;
  // Visual prefix shown in success state (e.g. "Car Rental Riches"). Optional.
  successCourseName?: string;
}

export default function WaitlistInlineForm({
  courseSlug,
  tier,
  onCancel,
  successCourseName,
}: WaitlistInlineFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          tier,
          course_slug: courseSlug,
          website: honeypot,
          turnstile_token: turnstileRef.current?.getResponse() || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setDuplicate(Boolean(data.duplicate));
        turnstileRef.current?.reset();
      } else {
        setError(data.error || "Something went wrong. Try again in a moment.");
      }
    } catch {
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const firstName = name.trim().split(/\s+/)[0] || "friend";
    return (
      <div className="border-t border-light-gray pt-6">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2">
          {duplicate ? "Already on the list" : "You’re in"}
        </p>
        <p className="font-display text-xl font-semibold text-deep-teal leading-tight mb-3">
          {duplicate
            ? `Looks like ${firstName} is already on it.`
            : `Welcome${successCourseName ? ` to the ${successCourseName} waitlist` : ""}, ${firstName}.`}
        </p>
        <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-5">
          Confirmation sent to{" "}
          <strong className="text-charcoal">{email.trim()}</strong>. The moment
          enrollment opens, that inbox gets the note before the public link
          goes out.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-lg font-sans text-sm font-semibold tracking-wide px-6 py-3 bg-deep-teal text-white hover:bg-deep-teal/90 transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-t border-light-gray pt-6"
    >
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
        Join the waitlist
      </p>
      <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-5">
        Drop your name and email. One note when the doors open, nothing else.
      </p>

      {/* Honeypot */}
      <input
        type="text"
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

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`waitlist-inline-name-${courseSlug}`}
            className="block font-sans text-xs font-semibold tracking-wide uppercase text-charcoal/65 mb-1.5"
          >
            Name
          </label>
          <input
            id={`waitlist-inline-name-${courseSlug}`}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            maxLength={120}
            className="w-full px-4 py-3 font-sans text-base bg-white border border-light-gray text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none transition-colors duration-200 rounded"
          />
        </div>
        <div>
          <label
            htmlFor={`waitlist-inline-email-${courseSlug}`}
            className="block font-sans text-xs font-semibold tracking-wide uppercase text-charcoal/65 mb-1.5"
          >
            Email
          </label>
          <input
            id={`waitlist-inline-email-${courseSlug}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-4 py-3 font-sans text-base bg-white border border-light-gray text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none transition-colors duration-200 rounded"
          />
        </div>
      </div>

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          options={{ size: "invisible" }}
        />
      )}

      {error && (
        <p className="mt-3 font-sans text-sm text-terracotta">{error}</p>
      )}

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-sm text-charcoal/60 hover:text-charcoal underline underline-offset-4 transition-colors text-left"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={[
            "inline-flex items-center justify-center rounded-lg",
            "font-sans text-sm font-semibold tracking-wide",
            "px-7 py-3 transition-colors duration-200",
            submitting
              ? "bg-warm-gold/60 text-near-black/60 cursor-wait"
              : "bg-warm-gold text-near-black hover:bg-warm-gold-dark",
          ].join(" ")}
        >
          {submitting ? "Adding you..." : "Add me to the list"}
        </button>
      </div>
    </form>
  );
}
