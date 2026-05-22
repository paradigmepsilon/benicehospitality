"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface EmailCaptureFormProps {
  source: string;
  variant?: "footer" | "card";
  buttonLabel?: string;
  placeholder?: string;
  helperText?: string;
  successMessage?: string;
  /** When true, shows the helper text only after success. Useful in compact UIs. */
  hideHelperUntilSuccess?: boolean;
}

/**
 * Self-contained newsletter / waitlist capture. Posts to /api/newsletter and
 * tags the row with the source string so admin reporting can split inbound by
 * surface (footer, community waitlist, course waitlist, etc).
 */
export default function EmailCaptureForm({
  source,
  variant = "footer",
  buttonLabel = "Subscribe",
  placeholder = "you@example.com",
  helperText = "No spam. One thoughtful note a week.",
  successMessage = "You're on the list. Welcome.",
  hideHelperUntilSuccess = false,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const isCard = variant === "card";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source,
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setEmail("");
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
    return (
      <div
        className={[
          "font-sans text-sm",
          isCard ? "text-charcoal" : "text-white/80",
        ].join(" ")}
      >
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`email-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          autoComplete="email"
          className={[
            "flex-1 px-4 py-3 font-sans text-sm transition-colors duration-200 focus:outline-none",
            isCard
              ? "bg-white border border-light-gray text-charcoal placeholder:text-charcoal/40 focus:border-primary-green"
              : "bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:border-warm-gold",
          ].join(" ")}
        />
        <button
          type="submit"
          disabled={submitting}
          className={[
            "px-5 py-3 font-sans text-sm font-semibold whitespace-nowrap transition-colors duration-200",
            submitting ? "opacity-60 cursor-wait" : "",
            isCard
              ? "bg-primary-green text-white hover:bg-primary-green-dark"
              : "bg-warm-gold text-near-black hover:bg-warm-gold/90",
          ].join(" ")}
        >
          {submitting ? "Sending..." : buttonLabel}
        </button>
      </div>

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          options={{ size: "invisible" }}
        />
      )}

      {error && (
        <p
          className={[
            "mt-2 font-sans text-xs",
            isCard ? "text-red-600" : "text-red-300",
          ].join(" ")}
        >
          {error}
        </p>
      )}

      {!hideHelperUntilSuccess && helperText && (
        <p
          className={[
            "mt-3 font-sans text-xs",
            isCard ? "text-charcoal/55" : "text-white/45",
          ].join(" ")}
        >
          {helperText}
        </p>
      )}
    </form>
  );
}
