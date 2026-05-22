import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewerContext } from "@/lib/preview";
import {
  listEnrollmentsForUser,
  synthesizeEnrollmentsForTier,
} from "@/lib/lms";
import {
  listCatalogCourses,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type CourseCategorySlug,
  type CatalogCourse,
} from "@/lib/course-catalog";
import CatalogCard from "@/components/sections/courses/CatalogCard";

export const metadata: Metadata = {
  title: "Browse courses",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BrowseCoursesPage() {
  const ctx = await getViewerContext();
  if (!ctx) redirect("/login?next=%2Faccount%2Fcourses%2Fbrowse");

  const [catalog, enrollments] = await Promise.all([
    listCatalogCourses(),
    ctx.effectiveTier !== null
      ? synthesizeEnrollmentsForTier(ctx.effectiveTier)
      : listEnrollmentsForUser(ctx.userId),
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  // Group by asset class. Courses without a category fall into a final
  // "Other" bucket so nothing silently disappears from the catalog.
  const grouped = new Map<CourseCategorySlug | "other", CatalogCourse[]>();
  for (const slug of CATEGORY_ORDER) grouped.set(slug, []);
  grouped.set("other", []);

  for (const c of catalog) {
    const key: CourseCategorySlug | "other" = c.categorySlug ?? "other";
    const list = grouped.get(key) ?? [];
    list.push(c);
    grouped.set(key, list);
  }

  const sections: Array<{ key: string; label: string; courses: CatalogCourse[] }> = [];
  for (const slug of CATEGORY_ORDER) {
    const courses = grouped.get(slug) ?? [];
    if (courses.length > 0) {
      sections.push({ key: slug, label: CATEGORY_LABEL[slug], courses });
    }
  }
  const otherCourses = grouped.get("other") ?? [];
  if (otherCourses.length > 0) {
    sections.push({ key: "other", label: "More courses", courses: otherCourses });
  }

  return (
    <div className="max-w-5xl">
      <Link
        href="/account/courses"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← Your courses
      </Link>
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
        Course catalog
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight">
        Browse courses
      </h1>
      <p className="font-sans text-base text-charcoal/85 leading-relaxed mt-3 max-w-2xl mb-10">
        Every course we offer, grouped by asset class. Enrolled courses are
        flagged so you can jump back in. Tap any card to see tiers, pricing,
        and the curriculum.
      </p>

      {sections.length === 0 ? (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
          <h2 className="font-display text-xl font-semibold text-deep-teal mb-2">
            Catalog is empty.
          </h2>
          <p className="font-sans text-sm text-charcoal/70 max-w-md mx-auto">
            New courses are added as they release. Check back after the next
            cohort cycle.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.key}>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal mb-5">
                {s.label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {s.courses.map((c) => (
                  <CatalogCard
                    key={c.id}
                    course={c}
                    state={{
                      enrolled: enrolledCourseIds.has(c.id),
                      isAdmin: ctx.effectiveIsAdmin,
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
