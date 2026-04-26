"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { fadeUp } from "@/lib/motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";

type Step = "date" | "time" | "details" | "success";

interface FormState {
  name: string;
  email: string;
  phone: string;
  hotelName: string;
  message: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState<Step>("date");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<Set<number>>(new Set());

  const turnstileRef = useRef<TurnstileInstance>(null);
  const [honeypot, setHoneypot] = useState("");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    hotelName: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Fetch available days for current month (single efficient API call)
  useEffect(() => {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    fetch(`/api/bookings/available-days?month=${monthStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.availableDays) {
          setAvailableDays(new Set(data.availableDays));
        }
      })
      .catch(() => {});
  }, [currentMonth, currentYear]);

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/bookings/slots?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleDateSelect = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setStep("time");
    fetchSlots(dateStr);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("details");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name as keyof FormState;
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!form.hotelName.trim()) errors.hotelName = "Hotel name is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          hotelName: form.hotelName,
          message: form.message,
          date: selectedDate,
          time: selectedTime,
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("success");
        turnstileRef.current?.reset();
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const canGoPrev = currentYear > today.getFullYear() || currentMonth > today.getMonth();

  // Calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = new Date().toLocaleDateString("en-CA");

  const inputBase =
    "w-full bg-white border px-5 py-3.5 font-sans text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none transition-colors duration-200";

  const inputClass = (field?: keyof FormState) =>
    `${inputBase} ${formErrors[field!] ? "border-red-400 focus:border-red-400" : "border-light-gray focus:border-primary-green"}`;

  const labelClass = "block font-sans text-sm font-medium text-near-black mb-2";

  return (
    <AnimatedSection theme="off-white" className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Step indicator */}
        {step !== "success" && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex items-center justify-center gap-3 mb-12">
              {[
                { key: "date", label: "Date" },
                { key: "time", label: "Time" },
                { key: "details", label: "Details" },
              ].map((s, i) => (
                <div key={s.key} className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (s.key === "date") { setStep("date"); setSelectedTime(null); }
                      if (s.key === "time" && selectedDate) setStep("time");
                      if (s.key === "details" && selectedTime) setStep("details");
                    }}
                    className={[
                      "flex items-center gap-2 text-sm font-sans font-medium transition-colors",
                      step === s.key
                        ? "text-primary-green"
                        : (s.key === "date" || (s.key === "time" && selectedDate) || (s.key === "details" && selectedTime))
                          ? "text-charcoal/60 hover:text-charcoal"
                          : "text-charcoal/30 cursor-default",
                    ].join(" ")}
                    disabled={
                      (s.key === "time" && !selectedDate) ||
                      (s.key === "details" && !selectedTime)
                    }
                  >
                    <span
                      className={[
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors",
                        step === s.key
                          ? "border-primary-green bg-primary-green text-white"
                          : (s.key === "date" && (step === "time" || step === "details")) ||
                            (s.key === "time" && step === "details")
                            ? "border-primary-green/40 text-primary-green/60"
                            : "border-charcoal/20 text-charcoal/30",
                      ].join(" ")}
                    >
                      {(s.key === "date" && (step === "time" || step === "details")) ||
                       (s.key === "time" && step === "details")
                        ? "✓"
                        : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < 2 && (
                    <div className="w-8 h-px bg-charcoal/15" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Calendar */}
        {step === "date" && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="bg-white border border-light-gray rounded-lg p-6 sm:p-8 max-w-lg mx-auto">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  disabled={!canGoPrev}
                  className="p-2 rounded-lg hover:bg-off-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="font-display text-xl font-semibold text-near-black">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-off-white transition-colors"
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map((day) => (
                  <div key={day} className="text-center text-xs font-sans font-semibold text-charcoal/40 uppercase tracking-wider py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the 1st */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isPast = dateStr < todayStr;
                  const isAvailable = availableDays.has(day);
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      disabled={isPast || !isAvailable}
                      className={[
                        "aspect-square rounded-lg text-sm font-sans font-medium transition-all duration-200 relative",
                        isSelected
                          ? "bg-primary-green text-white shadow-sm"
                          : isAvailable && !isPast
                            ? "text-near-black hover:bg-primary-green/10 hover:text-primary-green"
                            : "text-charcoal/20 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {day}
                      {isAvailable && !isPast && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-green" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-sans text-charcoal/40 text-center mt-6">
                All times are in Eastern Time (ET)
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Time slots */}
        {step === "time" && selectedDate && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-6">
                <p className="font-sans text-sm text-charcoal/60">
                  {formatDate(selectedDate)}
                </p>
                <button
                  onClick={() => { setStep("date"); setSelectedTime(null); }}
                  className="font-sans text-xs text-primary-green hover:text-primary-green-dark transition-colors mt-1"
                >
                  Change date
                </button>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center gap-2 text-sm text-charcoal/50 py-12">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading available times...
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 bg-white border border-light-gray rounded-lg">
                  <p className="font-sans text-sm text-charcoal/60 mb-2">
                    No available times on this date.
                  </p>
                  <button
                    onClick={() => { setStep("date"); setSelectedTime(null); }}
                    className="font-sans text-sm text-primary-green hover:text-primary-green-dark transition-colors"
                  >
                    Choose another date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={[
                        "py-3 px-4 rounded-lg text-sm font-sans font-medium border transition-all duration-200",
                        selectedTime === time
                          ? "bg-primary-green text-white border-primary-green shadow-sm"
                          : "bg-white text-charcoal border-light-gray hover:border-primary-green hover:text-primary-green",
                      ].join(" ")}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Details form */}
        {step === "details" && selectedDate && selectedTime && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="max-w-lg mx-auto">
              {/* Selected date/time summary */}
              <div className="bg-white border border-light-gray rounded-lg p-5 mb-8 text-center">
                <p className="font-display text-lg font-semibold text-near-black">
                  {formatDate(selectedDate)}
                </p>
                <p className="font-sans text-sm text-primary-green font-medium mt-1">
                  {formatTime(selectedTime)} ET &middot; 1 hour
                </p>
                <button
                  onClick={() => setStep("time")}
                  className="font-sans text-xs text-charcoal/40 hover:text-charcoal/60 transition-colors mt-2"
                >
                  Change time
                </button>
              </div>

              <h3 className="font-display text-2xl font-semibold text-near-black mb-6">
                Your Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                      className={inputClass("name")}
                    />
                    {formErrors.name && (
                      <p className="font-sans text-xs text-red-500 mt-1">{formErrors.name}</p>
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
                      placeholder="you@yourhotel.com"
                      className={inputClass("email")}
                    />
                    {formErrors.email && (
                      <p className="font-sans text-xs text-red-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

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
                      className={inputClass()}
                    />
                  </div>
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
                      placeholder="The Magnolia Inn"
                      className={inputClass("hotelName")}
                    />
                    {formErrors.hotelName && (
                      <p className="font-sans text-xs text-red-500 mt-1">{formErrors.hotelName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Anything you&apos;d like us to know?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your property or what you'd like to discuss..."
                    className={inputClass()}
                  />
                </div>

                {error && (
                  <p className="font-sans text-sm text-red-600">
                    {error}{" "}
                    <a href="/contact" className="underline">
                      Contact us directly
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
                  disabled={submitting}
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {step === "success" && selectedDate && selectedTime && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-semibold text-near-black mb-4">
                You&apos;re All Set
              </h2>
              <p className="font-sans text-base text-charcoal/70 leading-relaxed mb-2">
                Your discovery call has been booked for:
              </p>
              <div className="bg-white border border-light-gray rounded-lg p-5 my-6">
                <p className="font-display text-lg font-semibold text-near-black">
                  {formatDate(selectedDate)}
                </p>
                <p className="font-sans text-sm text-primary-green font-medium mt-1">
                  {formatTime(selectedTime)} ET &middot; 1 hour
                </p>
              </div>
              <p className="font-sans text-sm text-charcoal/60 mb-8">
                We&apos;ve sent a confirmation to <strong>{form.email}</strong>.
                We&apos;ll follow up with call details before your appointment.
              </p>
              <Button href="/" variant="primary">
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}

        {/* Footer link */}
        <div className="text-center mt-10">
          <p className="font-sans text-sm text-charcoal/40">
            Prefer to reach out directly?{" "}
            <a href="/contact" className="text-primary-green hover:text-primary-green-dark transition-colors">
              Contact us here
            </a>
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}
