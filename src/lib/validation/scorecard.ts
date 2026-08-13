import { z } from "zod";
import { SCORECARD_QUESTION_IDS } from "@/lib/scorecard/questions";

// Drop ids that are not in the current question set rather than rejecting the
// whole submission. Whenever a question is added or retired, browsers still
// holding the previous bundle keep posting the old ids, and a hard reject would
// throw away a 10-minute session with no way to recover. This is not a loosened
// safeguard: computeScorecard only ever reads ids it finds in SCORECARD_SECTIONS,
// so an unrecognized key has never been able to move a score.
const answerMapSchema = z
  .record(z.string(), z.boolean())
  .transform((val) =>
    Object.fromEntries(
      Object.entries(val).filter(([k]) => SCORECARD_QUESTION_IDS.has(k)),
    ),
  );

export const scorecardSubmitBodySchema = z.object({
  answers: answerMapSchema,
  property_nickname: z.string().trim().max(120).optional(),
  turnstile_token: z.string().min(1).max(2048),
});

export const scorecardUnlockBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(320),
  role: z.enum(["owner", "investor", "manager", "considering"]),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  opted_in_newsletter: z.boolean().optional(),
  turnstile_token: z.string().min(1).max(2048),
});

export type ScorecardSubmitBody = z.infer<typeof scorecardSubmitBodySchema>;
export type ScorecardUnlockBody = z.infer<typeof scorecardUnlockBodySchema>;
