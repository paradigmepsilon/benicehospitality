"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  CatalogCategory,
  CatalogCourse,
  CourseStatus,
} from "@/lib/courses-catalog-types";

interface CatalogTabsProps {
  categories: CatalogCategory[];
  coursesByCategory: Partial<Record<string, CatalogCourse[]>>;
}

export default function CatalogTabs({
  categories,
  coursesByCategory,
}: CatalogTabsProps) {
  // Default to the first category that has at least one course; fall back to
  // the first category if every panel is empty.
  const defaultId =
    categories.find((c) => (coursesByCategory[c.id]?.length ?? 0) > 0)?.id ??
    categories[0]?.id;
  const [active, setActive] = useState<string | undefined>(defaultId);

  const activeCategory =
    categories.find((c) => c.id === active) ?? categories[0];
  const activeCourses = activeCategory
    ? (coursesByCategory[activeCategory.id] ?? [])
    : [];

  if (!activeCategory) return null;

  return (
    <div>
      {/* Tab strip. Classic tab shape: active tab gets a gold fill with
          rounded top corners and sits flush against the panel below. */}
      <div
        role="tablist"
        aria-label="Course catalog by asset class"
        className="flex flex-wrap justify-center items-end gap-x-1 gap-y-1 border-b border-warm-gold/40 mb-10 md:mb-12"
      >
        {categories.map((c) => {
          const count = coursesByCategory[c.id]?.length ?? 0;
          const isActive = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`catalog-panel-${c.id}`}
              id={`catalog-tab-${c.id}`}
              onClick={() => setActive(c.id)}
              className={[
                "relative -mb-px px-5 sm:px-7 py-3 md:py-4 rounded-t-lg transition-colors duration-200",
                "font-sans text-xs md:text-sm font-semibold tracking-[0.22em] uppercase",
                isActive
                  ? "bg-warm-gold text-near-black border border-warm-gold border-b-warm-gold"
                  : "bg-transparent text-charcoal/60 hover:text-deep-teal hover:bg-warm-gold/10 border border-transparent",
              ].join(" ")}
            >
              {c.label}
              <span
                aria-hidden
                className={[
                  "ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold tracking-normal",
                  isActive
                    ? "bg-near-black/15 text-near-black"
                    : "bg-charcoal/10 text-charcoal/55",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        id={`catalog-panel-${activeCategory.id}`}
        aria-labelledby={`catalog-tab-${activeCategory.id}`}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8 pb-4 border-b border-warm-gold/30">
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2">
              {activeCategory.label}
            </p>
            <p className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight">
              {activeCategory.body}
            </p>
          </div>
          <p className="font-sans text-xs text-charcoal/60 italic">
            {activeCourses.length}{" "}
            {activeCourses.length === 1 ? "course" : "courses"}
          </p>
        </div>

        {activeCourses.length === 0 ? (
          <div className="bg-cream border border-warm-gold/30 rounded-lg p-8 md:p-12 text-center">
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
              In development
            </p>
            <p className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
              No courses live in this track yet.
            </p>
            <p className="font-sans text-base text-charcoal/80 leading-relaxed max-w-xl mx-auto">
              {activeCategory.emptyState ??
                "We're building this track now. Tell us you're interested and you'll hear from us when it ships."}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-deep-teal hover:text-warm-gold transition-colors duration-200 mt-6"
            >
              Get on the waitlist
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {activeCourses.map((course, i) => (
              <CourseCatalogCard
                key={course.slug}
                course={course}
                flip={i % 2 === 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card rendering. Moved from the page so the catalog can re-render cleanly
// inside the active tab panel without crossing the server/client boundary.
// ─────────────────────────────────────────────────────────────────────────────

function CourseCatalogCard({
  course,
  flip,
}: {
  course: CatalogCourse;
  flip?: boolean;
}) {
  const isLive = course.status === "live";

  const visualInner = (
    <>
      {course.image ? (
        <>
          <Image
            src={course.image.src}
            alt={course.image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className={[
              "object-cover transition-transform duration-500",
              course.href ? "group-hover/visual:scale-[1.02]" : "",
              course.image.anchor === "bottom"
                ? "object-bottom"
                : course.image.anchor === "top"
                  ? "object-top"
                  : "object-center",
            ].join(" ")}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-deep-teal/85 via-deep-teal/55 to-deep-teal/30"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-warm-gold/15 via-transparent to-deep-teal/15 pointer-events-none"
        />
      )}
      <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
        <div className="flex items-center gap-2">
          <StatusBadge
            status={course.status}
            releaseLabel={course.releaseLabel}
          />
        </div>
        <div>
          <h3
            className={[
              "font-display text-3xl md:text-4xl font-semibold leading-tight",
              course.image ? "text-cream" : "text-deep-teal",
            ].join(" ")}
          >
            {course.title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {course.assetTypes.map((t) => (
              <span
                key={t}
                className={[
                  "inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.15em] uppercase rounded-sm",
                  course.image
                    ? "bg-cream/15 text-cream border border-cream/30"
                    : "bg-warm-gold/10 text-warm-gold border border-warm-gold/40",
                ].join(" ")}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      {!course.image && (
        <div
          aria-hidden
          className="absolute right-6 top-1/2 -translate-y-1/2 w-px h-24 bg-warm-gold/40"
        />
      )}
    </>
  );

  const visualBaseClass =
    "relative block aspect-[4/3] md:aspect-auto md:min-h-[360px] overflow-hidden bg-cream";

  const visual = course.href ? (
    <Link
      href={course.href}
      aria-label={`Open ${course.title}`}
      className={`${visualBaseClass} group/visual focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold`}
    >
      {visualInner}
    </Link>
  ) : (
    <div className={visualBaseClass}>{visualInner}</div>
  );

  const info = (
    <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
      <p className="font-sans text-lg italic text-charcoal/85 leading-relaxed mb-4">
        {course.tagline}
      </p>
      <p className="font-sans text-base text-charcoal/80 leading-relaxed mb-6">
        {course.description}
      </p>
      {course.curriculumNote && (
        <p className="font-sans text-sm tracking-wide text-charcoal/65 mb-5">
          {course.curriculumNote}
        </p>
      )}
      {course.startingPrice && (
        <p
          className={[
            "font-display text-3xl md:text-4xl font-semibold tracking-tight mb-6",
            isLive ? "text-warm-gold" : "text-warm-gold/70",
          ].join(" ")}
        >
          {course.startingPrice}
        </p>
      )}
      {isLive && course.href ? (
        <Link
          href={course.href}
          className="inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-deep-teal hover:text-warm-gold transition-colors duration-200"
        >
          See {course.title}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      ) : (
        <p className="font-sans text-sm font-semibold tracking-wide text-charcoal/75 italic">
          Waitlist opens with the course release.
        </p>
      )}
    </div>
  );

  return (
    <article
      className={[
        "bg-white border rounded-lg overflow-hidden transition-colors duration-200 group",
        isLive
          ? "border-light-gray hover:border-deep-teal/40"
          : "border-light-gray",
      ].join(" ")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {flip ? (
          <>
            {info}
            {visual}
          </>
        ) : (
          <>
            {visual}
            {info}
          </>
        )}
      </div>
    </article>
  );
}

function StatusBadge({
  status,
  releaseLabel,
}: {
  status: CourseStatus;
  releaseLabel: string;
}) {
  const styles: Record<CourseStatus, string> = {
    live: "bg-primary-green text-white",
    "coming-soon": "bg-warm-gold/90 text-near-black",
    "in-development": "bg-charcoal/75 text-white",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-sm",
        styles[status],
      ].join(" ")}
    >
      {status === "live" ? "Live" : releaseLabel}
    </span>
  );
}
