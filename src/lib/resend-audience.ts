import { Resend } from "resend";

let cached: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

/**
 * Best-effort upsert of a contact into the configured Resend audience
 * (RESEND_AUDIENCE_ID). Never throws — returns false on any failure or when
 * unconfigured, so callers can log-and-continue without blocking their flow.
 *
 * Resend's contacts.create is effectively an upsert for our purposes: a
 * duplicate email returns an error we treat as non-fatal.
 */
export async function upsertAudienceContact(args: {
  email: string;
  firstName?: string | null;
  unsubscribed?: boolean;
}): Promise<boolean> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const resend = getClient();
  if (!audienceId || !resend) return false;

  try {
    const res = await resend.contacts.create({
      audienceId,
      email: args.email.toLowerCase().trim(),
      firstName: args.firstName?.trim() || undefined,
      unsubscribed: args.unsubscribed ?? false,
    });
    if (res.error) {
      console.error("[resend-audience] contact upsert error:", res.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[resend-audience] contact upsert threw:", err);
    return false;
  }
}
