/**
 * Pure scheduling helpers for the course nurture engine. No I/O here so they
 * can be unit tested with node:test (see schedule.test.ts).
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function nextSendAt(from: Date, delayHours: number): Date {
  return new Date(from.getTime() + delayHours * 60 * 60 * 1000);
}

export function advance(
  step: number,
  total: number,
): { nextStep: number; completed: boolean } {
  const nextStep = step + 1;
  return { nextStep, completed: nextStep >= total };
}

export function isSuppressed(email: string, unsubscribed: Set<string>): boolean {
  return unsubscribed.has(normalizeEmail(email));
}
