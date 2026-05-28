"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Shown once on /account when the URL has ?welcome=1 (set by the onboarding
// submit redirect). The modal renders inside a portal-free fixed overlay;
// dismissing it does a router.replace to strip the query string so refresh
// or back-nav doesn't reopen the modal. Chose a query param over a cookie
// because it's naturally one-shot and needs no server-side cleanup.
export default function WelcomeModal({ userName }: { userName: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showFromUrl = searchParams.get("welcome") === "1";
  // Mirror the URL flag into local state so dismissing doesn't fight the
  // server-rendered initial value.
  const [open, setOpen] = useState(showFromUrl);

  // ESC-to-close is the expected affordance for any modal; we add a single
  // listener while open and tear down on close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    setOpen(false);
    // router.replace (not push) so the welcome state doesn't leave a back-
    // stack entry that re-opens the modal.
    router.replace("/account");
  }

  if (!open) return null;
  const firstName = userName.split(" ")[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      onClick={handleClose}
    >
      <div
        // Stop click bubbling so the user can interact with the card without
        // triggering the backdrop close.
        onClick={(e) => e.stopPropagation()}
        className="bg-cream border border-light-gray rounded-lg shadow-2xl max-w-lg w-full p-8 md:p-10 text-center"
      >
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-5">
          You&rsquo;re in
        </p>
        <h2
          id="welcome-modal-title"
          className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-5"
        >
          Welcome, {firstName}.
        </h2>
        <p className="font-sans text-base text-charcoal leading-relaxed mb-3">
          Thanks for telling us a little about why you&rsquo;re here. This
          is your home base — your courses, the Nice Host Network community,
          and everything you unlock will live in here.
        </p>
        <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-7">
          Nothing fancy to do next. Look around, follow what catches your
          attention, and we&rsquo;ll send a note when something we&rsquo;ve
          built lines up with your goals.
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="w-full sm:w-auto inline-flex items-center justify-center bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-8 py-3.5 text-base min-h-[48px] transition-colors"
        >
          Get started
        </button>
      </div>
    </div>
  );
}
