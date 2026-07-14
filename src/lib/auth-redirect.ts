// Open-redirect guard for the post-login `next` parameter. Shared between the
// client login form and the server-side OAuth callback so both validate the
// same way — server-side validation is the authoritative one.

// Internal paths a post-login redirect may land on. Claim Proof buyers set up
// an account from the delivery email with next=/claimproof/portal?t=..., so the
// portal must be allow-listed or the guard silently rewrites it to /account
// (which drops them on the generic member dashboard instead of their kit).
const SAFE_NEXT_PREFIXES = ["/account", "/admin", "/claimproof"];

export function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  if (!SAFE_NEXT_PREFIXES.some((p) => raw === p || raw.startsWith(`${p}/`))) {
    return "/account";
  }
  return raw;
}
