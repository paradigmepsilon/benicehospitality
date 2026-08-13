import { cookies } from "next/headers";
import { PREVIEW_COOKIE_NAME, parsePreviewCookie } from "@/lib/preview-cookie";

/**
 * True when the caller is an admin currently previewing a member tier.
 *
 * While previewing, `session.user.id` is still the ADMIN's real id, so any
 * write would land on the admin's own account under a member's identity. Every
 * resource write path has to check this.
 *
 * Extracted from the save route so there is one implementation. Note the two
 * callers respond differently on purpose:
 *   - /api/resources/[slug]/save returns a fake success, because its optimistic
 *     bookmark UI would otherwise flap for an admin who is only looking.
 *   - /api/resources/[slug]/analyses returns a real 403. Faking a create there
 *     would hand the client an id that does not exist, and the next autosave
 *     PATCH would 404 against a row that was never written.
 */
export async function isAdminPreviewing(role: string): Promise<boolean> {
  if (role !== "admin") return false;
  const store = await cookies();
  return parsePreviewCookie(store.get(PREVIEW_COOKIE_NAME)?.value) !== null;
}
