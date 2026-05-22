import { cookies } from "next/headers";
import { getCurrentSession } from "@/lib/community-auth";
import {
  PREVIEW_COOKIE_NAME,
  parsePreviewCookie,
  type PreviewMode,
} from "@/lib/preview-cookie";
import type { EnrollmentTier } from "@/lib/lms";

// Single source of truth for "what view should this /account/* page render?"
// Pages call getViewerContext() once and use ctx.effectiveIsAdmin /
// ctx.effectiveTier instead of session.user.role / enrollment.tier directly.
// That's how the admin's "view as Tier 1/2/3" toggle propagates everywhere.

export interface ViewerContext {
  userId: number;
  userEmail: string;
  userName: string;
  realIsAdmin: boolean;
  // null when not previewing (real user, or admin browsing /admin)
  previewMode: PreviewMode;
  // What pages should treat the viewer as for gating decisions:
  //   true  — bypass minTier checks, see unpublished, no progress (god view)
  //   false — gate by effectiveTier
  effectiveIsAdmin: boolean;
  // Tier to feed into userMeetsMinTier(). null = god view.
  effectiveTier: EnrollmentTier | null;
  // Any preview mode (god view OR tier impersonation). When true, pages should
  // suppress writes (lesson_progress) so the admin's user_id doesn't accumulate
  // fake state from clicking around.
  isReadOnlyPreview: boolean;
}

export async function getViewerContext(): Promise<ViewerContext | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const realIsAdmin = session.user.role === "admin";
  const cookieStore = await cookies();
  const previewMode = realIsAdmin
    ? parsePreviewCookie(cookieStore.get(PREVIEW_COOKIE_NAME)?.value)
    : null;

  // When previewMode is null, the viewer is either a real member (real
  // enrollment / role) or an admin who hasn't entered preview yet — the
  // /account/* layout redirects the latter to /admin. When previewMode is
  // a tier, the admin impersonates a member at that tier across the board.
  const effectiveIsAdmin = previewMode === null && realIsAdmin;
  const effectiveTier: EnrollmentTier | null = previewMode;

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    realIsAdmin,
    previewMode,
    effectiveIsAdmin,
    effectiveTier,
    isReadOnlyPreview: realIsAdmin && previewMode !== null,
  };
}
