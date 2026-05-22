// Open-redirect guard for the post-login `next` parameter. Shared between the
// client login form and the server-side OAuth callback so both validate the
// same way — server-side validation is the authoritative one.

const SAFE_NEXT_PREFIXES = ["/account", "/admin"];

export function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  if (!SAFE_NEXT_PREFIXES.some((p) => raw === p || raw.startsWith(`${p}/`))) {
    return "/account";
  }
  return raw;
}
