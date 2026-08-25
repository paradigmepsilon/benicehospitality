import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowRight, Check, Sparkles, Lock } from "lucide-react";
import { getViewerContext } from "@/lib/preview";
import {
  getCourseBySlug,
  getActiveEnrollment,
  listLessonsForCourse,
  listCompletedLessonIds,
  listModulesForCourse,
  grantEnrollment,
  userCanAccessLesson,
  formatLessonNumber,
  type Enrollment,
  type Lesson,
  type CourseModule,
} from "@/lib/lms";
import {
  getCatalogCourseBySlug,
  getPurchaseBySessionId,
  markPurchaseSucceeded,
  getTierById,
} from "@/lib/course-catalog";
import { getStripe } from "@/lib/stripe";
import TierBuyCard from "@/components/sections/courses/TierBuyCard";

export const metadata: Metadata = {
  title: "Course",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

const TIER_LABEL: Record<string, string> = {
  "self-paced": "Self-paced",
  cohort: "Cohort",
  operator: "Operator (1:1)",
  comp: "Complimentary",
};

// Stripe redirects here after a successful Checkout Session with the
// session_id query param. We confirm the payment via the API and grant
// enrollment in case the webhook hasn't fired yet (or fired in a different
// region). This is the fast path; the webhook is the durable backup.
async function reconcilePostCheckout(
  sessionId: string,
  userId: number,
): Promise<{ tier: string; courseTitle: string } | null> {
  try {
    const purchase = await getPurchaseBySessionId(sessionId);
    if (!purchase) return null;
    if (purchase.userId !== userId) return null;
    if (purchase.status !== "pending") {
      // Already reconciled by webhook. Look up tier name for the welcome ribbon.
      const tier = await getTierById(purchase.courseTierId);
      const enrollment = await getActiveEnrollment(userId, purchase.courseId);
      return tier && enrollment
        ? { tier: tier.name, courseTitle: "" }
        : null;
    }
    // Confirm payment status with Stripe before doing anything mutating.
    const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId);
    if (stripeSession.payment_status !== "paid") return null;

    const tier = await getTierById(purchase.courseTierId);
    if (!tier) return null;

    await grantEnrollment({
      userId,
      courseId: purchase.courseId,
      tier: tier.tier,
      grantedByUserId: null,
      notes: `Stripe checkout session ${sessionId}`,
    });
    await markPurchaseSucceeded(
      sessionId,
      typeof stripeSession.payment_intent === "string"
        ? stripeSession.payment_intent
        : stripeSession.payment_intent?.id ?? null,
    );
    return { tier: tier.name, courseTitle: "" };
  } catch (err) {
    console.error("[account/courses/[slug]] post-checkout reconcile failed:", err);
    return null;
  }
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { session_id: stripeSessionId } = await searchParams;

  const ctx = await getViewerContext();
  if (!ctx) {
    redirect(`/login?next=${encodeURIComponent(`/account/courses/${slug}`)}`);
  }

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  // Review gate: until the admin marks the course ready (is_published flips
  // true), the course does not exist for non-admin viewers — enrolled or not.
  if (!course.isPublished && !ctx.realIsAdmin) notFound();

  // If the user just came back from a successful Stripe checkout, reconcile
  // before deciding what to render. This makes the post-purchase experience
  // feel instant instead of "your enrollment is processing, refresh in 30s".
  // Skip in any preview mode; admins aren't actually purchasing.
  let welcomeRibbon: { tier: string } | null = null;
  if (stripeSessionId && ctx.previewMode === null) {
    const result = await reconcilePostCheckout(stripeSessionId, ctx.userId);
    if (result) welcomeRibbon = { tier: result.tier };
  }

  // Resolve real enrollment for non-admin viewers. In tier preview, the
  // effectiveTier from the cookie stands in for an enrollment row across
  // every course, so we don't query the DB at all.
  let enrollment: Enrollment | null = null;
  if (!ctx.effectiveIsAdmin && ctx.effectiveTier === null) {
    enrollment = await getActiveEnrollment(ctx.userId, course.id);
  }

  // Branch 1: Not enrolled, not admin, not in tier preview → preview/buy view.
  if (
    !enrollment &&
    !ctx.effectiveIsAdmin &&
    ctx.effectiveTier === null
  ) {
    const catalog = await getCatalogCourseBySlug(slug);
    return (
      <PreviewView
        course={{ slug: course.slug, title: course.title, summary: course.summary }}
        catalog={catalog}
      />
    );
  }

  // Branch 2: Enrolled, admin god view, or admin tier preview → curriculum.
  const [allLessons, modules] = await Promise.all([
    listLessonsForCourse(course.id),
    listModulesForCourse(course.id),
  ]);
  const lessons = allLessons.filter((l) => l.isPublished || ctx.effectiveIsAdmin);
  // Real progress only for real members. Admin god view + tier-preview both
  // start from a clean slate so the admin's user_id never accumulates fake
  // progress from clicking around.
  const completedIds =
    ctx.isReadOnlyPreview
      ? new Set<number>()
      : await listCompletedLessonIds(ctx.userId, course.id);

  // Tier preview overrides the real enrollment tier; god view leaves it null
  // and effectiveIsAdmin handles the bypass.
  const userTier = ctx.effectiveTier ?? enrollment?.tier ?? null;

  const accessibleLessons = lessons.filter(
    (l) => ctx.effectiveIsAdmin || userCanAccessLesson(userTier, l.minTier, l.maxTier),
  );
  const completedCount = accessibleLessons.filter((l) =>
    completedIds.has(l.id),
  ).length;
  const totalForProgress = accessibleLessons.length;
  const pct =
    totalForProgress > 0
      ? Math.round((completedCount / totalForProgress) * 100)
      : 0;

  const nextLesson =
    accessibleLessons.find((l) => !completedIds.has(l.id)) ??
    accessibleLessons[0] ??
    null;

  // Group lessons by module. Lessons without a module fall into a final
  // "Other" bucket so they don't disappear silently if data is mid-migration.
  const lessonsByModule = new Map<number | "unassigned", Lesson[]>();
  for (const l of lessons) {
    const key: number | "unassigned" = l.moduleId ?? "unassigned";
    const list = lessonsByModule.get(key) ?? [];
    list.push(l);
    lessonsByModule.set(key, list);
  }
  const orderedSections: Array<{
    key: string;
    module: CourseModule | null;
    moduleIndex: number | null;
    lessons: Lesson[];
  }> = [];
  let moduleCounter = 0;
  for (const m of modules) {
    if (!m.isPublished && !ctx.effectiveIsAdmin) continue;
    moduleCounter++;
    const list = lessonsByModule.get(m.id) ?? [];
    orderedSections.push({
      key: `m${m.id}`,
      module: m,
      moduleIndex: moduleCounter,
      lessons: list,
    });
  }
  const orphans = lessonsByModule.get("unassigned") ?? [];
  if (orphans.length > 0) {
    orderedSections.push({
      key: "unassigned",
      module: null,
      moduleIndex: null,
      lessons: orphans,
    });
  }

  return (
    <div className="max-w-5xl">
      <Link
        href="/account/courses"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← Your courses
      </Link>

      {welcomeRibbon && (
        <div className="bg-primary-green text-white rounded-lg p-5 md:p-6 mb-8 flex items-start gap-4">
          <Sparkles className="w-5 h-5 text-warm-gold flex-shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-display text-lg font-semibold leading-tight">
              You&rsquo;re in. Welcome to {course.title}.
            </p>
            <p className="font-sans text-sm text-white/85 leading-relaxed mt-1">
              {welcomeRibbon.tier} access activated. Your receipt is on its way
              to your inbox. Start with the first lesson below.
            </p>
          </div>
        </div>
      )}

      {enrollment && (
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
          {TIER_LABEL[enrollment.tier] ?? enrollment.tier} · enrolled
        </p>
      )}
      {!enrollment && ctx.effectiveIsAdmin && (
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
          Admin access
        </p>
      )}
      {!enrollment && ctx.effectiveTier !== null && (
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
          {TIER_LABEL[ctx.effectiveTier] ?? ctx.effectiveTier} · preview
        </p>
      )}
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-deep-teal leading-[1.05] tracking-tight mb-5">
        {course.title}
      </h1>
      <p className="font-sans text-base text-charcoal leading-relaxed max-w-3xl mb-8">
        {course.summary}
      </p>

      {lessons.length > 0 && (
        <div className="bg-white border border-light-gray rounded-lg p-5 md:p-6 mb-10 max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-charcoal/65">
              Progress
            </p>
            <p className="font-sans text-sm font-semibold text-deep-teal">
              {pct}% · {completedCount} / {lessons.length}
            </p>
          </div>
          <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-warm-gold"
              style={{ width: `${pct}%` }}
            />
          </div>
          {nextLesson && (
            <Link
              href={`/account/courses/${course.slug}/${nextLesson.slug}`}
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
            >
              {completedCount === 0
                ? "Start with"
                : completedCount === lessons.length
                  ? "Revisit"
                  : "Continue with"}{" "}
              &ldquo;{nextLesson.title}&rdquo;
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
        </div>
      )}

      <div className="space-y-10">
        {orderedSections.length === 0 ? (
          <div className="bg-white border border-dashed border-light-gray rounded-lg p-8 text-center">
            <p className="font-sans text-sm text-charcoal/70">
              Curriculum is being prepared. Check back soon.
            </p>
          </div>
        ) : (
          orderedSections.map((section) => (
            <ModuleSection
              key={section.key}
              module={section.module}
              moduleIndex={section.moduleIndex}
              lessons={section.lessons}
              completedIds={completedIds}
              userTier={userTier}
              isAdmin={ctx.effectiveIsAdmin}
              courseSlug={course.slug}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ModuleSection({
  module,
  moduleIndex,
  lessons,
  completedIds,
  userTier,
  isAdmin,
  courseSlug,
}: {
  module: CourseModule | null;
  moduleIndex: number | null;
  lessons: Lesson[];
  completedIds: Set<number>;
  userTier: "self-paced" | "cohort" | "operator" | "comp" | null;
  isAdmin: boolean;
  courseSlug: string;
}) {
  return (
    <section>
      <header className="mb-4">
        {module?.phaseLabel && (
          <p className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-charcoal/50 mb-2">
            {module.phaseLabel}
          </p>
        )}
        <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight">
          {module?.title ?? "Other lessons"}
        </h2>
        {module?.summary && (
          <p className="font-sans text-sm text-charcoal/75 leading-relaxed mt-1 max-w-3xl">
            {module.summary}
          </p>
        )}
      </header>
      {lessons.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/55 italic">
          {isAdmin
            ? "No lessons in this module yet."
            : "Lessons coming soon."}
        </p>
      ) : (
        <ol className="space-y-3">
          {lessons.map((lesson, lessonIdx) => {
            const allowed = isAdmin || userCanAccessLesson(userTier, lesson.minTier, lesson.maxTier);
            const done = completedIds.has(lesson.id);
            const lessonLabel = formatLessonNumber(moduleIndex, lessonIdx + 1);
            return (
              <li key={lesson.id}>
                <Link
                  href={`/account/courses/${courseSlug}/${lesson.slug}`}
                  className={[
                    "flex items-start gap-4 bg-white border border-light-gray rounded-lg p-5 md:p-6 transition-colors group",
                    allowed
                      ? "hover:border-primary-green/40"
                      : "opacity-80 hover:border-warm-gold/50",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className={[
                      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-sans text-xs font-semibold",
                      done
                        ? "bg-primary-green text-white"
                        : !allowed
                          ? "bg-warm-gold/15 text-warm-gold border border-warm-gold/40"
                          : "bg-cream text-deep-teal border border-light-gray",
                    ].join(" ")}
                  >
                    {done ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : !allowed ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      lessonLabel
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg md:text-xl font-semibold text-deep-teal leading-tight mb-1 group-hover:text-warm-gold transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.summary && (
                      <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                        {lesson.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-charcoal/55 font-sans">
                      {lesson.durationMin !== null && (
                        <span>{lesson.durationMin} min</span>
                      )}
                      {lesson.bodyKind === "bundle" && <span>Slide deck</span>}
                      {lesson.bodyKind === "video" && <span>Video</span>}
                      {lesson.bodyKind === "workbook" && <span>Workbook</span>}
                      {!allowed && lesson.minTier && (
                        <span className="text-warm-gold font-semibold uppercase tracking-wider">
                          {lesson.minTier === "operator"
                            ? "Operator"
                            : lesson.minTier === "cohort"
                              ? "Cohort+"
                              : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className="w-5 h-5 text-charcoal/30 mt-2 group-hover:text-primary-green transition-colors"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function PreviewView({
  course,
  catalog,
}: {
  course: { slug: string; title: string; summary: string };
  catalog: Awaited<ReturnType<typeof getCatalogCourseBySlug>>;
}) {
  const purchasable = catalog?.isPurchasable ?? false;
  const tiers = catalog?.tiers ?? [];

  return (
    <div className="max-w-4xl">
      <Link
        href="/account/courses/browse"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60 hover:text-primary-green mb-6"
      >
        ← Browse courses
      </Link>
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
        Preview
      </p>
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-deep-teal leading-[1.05] tracking-tight mb-5">
        {course.title}
      </h1>
      <p className="font-sans text-base text-charcoal leading-relaxed max-w-3xl mb-10">
        {course.summary}
      </p>

      {!purchasable ? (
        <div className="bg-white border border-light-gray rounded-lg p-7 md:p-10">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal mb-3">
            {catalog?.isPlaceholder ? "Coming soon." : "Not yet for sale."}
          </h2>
          <p className="font-sans text-base text-charcoal/85 leading-relaxed mb-6">
            This course is being prepared. We&rsquo;ll email you the moment it
            opens for enrollment.
          </p>
          <Link
            href="/account/courses/browse"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
          >
            Browse other courses
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      ) : tiers.length === 0 ? (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-8 text-center">
          <p className="font-sans text-sm text-charcoal/70">
            Pricing tiers haven&rsquo;t been published yet. Check back shortly,
            or email{" "}
            <a
              href="mailto:admin@benicehospitality.com"
              className="text-primary-green hover:text-primary-green-dark underline"
            >
              admin@benicehospitality.com
            </a>{" "}
            for early access.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-deep-teal mb-2">
            Pick a tier.
          </h2>
          <p className="font-sans text-sm text-charcoal/70 mb-6">
            Cohort is the most popular path. All tiers include lifetime access
            and a 30-day money-back guarantee.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((t) => (
              <TierBuyCard
                key={t.id}
                tier={t}
                highlight={t.tier === "cohort"}
                disabled={!t.stripePriceId}
                disabledReason={
                  !t.stripePriceId
                    ? "Stripe price not configured. Contact admin."
                    : undefined
                }
              />
            ))}
          </div>
          <p className="font-sans text-xs text-charcoal/55 mt-6">
            Already purchased and don&rsquo;t see your enrollment? Email{" "}
            <a
              href="mailto:admin@benicehospitality.com"
              className="text-primary-green hover:text-primary-green-dark underline"
            >
              admin@benicehospitality.com
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
