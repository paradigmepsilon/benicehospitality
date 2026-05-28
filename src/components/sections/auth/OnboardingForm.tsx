"use client";

import { useMemo, useState, type FormEvent } from "react";

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

const BUSINESS_STAGE_OPTIONS = [
  { value: "none", label: "No properties or vehicles yet — exploring" },
  { value: "one", label: "Running one property/vehicle" },
  { value: "multiple", label: "Running multiple (or scaling)" },
] as const;

const HEARD_FROM_OPTIONS = [
  "A friend or colleague",
  "Google search",
  "LinkedIn",
  "Instagram or Threads",
  "YouTube",
  "Podcast",
  "An event or conference",
  "Other",
];

interface Props {
  userName: string;
  initial: {
    phone: string;
    serviceInterests: string[];
  };
}

export default function OnboardingForm({ userName, initial }: Props) {
  const [phone, setPhone] = useState(initial.phone);
  const [interests, setInterests] = useState<Set<ServiceValue>>(
    new Set(initial.serviceInterests as ServiceValue[]),
  );
  const [whyJoining, setWhyJoining] = useState("");
  const [goals, setGoals] = useState("");
  const [businessStage, setBusinessStage] = useState<string>("");
  const [heardFrom, setHeardFrom] = useState<string>("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [error, setError] = useState("");
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
  // Greet by first name once at the top of the form for a softer entry.
  const firstName = userName.split(" ")[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (interestArray.length === 0) {
      setError("Pick at least one area you're interested in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim() || undefined,
          serviceInterests: interestArray,
          whyJoining: whyJoining.trim() || undefined,
          goals: goals.trim() || undefined,
          businessStage: businessStage || undefined,
          heardFrom: heardFrom.trim() || undefined,
          marketingOptIn,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't save your details. Try again.");
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      // Hard nav so the just-set onboarded_at is reflected on the next
      // request to /account (server component re-runs the gate query).
      window.location.assign(data.redirect || "/account?welcome=1");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-light-gray rounded-lg p-7 md:p-8 space-y-6"
      noValidate
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-sans p-3 rounded">
          {error}
        </div>
      )}

      <p className="font-sans text-sm text-charcoal leading-relaxed">
        Hi {firstName} — these answers help us share the right resources with
        you. No wrong answers.
      </p>

      <fieldset>
        <legend className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-3">
          What are you interested in? <span className="normal-case tracking-normal text-charcoal/55 font-normal">(required, pick one or more)</span>
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

      <div>
        <label
          htmlFor="phone"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          Phone <span className="normal-case tracking-normal text-charcoal/55 font-normal">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label
          htmlFor="businessStage"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          Where are you today? <span className="normal-case tracking-normal text-charcoal/55 font-normal">(optional)</span>
        </label>
        <select
          id="businessStage"
          value={businessStage}
          onChange={(e) => setBusinessStage(e.target.value)}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black focus:outline-none focus:border-primary-green transition-colors"
        >
          <option value="">Select one&hellip;</option>
          {BUSINESS_STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="whyJoining"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          What brought you here? <span className="normal-case tracking-normal text-charcoal/55 font-normal">(optional)</span>
        </label>
        <textarea
          id="whyJoining"
          rows={3}
          value={whyJoining}
          onChange={(e) => setWhyJoining(e.target.value)}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors resize-y"
          placeholder="A specific problem, a referral, curiosity — anything."
          maxLength={2000}
        />
      </div>

      <div>
        <label
          htmlFor="goals"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          What would success look like? <span className="normal-case tracking-normal text-charcoal/55 font-normal">(optional)</span>
        </label>
        <textarea
          id="goals"
          rows={3}
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors resize-y"
          placeholder="A revenue number, a system you want to build, a habit you want to break."
          maxLength={2000}
        />
      </div>

      <div>
        <label
          htmlFor="heardFrom"
          className="block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70 mb-2"
        >
          How did you hear about us? <span className="normal-case tracking-normal text-charcoal/55 font-normal">(optional)</span>
        </label>
        <select
          id="heardFrom"
          value={heardFrom}
          onChange={(e) => setHeardFrom(e.target.value)}
          className="w-full bg-white border border-light-gray rounded-md px-4 py-3 font-sans text-base text-near-black focus:outline-none focus:border-primary-green transition-colors"
        >
          <option value="">Select one&hellip;</option>
          {HEARD_FROM_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-2 font-sans text-sm text-charcoal/80 cursor-pointer">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          className="mt-1 w-4 h-4 accent-primary-green flex-shrink-0"
        />
        <span>
          It&rsquo;s okay to email me occasional updates, resources, and event
          invites. You can unsubscribe any time.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-7 py-3.5 text-base min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving…" : "Finish setup"}
      </button>
    </form>
  );
}
