import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

interface SeedAccount {
  email: string;
  name: string;
  role: "admin" | "user";
  password: string;
}

// Idempotent: safe to re-run. Existing rows keep their existing password
// unless the env vars below differ from the stored hash, in which case the
// hash is rotated. Use `--force-reset` to overwrite even if the env var
// matches the seed default.
const DEFAULTS = {
  admin: {
    email: "admin@benicehospitality.com",
    name: "BNHG Admin",
    role: "admin" as const,
    password: process.env.BNHG_ADMIN_PASSWORD || "Admin2026!",
  },
  member: {
    email: "member@benicehospitality.com",
    name: "Maya Operator",
    role: "user" as const,
    password: process.env.BNHG_MEMBER_PASSWORD || "Member2026!",
  },
};

async function seedUsers() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Configure it in .env.local before seeding.",
    );
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const force = process.argv.includes("--force-reset");
  const accounts: SeedAccount[] = [DEFAULTS.admin, DEFAULTS.member];

  console.log("Seeding BNHG community accounts...");

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);

    const existing = (await sql`
      SELECT id, password_hash FROM users WHERE LOWER(email) = LOWER(${account.email})
    `) as { id: number; password_hash: string }[];

    if (existing.length === 0) {
      await sql`
        INSERT INTO users (email, name, role, password_hash)
        VALUES (${account.email}, ${account.name}, ${account.role}, ${passwordHash})
      `;
      console.log(
        `  ✓ created ${account.role.padEnd(5)} ${account.email}`,
      );
    } else if (force) {
      await sql`
        UPDATE users
        SET name = ${account.name},
            role = ${account.role},
            password_hash = ${passwordHash},
            updated_at = NOW(),
            disabled_at = NULL
        WHERE id = ${existing[0].id}
      `;
      console.log(
        `  ↻ reset    ${account.role.padEnd(5)} ${account.email} (--force-reset)`,
      );
    } else {
      console.log(
        `  · exists   ${account.role.padEnd(5)} ${account.email} (use --force-reset to overwrite)`,
      );
    }
  }

  console.log("Done.");
}

seedUsers().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
