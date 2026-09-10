export const FOUNDER_LABELS: Record<string, string> = {
  alex: "Alex Henry",
  della: "Della Henry",
};

/**
 * The founder's own inbox for their Google Meet calendar invite. Configured
 * via env (not hardcoded) since these are real business contacts, not
 * something to invent — see ALEX_CALENDAR_EMAIL / DELLA_CALENDAR_EMAIL.
 * Returns null (rather than throwing) when unset, matching every other
 * best-effort Calendar side effect: a missing address just skips the invite.
 */
export function founderCalendarEmail(founder: string | null): string | null {
  if (founder === "alex") return process.env.ALEX_CALENDAR_EMAIL || null;
  if (founder === "della") return process.env.DELLA_CALENDAR_EMAIL || null;
  return null;
}
