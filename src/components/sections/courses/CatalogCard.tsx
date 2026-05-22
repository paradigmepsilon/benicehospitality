import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import {
  formatPriceCents,
  priceRange,
  type CatalogCourse,
} from "@/lib/course-catalog";

export interface CatalogCardState {
  enrolled: boolean;
  isAdmin: boolean;
}

export default function CatalogCard({
  course,
  state,
}: {
  course: CatalogCourse;
  state: CatalogCardState;
}) {
  const range = priceRange(course.tiers);
  const thumb = course.thumbnailUrl || course.heroImageUrl;
  const detailHref = `/account/courses/${course.slug}`;

  // Cards lead with the visual; the badge in the corner tells the user where
  // they stand at a glance (enrolled / admin access / coming soon / price).
  return (
    <Link
      href={detailHref}
      className="group block bg-white border border-light-gray rounded-lg overflow-hidden hover:border-primary-green/40 hover:shadow-sm transition-all"
    >
      <div className="relative aspect-[16/9] bg-cream overflow-hidden">
        {thumb ? (
          // Using <img> not next/image to keep this server-component friendly
          // without a remote-pattern allowlist for thumbnails uploaded ad hoc.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/30 font-display text-sm">
            {course.title}
          </div>
        )}

        <div className="absolute top-3 left-3">
          {state.enrolled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase bg-primary-green text-white rounded">
              <CheckCircle2 className="w-3 h-3" aria-hidden /> Enrolled
            </span>
          ) : state.isAdmin ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase bg-near-black text-warm-gold rounded">
              Admin access
            </span>
          ) : course.isPlaceholder ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase bg-charcoal/80 text-white rounded">
              Coming soon
            </span>
          ) : !course.isPurchasable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase bg-charcoal/80 text-white rounded">
              <Lock className="w-3 h-3" aria-hidden /> Not for sale
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-deep-teal leading-tight mb-2 group-hover:text-warm-gold transition-colors">
          {course.title}
        </h3>
        <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-4 line-clamp-2">
          {course.summary}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-sans text-sm text-charcoal/70">
            {state.enrolled
              ? "Continue learning"
              : state.isAdmin
                ? "Open course"
                : course.isPlaceholder || !course.isPurchasable
                  ? "Notify me when this opens"
                  : range
                    ? range.fromCents === range.toCents
                      ? formatPriceCents(range.fromCents)
                      : `from ${formatPriceCents(range.fromCents)}`
                    : "Pricing TBD"}
          </span>
          <ArrowRight
            className="w-4 h-4 text-charcoal/40 group-hover:text-primary-green transition-colors"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
