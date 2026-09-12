"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

interface BookingDetails {
  id: number;
  name: string;
  status: string;
  date: string;
  time: string;
  formattedDate: string;
  formattedTime: string;
  callType: string;
  requestedFounder: string | null;
  founderLabel: string | null;
  meetLink: string | null;
}

type ViewState = "loading" | "invalid" | "ready" | "cancelled" | "rescheduled";

export default function ManageBooking() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [view, setView] = useState<ViewState>("loading");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const params = () => new URLSearchParams({ id: id || "", email: email || "", token: token || "" });

  useEffect(() => {
    if (!id || !email || !token) {
      setView("invalid");
      return;
    }
    fetch(`/api/bookings/manage?${params().toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: BookingDetails) => {
        setBooking(data);
        setView(data.status === "cancelled" ? "cancelled" : "ready");
      })
      .catch(() => setView("invalid"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, email, token]);

  const fetchSlots = useCallback(
    async (date: string) => {
      if (!booking) return;
      setLoadingSlots(true);
      setSlots([]);
      try {
        const founderParam = booking.requestedFounder ? `&founder=${booking.requestedFounder}` : "";
        const res = await fetch(`/api/bookings/slots?date=${date}&call_type=${booking.callType}${founderParam}`);
        const data = await res.json();
        setSlots(data.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [booking]
  );

  async function handleCancel() {
    if (!confirm("Cancel this call? We'll let you know it's cancelled by email.")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/manage/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email, token }),
      });
      const data = await res.json();
      if (data.success) {
        setView("cancelled");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReschedule(time: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/manage/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email, token, date: newDate, time }),
      });
      const data = await res.json();
      if (data.success) {
        setView("rescheduled");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="min-h-[70vh] bg-cream py-24 px-6">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl font-semibold text-near-black mb-8 text-center">
          Manage Your Booking
        </h1>

        {view === "loading" && <p className="text-center text-charcoal/60">Loading your booking&hellip;</p>}

        {view === "invalid" && (
          <p className="text-center text-red-600">
            This link is invalid or has expired. Contact us directly if you need help with your booking.
          </p>
        )}

        {view === "cancelled" && (
          <div className="text-center">
            <p className="text-charcoal/80 mb-6">This call has been cancelled.</p>
            <Button href="/book" variant="primary">Book a New Call</Button>
          </div>
        )}

        {view === "rescheduled" && booking && (
          <div className="text-center">
            <p className="text-charcoal/80 mb-2">Your call has been rescheduled.</p>
            <p className="text-sm text-charcoal/60">Check your email for the updated details.</p>
          </div>
        )}

        {view === "ready" && booking && !rescheduling && (
          <div className="bg-white rounded-lg border border-[#e8e4dd] p-8">
            <p className="text-sm text-charcoal/60 uppercase tracking-wide mb-1">
              {booking.founderLabel ? `Call with ${booking.founderLabel}` : "Discovery Call"}
            </p>
            <p className="font-display text-xl font-semibold text-near-black mb-1">{booking.formattedDate}</p>
            <p className="text-charcoal/80 mb-6">{booking.formattedTime}</p>

            {booking.meetLink && (
              <a href={booking.meetLink} target="_blank" rel="noopener noreferrer" className="text-primary-green underline text-sm block mb-6">
                Join Google Meet
              </a>
            )}

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setRescheduling(true);
                  setNewDate("");
                  setSlots([]);
                }}
                disabled={submitting}
              >
                Reschedule
              </Button>
              <Button variant="terracotta" onClick={handleCancel} disabled={submitting}>
                Cancel Call
              </Button>
            </div>
          </div>
        )}

        {view === "ready" && booking && rescheduling && (
          <div className="bg-white rounded-lg border border-[#e8e4dd] p-8">
            <p className="font-display text-xl font-semibold text-near-black mb-4">Pick a new time</p>

            <label htmlFor="newDate" className="block text-sm text-charcoal/80 mb-2">Date</label>
            <input
              id="newDate"
              type="date"
              min={today}
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                if (e.target.value) fetchSlots(e.target.value);
              }}
              className="w-full border border-[#e8e4dd] rounded-md px-3 py-2 mb-6"
            />

            {loadingSlots && <p className="text-sm text-charcoal/60">Loading times&hellip;</p>}

            {!loadingSlots && newDate && slots.length === 0 && (
              <p className="text-sm text-charcoal/60 mb-4">No times available that day. Try another date.</p>
            )}

            {slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReschedule(s)}
                    className="border border-[#e8e4dd] rounded-md py-2 text-sm hover:border-primary-green hover:text-primary-green transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <button
              type="button"
              className="text-sm text-charcoal/60 underline"
              onClick={() => setRescheduling(false)}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
