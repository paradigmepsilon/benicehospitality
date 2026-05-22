import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Community login session cookie. The session id stored here is a server-side
// row reference; revoking the row in user_sessions invalidates the cookie on
// the next request without rotating signing keys.
export const SESSION_COOKIE = "bnhg_session";
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MIN = 30;
const BCRYPT_COST = 12;

export type Role = "admin" | "user";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface SessionWithUser {
  sessionId: string;
  user: User;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: Role;
  password_hash: string;
  created_at: string;
  last_login_at: string | null;
  disabled_at: string | null;
}

interface SessionRow {
  id: string;
  user_id: number;
  expires_at: string;
  revoked_at: string | null;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

// =============================================================================
// Dev fallback — runs entirely in-memory when DATABASE_URL isn't configured AND
// BNHG_DEV_FALLBACK_AUTH=1. Lets the seeded admin/member accounts log in
// without requiring a Neon DB on the local machine. Strictly off in production:
// even with the env flag set, production NODE_ENV refuses the fallback so a
// misconfigured deploy fails loudly rather than silently using hardcoded creds.
// =============================================================================

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function isDevFallbackEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.BNHG_DEV_FALLBACK_AUTH === "1";
}

export class AuthBackendUnavailableError extends Error {
  constructor() {
    super(
      "Auth backend is not configured. Set DATABASE_URL (and run db:migrate + db:seed:users), or set BNHG_DEV_FALLBACK_AUTH=1 in .env.local to use the in-memory dev fallback.",
    );
    this.name = "AuthBackendUnavailableError";
  }
}

interface FallbackAccount {
  id: number;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
}

let fallbackAccountsCache: FallbackAccount[] | null = null;
function getFallbackAccounts(): FallbackAccount[] {
  if (fallbackAccountsCache) return fallbackAccountsCache;
  fallbackAccountsCache = [
    {
      id: 1,
      email: "admin@benicehospitality.com",
      name: "BNHG Admin",
      role: "admin",
      passwordHash: bcrypt.hashSync(
        process.env.BNHG_ADMIN_PASSWORD || "Admin2026!",
        10, // cheaper than DB-mode cost; the fallback only runs locally
      ),
    },
    {
      id: 2,
      email: "member@benicehospitality.com",
      name: "Maya Operator",
      role: "user",
      passwordHash: bcrypt.hashSync(
        process.env.BNHG_MEMBER_PASSWORD || "Member2026!",
        10,
      ),
    },
  ];
  return fallbackAccountsCache;
}

// In-memory session store for dev fallback. Resets on server restart, which is
// fine for local dev. Map<sessionId, { user, expiresAt, revoked }>.
interface FallbackSession {
  id: string;
  user: FallbackAccount;
  expiresAt: number;
  revoked: boolean;
}
const fallbackSessions = new Map<string, FallbackSession>();

function logFallbackBanner() {
  if (process.env.NODE_ENV === "production") return;
  // Print once on first use so the developer can see at a glance that DB
  // isn't being hit.
  if (!fallbackAccountsCache) {
    console.warn(
      "\n[community-auth] DEV FALLBACK ACTIVE — DATABASE_URL is not set; using in-memory accounts. Disable by either setting DATABASE_URL or removing BNHG_DEV_FALLBACK_AUTH from .env.local.\n",
    );
  }
}

