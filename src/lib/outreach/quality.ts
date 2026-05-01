export interface DraftValidationInput {
  hotel_name: string | null;
  draft_subject: string;
  draft_body: string;
}

export interface DraftValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Quality gate for skill-generated cold email drafts.
 * Rejects targets that fail before they ever enter the send queue.
 */
export function validateDraft(input: DraftValidationInput): DraftValidationResult {
  const subject = input.draft_subject.trim();
  if (subject.length < 10) return { valid: false, reason: "subject_too_short" };
  if (subject.length > 120) return { valid: false, reason: "subject_too_long" };

  const body = input.draft_body.trim();
  if (!body) return { valid: false, reason: "body_empty" };

  const wordCount = body.split(/\s+/).length;
  if (wordCount < 60) return { valid: false, reason: "body_too_short" };
  if (wordCount > 350) return { valid: false, reason: "body_too_long" };

  if (input.hotel_name && !body.toLowerCase().includes(input.hotel_name.toLowerCase())) {
    return { valid: false, reason: "no_hotel_name_in_body" };
  }

  const placeholderPatterns: Array<RegExp> = [
    /\[hotel name\]/i,
    /\[name\]/i,
    /\bLorem ipsum\b/i,
    /\bTODO\b/,
    /\bFIXME\b/,
  ];
  for (const p of placeholderPatterns) {
    if (p.test(body) || p.test(subject)) {
      return { valid: false, reason: "placeholder_text_detected" };
    }
  }

  if (!body.includes("{{AUDIT_URL}}")) {
    return { valid: false, reason: "no_audit_url_placeholder" };
  }

  return { valid: true };
}
