"use client";

import { useState, useRef, FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { AuditData } from "@/lib/types/audit";

interface EmailGateProps {
  token: string;
  hotelName: string;
  onUnlock: (data: AuditData) => void;
}

export default function EmailGate({ token, hotelName, onUnlock }: EmailGateProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const turnstileToken = turnstileRef.current?.getResponse();
    if (!turnstileToken) {
      setError("Please complete the verification.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/audit/${token}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstile_token: turnstileToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Unable to unlock. Please try again.");
        turnstileRef.current?.reset();
        setSubmitting(false);
        return;
      }
      const data = (await res.json()) as { audit_data: AuditData };
      onUnlock(data.audit_data);
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
      setSubmitting(false);
    }
  }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="bg-white border border-light-gray rounded-lg p-6 md:p-10 max-w-xl mx-auto">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-near-black mb-3 text-center">
        Unlock the full audit
      </h2>
      <p className="text-charcoal text-sm md:text-base leading-relaxed mb-6 text-center">
        We analyzed {hotelName} across seven dimensions of boutique hotel performance. The full report shows your strengths, your gaps, and the three highest-impact actions you can take.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="audit-email" className="block text-sm font-semibold text-near-black mb-1.5">
            Your work email
          </label>
          <input
            id="audit-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourhotel.com"
            className="w-full border border-light-gray bg-white px-4 py-3 text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green rounded-md transition-colors"
          />
        </div>

        {error && (
          <div className="bg-terracotta/10 border border-terracotta/30 text-terracotta text-sm px-4 py-2.5 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark text-white font-semibold px-6 py-3.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          {submitting ? "Unlocking..." : "Unlock My Audit"}
        </button>

        {siteKey && (
          <div className="flex justify-center">
            <Turnstile ref={turnstileRef} siteKey={siteKey} options={{ size: "invisible" }} />
          </div>
        )}

        <p className="text-xs text-charcoal/60 text-center leading-relaxed pt-2">
          We&apos;ll email your audit link so you can return any time. Occasional related insights, no spam, unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
