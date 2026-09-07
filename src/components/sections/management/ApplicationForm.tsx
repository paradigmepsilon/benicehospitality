"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import {
  MANAGEMENT_OFFERS,
  SERVICE_AREA_STATES,
  isServiceAreaState,
  type ManagedAsset,
} from "@/lib/management/constants";

const CURRENT_STATUS: { value: string; label: string }[] = [
  { value: "idle", label: "Sitting idle" },
  { value: "self_managed", label: "Self-managed today" },
  { value: "on_platform", label: "Listed on a platform today" },
];

const TIMELINE: { value: string; label: string }[] = [
  { value: "now", label: "Ready now" },
  { value: "30_days", label: "Within 30 days" },
  { value: "90_days", label: "Within 90 days" },
  { value: "exploring", label: "Just exploring" },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  asset: ManagedAsset;
  assetCount: string;
  state: string;
  city: string;
  currentStatus: string;
  timeline: string;
  wants: string;
  heardFrom: string;
}

function initialAsset(param: string | null): ManagedAsset {
  return param === "rooms" ? "rooms" : "car";
}

/**
 * Posts to /api/management/apply. On success we hand off to /book (the
 * redirectTo the API returns); on failure we keep every field exactly as the
 * visitor left it and show one inline message above the submit button. The
 * form is never cleared on error, per the task brief.
 */
export default function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    email: "",
    phone: "",
    asset: initialAsset(searchParams.get("asset")),
    assetCount: "1",
    state: "",
    city: "",
    currentStatus: "",
    timeline: "",
    wants: "",
    heardFrom: "",
  }));
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every FormState field is a plain string (asset is a two-value string
  // union), so one string-valued setter covers text inputs, the select, and
  // the pill-button groups without fighting TypeScript's indexed-access
  // inference on a generic key. The cast on the returned object is the one
  // place that trusts the caller to pass a valid field name.
  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }) as FormState);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    update(e.target.name as keyof FormState, e.target.value);
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Please add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Please add a valid email address.";
    }
    if (!isServiceAreaState(form.state)) {
      return "Please choose a state. We manage assets in Georgia, Florida, South Carolina, North Carolina, Alabama, and Tennessee.";
    }
    const count = Number(form.assetCount);
    if (!Number.isFinite(count) || count < 1) {
      return "How many do you have? Please enter at least one.";
    }
    if (!form.currentStatus) return "Please tell us how the asset is used today.";
    if (!form.timeline) return "Please pick a timeline.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/management/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          asset: form.asset,
          assetCount: form.assetCount,
          state: form.state,
          city: form.city,
          currentStatus: form.currentStatus,
          timeline: form.timeline,
          wants: form.wants,
          heardFrom: form.heardFrom,
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirectTo);
        return;
      }
      setError(data.error || "Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "w-full bg-white border border-light-gray px-5 py-3.5 font-sans text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-primary-green transition-colors duration-200";
  const labelClass = "block font-sans text-sm font-medium text-near-black mb-2";

  function pillGroup(
    field: keyof FormState,
    options: { value: string; label: string }[],
  ) {
    return (
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const selected = form[field] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => update(field, opt.value)}
              className={[
                "font-sans text-sm px-4 py-2.5 border transition-all duration-200 min-h-11",
                selected
                  ? "bg-primary-green text-white border-primary-green"
                  : "bg-white text-charcoal/70 border-light-gray hover:border-primary-green hover:text-primary-green",
              ].join(" ")}
              aria-pressed={selected}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <AnimatedSection theme="light" className="pt-32 md:pt-40 pb-20 md:pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <AnimatedItem>
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-primary-green mb-6">
            Check your fit
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-6">
            Tell us about the asset.
          </h1>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-lg text-charcoal leading-snug mb-12">
            A few minutes now, then a call to confirm fit. Nothing is signed
            until you&rsquo;re ready.
          </p>
        </AnimatedItem>

        <AnimatedItem>
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
            />

            {/* Asset type */}
            <div>
              <p className={labelClass}>
                What are you looking to manage?{" "}
                <span className="text-primary-green">*</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(MANAGEMENT_OFFERS) as ManagedAsset[]).map((a) => {
                  const selected = form.asset === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => update("asset", a)}
                      className={[
                        "font-sans text-sm px-5 py-3 border transition-all duration-200 min-h-11",
                        selected
                          ? "bg-primary-green text-white border-primary-green"
                          : "bg-white text-charcoal/70 border-light-gray hover:border-primary-green hover:text-primary-green",
                      ].join(" ")}
                      aria-pressed={selected}
                    >
                      {a === "car" ? "A car" : "Rooms"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name / Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Your Name <span className="text-primary-green">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Alex Henry"
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address <span className="text-primary-green">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputBase}
                />
              </div>
            </div>

            {/* Phone / City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Atlanta"
                  className={inputBase}
                />
              </div>
            </div>

            {/* State / Asset count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="state" className={labelClass}>
                  State <span className="text-primary-green">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  className={inputBase}
                >
                  <option value="" disabled>
                    Select your state
                  </option>
                  {SERVICE_AREA_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="assetCount" className={labelClass}>
                  How Many? <span className="text-primary-green">*</span>
                </label>
                <input
                  id="assetCount"
                  name="assetCount"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={form.assetCount}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Current status */}
            <div>
              <p className={labelClass}>
                How is it used today?{" "}
                <span className="text-primary-green">*</span>
              </p>
              {pillGroup("currentStatus", CURRENT_STATUS)}
            </div>

            {/* Timeline */}
            <div>
              <p className={labelClass}>
                What&rsquo;s your timeline?{" "}
                <span className="text-primary-green">*</span>
              </p>
              {pillGroup("timeline", TIMELINE)}
            </div>

            {/* Wants */}
            <div>
              <label htmlFor="wants" className={labelClass}>
                What do you want from management?
              </label>
              <textarea
                id="wants"
                name="wants"
                rows={4}
                value={form.wants}
                onChange={handleChange}
                placeholder="Tell us what's prompting this, and anything else worth knowing before the call."
                className={inputBase}
              />
            </div>

            {/* Heard from */}
            <div>
              <label htmlFor="heardFrom" className={labelClass}>
                How did you hear about us?
              </label>
              <input
                id="heardFrom"
                name="heardFrom"
                type="text"
                value={form.heardFrom}
                onChange={handleChange}
                placeholder="Facebook group, a friend, a course, etc."
                className={inputBase}
              />
            </div>

            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                options={{ size: "invisible" }}
              />
            )}

            {error && (
              <p className="font-sans text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
