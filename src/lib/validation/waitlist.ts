import { z } from "zod";

// "interest" is the catch-all tier used by tierless waitlists (e.g. Car Rental
// Riches, which doesn't have pricing tiers yet). Keep the explicit RRR tiers
// alongside it so the same endpoint and admin views serve both flows.
export const waitlistTierSchema = z.enum([
  "self_paced",
  "cohort",
  "operator",
  "interest",
]);
export type WaitlistTier = z.infer<typeof waitlistTierSchema>;

export const waitlistRequestBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(320),
  tier: waitlistTierSchema,
  course_slug: z.string().min(1).max(120).default("room-rental-riches"),
  turnstile_token: z.string().min(1).max(2048),
});

export const TIER_LABELS: Record<WaitlistTier, string> = {
  self_paced: "Self-paced",
  cohort: "Cohort",
  operator: "Operator",
  interest: "Interest",
};
