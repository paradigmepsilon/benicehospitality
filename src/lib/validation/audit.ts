import { z } from "zod";

export const letterGradeSchema = z.enum(["A", "B", "C", "D", "F"]);

export const dimensionKeySchema = z.enum([
  "revenue_opportunity",
  "online_reputation",
  "competitive_position",
  "guest_personas",
  "tech_stack",
  "visibility_discoverability",
]);

export const focusDimensionKeySchema = z.enum([
  "revenue_opportunity",
  "online_reputation",
  "competitive_position",
  "guest_personas",
  "tech_stack",
  "visibility_discoverability",
  "quick_wins",
  "general_all_seven",
]);

export const dimensionScoreSchema = z.object({
  subscore: z.number().int().min(0).max(100),
  grade: letterGradeSchema,
  findings: z.array(z.string().min(1).max(500)).min(1).max(2),
});

export const quickWinSchema = z.object({
  title: z.string().min(1).max(200),
  effort: z.enum(["this_week", "this_month", "this_quarter"]),
  pillar: z.enum(["commercial", "guest_experience", "tech"]),
  finding: z.string().min(1).max(500),
  action: z.string().min(1).max(500),
});

export const auditDataSchema = z.object({
  hotel: z.object({
    name: z.string().min(1).max(500),
    slug: z.string().min(1).max(255),
    url: z.string().url().max(2000),
    location: z.string().max(255).nullable(),
    room_count: z.number().int().positive().nullable(),
  }),
  overall: z.object({
    score: z.number().int().min(0).max(100),
    grade: letterGradeSchema,
    summary: z.string().min(1).max(500),
  }),
  dimensions: z.object({
    revenue_opportunity: dimensionScoreSchema,
    online_reputation: dimensionScoreSchema,
    competitive_position: dimensionScoreSchema,
    guest_personas: dimensionScoreSchema,
    tech_stack: dimensionScoreSchema,
    visibility_discoverability: dimensionScoreSchema,
  }),
  quick_wins: z.tuple([quickWinSchema, quickWinSchema, quickWinSchema]),
  generated_at: z.string().datetime(),
  signal_referral_eligible: z.boolean(),
});

export const auditCreatePayloadSchema = z.object({
  audit_data: auditDataSchema,
});

export const auditUnlockBodySchema = z.object({
  email: z.string().email().max(320),
  turnstile_token: z.string().min(1).max(2048),
});

export const auditTrackBodySchema = z.object({
  event_type: z.enum(["cta_clicked"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const auditRequestBodySchema = z.object({
  hotel_url: z.string().url().max(2000),
  email: z.string().email().max(320),
  role: z.enum(["owner", "gm", "operator", "other"]),
  turnstile_token: z.string().min(1).max(2048),
});
