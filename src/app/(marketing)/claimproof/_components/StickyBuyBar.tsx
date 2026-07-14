"use client";

import { useEffect, useState } from "react";

/**
 * StickyBuyBar — a slim persistent CTA that keeps checkout one tap away
 * through the long middle of the page.
 *
 * Behavior:
 *  - Hidden while the hero is in view (the hero already has its own CTAs).
 *  - Appears once the visitor scrolls past the hero.
 *  - Hides again once the pricing section is in view (a "go to pricing" bar is
 *    noise when you are already looking at the tiers) and stays hidden below it.
 *
 * It links to #pricing rather than starting checkout directly, so the visitor
 * still chooses a tier. Keeps the mid-page free of inline CTAs.
 */
export default function StickyBuyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("cp-hero");
    const pricing = document.getElementById("pricing");
    if (!hero || !pricing) return;

    let heroOut = false; // scrolled past the hero
    let pricingIn = false; // pricing (or below) reached

    const update = () => setVisible(heroOut && !pricingIn);

    const heroObs = new IntersectionObserver(
      ([e]) => {
        heroOut = !e.isIntersecting;
        update();
      },
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" },
    );
    const pricingObs = new IntersectionObserver(
      ([e]) => {
        // Consider pricing "reached" as soon as its top enters the viewport.
        pricingIn = e.isIntersecting || e.boundingClientRect.top < 0;
        update();
      },
      { threshold: 0 },
    );

    heroObs.observe(hero);
    pricingObs.observe(pricing);
    return () => {
      heroObs.disconnect();
      pricingObs.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto max-w-5xl px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="flex items-center justify-between gap-3 rounded-full bg-near-black/95 px-4 py-2.5 shadow-2xl ring-1 ring-white/10 backdrop-blur sm:px-5 sm:py-3 md:px-7 md:py-4">
          <p className="min-w-0 font-sans text-sm text-white/85 md:text-base">
            <span className="font-semibold text-white">
              Stop losing claims.
            </span>{" "}
            <span className="hidden md:inline text-white/70">
              Get the exact system a real fleet runs.
            </span>
          </p>
          <a
            href="#pricing"
            className="inline-flex flex-none items-center justify-center whitespace-nowrap rounded-full bg-warm-gold px-4 py-2.5 font-sans text-sm font-semibold text-near-black transition-all duration-300 hover:bg-gold-light active:scale-[0.98] sm:px-6 md:text-base"
          >
            <span className="sm:hidden">Get the System</span>
            <span className="hidden sm:inline">Get Claim Proof</span>
          </a>
        </div>
      </div>
    </div>
  );
}
