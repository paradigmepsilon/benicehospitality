import Image from "next/image";
import Link from "next/link";
import { type FeaturedBook } from "@/lib/featured-books";

/**
 * The standout "ad" for first-party books, shared by the resource library, the
 * Marketplace, and the founder pages.
 *
 * One compact spotlight row per book: cover, hook, specs, price, CTA. Multiple
 * books stack as identical rows, so the layout needs no special case the day
 * The Car Rental Riches Blueprint flips to available.
 *
 * Two wrappers, same row:
 *   - variant="section" (default) — full-bleed near-black section with a display
 *     headline. Used where the ad owns its own slice of the page (/resources,
 *     /della).
 *   - variant="inline" — a contained near-black card with a small label, sized
 *     to sit inside another section's content column (the Marketplace tab
 *     panel, which is off-white).
 *
 * The CTA links to the book's sales page, never straight into checkout: that
 * page owns price framing, FAQs, and the legal footer. `source` is appended as
 * ?src= so the funnel origin is visible in analytics.
 *
 * No interactivity here, so this renders on the server when the parent allows
 * it (and is safe to pull into the Marketplace's client catalog).
 */

interface BookPromoBandProps {
  books: FeaturedBook[];
  /** Small gold label above the ad. */
  eyebrow: string;
  /** Headline. Display-size in "section", one compact line in "inline". */
  headline: string;
  /** Supporting line. Rendered in "section" only — "inline" stays lean. */
  body?: string;
  /** Analytics tag for the sales-page link, e.g. "marketplace-promo". */
  source: string;
  variant?: "section" | "inline";
}

export default function BookPromoBand({
  books,
  eyebrow,
  headline,
  body,
  source,
  variant = "section",
}: BookPromoBandProps) {
  if (books.length === 0) return null;

  const rows = (
    <div className="space-y-4">
      {books.map((book) => (
        <BookSpotlight key={book.tag} book={book} source={source} />
      ))}
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="mb-10 md:mb-12">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-warm-gold">
            {eyebrow}
          </p>
          <p className="font-sans text-sm text-charcoal/70">{headline}</p>
        </div>
        {rows}
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-near-black px-6 py-14 md:px-12 md:py-16 lg:px-20">
      {/* Warm glow so the covers sit in light rather than floating on black. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[24rem] w-[24rem] rounded-full bg-warm-gold/15 blur-[100px]"
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
            {headline}
          </h2>
          {body ? (
            <p className="mt-4 font-sans text-base leading-snug text-white/75">
              {body}
            </p>
          ) : null}
        </div>
        {rows}
      </div>
    </section>
  );
}

/**
 * One book, one row. Cover / copy / price + CTA across three columns on large
 * screens, stacking on small. Identical in both variants so the ad reads the
 * same wherever it appears.
 */
function BookSpotlight({
  book,
  source,
}: {
  book: FeaturedBook;
  source: string;
}) {
  const href = `${book.path}?src=${encodeURIComponent(source)}`;

  // The card carries its own near-black ground so the white copy reads the same
  // on the off-white Marketplace panel as it does inside the dark section
  // variant, where the white overlay lifts it off the section behind it.
  return (
    <Link
      href={href}
      className="group grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-5 rounded-lg border border-warm-gold/25 bg-near-black bg-gradient-to-r from-white/[0.06] to-transparent p-5 transition-colors duration-200 hover:border-warm-gold/60 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-7 sm:p-6 lg:grid-cols-[7rem_minmax(0,1fr)_auto] lg:gap-x-8"
    >
      <Image
        src={book.coverImage}
        alt={`Cover of ${book.name} by ${book.author}`}
        width={1400}
        height={2100}
        quality={90}
        className="w-full rounded-sm shadow-[0_14px_34px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-0.5"
      />

      <div className="min-w-0">
        <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-warm-gold">
          By {book.author}
        </p>
        <h3 className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
          {book.name}
        </h3>
        <p className="mt-2 max-w-xl font-sans text-sm leading-snug text-white/70">
          {book.hook}
        </p>
        <p className="mt-3 font-sans text-xs text-white/50">
          {book.specs.join(" · ")}
        </p>
      </div>

      {/* Price + CTA. Full-width under the copy on small screens, its own
          right-hand column from lg up. */}
      <div className="col-span-full flex items-center gap-5 lg:col-span-1 lg:flex-col lg:items-end lg:gap-3">
        <p className="flex items-baseline gap-2">
          {book.priceListUsd ? (
            <span className="font-sans text-sm text-white/40 line-through">
              ${book.priceListUsd}
            </span>
          ) : null}
          <span className="font-display text-3xl font-semibold text-warm-gold [font-variant-numeric:lining-nums_tabular-nums]">
            ${book.priceUsd}
          </span>
        </p>
        <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-warm-gold px-5 py-2.5 font-sans text-sm font-semibold text-near-black transition-colors duration-200 group-hover:bg-warm-gold-dark">
          Get your copy
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
