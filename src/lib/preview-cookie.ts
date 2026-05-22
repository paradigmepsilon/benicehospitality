// Shared cookie name + value parsing for "admin previewing as member" mode.
// Lives outside the "use server" actions module because that module can only
// export async functions. Pages, layouts, API routes, and server actions all
// import from here.

export const PREVIEW_COOKIE_NAME = "bnhg_preview_member";

// What tier the admin is currently impersonating in the member portal.
//   null         — not in preview (real user, or admin browsing /admin)
//   "self-paced" — Tier 1
//   "cohort"     — Tier 2
//   "operator"   — Tier 3
export type PreviewMode = "self-paced" | "cohort" | "operator" | null;

export function parsePreviewCookie(raw: string | undefined): PreviewMode {
  if (!raw) return null;
  switch (raw) {
    case "self-paced":
    case "cohort":
    case "operator":
      return raw;
    // Legacy values ("1" — original boolean cookie; "admin" — removed god
    // view). Treat both as "self-paced" so old tabs land on the most
    // restrictive paid view rather than god-view-by-accident.
    case "1":
    case "admin":
      return "self-paced";
    default:
      return null;
  }
}
