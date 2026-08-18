"use client";

import { Star } from "lucide-react";

/**
 * Read-only rating, for the collapsed roster card. Always paired with the
 * numeric text next to it — colour alone must never be the only carrier, and
 * five gold shapes at 14px are not readable as a number at a glance.
 */
export function RatingStars({ value }: { value: number }) {
  if (!value) {
    return (
      <span className="font-sans text-xs text-charcoal/50 whitespace-nowrap">
        Not rated
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap"
      aria-label={`Rated ${value} out of 5`}
    >
      <span aria-hidden className="inline-flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= value ? "fill-current text-warm-gold" : "text-charcoal/25"
            }`}
          />
        ))}
      </span>
      <span className="font-sans text-xs font-semibold text-charcoal/70 tabular-nums">
        {value}
      </span>
    </span>
  );
}

/**
 * The editable rating. Five buttons rather than a 1-to-5 <select>, because
 * picking a number out of a dropdown to say "they were good" is the single
 * least intuitive control on the old table.
 *
 * Tapping the current value clears it — an accidental one-star is otherwise
 * permanent, since there is no empty option to go back to.
 *
 * The buttons are `no-print`; the sentence beside them is not, so a printed
 * rolodex still says "4 of 5" instead of showing five empty rectangles.
 */
export default function StarRating({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Names the group for screen readers, e.g. "Your rating for ATL Plumbing". */
  label: string;
}) {
  const parsed = parseInt(value, 10);
  const rating = Number.isFinite(parsed) && parsed >= 1 && parsed <= 5 ? parsed : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div
        role="group"
        aria-label={label}
        className="no-print flex items-center -ml-2"
      >
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(rating === s ? "" : String(s))}
            aria-pressed={rating === s}
            aria-label={
              rating === s
                ? `Clear rating (currently ${s} of 5)`
                : `Rate ${s} out of 5`
            }
            className="min-w-11 min-h-11 flex items-center justify-center rounded-md hover:bg-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green transition-colors"
          >
            <Star
              aria-hidden
              className={`w-6 h-6 transition-colors ${
                s <= rating
                  ? "fill-current text-warm-gold"
                  : "text-charcoal/30"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="font-sans text-sm text-charcoal/65">
        {rating ? `${rating} of 5` : "Not rated yet"}
      </span>
    </div>
  );
}
