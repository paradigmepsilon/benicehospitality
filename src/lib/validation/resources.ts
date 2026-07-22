import { z } from "zod";

// Body for POST /api/resources/[slug]/unlock. Mirrors the scorecard unlock
// schema but without the scorecard-specific "answers accurate" concerns — the
// front-door gate just captures the lead. Role is optional here because these
// tools serve a broader audience than the property-scoring scorecard.
export const resourceUnlockBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(320),
  role: z
    .enum(["owner", "investor", "manager", "considering"])
    .optional(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  opted_in_newsletter: z.boolean().optional(),
  turnstile_token: z.string().min(1).max(2048),
  // Visit-scoped attribution, read back from sessionStorage by ResourceGate.
  // Client-supplied and therefore untrusted, so it is length-capped here and
  // only ever used as a label on the lead — never for access decisions.
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
});

export type ResourceUnlockBody = z.infer<typeof resourceUnlockBodySchema>;
