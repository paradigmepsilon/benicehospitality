import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// In local dev without DATABASE_URL, return an empty result set instead of
// crashing at module-evaluation time. Production / preview deployments must
// have DATABASE_URL configured.
function makeStub(): NeonQueryFunction<false, false> {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[db] DATABASE_URL is not set — DB queries will return [] in this environment.",
    );
  }
  return (async () =>
    []) as unknown as NeonQueryFunction<false, false>;
}

export const sql: NeonQueryFunction<false, false> = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : makeStub();