// =============================================================================
// accounts
// =============================================================================

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  if (!isDbConfigured()) return null;
  const rows = (await sql`
    SELECT id, email, name, role, password_hash, created_at, last_login_at, disabled_at
    FROM users WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  if (!isDbConfigured()) return null;
  const rows = (await sql`
    SELECT id, email, name, role, password_hash, created_at, last_login_at, disabled_at
    FROM users WHERE id = ${id} LIMIT 1
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function authenticate(
  email: string,
  password: string,
): Promise<User | null> {
  if (isDbConfigured()) {
    const row = await findUserByEmail(email);
    if (!row || row.disabled_at) return null;
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return null;
    return rowToUser(row);
  }
  if (isDevFallbackEnabled()) {
    logFallbackBanner();
    const account = getFallbackAccounts().find(
      (a) => a.email.toLowerCase() === email.toLowerCase().trim(),
    );
    if (!account) return null;
    const ok = await bcrypt.compare(password, account.passwordHash);
    if (!ok) return null;
    return {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      createdAt: new Date(0).toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }
  throw new AuthBackendUnavailableError();
}

export async function setUserPassword(
  userId: number,
  newPassword: string,
): Promise<void> {
  if (isDbConfigured()) {
    const hash = await bcrypt.hash(newPassword, BCRYPT_COST);
    await sql`
      UPDATE users
      SET password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    await sql`
      UPDATE user_sessions SET revoked_at = NOW()
      WHERE user_id = ${userId} AND revoked_at IS NULL
    `;
    return;
  }
  if (isDevFallbackEnabled()) {
    const account = getFallbackAccounts().find((a) => a.id === userId);
    if (!account) return;
    account.passwordHash = await bcrypt.hash(newPassword, 10);
    for (const session of fallbackSessions.values()) {
      if (session.user.id === userId) session.revoked = true;
    }
    return;
  }
  throw new AuthBackendUnavailableError();
}

// =============================================================================
// sessions
// =============================================================================

export async function createUserSession(
  userId: number,
  ip: string | null,
  userAgent: string | null,
): Promise<{ sessionId: string; expiresAt: Date }> {
  const sessionId = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  if (isDbConfigured()) {
    await sql`
      INSERT INTO user_sessions (id, user_id, expires_at, ip, user_agent)
      VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()}, ${ip}, ${userAgent})
    `;
    await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${userId}`;
    return { sessionId, expiresAt };
  }
  if (isDevFallbackEnabled()) {
    const account = getFallbackAccounts().find((a) => a.id === userId);
    if (!account) throw new Error("Unknown user id");
    fallbackSessions.set(sessionId, {
      id: sessionId,
      user: account,
      expiresAt: expiresAt.getTime(),
      revoked: false,
    });
    return { sessionId, expiresAt };
  }
  throw new AuthBackendUnavailableError();
}

export async function getSessionWithUser(
  sessionId: string,
): Promise<SessionWithUser | null> {
  if (isDbConfigured()) {
    const rows = (await sql`
      SELECT s.id AS session_id, s.expires_at, s.revoked_at,
             u.id, u.email, u.name, u.role, u.password_hash,
             u.created_at, u.last_login_at, u.disabled_at
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ${sessionId}
      LIMIT 1
    `) as Array<
      UserRow & {
        session_id: string;
        expires_at: string;
        revoked_at: string | null;
      }
    >;
    const row = rows[0];
    if (!row) return null;
    if (row.revoked_at) return null;
    if (row.disabled_at) return null;
    if (new Date(row.expires_at).getTime() <= Date.now()) return null;
    return { sessionId: row.session_id, user: rowToUser(row) };
  }
  if (isDevFallbackEnabled()) {
    const session = fallbackSessions.get(sessionId);
    if (!session || session.revoked) return null;
    if (session.expiresAt <= Date.now()) return null;
    return {
      sessionId: session.id,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        createdAt: new Date(0).toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
    };
  }
  return null;
}

export async function revokeSession(sessionId: string): Promise<void> {
  if (isDbConfigured()) {
    await sql`
      UPDATE user_sessions SET revoked_at = NOW()
      WHERE id = ${sessionId} AND revoked_at IS NULL
    `;
    return;
  }
  if (isDevFallbackEnabled()) {
    const session = fallbackSessions.get(sessionId);
    if (session) session.revoked = true;
    return;
  }
}

export async function revokeAllSessionsForUser(userId: number): Promise<void> {
  if (isDbConfigured()) {
    await sql`
      UPDATE user_sessions SET revoked_at = NOW()
      WHERE user_id = ${userId} AND revoked_at IS NULL
    `;
    return;
  }
  if (isDevFallbackEnabled()) {
    for (const session of fallbackSessions.values()) {
      if (session.user.id === userId) session.revoked = true;
    }
  }
}

// =============================================================================
// cookies
// =============================================================================

export function setUserSessionCookie(
  response: NextResponse,
  sessionId: string,
): void {
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

export function clearUserSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentSession(): Promise<SessionWithUser | null> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getSessionWithUser(sessionId);
}

