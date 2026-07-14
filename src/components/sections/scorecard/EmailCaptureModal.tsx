"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "investor", label: "Investor" },
  { value: "manager", label: "Property Manager" },
  { value: "considering", label: "Considering buying" },
] as const;

export default function EmailCaptureModal({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [optedIn, setOptedIn] = useState(true);
  const [confirmedAccurate, setConfirmedAccurate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !role) {
      setError("Please fill in name, email, and role.");
      return;
    }

    if (!confirmedAccurate) {
      setError(
        "Please confirm your answers accurately reflect this property before we score it.",
      );
      return;
    }

    const turnstileToken = turnstileRef.current?.getResponse();
    if (siteKey && !turnstileToken) {
      setError("Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/scorecard/${token}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          phone: phone.trim() || undefined,
          opted_in_newsletter: optedIn,
          turnstile_token: turnstileToken || "no-turnstile-configured",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Submission failed. Please try again.");
        turnstileRef.current?.reset();
        return;
      }

      const data = (await res.json()) as { ok: boolean; results_url: string };
      router.push(data.results_url);
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scorecard-capture-title"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2">
            1 last step
          </p>
          <h2
            id="scorecard-capture-title"
            className="font-display text-2xl sm:text-3xl font-semibold text-near-black leading-tight mb-3"
          >
            Where should we send your scorecard?
          </h2>
          <p className="font-sans text-sm text-charcoal/70 leading-relaxed mb-6">
            Your score is ready. Confirm your answers are accurate and tell us
            where to send it. We will reveal the result here and email you a copy
            you can revisit any time.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="sc-name"
                className="block font-sans text-sm font-semibold text-near-black mb-1.5"
              >
                Your name
              </label>
              <input
                id="sc-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-light-gray bg-white px-4 py-2.5 text-base text-near-black focus:outline-none focus:border-primary-green rounded-md transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="sc-email"
                className="block font-sans text-sm font-semibold text-near-black mb-1.5"
              >
                Email
              </label>
              <input
                id="sc-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-light-gray bg-white px-4 py-2.5 text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green rounded-md transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-semibold text-near-black mb-2">
                Your role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    aria-pressed={role === r.value}
                    className={[
                      "border-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-center",
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

            <div>
              <label
                htmlFor="sc-phone"
                className="block font-sans text-sm font-semibold text-near-black mb-1.5"
              >
                Phone (optional)
              </label>
              <input
                id="sc-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-light-gray bg-white px-4 py-2.5 text-base text-near-black focus:outline-none focus:border-primary-green rounded-md transition-colors"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer rounded-md border-2 border-warm-gold/50 bg-warm-gold/10 p-3.5">
              <input
                type="checkbox"
                required
                checked={confirmedAccurate}
                onChange={(e) => setConfirmedAccurate(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary-green shrink-0"
              />
              <span className="font-sans text-xs text-near-black leading-relaxed">
                <strong>
                  I confirm my answers accurately reflect this property.
                </strong>{" "}
                I understand anything left unchecked counts as a &ldquo;no,&rdquo;
                and a property can legitimately score low.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={optedIn}
                onChange={(e) => setOptedIn(e.target.checked)}
                className="mt-1 h-4 w-4 accent-primary-green shrink-0"
              />
              <span className="font-sans text-xs text-charcoal/80 leading-relaxed">
                Send me the BNHG operator newsletter.
              </span>
            </label>

            {error && (
              <div className="bg-terracotta/10 border border-terracotta/30 text-terracotta text-sm px-4 py-2.5 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !confirmedAccurate}
              className="w-full inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark text-white font-semibold px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {submitting ? "Unlocking..." : "Show My Score"}
            </button>

            {siteKey && (
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  options={{ size: "invisible" }}
                />
              </div>
            )}

            <p className="font-sans text-[11px] text-charcoal/60 text-center leading-relaxed pt-1">
              We will not share your information. By submitting you agree to be
              contacted by Be Nice Hospitality Group about co-living operations.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="block mx-auto font-sans text-xs text-charcoal/50 hover:text-charcoal underline-offset-2 hover:underline"
            >
              Go back and review my answers
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
