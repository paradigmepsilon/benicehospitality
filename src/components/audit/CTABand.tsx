"use client";

import { useRouter } from "next/navigation";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

type Audience = "owner" | "operator" | "default";

interface CTABandProps {
  token: string;
  hotelName: string;
  signalEligible: boolean;
  requesterRole?: string | null;
}

function audienceFromRole(role: string | null | undefined): Audience {
  if (role === "owner" || role === "gm") return "owner";
  if (role === "operator") return "operator";
  return "default";
}

interface AudienceCopy {
  headline: string;
  subtext: (hotelName: string) => string;
  buttonLabel: string;
  destination: (token: string) => string;
}

const AUDIENCE_COPY: Record<Audience, AudienceCopy> = {
  default: {
    headline: "You have gaps. Let's fix them together.",
    subtext: (hotelName) =>
      `Book a free 45-minute discovery call. Pick the dimension that matters most to ${hotelName}, and we'll arrive prepared with a deeper read on it.`,
    buttonLabel: "Book a Discovery Call",
    destination: (token) =>
      bookingUrl({
        auditToken: token,
        source: BOOKING_SOURCES.AUDIT_DEFAULT_CTA,
        utmSource: "tier-0-audit",
        utmMedium: "audit-cta",
      }),
  },
  owner: {
    headline: "You have gaps. Let's fix them together.",
    subtext: (hotelName) =>
      `Book a 45-minute Signal discovery call. We'll come ready with a deeper read on whichever dimension matters most for ${hotelName}.`,
    buttonLabel: "Book a Discovery Call",
    destination: (token) =>
      bookingUrl({
        auditToken: token,
        callType: "discovery_call_45",
        source: BOOKING_SOURCES.AUDIT_OWNER_CTA,
        utmSource: "tier-0-audit",
        utmMedium: "audit-cta",
      }),
  },
  operator: {
    headline: "You have gaps. The Host-to-Operator Method closes them.",
    subtext: () =>
      "The Foundation and Flagship courses use the same framework this audit just walked you through. Nice Host Network adds 2 live sessions every week to put it into practice.",
    buttonLabel: "See the Courses",
    destination: (token) =>
      `/education?audit_token=${token}&utm_source=tier-0-audit&utm_medium=audit-cta`,
  },
};

export default function CTABand({ token, hotelName, signalEligible, requesterRole }: CTABandProps) {
  const router = useRouter();
  const audience = audienceFromRole(requesterRole);
  const copy = AUDIENCE_COPY[audience];

  async function handleClick() {
    // Fire-and-forget: log the cta_clicked event before we navigate.
    // This also cancels any pending nurture sequence on the server.
    try {
      await fetch(`/api/audit/${token}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "cta_clicked", metadata: { audience } }),
        keepalive: true,
      });
    } catch {
      // non-blocking
    }
    router.push(copy.destination(token));
  }

  return (
    <div className="bg-near-black text-white rounded-lg p-8 md:p-12 text-center">
      <p className="text-warm-gold text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-3">
        Next Step
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 leading-tight">
        {copy.headline}
      </h2>
      <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
        {copy.subtext(hotelName)}
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark transition-colors text-white font-semibold px-8 py-4 rounded-lg text-base md:text-lg min-h-[56px] cursor-pointer"
      >
        {copy.buttonLabel}
        <svg className="ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      {signalEligible && audience !== "owner" && (
        <p className="text-white/50 text-xs md:text-sm mt-6 max-w-xl mx-auto leading-relaxed">
          AI search visibility looks like a soft spot for you. Ask us about Signal by BNHG during your call.
        </p>
      )}
    </div>
  );
}