// =============================================================================
// password reset
// =============================================================================

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createPasswordResetToken(
  userId: number,
): Promise<{ rawToken: string; expiresAt: Date }> {
  if (!isDbConfigured()) {
    // Dev fallback intentionally does not support password reset; the
    // hardcoded passwords are recoverable from .env.local instead.
    throw new AuthBackendUnavailableError();
  }
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MIN * 60 * 1000);
  await sql`
    UPDATE password_reset_tokens SET consumed_at = NOW()
    WHERE user_id = ${userId} AND consumed_at IS NULL AND expires_at > NOW()
  `;
  await sql`
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;
  return { rawToken, expiresAt };
}

export async function consumePasswordResetToken(
  rawToken: string,
): Promise<{ userId: number } | null> {
  if (!isDbConfigured()) return null;
  const tokenHash = hashToken(rawToken);
  const rows = (await sql`
    SELECT id, user_id, expires_at, consumed_at
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `) as Array<{
    id: number;
    user_id: number;
    expires_at: string;
    consumed_at: string | null;
  }>;
  const row = rows[0];
  if (!row) return null;
  if (row.consumed_at) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;
  await sql`
    UPDATE password_reset_tokens SET consumed_at = NOW()
    WHERE id = ${row.id}
  `;
  return { userId: row.user_id };
}

// =============================================================================
// OAuth account linking
// =============================================================================

export type OAuthProvider = "google" | "facebook" | "linkedin";
export type OAuthLinkErrorCode = "oauth_link_conflict" | "oauth_disabled";

export class OAuthLinkError extends Error {
  constructor(public code: OAuthLinkErrorCode) {
    super(code);
    this.name = "OAuthLinkError";
  }
}

interface OAuthAccountRow {
  id: number;
  user_id: number;
  provider: OAuthProvider;
  provider_account_id: string;
}

export interface FindOrCreateOAuthUserInput {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string | null;
  name: string;
  emailVerified: boolean;
}

// Finds the user already linked to (provider, providerAccountId), or links
// the OAuth identity to an existing email-matched user when safe, or creates
// a new password-less user. Throws OAuthLinkError on linking conflicts so the
// callback route can map them to user-facing error codes.
export async function findOrCreateOAuthUser(
  input: FindOrCreateOAuthUserInput,
): Promise<User> {
  if (!isDbConfigured()) {
    throw new AuthBackendUnavailableError();
  }

  // 1. Already linked? Source of truth is the stable provider account ID.
  const linkedRows = (await sql`
    SELECT id, user_id, provider, provider_account_id
    FROM user_oauth_accounts
    WHERE provider = ${input.provider}
      AND provider_account_id = ${input.providerAccountId}
    LIMIT 1
  `) as OAuthAccountRow[];
  const linked = linkedRows[0];
  if (linked) {
    const userRow = await findUserById(linked.user_id);
    if (!userRow) throw new OAuthLinkError("oauth_link_conflict");
    if (userRow.disabled_at) throw new OAuthLinkError("oauth_disabled");
    return rowToUser(userRow);
  }

  // 2. Email match? Strict Facebook policy: never auto-link. For Google and
  // LinkedIn, require provider-attested email_verified=true.
  if (input.email) {
    const existing = await findUserByEmail(input.email);
    if (existing) {
      if (existing.disabled_at) throw new OAuthLinkError("oauth_disabled");
      if (input.provider === "facebook") {
        throw new OAuthLinkError("oauth_link_conflict");
      }
      if (!input.emailVerified) {
        throw new OAuthLinkError("oauth_link_conflict");
      }
      await sql`
        INSERT INTO user_oauth_accounts (user_id, provider, provider_account_id, email_at_link)
        VALUES (${existing.id}, ${input.provider}, ${input.providerAccountId}, ${input.email})
      `;
      return rowToUser(existing);
    }
  }

  // 3. Brand-new user. role='user' always — admins are seeded explicitly.
  const verifiedAt = input.emailVerified ? new Date().toISOString() : null;
  const insertEmail = (input.email ?? "").trim();
  if (!insertEmail) {
    throw new OAuthLinkError("oauth_link_conflict");
  }
  const inserted = (await sql`
    INSERT INTO users (email, name, role, password_hash, email_verified_at)
    VALUES (${insertEmail}, ${input.name}, 'user', NULL, ${verifiedAt})
    RETURNING id, email, name, role, password_hash, created_at, last_login_at, disabled_at
  `) as UserRow[];
  const newUser = inserted[0];
  if (!newUser) throw new Error("Failed to insert user");
  await sql`
    INSERT INTO user_oauth_accounts (user_id, provider, provider_account_id, email_at_link)
    VALUES (${newUser.id}, ${input.provider}, ${input.providerAccountId}, ${insertEmail})
  `;
  return rowToUser(newUser);
}

// Re-export the row-level type for callers that need it (e.g., admin panels
// listing all users). User is the public-safe shape.
export type { UserRow, SessionRow };
