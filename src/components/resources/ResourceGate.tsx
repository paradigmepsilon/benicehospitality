"use client";

import { FormEvent, ReactNode, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "investor", label: "Investor" },
  { value: "manager", label: "Property Manager" },
  { value: "considering", label: "Considering buying" },
] as const;

/**
 * Front-door gate. When `unlocked` (logged in or a valid unlock cookie), it
 * renders the tool. Otherwise it renders an inline name + email capture card;
 * on success it sets the unlock cookie server-side and refreshes so the server
 * re-renders with the tool visible.
 */
export default function ResourceGate({
  slug,
  toolName,
  unlocked,
  children,
}: {
  slug: string;
  toolName: string;
  unlocked: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [optedIn, setOptedIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (unlocked) return <>{children}</>;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    const turnstileToken = turnstileRef.current?.getResponse();
    if (siteKey && !turnstileToken) {
      setError("Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/resources/${slug}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: role || undefined,
          phone: phone.trim() || undefined,
          opted_in_newsletter: optedIn,
          turnstile_token: turnstileToken || "no-turnstile-configured",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Something went wrong. Please try again.");
        turnstileRef.current?.reset();
        return;
      }

      // Cookie is set on the response; refresh so the server re-renders unlocked.
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="bg-white rounded-lg shadow-xl border border-light-gray/70 overflow-hidden">
        <div className="p-6 sm:p-8">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2">
            Free · 1 quick step
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-near-black leading-tight mb-3">
            Get instant access to the {toolName}
          </h2>
          <p className="font-sans text-sm text-charcoal/70 leading-relaxed mb-6">
            Tell us where to send it. You will unlock this tool right here, and we
            will email you a link so you can pick up where you left off any time.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="rg-name"
                className="block font-sans text-sm font-semibold text-near-black mb-1.5"
              >
                Your name
              </label>
              <input
                id="rg-name"
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
                htmlFor="rg-email"
                className="block font-sans text-sm font-semibold text-near-black mb-1.5"
              >
                Email
              </label>
              <input
                id="rg-email"
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
                Your role <span className="font-normal text-charcoal/50">(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(role === r.value ? "" : r.value)}
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
              disabled={submitting}
              className="w-full inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark text-white font-semibold px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {submitting ? "Unlocking..." : `Unlock the ${toolName}`}
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
          </form>
        </div>
      </div>
    </div>
  );
}
