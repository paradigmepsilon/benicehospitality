/**
 * Idempotent find-or-create for the "Room Rental Riches leads" Resend audience.
 *
 * Run once (or any time): prints the audience id to drop into RESEND_AUDIENCE_ID.
 *
 *   node --env-file=.env.local --import tsx scripts/setup-resend-audience.ts
 */
import { Resend } from "resend";

const AUDIENCE_NAME = "Room Rental Riches leads";

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set. Aborting.");
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  const existing = await resend.audiences.list();
  if (existing.error) {
    console.error("Failed to list audiences:", existing.error);
    process.exit(1);
  }

  const match = existing.data?.data.find((a) => a.name === AUDIENCE_NAME);
  if (match) {
    console.log(`Found existing audience "${AUDIENCE_NAME}".`);
    console.log(`RESEND_AUDIENCE_ID=${match.id}`);
    return;
  }

  const created = await resend.audiences.create({ name: AUDIENCE_NAME });
  if (created.error || !created.data) {
    console.error("Failed to create audience:", created.error);
    process.exit(1);
  }
  console.log(`Created audience "${AUDIENCE_NAME}".`);
  console.log(`RESEND_AUDIENCE_ID=${created.data.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
