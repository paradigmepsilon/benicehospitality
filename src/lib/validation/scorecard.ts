import { z } from "zod";
import { SCORECARD_QUESTION_IDS } from "@/lib/scorecard/questions";

const answerMapSchema = z
  .record(z.string(), z.boolean())
  .refine(
    (val) => Object.keys(val).every((k) => SCORECARD_QUESTION_IDS.has(k)),
    { message: "Unknown question id" },
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
