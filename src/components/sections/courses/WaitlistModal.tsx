"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { WaitlistTier } from "@/lib/validation/waitlist";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  tier: {
    name: string;
    slug: WaitlistTier;
  };
  courseSlug?: string;
}

export default function WaitlistModal({
  open,
  onClose,
  tier,
  courseSlug = "room-rental-riches",
}: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form state whenever the modal opens for a new tier
  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setHoneypot("");
      setError(null);
      setSuccess(false);
      setSubmitting(false);
      // Focus the first field after the entrance animation lands
      const t = setTimeout(() => nameInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, tier.slug]);

  // Escape key closes the modal
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock page scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          tier: tier.slug,
          course_slug: courseSlug,
          website: honeypot,
          turnstile_token: turnstileRef.current?.getResponse() || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="waitlist-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close waitlist signup"
            onClick={onClose}
            className="absolute inset-0 bg-near-black/60 backdrop-blur-sm cursor-default"
          />

          {/* Card */}
          <motion.div
            key="waitlist-card"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white border border-warm-gold/50 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-charcoal/55 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>

            <div className="p-7 md:p-10">
              <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
                Waitlist · {tier.name}
              </p>

              {success ? (
                <>
                  <h2
                    id="waitlist-modal-title"
                    className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-3"
                  >
                    You&rsquo;re on the list, {name.split(" ")[0] || "friend"}.
                  </h2>
                  <p className="font-sans text-base text-charcoal/80 leading-relaxed mb-2">
                    We just sent a confirmation to{" "}
                    <strong className="text-charcoal">{email}</strong>. The
                    moment {tier.name.toLowerCase()} enrollment opens for Room
                    Rental Riches, you&rsquo;ll be the first to know.
                  </p>
                  <p className="font-sans text-sm text-charcoal/60 italic mb-6">
                    Della reads replies herself if you have questions in the
                    meantime.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-lg font-sans text-sm font-semibold tracking-wide px-6 py-3 bg-deep-teal text-white hover:bg-deep-teal/90 transition-colors"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <h2
                    id="waitlist-modal-title"
                    className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-3"
                  >
                    Join the {tier.name} waitlist.
                  </h2>
                  <p className="font-sans text-base text-charcoal/75 leading-relaxed mb-6">
                    Drop your name and email. We&rsquo;ll reach out the moment{" "}
                    {tier.name.toLowerCase()} enrollment opens. No drip
                    campaign, no upsells, just one note when the doors unlock.
                  </p>

                  <form onSubmit={handleSubmit} noValidate>
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
                          htmlFor="waitlist-name"
                          className="block font-sans text-xs font-semibold tracking-wide uppercase text-charcoal/65 mb-1.5"
                        >
                          Name
                        </label>
                        <input
                          ref={nameInputRef}
                          id="waitlist-name"
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
                          htmlFor="waitlist-email"
                          className="block font-sans text-xs font-semibold tracking-wide uppercase text-charcoal/65 mb-1.5"
                        >
                          Email
                        </label>
                        <input
                          id="waitlist-email"
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
                      <p className="mt-3 font-sans text-sm text-terracotta">
                        {error}
                      </p>
                    )}

                    <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={onClose}
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
                        {submitting ? "Sending..." : "Add me to the list"}
                      </button>
                    </div>

                    <p className="mt-4 font-sans text-xs text-charcoal/50 leading-relaxed">
                      One note when enrollment opens. Nothing else.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
