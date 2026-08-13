// Access resolution for a resource tool page.
//
// Before the account-required cutover each of the twenty tool pages did its own
// Promise.all([getCurrentSession(), hasResourceUnlock()]). getCurrentSession()
// is not React-cached, so that pattern cost a DB round-trip per call site.
// Everything funnels through getResourceAccess() now: one session read, one
// cookie read, and the auto-add side effect in a single place.

import { after } from "next/server";
import { cookies } from "next/headers";
import { getCurrentSession } from "@/lib/community-auth";
import { hasResourceUnlock } from "@/lib/resources/unlock-cookie";
import { PREVIEW_COOKIE_NAME, parsePreviewCookie } from "@/lib/preview-cookie";
import {
  isResourceToolSaved,
  shelveResourceTool,
  touchResourceToolOpen,
} from "@/lib/resources/saved";
import { recordResourceToolLead } from "@/lib/resources/leads";
import type { ResourceToolMeta } from "@/lib/resources/registry";

/**
 * - `member`         — logged in. Full access. The open is recorded, but the
 *                      tool is only added to their dashboard if they ask.
 * - `grandfathered`  — no account, but still holding a valid pre-cutover
 *                      unlock cookie. Full access plus a "create an account"
 *                      banner, until the cookie expires (90-day TTL).
 * - `locked`         — everyone else. Marketing copy renders; the tool itself
 *                      is replaced by a create-account prompt.
 */
export type ResourceAccessMode = "member" | "grandfathered" | "locked";

export interface ResourceAccess {
  mode: ResourceAccessMode;
  loggedIn: boolean;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  /** Seeds the save button's initial state. */
  saved: boolean;
  /** Admin impersonating a member tier — never write to their real shelf. */
  isReadOnlyPreview: boolean;
  /**
   * May this session write tool data to the account? The ONLY correct write
   * gate, and the reason it exists as its own field.
   *
   * Neither of the two obvious tests works on its own. `mode === "member"` is
   * true for an admin previewing a member tier, whose writes would land on the
   * admin's own row under someone else's identity. `loggedIn` is the same value
   * and carries the same hole — passing it into tool components under that name
   * is precisely how the hole got there. And a grandfathered visitor renders
   * the live tool with no account at all to write to.
   */
  canSync: boolean;
}

export async function getResourceAccess(
  tool: ResourceToolMeta,
): Promise<ResourceAccess> {
  const [session, cookieUnlock, store] = await Promise.all([
    getCurrentSession(),
    hasResourceUnlock(),
    cookies(),
  ]);

  // Reconstructed from the raw cookie rather than via getViewerContext(),
  // which would trigger a second uncached getCurrentSession().
  const isReadOnlyPreview =
    session?.user.role === "admin" &&
    parsePreviewCookie(store.get(PREVIEW_COOKIE_NAME)?.value) !== null;

  const mode: ResourceAccessMode = session
    ? "member"
    : cookieUnlock
      ? "grandfathered"
      : "locked";

  const canSync = Boolean(session) && mode === "member" && !isReadOnlyPreview;

  // Whether the tool is on their dashboard. This used to be hardcoded true for
  // every member, on the reasoning that the deferred auto-add made it true
  // within milliseconds. Now that opening no longer saves, that shortcut would
  // be a straight lie — the button would read "Saved" on a tool nobody added.
  // One indexed lookup, and only for signed-in members.
  const saved = canSync
    ? await isResourceToolSaved(session!.user.id, tool.slug).catch(() => false)
    : false;

  if (canSync) {
    const { id, email, name } = session!.user;
    // Record the open, deferred past the response so the visitor pays nothing
    // for it. after() is stable in Next 16.
    after(async () => {
      try {
        // A tool with nothing to fill in can only ever be "used" by being
        // opened, so opening puts it on the dashboard. Everything else waits
        // for a real edit and gets shelved by its write route instead — see
        // the `persistence` docs in registry.ts.
        const created =
          tool.persistence === "none"
            ? (await shelveResourceTool(id, tool.slug, "auto-open")).inserted
            : await touchResourceToolOpen(id, tool.slug);
        // First open of this tool by this person → the CRM ingestion point
        // that the deleted unlock endpoint used to own. Still keyed to the
        // OPEN, not the shelf: a lead is a lead-gen signal, and someone who
        // looked and left is still a lead.
        if (created) {
          await recordResourceToolLead({
            slug: tool.slug,
            email,
            name,
            userId: id,
          });
        }
      } catch (err) {
        console.error("[resources/access] auto-add failed:", err);
      }
    });
  }

  return {
    mode,
    loggedIn: Boolean(session),
    userId: session?.user.id ?? null,
    userEmail: session?.user.email ?? null,
    userName: session?.user.name ?? null,
    saved,
    isReadOnlyPreview,
    canSync,
  };
}
