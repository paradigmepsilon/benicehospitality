"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  ctaFor,
  type SuggestedProduct,
} from "@/lib/resources/supply-inventory-tracker/config";

/**
 * Affiliate presentation for the Supply Inventory Tracker. Products come from
 * the marketplace catalog (admin-managed), matched to what the operator is
 * actually running low on.
 *
 * Click tracking and link rel mirror marketplace/_components/ProductCard so
 * every affiliate exit in the app records the same way: best-effort POST that
 * never blocks navigation, and rel="sponsored" for disclosure.
 */
function trackClick(p: SuggestedProduct) {
  try {
    fetch("/api/marketplace/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: p.id,
        network: p.network,
        referrer:
          typeof window !== "undefined" ? window.location.pathname : null,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking is best-effort. Never block the affiliate navigation.
  }
}

/**
 * The inline "our pick" line shown beside a low item in the restock panel.
 * Deliberately one line: the operator is here to count supplies, not shop.
 */
export function InlineSuggestion({ product }: { product: SuggestedProduct }) {
  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => trackClick(product)}
      className="no-print group flex items-center gap-2 w-full max-w-full rounded-md border border-warm-gold/50 bg-warm-gold/5 hover:bg-warm-gold/15 hover:border-warm-gold px-2.5 py-1.5 transition-colors"
    >
      <span className="relative w-8 h-8 shrink-0 rounded overflow-hidden bg-cream">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="32px"
          className="object-cover"
        />
      </span>
      <span className="min-w-0">
        <span className="block font-sans text-[10px] font-semibold tracking-[0.16em] uppercase text-warm-gold-dark leading-none mb-0.5">
          Our pick
        </span>
        <span className="block font-sans text-xs text-near-black leading-tight truncate">
          {product.name}
        </span>
      </span>
      <span className="ml-auto pl-1 font-sans text-[11px] font-semibold text-warm-gold-dark whitespace-nowrap inline-flex items-center gap-1">
        {product.priceRange}
        <ExternalLink className="w-3 h-3 shrink-0" aria-hidden />
      </span>
      <span className="sr-only">
        {ctaFor(product.network)} (affiliate link)
      </span>
    </a>
  );
}

/** One product card in the strip below the tracker. */
function SuggestionCard({ product }: { product: SuggestedProduct }) {
  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => trackClick(product)}
      className="group flex flex-col bg-white border border-light-gray hover:border-warm-gold rounded-lg overflow-hidden transition-colors"
    >
      <span className="relative block aspect-[16/9] bg-cream overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 inline-flex items-center bg-deep-teal text-white rounded-full px-2 py-0.5 font-sans text-[9px] font-semibold tracking-[0.16em] uppercase">
            {product.badge}
          </span>
        )}
      </span>
      <span className="flex flex-col flex-1 p-4">
        <span className="block font-display text-sm font-semibold text-deep-teal leading-tight mb-1.5">
          {product.name}
        </span>
        <span className="block font-sans text-xs text-charcoal/75 leading-relaxed mb-3 line-clamp-2">
          {product.body}
        </span>
        <span className="mt-auto flex items-center justify-between gap-2">
          <span className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-warm-gold-dark">
            {product.priceRange}
          </span>
          <span className="font-sans text-xs font-semibold text-warm-gold-dark group-hover:text-deep-teal inline-flex items-center gap-1 transition-colors">
            {ctaFor(product.network)}
            <ExternalLink className="w-3 h-3 shrink-0" aria-hidden />
          </span>
        </span>
      </span>
    </a>
  );
}

/**
 * The "stock up" strip under the tracker. Hidden entirely when the catalog has
 * nothing to show, so the tool never renders an empty shopping section.
 */
export function SuggestionStrip({
  products,
}: {
  products: SuggestedProduct[];
}) {
  if (!products.length) return null;

  return (
    <section className="no-print mt-10 border-t border-light-gray pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
        <h3 className="font-display text-lg font-semibold text-near-black">
          Stock up on supplies
        </h3>
        <Link
          href="/marketplace"
          className="font-sans text-xs font-semibold text-warm-gold-dark hover:text-deep-teal transition-colors"
        >
          See the full marketplace →
        </Link>
      </div>
      <p className="font-sans text-xs text-charcoal/65 leading-relaxed mb-5 max-w-2xl">
        What we buy for our own properties, matched to what you are tracking. We
        earn a commission on some of these links, at no cost to you.{" "}
        <Link
          href="/affiliate-disclosure"
          className="text-warm-gold-dark hover:underline"
        >
          How this works
        </Link>
        .
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <SuggestionCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
