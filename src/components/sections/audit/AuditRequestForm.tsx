"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "gm", label: "General Manager" },
  { value: "operator", label: "Operator" },
  { value: "other", label: "Other" },
] as const;

export default function AuditRequestForm() {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [hotelUrl, setHotelUrl] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hotelUrl.trim() || !email.trim() || !role) {
      setError("Please fill in every field.");
      return;
    }

    const turnstileToken = turnstileRef.current?.getResponse();
    if (!turnstileToken) {
      setError("Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);
    try {
      // Auto-prefix protocol if user didn't include one
      const normalizedUrl = /^https?:\/\//i.test(hotelUrl.trim())
        ? hotelUrl.trim()
        : `https://${hotelUrl.trim()}`;

      const res = await fetch("/api/audit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_url: normalizedUrl,
          email: email.trim(),
          role,
          turnstile_token: turnstileToken,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Submission failed. Please try again.");
        turnstileRef.current?.reset();
        return;
      }

      router.push("/audit/request/thanks");
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="bg-white border border-light-gray rounded-lg p-6 sm:p-8 lg:p-10">
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-near-black mb-2">
        Request your audit
      </h2>
      <p className="font-sans text-sm text-charcoal/70 mb-7 leading-relaxed">
        Three fields. We&apos;ll send your audit to your email when it&apos;s ready.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="hotel-url"
            className="block font-sans text-sm font-semibold text-near-black mb-1.5"
          >
            Your hotel website
          </label>
          <input
            id="hotel-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            required
            value={hotelUrl}
            onChange={(e) => setHotelUrl(e.target.value)}
            placeholder="yourhotel.com"
            className="w-full border border-light-gray bg-white px-4 py-3 text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green rounded-md transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="audit-email"
            className="block font-sans text-sm font-semibold text-near-black mb-1.5"
          >
            Your email
          </label>
          <input
            id="audit-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourhotel.com"
            className="w-full border border-light-gray bg-white px-4 py-3 text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green rounded-md transition-colors"
          />
        </div>

        <div>
          <label className="block font-sans text-sm font-semibold text-near-black mb-2">
            Your role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                aria-pressed={role === r.value}
                className={[
                  "border-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-center",
                  role === r.value
                    ? "border-primary-green bg-primary-green/5 text-near-black"
                    : "border-light-gray bg-white text-charcoal/70 hover:border-primary-green/40",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
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
          {submitting ? "Submitting..." : "Get My Free Audit"}
        </button>

        {siteKey && (
          <div className="flex justify-center">
            <Turnstile ref={turnstileRef} siteKey={siteKey} options={{ size: "invisible" }} />
          </div>
        )}

        <p className="font-sans text-xs text-charcoal/60 text-center leading-relaxed pt-1">
          Audits typically ready within 48 hours. We&apos;ll email you the link
          when it&apos;s done.
        </p>
      </form>
    </div>
  );
}
