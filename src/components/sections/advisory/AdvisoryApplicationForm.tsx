"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const ASSET_CLASSES = [
  { value: "property", label: "Property (STR / LTR / Co-living)" },
  { value: "auto", label: "Auto (Turo / fleet)" },
  { value: "co_living", label: "Co-living buildings only" },
  { value: "multi_asset", label: "Multi-asset (property + auto + experiences)" },
] as const;

const UNIT_COUNTS = [
  { value: "1-4", label: "1 to 4" },
  { value: "5-9", label: "5 to 9" },
  { value: "10-14", label: "10 to 14" },
  { value: "15-24", label: "15 to 24" },
  { value: "25+", label: "25 or more" },
] as const;

const REVENUE_RANGES = [
  { value: "under_400k", label: "Under $400K" },
  { value: "400k_750k", label: "$400K to $750K" },
  { value: "750k_1_5m", label: "$750K to $1.5M" },
  { value: "1_5m_3m", label: "$1.5M to $3M" },
  { value: "over_3m", label: "Over $3M" },
] as const;

const TIMING_OPTIONS = [
  { value: "next_30", label: "Within 30 days" },
  { value: "next_60_90", label: "Next 60 to 90 days" },
  { value: "later_2026", label: "Later in 2026" },
] as const;

interface FormState {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  assetClass: string;
  unitCount: string;
  revenueRange: string;
  timing: string;
  topConstraint: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  assetClass: "",
  unitCount: "",
  revenueRange: "",
  timing: "",
  topConstraint: "",
};

export default function AdvisoryApplicationForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Required.";
    if (!form.email.trim()) next.email = "Required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Please enter a valid email.";
    if (!form.businessName.trim()) next.businessName = "Required.";
    if (!form.assetClass) next.assetClass = "Required.";
    if (!form.unitCount) next.unitCount = "Required.";
    if (!form.revenueRange) next.revenueRange = "Required.";
    if (!form.topConstraint.trim()) next.topConstraint = "Required.";
    else if (form.topConstraint.length > 1000)
      next.topConstraint = "Please keep this under 1,000 characters.";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setForm(EMPTY);
        turnstileRef.current?.reset();
      } else {
        setSubmitError(data.error || "Something went wrong. Try again in a moment.");
        turnstileRef.current?.reset();
      }
    } catch {
      setSubmitError("Something went wrong. Try again in a moment.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-light-gray rounded-md p-8 md:p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-green/10 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-primary-green"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-semibold text-near-black mb-3">
          We have your application.
        </h3>
        <p className="font-sans text-base text-charcoal/75 leading-relaxed max-w-md mx-auto">
          Della or Alex personally reads every application. You will hear back within two business days with either a calendar link for the discovery call or a clear no, with a reason. We never ghost.
        </p>
      </div>
    );
  }

  const inputBase =
    "w-full bg-white border px-4 py-3 font-sans text-base text-near-black placeholder:text-charcoal/40 focus:outline-none transition-colors duration-200 rounded-md";
  const inputClass = (field: keyof FormState) =>
    `${inputBase} ${errors[field] ? "border-red-400 focus:border-red-400" : "border-light-gray focus:border-primary-green"}`;
  const labelClass = "block font-sans text-sm font-semibold text-near-black mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-light-gray rounded-md p-6 md:p-8 space-y-6"
      noValidate
    >
      <div>
        <h3 className="font-display text-2xl md:text-3xl font-semibold text-near-black mb-2">
          Apply for Advisory
        </h3>
        <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
          Six fields plus a paragraph. Della or Alex reads every application personally.
        </p>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="adv-name" className={labelClass}>
            Your name <span className="text-primary-green">*</span>
          </label>
          <input
            id="adv-name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass("name")}
            autoComplete="name"
            required
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="adv-email" className={labelClass}>
            Email <span className="text-primary-green">*</span>
          </label>
          <input
            id="adv-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass("email")}
            autoComplete="email"
            required
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="adv-phone" className={labelClass}>
            Phone (optional)
          </label>
          <input
            id="adv-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass("phone")}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="adv-business" className={labelClass}>
            Business name <span className="text-primary-green">*</span>
          </label>
          <input
            id="adv-business"
            type="text"
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            className={inputClass("businessName")}
            required
          />
          {errors.businessName && (
            <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Asset class <span className="text-primary-green">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ASSET_CLASSES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("assetClass", opt.value)}
              aria-pressed={form.assetClass === opt.value}
              className={[
                "border-2 rounded-md px-4 py-3 text-sm font-medium transition-colors text-left",
                form.assetClass === opt.value
                  ? "border-primary-green bg-primary-green/5 text-near-black"
                  : "border-light-gray bg-white text-charcoal/75 hover:border-primary-green/40",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.assetClass && (
          <p className="mt-1 text-xs text-red-500">{errors.assetClass}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="adv-units" className={labelClass}>
            Units / vehicles <span className="text-primary-green">*</span>
          </label>
          <select
            id="adv-units"
            value={form.unitCount}
            onChange={(e) => update("unitCount", e.target.value)}
            className={inputClass("unitCount")}
            required
          >
            <option value="">Select a range</option>
            {UNIT_COUNTS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          {errors.unitCount && <p className="mt-1 text-xs text-red-500">{errors.unitCount}</p>}
        </div>
        <div>
          <label htmlFor="adv-revenue" className={labelClass}>
            Annual revenue <span className="text-primary-green">*</span>
          </label>
          <select
            id="adv-revenue"
            value={form.revenueRange}
            onChange={(e) => update("revenueRange", e.target.value)}
            className={inputClass("revenueRange")}
            required
          >
            <option value="">Select a range</option>
            {REVENUE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {errors.revenueRange && (
            <p className="mt-1 text-xs text-red-500">{errors.revenueRange}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="adv-constraint" className={labelClass}>
          What is the biggest constraint on your operation right now?{" "}
          <span className="text-primary-green">*</span>
        </label>
        <textarea
          id="adv-constraint"
          rows={5}
          value={form.topConstraint}
          onChange={(e) => update("topConstraint", e.target.value)}
          className={inputClass("topConstraint")}
          maxLength={1000}
          placeholder="One paragraph is fine. Specifics beat generalities."
          required
        />
        <div className="mt-1 flex items-center justify-between">
          <span>
            {errors.topConstraint && (
              <span className="text-xs text-red-500">{errors.topConstraint}</span>
            )}
          </span>
          <span className="text-xs text-charcoal/50">
            {form.topConstraint.length} / 1000
          </span>
        </div>
      </div>

      <div>
        <label className={labelClass}>When would you want to start?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {TIMING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("timing", opt.value === form.timing ? "" : opt.value)}
              aria-pressed={form.timing === opt.value}
              className={[
                "border-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-center",
                form.timing === opt.value
                  ? "border-primary-green bg-primary-green/5 text-near-black"
                  : "border-light-gray bg-white text-charcoal/75 hover:border-primary-green/40",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          options={{ size: "invisible" }}
        />
      )}

      {submitError && (
        <p className="font-sans text-sm text-red-600">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark text-white font-semibold px-6 py-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
      >
        {submitting ? "Sending..." : "Send Application"}
      </button>

      <p className="font-sans text-xs text-charcoal/55 text-center leading-relaxed">
        We answer every application within two business days, even the no.
      </p>
    </form>
  );
}
