"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ENDORSER_NAME,
  type Endorser,
} from "@/lib/marketplace-endorsements";
import { ProductPhoto, badgeTone, sourceLabel, type PlateSpec } from "./ProductCard";
import { NETWORK_CTA, type Product } from "./types";

const PORTRAIT: Record<Endorser, string> = {
  della: "/images/Dee.jpeg",
  alex: "/images/Lex.jpeg",
};

function trackAffiliateClick(p: Product) {
  try {
    fetch("/api/marketplace/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: p.id,
        network: p.network,
        referrer: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking is best-effort. Never block the affiliate navigation.
  }
}

/**
 * One endorser's block. Renders nothing unless at least one field has text:
 * empty is the "not approved yet" state (see marketplace-endorsements.ts), so
 * an unapproved draft can never reach this page.
 */
function EndorsementBlock({
  who,
  use,
  take,
}: {
  who: Endorser;
  use: string;
  take: string;
}) {
  if (!use && !take) return null;
  const name = ENDORSER_NAME[who];
  return (
    <section className="mt-6 rounded-lg border border-warm-gold/30 bg-cream/60 p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="relative w-10 h-10 shrink-0 overflow-hidden rounded-full border border-warm-gold/40">
          <Image
            src={PORTRAIT[who]}
            alt=""
            fill
            sizes="40px"
            className="object-cover object-top"
          />
        </span>
        <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-warm-gold-dark">
          From {name}
        </p>
      </div>
      {use && (
        <div className="mb-3 last:mb-0">
          <h3 className="font-display text-base font-semibold text-deep-teal mb-1">
            How {name} uses it
          </h3>
          <p className="font-sans text-sm text-charcoal/85 leading-relaxed">{use}</p>
        </div>
      )}
      {take && (
        <div>
          <h3 className="font-display text-base font-semibold text-deep-teal mb-1">
            {name}&rsquo;s take
          </h3>
          <p className="font-sans text-sm text-charcoal/85 leading-relaxed">{take}</p>
        </div>
      )}
    </section>
  );
}

/**
 * Listing details. The only outbound retailer link on the marketplace lives
 * here, and the affiliate disclaimer sits directly beneath it: FTC guidance
 * wants the disclosure next to the link, and this is the one place the link is.
 *
 * The disclaimer keys off `firstParty`, not `network`: a row can be stored as
 * "direct" and still carry an affiliate code, and over-disclosing is harmless.
 */
export default function ProductModal({
  product,
  plate,
  onClose,
}: {
  product: Product | null;
  plate: PlateSpec | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = product !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {product && plate && (
        <motion.div
          key="product-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 bg-near-black/60 backdrop-blur-sm cursor-default"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto overscroll-contain bg-white border border-warm-gold/50 rounded-lg shadow-2xl"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-cream">
              <ProductPhoto p={product} plate={plate} sizes="(min-width: 768px) 672px, 100vw" />
              <span className="absolute bottom-3 right-3 inline-flex items-center bg-near-black/80 backdrop-blur-sm text-white rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase">
                {sourceLabel(product)}
              </span>
              {product.badge && (
                <span
                  className={`absolute bottom-3 left-3 inline-flex items-center ${badgeTone(product.badge)} rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase`}
                >
                  {product.badge}
                </span>
              )}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-white/90 text-charcoal/70 hover:text-charcoal hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-warm-gold"
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
            </div>

            <div className="p-6 md:p-8">
              {product.priceRange && (
                <span className="inline-flex items-center border border-warm-gold/60 bg-cream text-warm-gold-dark rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold tracking-[0.16em] uppercase mb-3">
                  {product.priceRange}
                </span>
              )}
              <h2
                id="product-modal-title"
                className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-3"
              >
                {product.name}
              </h2>
              {product.body && (
                <p className="font-sans text-base text-charcoal/85 leading-relaxed mb-4">
                  {product.body}
                </p>
              )}
              {product.bullets.length > 0 && (
                <ul className="space-y-2">
                  {product.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2.5 font-sans text-sm text-charcoal/80 leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="mt-2 inline-block w-1 h-1 rounded-full bg-warm-gold shrink-0"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              <EndorsementBlock who="della" use={product.dellaUse} take={product.dellaTake} />
              <EndorsementBlock who="alex" use={product.alexUse} take={product.alexTake} />

              <div className="mt-7 pt-6 border-t border-warm-gold/25">
                {product.status !== "live" ? (
                  <p className="font-sans text-sm font-semibold text-charcoal/60">
                    {product.status === "soon"
                      ? "On the way. Check back soon."
                      : "Currently unavailable."}
                  </p>
                ) : product.firstParty ? (
                  <Link
                    href={product.affiliateUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-warm-gold text-near-black font-sans text-sm font-semibold tracking-wide hover:bg-warm-gold-dark transition-colors"
                  >
                    View the book <span aria-hidden>→</span>
                  </Link>
                ) : (
                  <>
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      onClick={() => trackAffiliateClick(product)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-warm-gold text-near-black font-sans text-sm font-semibold tracking-wide hover:bg-warm-gold-dark transition-colors"
                    >
                      {NETWORK_CTA[product.network]}
                      <span aria-hidden>→</span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                    <p className="mt-3 font-sans text-xs text-charcoal/60 leading-relaxed">
                      This is an affiliate link. We may earn a commission if you
                      buy, at no extra cost to you.{" "}
                      <Link
                        href="/affiliate-disclosure"
                        className="text-warm-gold-dark underline underline-offset-2 hover:text-deep-teal"
                      >
                        How this works
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
