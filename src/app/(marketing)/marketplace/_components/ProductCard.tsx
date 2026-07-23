"use client";

import Image from "next/image";
import {
  NETWORK_CTA,
  NETWORK_LABEL,
  type Product,
  type ProductBadge,
} from "./types";

function badgeTone(badge: ProductBadge): string {
  switch (badge) {
    case "Della Uses This":
      return "bg-deep-teal text-white";
    case "Best Value":
      return "bg-primary-green text-white";
    case "Editor's Pick":
      return "bg-warm-gold text-near-black";
    case "New":
      return "bg-warm-gold-dark text-white";
  }
}

export default function ProductCard({ p }: { p: Product }) {
  const inactive = p.status !== "live";
  const cta = NETWORK_CTA[p.network];
  const networkLabel = NETWORK_LABEL[p.network];

  const handleClick = () => {
    try {
      fetch("/api/marketplace/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.id,
          network: p.network,
          referrer: typeof window !== "undefined" ? window.location.pathname : null,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Tracking is best-effort. Never block the affiliate navigation.
    }
  };

  const containerClass = inactive
    ? "group relative flex flex-col bg-light-gray/60 border border-light-gray rounded-lg overflow-hidden h-full opacity-75 transition-all duration-200 hover:opacity-90"
    : "group relative flex flex-col bg-white border border-light-gray rounded-lg overflow-hidden h-full transition-all duration-200 cursor-pointer hover:border-warm-gold hover:shadow-lg hover:-translate-y-1 focus-within:border-warm-gold focus-within:shadow-lg";

  return (
    <article className={containerClass}>
      <div className="relative aspect-[16/9] overflow-hidden bg-cream">
        <Image
          src={p.image.src}
          alt={p.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 bg-near-black/80 backdrop-blur-sm text-white rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase"
          aria-label={`Available on ${networkLabel}`}
        >
          {networkLabel}
        </span>
        {p.badge && (
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1 ${badgeTone(p.badge)} rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase`}
          >
            {p.badge}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center border border-warm-gold/60 bg-cream text-warm-gold-dark rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold tracking-[0.16em] uppercase">
            {p.priceRange}
          </span>
          {p.status === "out-of-stock" && (
            <span className="inline-flex items-center border border-charcoal/30 text-charcoal/70 rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase">
              Out of stock
            </span>
          )}
          {p.status === "soon" && (
            <span className="inline-flex items-center border border-warm-gold/70 text-warm-gold-dark rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase">
              Coming soon
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-deep-teal leading-tight mb-3">
          {p.name}
        </h3>
        <p className="font-sans text-sm text-charcoal/85 leading-relaxed mb-4">
          {p.body}
        </p>

        {p.bullets.length > 0 && (
          <ul className="space-y-2 mb-5">
            {p.bullets.map((b) => (
              <li
                key={b}
                className="flex gap-2.5 font-sans text-xs text-charcoal/75 leading-relaxed"
              >
                <span
                  aria-hidden
                  className="mt-1.5 inline-block w-1 h-1 rounded-full bg-warm-gold shrink-0"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {inactive ? (
          <span className="mt-auto pt-2 inline-flex items-center gap-1.5 font-sans text-sm font-semibold tracking-wide text-charcoal/55">
            {p.status === "soon" ? "On the way" : "Currently unavailable"}
          </span>
        ) : (
          <a
            href={p.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={handleClick}
            className="mt-auto pt-2 inline-flex items-center gap-1.5 font-sans text-sm font-semibold tracking-wide text-warm-gold-dark hover:text-deep-teal transition-colors outline-none before:absolute before:inset-0 before:z-10 before:content-['']"
          >
            <span className="sr-only">{p.name}: </span>
            {cta}
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        )}
      </div>
    </article>
  );
}
