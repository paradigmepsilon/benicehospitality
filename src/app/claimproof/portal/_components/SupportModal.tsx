"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Support affordance for the portal nav: a pill button (styled to match the
 * other nav links) that opens a small dark-glass modal with the support email
 * and a short note. The "Email support" action pre-fills a bracketed subject
 * tag so every inbound message is trivially filterable in the mailbox.
 *
 * Self-contained (owns its own open state) so it can drop straight into the
 * server-rendered layout in place of the old mailto link. Carries cp-noprint
 * so it never shows up in a printed tool PDF.
 */

const SUPPORT_EMAIL = "admin@benicehospitality.com";
const SUBJECT_TAG = "[Claim Proof Support]";
// Encoded "[Claim Proof Support] " — trailing space leaves the cursor ready
// for the user to type their topic after the filterable tag.
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=%5BClaim%20Proof%20Support%5D%20`;

export default function SupportModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Portal to document.body: the portal header uses backdrop-blur, which makes
  // `position: fixed` resolve against the header bar instead of the viewport,
  // pinning the modal to the top. Rendering into body escapes that container.
  useEffect(() => setMounted(true), []);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Lock page scroll while open, and focus the close button on entrance.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full px-3.5 py-1.5 font-sans text-sm text-white/60 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
      >
        Support
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="cp-support-backdrop"
            className="cp-noprint fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cp-support-title"
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close support"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
              key="cp-support-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#2A2932] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl"
            >
              {/* Close button */}
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>

              <div className="p-7 md:p-8">
                <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8BA5BE]">
                  Support
                </p>
                <h2
                  id="cp-support-title"
                  className="mb-3 font-display text-2xl font-semibold leading-tight text-white"
                >
                  Need a hand?
                </h2>
                <p className="mb-6 font-sans text-sm leading-relaxed text-white/70">
                  We&rsquo;re a small team and we read every message. Email us
                  what&rsquo;s going on with your claim and we&rsquo;ll get back
                  to you fast.
                </p>

                <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="font-sans text-[11px] uppercase tracking-wider text-white/45">
                    Email us
                  </p>
                  <p className="select-all font-sans text-sm font-semibold text-white">
                    {SUPPORT_EMAIL}
                  </p>
                </div>

                <a
                  href={MAILTO}
                  className="flex w-full items-center justify-center rounded-full bg-[#E19C63] px-5 py-2.5 font-sans text-sm font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183]"
                >
                  Email support
                </a>
                <p className="mt-3 font-sans text-xs leading-relaxed text-white/40">
                  Your message opens with the subject{" "}
                  <span className="font-mono text-white/55">{SUBJECT_TAG}</span>{" "}
                  so we can route it fast. Add your topic after it.
                </p>
              </div>
            </motion.div>
          </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
