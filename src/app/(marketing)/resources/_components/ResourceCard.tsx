"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { WaitlistTier } from "@/lib/validation/waitlist";
import WaitlistInlineForm from "@/components/sections/waitlist/WaitlistInlineForm";

export type Access = "free" | "free-email" | "labs-pass" | "course";

const ACCESS_META: Record<
  Access,
  { label: string; tone: "neutral" | "gold" | "green" | "teal" }
> = {
  free: { label: "Free", tone: "neutral" },
  "free-email": { label: "Free · email required", tone: "gold" },
  "labs-pass": { label: "Free · Pro on Labs Pass", tone: "teal" },
  course: { label: "Inside Room Rental Riches", tone: "green" },
};

export interface Resource {
  name: string;
  body: string;
  bullets: string[];
  access: Access;
  href?: string;
  status?: "live" | "soon";
  // When set, the modal renders a name/email waitlist form posting to
  // /api/waitlist instead of the default "Get in touch" CTA.
  waitlist?: { courseSlug: string; tier: WaitlistTier };
}

function AccessBadge({
  access,
  light = false,
}: {
  access: Access;
  light?: boolean;
}) {
  const meta = ACCESS_META[access];
  const baseTone =
    meta.tone === "gold"
      ? light
        ? "border-warm-gold/60 text-warm-gold"
        : "border-warm-gold/70 text-warm-gold-dark"
      : meta.tone === "green"
        ? light
          ? "border-white/40 text-white"
          : "border-primary-green/60 text-primary-green"
        : meta.tone === "teal"
          ? light
            ? "border-white/30 text-white/85"
            : "border-deep-teal/30 text-deep-teal"
          : light
            ? "border-white/30 text-white/80"
            : "border-charcoal/30 text-charcoal";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${baseTone} rounded-full px-2.5 py-1 font-sans text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase`}
    >
      {meta.label}
    </span>
  );
}

function cardContainerClass(variant: "light" | "dark", inactive: boolean) {
  if (variant === "light") {
    return inactive
      ? "w-full text-left bg-light-gray/60 border border-light-gray rounded-lg p-6 h-full opacity-75 transition-all duration-200 hover:opacity-90 hover:border-warm-gold/40 cursor-pointer"
      : "group block bg-white border border-light-gray rounded-lg p-6 h-full transition-all duration-200 hover:border-warm-gold hover:bg-warm-gold/10 hover:shadow-lg hover:-translate-y-1";
  }
  return inactive
    ? "w-full text-left border-l-2 border-white/25 pl-6 md:pl-8 h-full opacity-60 transition-all duration-200 hover:opacity-80 cursor-pointer"
    : "group block border-l-2 border-warm-gold pl-6 md:pl-8 h-full transition-all duration-200 hover:bg-warm-gold/15 hover:translate-x-1";
}

function cardHeadingClass(variant: "light" | "dark", inactive: boolean) {
  if (variant === "light") {
    return inactive
      ? "font-display text-lg font-semibold text-deep-teal/55 leading-tight"
      : "font-display text-lg font-semibold text-deep-teal leading-tight";
  }
  return inactive
    ? "font-display text-xl font-semibold text-white/70 leading-tight"
    : "font-display text-xl font-semibold text-white leading-tight";
}

function cardBodyClass(variant: "light" | "dark", inactive: boolean) {
  if (variant === "light") {
    return inactive
      ? "font-sans text-sm text-charcoal/55 leading-relaxed"
      : "font-sans text-sm text-charcoal/85 leading-relaxed";
  }
  return inactive
    ? "font-sans text-base text-white/60 leading-relaxed"
    : "font-sans text-base text-white/85 leading-relaxed";
}

function CardInner({
  r,
  variant,
  inactive,
  showArrow,
}: {
  r: Resource;
  variant: "light" | "dark";
  inactive: boolean;
  showArrow: boolean;
}) {
  return (
    <>
      <h3 className={`${cardHeadingClass(variant, inactive)} mb-3`}>
        {r.name}
        {showArrow && (
          <span
            aria-hidden
            className="ml-1.5 opacity-70 inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100"
          >
            →
          </span>
        )}
      </h3>
      <p className={cardBodyClass(variant, inactive)}>{r.body}</p>
    </>
  );
}

export default function ResourceCard({
  r,
  variant,
}: {
  r: Resource;
  variant: "light" | "dark";
}) {
  // Greyed card: explicitly coming soon, or members-only Labs Pass tooling.
  const isGreyed = r.status === "soon" || r.access === "labs-pass";
  // Modal click: no direct destination, or coming-soon (force contact flow).
  const useModal = !r.href || r.status === "soon";

  // Direct link: navigate to the existing detail page.
  if (!useModal && r.href) {
    return (
      <Link
        href={r.href}
        className={cardContainerClass(variant, false)}
      >
        <CardInner r={r} variant={variant} inactive={false} showArrow />
      </Link>
    );
  }

  // Modal path: open a popup with bullets + "get in touch" CTA → /contact.
  return <ModalCard r={r} variant={variant} greyed={isGreyed} />;
}

function ModalCard({
  r,
  variant,
  greyed,
}: {
  r: Resource;
  variant: "light" | "dark";
  greyed: boolean;
}) {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          greyed
            ? cardContainerClass(variant, true)
            : `${cardContainerClass(variant, false)} group w-full text-left cursor-pointer`
        }
        aria-haspopup="dialog"
      >
        <CardInner
          r={r}
          variant={variant}
          inactive={greyed}
          showArrow={!greyed}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key={`resource-backdrop-${r.name}`}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`resource-title-${r.name}`}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-near-black/60 backdrop-blur-sm cursor-default"
            />

            <motion.div
              key={`resource-card-${r.name}`}
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
                  <AccessBadge access={r.access} />
                  {r.status === "soon" && (
                    <span className="ml-2 inline-flex items-center gap-1.5 border border-warm-gold/70 text-warm-gold-dark rounded-full px-2.5 py-1 font-sans text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase">
                      Coming soon
                    </span>
                  )}
                </div>

                <h2
                  id={`resource-title-${r.name}`}
                  className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4"
                >
                  {r.name}
                </h2>

                <p className="font-sans text-base text-charcoal/80 leading-relaxed mb-6">
                  {r.body}
                </p>

                {r.bullets.length > 0 && (
                  <ul className="space-y-2.5 mb-8">
                    {r.bullets.map((b) => (
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
                )}

                {r.waitlist ? (
                  <WaitlistInlineForm
                    courseSlug={r.waitlist.courseSlug}
                    tier={r.waitlist.tier}
                    onCancel={() => setOpen(false)}
                  />
                ) : (
                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="font-sans text-sm text-charcoal/60 hover:text-charcoal underline underline-offset-4 transition-colors text-left"
                    >
                      Close
                    </button>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-lg font-sans text-sm font-semibold tracking-wide px-7 py-3 bg-warm-gold text-near-black hover:bg-warm-gold-dark transition-colors"
                    >
                      {r.status === "soon" ? "Get on the list" : "Get in touch"}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

