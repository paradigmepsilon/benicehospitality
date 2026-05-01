"use client";

import { useRouter } from "next/navigation";

interface CTABandProps {
  token: string;
  hotelName: string;
  signalEligible: boolean;
}

export default function CTABand({ token, hotelName, signalEligible }: CTABandProps) {
  const router = useRouter();

  async function handleClick() {
    // Fire-and-forget: log the cta_clicked event before we navigate.
    // This also cancels any pending nurture sequence on the server.
    try {
      await fetch(`/api/audit/${token}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "cta_clicked" }),
        keepalive: true,
      });
    } catch {
      // non-blocking
    }
    router.push(`/book?audit_token=${token}&utm_source=tier-0-audit&utm_medium=audit-cta`);
  }

  return (
    <div className="bg-near-black text-white rounded-lg p-8 md:p-12 text-center">
      <p className="text-warm-gold text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-3">
        Next Step
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 leading-tight">
        You have gaps. Let&apos;s fix them together.
      </h2>
      <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
        Book a free 40-minute strategy call. Pick the dimension that matters most to {hotelName}, and we&apos;ll arrive prepared with a deeper read on it.
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark transition-colors text-white font-semibold px-8 py-4 rounded-lg text-base md:text-lg min-h-[56px] cursor-pointer"
      >
        Book My 40-Minute Strategy Call
        <svg className="ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      {signalEligible && (
        <p className="text-white/50 text-xs md:text-sm mt-6 max-w-xl mx-auto leading-relaxed">
          AI search visibility looks like a high-leverage area for you. Ask us about Signal by BNHG during your call.
        </p>
      )}
    </div>
  );
}
