import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AccountDashboard from "@/components/sections/auth/AccountDashboard";
import WelcomeModal from "@/components/member/WelcomeModal";
import { getViewerContext } from "@/lib/preview";
import {
  listEnrollmentsForUser,
  synthesizeEnrollmentsForTier,
} from "@/lib/lms";
import { listSavedResourceTools } from "@/lib/resources/saved";

/** How many saved tools the dashboard shows before deferring to the full page. */
const DASHBOARD_SAVED_LIMIT = 6;

export const metadata: Metadata = {
  title: "Your Account",
  description:
    "Your courses, resources, and Nice Host Network access in one place.",
  alternates: { canonical: "https://benicehospitality.com/account" },
  robots: { index: false, follow: false },
};

// The layout (src/app/account/layout.tsx) already gates auth and decides
// whether an admin is allowed in (preview mode only). This page just renders
// the dashboard for whatever viewer context applies: real member, admin in
// god-view preview, or admin previewing as a specific tier.
export default async function AccountPage() {
  const ctx = await getViewerContext();
  if (!ctx) {
    redirect("/login?next=%2Faccount");
  }

  // For tier impersonation, synthesize one enrollment row per published course
  // at the previewed tier so the dashboard renders as a real member would see
  // it. God view (effectiveTier === null while effectiveIsAdmin) keeps the
  // admin's actual enrollments, typically empty, which is fine.
  // ctx.userId is the admin's real id during preview, so their own saved tools
  // would show under a member's identity. Empty shelf while previewing.
  const inPreview = ctx.previewMode !== null;

  const [enrollments, savedTools] = await Promise.all([
    ctx.effectiveTier !== null
      ? synthesizeEnrollmentsForTier(ctx.effectiveTier)
      : listEnrollmentsForUser(ctx.userId),
    inPreview ? Promise.resolve([]) : listSavedResourceTools(ctx.userId),
  ]);

  return (
    <>
      {/* Suspense boundary required because WelcomeModal reads useSearchParams.
          The modal renders only when ?welcome=1 is in the URL — set by the
          onboarding submit redirect — and self-clears the query string. */}
      <Suspense fallback={null}>
        <WelcomeModal userName={ctx.userName} />
      </Suspense>
      <AccountDashboard
        initialUser={{
          email: ctx.userEmail,
          name: ctx.userName,
          role: ctx.realIsAdmin ? "admin" : "user",
        }}
        enrollments={enrollments.map((e) => ({
          id: e.id,
          tier: e.tier,
          course: {
            slug: e.course.slug,
            title: e.course.title,
            summary: e.course.summary,
          },
          totalLessons: e.totalLessons,
          completedLessons: e.completedLessons,
        }))}
        savedTools={savedTools.slice(0, DASHBOARD_SAVED_LIMIT).map((t) => ({
          slug: t.toolSlug,
          name: t.tool.name,
          blurb: t.tool.blurb,
          lane: t.lane,
        }))}
        savedToolsTotal={savedTools.length}
      />
    </>
  );
}
