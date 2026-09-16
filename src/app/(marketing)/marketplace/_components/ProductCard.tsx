"use client";

import Image from "next/image";
import { isRenderableImageUrl } from "@/lib/image-sources";
import { objectPositionFor } from "@/lib/image-anchor";
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

export interface PlateSpec {
  /** Category tint, a brand token hex. */
  tint: string;
  /** Room or job name, rendered in small caps. */
  label: string;
  /** 1-based position within its section. */
  index: number;
}

/**
 * What fills the image slot when a product has no photograph.
 *
 * Collapsing the slot entirely would break grid rhythm and strip the card of
 * the visual anchor shoppers scan for, so the slot is occupied deliberately
 * instead: the category tint washed over cream, a ruled field, the room name,
 * and a large index numeral. Ink stays dark on a light ground, so contrast
 * holds for every tint without per-color tuning.
 *
 * When Amazon PA-API access opens and real product photography lands in
 * image_url, this is simply no longer rendered — see the branch in ProductCard.
 */
function ProductPlate({ tint, label, index }: PlateSpec) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: `color-mix(in srgb, ${tint} 9%, #FAF8F3)` }}
    >
      {/* Ruled field. Low-contrast, purely textural. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, ${tint}14 0px, ${tint}14 1px, transparent 1px, transparent 11px)`,
        }}
      />
      <span
        className="absolute bottom-3 left-4 font-sans text-[10px] font-semibold tracking-[0.22em] uppercase"
        style={{ color: tint }}
      >
        {label}
      </span>
      <span
        className="absolute -bottom-3 right-3 font-display text-[4.5rem] leading-none font-semibold italic select-none"
        style={{ color: tint, opacity: 0.17 }}
      >
        {String(index).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function ProductCard({
  p,
  plate,
}: {
  p: Product;
  plate: PlateSpec;
}) {
  const inactive = p.status !== "live";
  const cta = NETWORK_CTA[p.network];
  const networkLabel = NETWORK_LABEL[p.network];

  // Guard the src rather than trusting the column. An empty string makes
  // next/image render an <img> with no src at all; an un-allowlisted host makes
  // it throw during server render. Both are reachable from the admin form.
  const hasPhoto = isRenderableImageUrl(p.image.src);

  // The first bullet is promoted onto the card as the one-line reason to care.
  // The rest stay below, so the card reads at a glance but still rewards
  // stopping on it.
  const [lead, ...rest] = p.bullets;

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
    ? "group relative flex flex-col bg-light-gray/60 border border-light-gray rounded-card overflow-hidden h-full opacity-75 transition-all duration-200 hover:opacity-90"
    : "group relative flex flex-col bg-white border border-light-gray rounded-card overflow-hidden h-full transition-all duration-200 cursor-pointer hover:border-warm-gold hover:-translate-y-1 focus-within:border-warm-gold";

  return (
    <article className={containerClass}>
      <div className="relative aspect-[16/9] overflow-hidden bg-cream">
        {hasPhoto ? (
          <Image
            src={p.image.src}
            alt={p.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            style={{
              filter: "saturate(0.9) contrast(1.05)",
              objectPosition: objectPositionFor(p.image.anchor),
            }}
          />
        ) : (
          <ProductPlate {...plate} />
        )}
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
          {p.priceRange && (
            <span className="inline-flex items-center border border-warm-gold/60 bg-cream text-warm-gold-dark rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold tracking-[0.16em] uppercase">
              {p.priceRange}
            </span>
          )}
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

        {lead && (
          <p className="font-sans text-sm text-charcoal font-medium leading-relaxed mb-3 pl-3 border-l-2 border-warm-gold/70">
            {lead}
          </p>
        )}

        <p className="font-sans text-sm text-charcoal/80 leading-relaxed mb-4">
          {p.body}
        </p>

        {rest.length > 0 && (
          <ul className="space-y-2 mb-5">
            {rest.map((b) => (
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
            /* before:inset-0 makes the whole card one hover target and one
               link. Baymard finds 76% of sites fail to do this. */
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
