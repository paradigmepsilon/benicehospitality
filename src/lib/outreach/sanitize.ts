/**
 * Strip the most common AI tells out of a generated email draft. The Claude
 * prompt already forbids these, but the model occasionally slips. Running a
 * deterministic pass after generation guarantees nothing leaks through.
 *
 * Rules (kept narrow to avoid mangling intentional usage):
 *   1. Em dashes / en dashes → comma + space (with surrounding spacing fixed).
 *   2. Curly quotes → straight quotes (single and double).
 *   3. Ellipsis char (…) → three dots.
 *   4. Non-breaking spaces → regular spaces.
 *   5. Trim trailing whitespace on each line, collapse 3+ blank lines to 2.
 */
export function sanitizeDraftText(input: string): string {
  if (!input) return input;

  let out = input;

  // Step 1: replace em/en dashes. Patterns we see:
  //   "word — word"   → "word, word"
  //   "word—word"     → "word, word"
  //   "word —word"    → "word, word"
  // Same for en dash (–). We don't touch hyphens (-).
  out = out.replace(/\s*[—–]\s*/g, ", ");

  // Step 2: curly quotes. (‘, ’ are single; “, ” are double.)
  out = out
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"');

  // Step 3: ellipsis character.
  out = out.replace(/…/g, "...");

  // Step 4: non-breaking and other invisible spaces.
  out = out.replace(/[   ]/g, " ");

  // Step 5: trim trailing spaces on each line, collapse 3+ blank lines to 2.
  out = out
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  // Step 6: a comma immediately before another comma or period reads worse than
  // the original em-dash. Clean those up.
  out = out.replace(/,\s*,/g, ",").replace(/,\s*\./g, ".");

  return out;
}

/**
 * Apply sanitization to a generated draft (subject + body). Returns a new
 * object; does not mutate.
 */
export function sanitizeDraft<T extends { subject: string; body: string }>(draft: T): T {
  return {
    ...draft,
    subject: sanitizeDraftText(draft.subject),
    body: sanitizeDraftText(draft.body),
  };
}
