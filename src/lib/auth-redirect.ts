// Open-redirect guard for the post-login `next` parameter. Shared between the
// client login form and the server-side OAuth callback so both validate the
// same way — server-side validation is the authoritative one.

// Internal paths a post-login redirect may land on. Claim Proof buyers set up
// an account from the delivery email with next=/claimproof/portal?t=..., so the
// portal must be allow-listed or the guard silently rewrites it to /account
// (which drops them on the generic member dashboard instead of their kit).
//
// /resources is here because the free tools went account-gated: every "create
// a free account" CTA on a tool page carries next=/resources/<slug>, and
// without the prefix the guard would drop the visitor on /account instead of
// the tool they were trying to open. /resources is a public route, so
// allow-listing it grants no access that did not already exist.
const SAFE_NEXT_PREFIXES = ["/account", "/admin", "/claimproof", "/resources"];

export function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  if (!SAFE_NEXT_PREFIXES.some((p) => raw === p || raw.startsWith(`${p}/`))) {
    return "/account";
  }
  return raw;
}
