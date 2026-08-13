import { z } from "zod";

// Route-shape validation for /api/resources/[slug]/analyses.
//
// This layer checks STRUCTURE only — is `name` a sane string, is `data` an
// object, is `baseRevision` an integer. It deliberately says nothing about the
// contents of `data`: that is the tool's own business, handled by the
// `sanitize` function in analysis-schemas.ts, which strips and defaults rather
// than rejecting. Splitting it this way is what lets us tighten a tool's state
// shape without 400-ing a member who still has yesterday's bundle loaded.
//
// The `name` bound matches the column's CHECK (char_length BETWEEN 1 AND 120)
// so a too-long name fails as a readable 400 rather than a Postgres error.

/** `data` is any JSON object. The tool sanitizes the inside of it. */
const payloadSchema = z.record(z.string(), z.unknown());

export const analysisCreateBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  data: payloadSchema.optional(),
});

export const analysisPatchBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    data: payloadSchema.optional(),
    schemaVersion: z.number().int().min(1).max(32767).optional(),
    // Required on every write: the optimistic-concurrency token the client got
    // with its last read. Without it two tabs silently overwrite each other.
    baseRevision: z.number().int().min(0),
    /**
     * The member actually changed something, as opposed to a rehydrate or a
     * migration. The route shelves the tool on their dashboard only when true.
     *
     * Declared here because zod objects STRIP unknown keys by default — leave
     * it out and the flag vanishes silently between the client and the handler,
     * with nothing failing to point at why.
     */
    dirty: z.boolean().optional(),
  })
  .refine((b) => b.name !== undefined || b.data !== undefined, {
    message: "Provide a name, data, or both.",
  });

export const analysisDuplicateBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
});

export type AnalysisCreateBody = z.infer<typeof analysisCreateBodySchema>;
export type AnalysisPatchBody = z.infer<typeof analysisPatchBodySchema>;
export type AnalysisDuplicateBody = z.infer<typeof analysisDuplicateBodySchema>;
