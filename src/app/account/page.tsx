import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountDashboard from "@/components/sections/auth/AccountDashboard";
import { getViewerContext } from "@/lib/preview";
import {
  listEnrollmentsForUser,
  synthesizeEnrollmentsForTier,
} from "@/lib/lms";

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
  const enrollments =
    ctx.effectiveTier !== null
      ? await synthesizeEnrollmentsForTier(ctx.effectiveTier)
      : await listEnrollmentsForUser(ctx.userId);

  return (
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
    />
  );
}
