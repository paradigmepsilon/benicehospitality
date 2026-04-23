"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { TIER_ZERO_RESOURCES } from "@/lib/tier-zero-resources";

const INTERESTS = [
  "Free Resource",
  "Diagnostic",
  "Implementation Help",
  "Guestally Demo",
  "Just Exploring",
];

function slugToResourceName(slug: string | null): string | null {
  if (!slug) return null;
  const match = TIER_ZERO_RESOURCES.find((r) => r.slug === slug);
  return match ? match.name : null;
}

const ROOM_COUNTS = ["10–20 rooms", "21–35 rooms", "36–50 rooms", "50+ rooms"];

interface FormState {
  name: string;
  email: string;
  phone: string;
  hotelName: string;
  location: string;
  roomCount: string;
  interests: string[];
  message: string;
}

export default function ContactForm() {
  const searchParams = useSearchParams();
  const prefilledResource = slugToResourceName(searchParams.get("resource"));
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [honeypot, setHoneypot] = useState("");
  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    email: "",
    phone: "",
    hotelName: "",
    location: "",
    roomCount: "",
    interests: prefilledResource ? ["Free Resource"] : [],
    message: prefilledResource
      ? `I'd like to request the ${prefilledResource}.`
      : "",
  }));
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validate = (fields?: (keyof FormState)[]) => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    const check = fields || (["name", "email", "hotelName"] as (keyof FormState)[]);

    if (check.includes("name") && !form.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (check.includes("email")) {
      if (!form.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }
    if (check.includes("hotelName") && !form.hotelName.trim()) {
      newErrors.hotelName = "Hotel name is required.";
    }

    return newErrors;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const field = e.target.name as keyof FormState;
    setTouched((prev) => new Set(prev).add(field));
    const fieldErrors = validate([field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldErrors[field]) {
        next[field] = fieldErrors[field];
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const field = e.target.name as keyof FormState;
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(new Set(["name", "email", "hotelName"]));
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          hotelName: form.hotelName,
          location: form.location,
          roomCount: form.roomCount,
          interests: form.interests.join(", "),
          message: form.message,
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        turnstileRef.current?.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputBase =
    "w-full bg-white border px-5 py-3.5 font-sans text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none transition-colors duration-200";

  const inputClass = (field?: keyof FormState) =>
    `${inputBase} ${errors[field!] ? "border-red-400 focus:border-red-400" : "border-light-gray focus:border-primary-green"}`;

  const labelClass = "block font-sans text-sm font-medium text-near-black mb-2";

  const handleCloseModal = () => {
    setStatus("idle");
    setForm({
      name: "",
      email: "",
      phone: "",
      hotelName: "",
      location: "",
      roomCount: "",
      interests: [],
      message: "",
    });
    setErrors({});
    setTouched(new Set());
  };

  return (
    <>
      {status === "success" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label="Confirmation"
        >
          <div
            className="bg-white rounded-lg p-6 sm:p-10 max-w-md w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-px bg-primary-green mx-auto mb-8" />
            <h2 className="font-display text-3xl font-semibold text-near-black mb-4">
              Message Received
            </h2>
            <p className="font-sans text-base text-charcoal/70 mb-8 leading-relaxed">
              Thank you, {form.name}. We&apos;ll be in touch within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/" variant="primary">
                Back to Home
              </Button>
              <Button onClick={handleCloseModal} variant="ghost" className="text-charcoal! border-light-gray! hover:bg-near-black/5!">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    <AnimatedSection theme="off-white" className="py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Form */}
        <div className="lg:col-span-2">
          <AnimatedItem>
            <h2 className="font-display text-3xl font-semibold text-near-black mb-8">
              Tell Us About Your Property
            </h2>
          </AnimatedItem>

          {prefilledResource && (
            <AnimatedItem>
              <div className="mb-6 border border-primary-green/40 bg-primary-green/5 p-4 rounded-lg">
                <p className="font-sans text-sm text-near-black">
                  <span className="font-semibold">Requesting:</span>{" "}
                  {prefilledResource}
                </p>
                <p className="font-sans text-xs text-charcoal/60 mt-1">
                  We&apos;ve pre-selected &ldquo;Free Resource&rdquo; below. Just fill out the rest and hit send.
                </p>
              </div>
            </AnimatedItem>
          )}

          <AnimatedItem>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Honeypot — hidden from real users */}
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

              {/* Row 1 */}
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
                    onBlur={handleBlur}
                    placeholder="Alex Henry"
                    className={inputClass("name")}
                  />
                  {errors.name && touched.has("name") && (
                    <p className="font-sans text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
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
                    onBlur={handleBlur}
                    placeholder="you@yourhotel.com"
                    className={inputClass("email")}
                  />
                  {errors.email && touched.has("email") && (
                    <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
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
                  className={inputClass()}
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="hotelName" className={labelClass}>
                    Hotel Name <span className="text-primary-green">*</span>
                  </label>
                  <input
                    id="hotelName"
                    name="hotelName"
                    type="text"
                    required
                    value={form.hotelName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="The Magnolia Inn"
                    className={inputClass("hotelName")}
                  />
                  {errors.hotelName && touched.has("hotelName") && (
                    <p className="font-sans text-xs text-red-500 mt-1">{errors.hotelName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="location" className={labelClass}>
                    Hotel Location{" "}
                    <span className="text-charcoal/40 font-normal">
                      (City, State)
                    </span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Savannah, GA"
                    className={inputClass()}
                  />
                </div>
              </div>

              {/* Room Count */}
              <div>
                <label htmlFor="roomCount" className={labelClass}>
                  Approximate Room Count
                </label>
                <select
                  id="roomCount"
                  name="roomCount"
                  value={form.roomCount}
                  onChange={handleChange}
                  className={inputClass()}
                >
                  <option value="">Select room count</option>
                  {ROOM_COUNTS.map((rc) => (
                    <option key={rc} value={rc}>
                      {rc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interests */}
              <div>
                <p className={labelClass}>What Are You Most Interested In?</p>
                <div className="flex flex-wrap gap-3">
                  {INTERESTS.map((interest) => {
                    const selected = form.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterest(interest)}
                        className={[
                          "font-sans text-sm px-4 py-2.5 border transition-all duration-200 min-h-11",
                          selected
                            ? "bg-primary-green text-white border-primary-green"
                            : "bg-white text-charcoal/70 border-light-gray hover:border-primary-green hover:text-primary-green",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={selected}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className={labelClass}>
                  Anything Else We Should Know?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your property, your biggest challenge right now, or what you're hoping to get out of a conversation..."
                  className={inputClass()}
                />
              </div>

              {status === "error" && (
                <p className="font-sans text-sm text-red-600">
                  Something went wrong. Please try again or email us directly
                  at{" "}
                  <a
                    href="mailto:admin@benicehospitality.com"
                    className="underline"
                  >
                    admin@benicehospitality.com
                  </a>
                </p>
              )}

              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                options={{ size: "invisible" }}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </AnimatedItem>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <AnimatedItem>
            <div className="bg-white border border-light-gray rounded-lg p-7">
              <h3 className="font-display text-xl font-semibold text-near-black mb-5">
                Other Ways to Reach Us
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="font-sans text-xs text-charcoal/40 uppercase tracking-widest font-semibold mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:admin@benicehospitality.com"
                    className="font-sans text-sm text-primary-green hover:text-primary-green-dark transition-colors"
                  >
                    admin@benicehospitality.com
                  </a>
                </div>
                <div>
                  <p className="font-sans text-xs text-charcoal/40 uppercase tracking-widest font-semibold mb-1">
                    Location
                  </p>
                  <p className="font-sans text-sm text-charcoal/80">
                    Hapeville, Georgia
                  </p>
                </div>
                <div>
                  <p className="font-sans text-xs text-charcoal/40 uppercase tracking-widest font-semibold mb-1">
                    Response Time
                  </p>
                  <p className="font-sans text-sm text-charcoal/80">
                    We typically respond within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <div className="bg-near-black rounded-lg p-7">
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                Not Sure Where to Start?
              </h3>
              <p className="font-sans text-sm text-white/65 leading-relaxed mb-5">
                Request a free resource for your property. We&apos;ll
                send you a custom analysis of your top opportunities.
                No call required to get started.
              </p>
              <p className="font-sans text-xs text-white/40 italic">
                Just select &ldquo;Free Resource&rdquo; in the form.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </div>
    </AnimatedSection>
    </>
  );
}
