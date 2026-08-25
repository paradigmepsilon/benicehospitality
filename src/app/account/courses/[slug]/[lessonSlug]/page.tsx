import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, Lock } from "lucide-react";
import { getViewerContext } from "@/lib/preview";
import {
  getCourseBySlug,
  getActiveEnrollment,
  getLessonByCourseAndSlug,
  listLessonsForCourse,
  listModulesForCourse,
  listCompletedLessonIds,
  userCanAccessLesson,
  userMeetsMinTier,
  formatLessonNumber,
} from "@/lib/lms";
import { listAssetsForLesson } from "@/lib/lesson-assets";
import LessonCompleteToggle from "@/components/sections/auth/LessonCompleteToggle";
import BundleFrame from "@/components/sections/courses/BundleFrame";
import VideoEmbed from "@/components/sections/courses/VideoEmbed";

export const metadata: Metadata = {
  title: "Lesson",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

const TIER_LABEL: Record<string, string> = {
  "self-paced": "Self-paced",
  cohort: "Cohort",
  operator: "Operator",
};

export default async function LessonPage({ params }: PageProps) {
  const { slug, lessonSlug } = await params;

  const ctx = await getViewerContext();
  if (!ctx) {
    redirect(
      `/login?next=${encodeURIComponent(`/account/courses/${slug}/${lessonSlug}`)}`,
    );
  }

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  // Review gate: unready courses are invisible to non-admins.
  if (!course.isPublished && !ctx.realIsAdmin) notFound();

  // Enrollment gate. Admin god view bypasses entirely; tier preview uses the
  // previewed tier across every course, so no DB enrollment row is required.
  // Real members must have an active enrollment.
  let userTier: "self-paced" | "cohort" | "operator" | "comp" | null = null;
  if (!ctx.effectiveIsAdmin && ctx.effectiveTier === null) {
    const enrollment = await getActiveEnrollment(ctx.userId, course.id);
    if (!enrollment) {
      redirect(`/account/courses/${slug}`);
    }
    userTier = enrollment.tier;
  } else if (ctx.effectiveTier !== null) {
    userTier = ctx.effectiveTier;
  }

  const lesson = await getLessonByCourseAndSlug(course.id, lessonSlug);
  if (!lesson) notFound();

  // Unapproved (unpublished) lessons are reachable only by admins — direct
  // URLs included.
  if (!lesson.isPublished && !ctx.realIsAdmin) {
    redirect(`/account/courses/${slug}`);
  }

  const tierAllowed =
    ctx.effectiveIsAdmin ||
    userCanAccessLesson(userTier, lesson.minTier, lesson.maxTier);
  // When blocked, distinguish min-tier (upgrade unlocks) from max-tier (this
  // lesson is exclusive to a lower tier; upgrading wouldn't help).
  const blockedByMaxTier =
    !tierAllowed && userMeetsMinTier(userTier, lesson.minTier);

  const [allLessons, modules] = await Promise.all([
    listLessonsForCourse(course.id),
    listModulesForCourse(course.id),
  ]);
  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  // Compute "M.L" identifier from sort-order indices. Admin preview hides
  // unpublished modules from non-admins, but the lesson's own number doesn't
  // shift with viewer; count against the full published-module list.
  const visibleModules = modules.filter(
    (m) => m.isPublished || ctx.effectiveIsAdmin,
  );
  const moduleIndex =
    lesson.moduleId != null
      ? (() => {
          const i = visibleModules.findIndex((m) => m.id === lesson.moduleId);
          return i >= 0 ? i + 1 : null;
        })()
      : null;
  const moduleLessons = allLessons
    .filter((l) => l.moduleId === lesson.moduleId)
    .sort((a, b) => a.position - b.position || a.id - b.id);
  const lessonIndex =
    moduleLessons.findIndex((l) => l.id === lesson.id) + 1 || 1;
  const lessonLabel = formatLessonNumber(moduleIndex, lessonIndex);

  // Real progress only for real members. Admin in any preview mode (god view
  // or tier impersonation) starts from a clean slate so their user_id never
  // accumulates fake lesson_progress rows.
  const completedIds = ctx.isReadOnlyPreview
    ? new Set<number>()
    : await listCompletedLessonIds(ctx.userId, course.id);
  const isComplete = completedIds.has(lesson.id);

  const assets = await listAssetsForLesson(lesson.id);
  const attachments = assets.filter((a) => a.role === "attachment");

  // Slide-bundle lessons need a wider container than the editorial body so
  // the deck can render at design intent. Header + footer stay narrow.
  const isWideBody =
    tierAllowed &&
    lesson.bodyKind === "bundle" &&
    lesson.bundleAspect === "slide";

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/account/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden />
          {course.title}
        </Link>
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
          Lesson {lessonLabel}
          {lesson.durationMin !== null && ` · ${lesson.durationMin} min`}
          {ctx.previewMode !== null &&
            ` · Preview as ${TIER_LABEL[ctx.previewMode] ?? ctx.previewMode}`}
          {lesson.minTier && ` · ${TIER_LABEL[lesson.minTier] ?? lesson.minTier}+`}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-5">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="font-sans text-base text-charcoal leading-relaxed italic mb-8">
            {lesson.summary}
          </p>
        )}
      </div>

      {!tierAllowed ? (
        <div className="max-w-4xl mx-auto">
          {blockedByMaxTier ? (
            <TierExclusiveBlock
              maxTierLabel={TIER_LABEL[lesson.maxTier ?? ""] ?? lesson.maxTier ?? ""}
            />
          ) : (
            <TierLockedBlock minTierLabel={TIER_LABEL[lesson.minTier ?? ""] ?? lesson.minTier ?? ""} />
          )}
        </div>
      ) : isWideBody ? (
        <LessonBody lesson={lesson} assets={assets} />
      ) : (
        <div className="max-w-4xl mx-auto">
          <LessonBody lesson={lesson} assets={assets} />
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {tierAllowed && attachments.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal mb-4">
              Resources
            </h2>
            <ul className="space-y-3">
              {attachments.map((a) => (
                <li key={a.id}>
                  <a
                    href={`/api/account/lessons/${lesson.id}/asset/${encodeURIComponent(
                      a.relativePath,
                    )}`}
                    className="flex items-center justify-between bg-white border border-light-gray rounded-lg p-4 hover:border-primary-green/40 transition-colors group"
                    download={a.filename}
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-primary-green" aria-hidden />
                      <span className="font-sans text-sm font-semibold text-deep-teal group-hover:text-warm-gold transition-colors">
                        {a.filename}
                      </span>
                    </div>
                    <span className="font-sans text-xs text-charcoal/55">
                      {Math.max(1, Math.round(a.sizeBytes / 1024))} KB
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!ctx.realIsAdmin && tierAllowed && (
          <div className="mt-8">
            <LessonCompleteToggle
              lessonId={lesson.id}
              initialComplete={isComplete}
              nextHref={
                next ? `/account/courses/${course.slug}/${next.slug}` : null
              }
              courseHref={`/account/courses/${course.slug}`}
            />
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 min-w-0">
            {prev ? (
              <Link
                href={`/account/courses/${course.slug}/${prev.slug}`}
                className="block bg-white border border-light-gray rounded-lg p-5 hover:border-primary-green/40 transition-colors group"
              >
                <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-charcoal/60 mb-1.5">
                  ← Previous
                </p>
                <p className="font-display text-base font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors truncate">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {next ? (
              <Link
                href={`/account/courses/${course.slug}/${next.slug}`}
                className="block bg-white border border-light-gray rounded-lg p-5 hover:border-primary-green/40 transition-colors group sm:text-right"
              >
                <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-charcoal/60 mb-1.5">
                  Next →
                </p>
                <p className="font-display text-base font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors truncate">
                  {next.title}
                </p>
              </Link>
            ) : (
              <Link
                href={`/account/courses/${course.slug}`}
                className="block bg-primary-green text-white rounded-lg p-5 hover:bg-primary-green-dark transition-colors group sm:text-right"
              >
                <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-warm-gold mb-1.5">
                  Course wrap-up →
                </p>
                <p className="font-display text-base font-semibold leading-tight inline-flex items-center gap-2">
                  Back to overview
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonBody({
  lesson,
  assets,
}: {
  lesson: Awaited<ReturnType<typeof getLessonByCourseAndSlug>>;
  assets: Awaited<ReturnType<typeof listAssetsForLesson>>;
}) {
  if (!lesson) return null;
  if (lesson.bodyKind === "bundle") {
    if (!lesson.bundleMainFilename) {
      return (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-6 text-center">
          <p className="font-sans text-sm text-charcoal/70">
            This lesson&rsquo;s bundle is being prepared. Check back shortly.
          </p>
        </div>
      );
    }
    const src = `/api/account/lessons/${lesson.id}/asset/${lesson.bundleMainFilename
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    return <BundleFrame src={src} aspect={lesson.bundleAspect} />;
  }
  if (lesson.bodyKind === "video") {
    if (!lesson.videoUrl) {
      return (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-6 text-center">
          <p className="font-sans text-sm text-charcoal/70">
            Video URL not set yet.
          </p>
        </div>
      );
    }
    return <VideoEmbed url={lesson.videoUrl} />;
  }
  if (lesson.bodyKind === "workbook") {
    // First non-attachment file is treated as the workbook file; falls back
    // to the first attachment if no other "workbook" asset is registered.
    const workbookFile =
      assets.find((a) => a.role === "other" && /\.(pdf|docx?|xlsx?)$/i.test(a.filename)) ??
      assets.find((a) => a.role === "attachment");
    return (
      <div className="bg-white border border-light-gray rounded-lg p-7">
        {lesson.body && (
          <article
            className="prose prose-slate max-w-none font-sans prose-headings:font-display prose-headings:text-deep-teal mb-6"
            dangerouslySetInnerHTML={{ __html: lesson.body }}
          />
        )}
        {workbookFile ? (
          <a
            href={`/api/account/lessons/${lesson.id}/asset/${encodeURIComponent(workbookFile.relativePath)}`}
            className="inline-flex items-center gap-2 bg-primary-green text-white hover:bg-primary-green-dark font-sans font-semibold rounded-lg px-5 py-3 transition-colors"
            download={workbookFile.filename}
          >
            <Download className="w-4 h-4" aria-hidden />
            Download {workbookFile.filename}
          </a>
        ) : (
          <p className="font-sans text-sm text-charcoal/70">
            Workbook file isn&rsquo;t uploaded yet.
          </p>
        )}
      </div>
    );
  }
  // text (default)
  return (
    <article
      className="bg-white border border-light-gray rounded-lg p-7 md:p-10 prose prose-slate max-w-none font-sans prose-headings:font-display prose-headings:text-deep-teal prose-h3:text-xl prose-p:text-charcoal prose-p:leading-relaxed prose-strong:text-deep-teal prose-li:text-charcoal prose-a:text-primary-green hover:prose-a:text-primary-green-dark"
      dangerouslySetInnerHTML={{ __html: lesson.body }}
    />
  );
}

function TierLockedBlock({ minTierLabel }: { minTierLabel: string }) {
  return (
    <div className="bg-white border border-light-gray rounded-lg p-7 md:p-10 text-center">
      <Lock className="w-7 h-7 text-warm-gold mx-auto mb-4" aria-hidden />
      <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal mb-3">
        {minTierLabel} tier required
      </h2>
      <p className="font-sans text-base text-charcoal/85 leading-relaxed mb-6 max-w-md mx-auto">
        This lesson is part of the {minTierLabel} package. Upgrade your
        enrollment to unlock it along with everything else at that tier.
      </p>
      <Link
        href="/account/courses/browse"
        className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
      >
        See upgrade options
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </div>
  );
}

function TierExclusiveBlock({ maxTierLabel }: { maxTierLabel: string }) {
  return (
    <div className="bg-white border border-light-gray rounded-lg p-7 md:p-10 text-center">
      <Lock className="w-7 h-7 text-warm-gold mx-auto mb-4" aria-hidden />
      <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal mb-3">
        Not part of your tier&rsquo;s curriculum
      </h2>
      <p className="font-sans text-base text-charcoal/85 leading-relaxed max-w-md mx-auto">
        This lesson is exclusive to the {maxTierLabel} tier. Your enrollment
        includes a different path through this material.
      </p>
    </div>
  );
}
