"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import WaitlistInlineForm from "./WaitlistInlineForm";

const CRR_BULLETS = [
  "The Host-to-Operator method retuned for Turo",
  "3 commitment tiers, same operator-grade depth",
  "Fleet-mix templates and SOPs included",
  "Drops in 2026",
];

const CRR_BODY =
  "The Host-to-Operator method retuned for Turo and rental-fleet operators. Same 3 commitment tiers, same operator-grade depth.";

interface CarRentalRichesWaitlistTriggerProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "terracotta" | "light";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export default function CarRentalRichesWaitlistTrigger({
  children,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className,
}: CarRentalRichesWaitlistTriggerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="crr-waitlist-backdrop"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crr-waitlist-title"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-near-black/60 backdrop-blur-sm cursor-default"
            />

            <motion.div
              key="crr-waitlist-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white border border-warm-gold/50 rounded-lg shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-charcoal/55 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>

              <div className="p-7 md:p-10">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 border border-primary-green/60 text-primary-green rounded-full px-2.5 py-1 font-sans text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase">
                    Car Rental Riches
                  </span>
                  <span className="ml-2 inline-flex items-center gap-1.5 border border-warm-gold/70 text-warm-gold-dark rounded-full px-2.5 py-1 font-sans text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase">
                    Coming soon
                  </span>
                </div>

                <h2
                  id="crr-waitlist-title"
                  className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4"
                >
                  Car Rental Riches curriculum
                </h2>

                <p className="font-sans text-base text-charcoal/80 leading-relaxed mb-6">
                  {CRR_BODY}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {CRR_BULLETS.map((b) => (
                    <li
                      key={b}
                      className="flex gap-3 font-sans text-sm md:text-base text-charcoal/85 leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-warm-gold shrink-0"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <WaitlistInlineForm
                  courseSlug="car-rental-riches"
                  tier="interest"
                  successCourseName="Car Rental Riches"
                  onCancel={() => setOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
