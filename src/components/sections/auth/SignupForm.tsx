"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import OAuthButtons, {
  type EnabledProviders,
} from "@/components/sections/auth/OAuthButtons";
import posthog from "posthog-js";

// Mirrors the LOCKED vocabulary in src/lib/community-auth.ts. Kept inline as
// a labelled tuple so the form copy can diverge from the DB enum names
// without churn on either side.
const SERVICE_OPTIONS = [
  {
    value: "rental_properties",
    label: "Rental Properties",
    helper: "Short-term, mid-term, and long-term residential rentals.",
  },
  {
    value: "independent_hotels",
    label: "Independent Hotels",
    helper: "Boutique and independent hospitality operators.",
  },
  {
    value: "autos",
    label: "Autos",
    helper: "Vehicle rental and fleet operations.",
  },
] as const;

type ServiceValue = (typeof SERVICE_OPTIONS)[number]["value"];

interface Props {
  enabledProviders?: EnabledProviders;
}

const NO_PROVIDERS: EnabledProviders = {
  google: false,
  facebook: false,
  linkedin: false,
};

export default function SignupForm({
  enabledProviders = NO_PROVIDERS,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Use a Set so toggling is O(1) and the order of selection doesn't matter.
  // We materialize an array only when posting.
  const [interests, setInterests] = useState<Set<ServiceValue>>(new Set());
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleInterest(value: ServiceValue) {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const interestArray = useMemo(() => Array.from(interests), [interests]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !phone || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (interestArray.length === 0) {
      setError("Pick at least one area you're interested in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          serviceInterests: interestArray,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Signup failed. Try again.");
        setLoading(false);
        return;
      }
      posthog.capture("user_signed_up", {
        method: "password",
        service_interests: interestArray,
      });
      setSubmitted(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const hasOAuth =
    enabledProviders.google ||
    enabledProviders.facebook ||
    enabledProviders.linkedin;

  // Post-submit success state. Email send happens out-of-band and the user
  // can't proceed without clicking the verification link, so we don't
  // navigate anywhere from here.
  if (submitted) {
    return (
      <div className="bg-white border border-light-gray rounded-lg p-7 md:p-8 space-y-4 text-center">
        <h2 className="font-display text-2xl text-deep-teal font-semibold">
          Check your inbox.
        </h2>
        <p className="font-sans text-base text-charcoal leading-relaxed">
          We sent a verification link to <strong>{email}</strong>. Click the
          button in that email to finish setting up your account. The link is
          good for 24 hours.
        </p>
        <p className="font-sans text-xs text-charcoal/60">
          Don&rsquo;t see it? Check spam, or wait a minute and refresh your
          inbox.
        </p>
        <div className="pt-4 border-t border-light-gray">
          <Link
            href="/login"
            className="font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasOAuth && (
        <OAuthButtons next="/account" enabledProviders={enabledProviders} />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-light-gray rounded-lg p-7 md:p-8 space-y-5"
        noValidate
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-sans p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
          >
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-light-gray rounded-md px-4 py-3 pr-16 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
              placeholder="At least 10 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-xs font-semibold text-charcoal/60 hover:text-primary-green"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <fieldset>
          <legend className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-3">
            What are you interested in? <span className="normal-case tracking-normal text-charcoal/55 font-normal">(pick one or more)</span>
          </legend>
          <div className="space-y-2">
            {SERVICE_OPTIONS.map((opt) => {
              const checked = interests.has(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    checked
                      ? "border-primary-green bg-primary-green/5"
                      : "border-light-gray hover:border-charcoal/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInterest(opt.value)}
                    className="mt-1 w-4 h-4 accent-primary-green flex-shrink-0"
                  />
                  <span className="flex-1">
                    <span className="block font-sans text-sm font-semibold text-near-black">
                      {opt.label}
                    </span>
                    <span className="block font-sans text-xs text-charcoal/65 mt-0.5">
                      {opt.helper}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-7 py-3.5 text-base min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating your account…" : "Create my account"}
        </button>

        <p className="font-sans text-xs text-charcoal/55 text-center leading-relaxed">
          We&rsquo;ll send a verification link before you can sign in.
        </p>
      </form>
    </div>
  );
}
