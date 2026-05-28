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
// Verification tokens get a longer window than reset tokens — users often open
// signup emails hours later. 24h matches industry convention.
const EMAIL_VERIFY_TTL_HOURS = 24;
const BCRYPT_COST = 12;

// Locked vocabulary for the intake form. Mirrors the DB CHECK constraint
// expectation: service_interests TEXT[] is constrained at the API layer.
export const SERVICE_INTERESTS = [
  "rental_properties",
  "independent_hotels",
  "autos",
] as const;
export type ServiceInterest = (typeof SERVICE_INTERESTS)[number];

export const BUSINESS_STAGES = ["none", "one", "multiple"] as const;
export type BusinessStage = (typeof BUSINESS_STAGES)[number];

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
  // Password is nullable for OAuth-only accounts (see migrate.ts: ALTER COLUMN
  // password_hash DROP NOT NULL). authenticate() treats a missing hash as
  // "this account is OAuth-only, password login impossible."
  password_hash: string | null;
  created_at: string;
  last_login_at: string | null;
  disabled_at: string | null;
  // Set when the user verifies via email link OR when an OAuth provider
  // attests email_verified=true at link time. NULL means unverified.
  email_verified_at: string | null;
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
    SELECT id, email, name, role, password_hash, created_at, last_login_at, disabled_at, email_verified_at
    FROM users WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  if (!isDbConfigured()) return null;
  const rows = (await sql`
    SELECT id, email, name, role, password_hash, created_at, last_login_at, disabled_at, email_verified_at
    FROM users WHERE id = ${id} LIMIT 1
  `) as UserRow[];
  return rows[0] ?? null;
}

// Sentinel returned by authenticate() when the password matches but the user
// hasn't verified their email yet. The login route uses this to surface a
// distinct "check your inbox" message instead of the generic invalid-credentials
// copy. We're intentionally NOT returning null here so the call site doesn't
// confuse "bad password" with "good password, not verified".
export class EmailNotVerifiedError extends Error {
  constructor() {
    super("email_not_verified");
    this.name = "EmailNotVerifiedError";
  }
}

export async function authenticate(
  email: string,
  password: string,
): Promise<User | null> {
  if (isDbConfigured()) {
    const row = await findUserByEmail(email);
    if (!row || row.disabled_at) return null;
    if (!row.password_hash) return null;
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return null;
    // Password is good. If the user signed up via /signup and hasn't clicked
    // the verification link, block login here. OAuth-provisioned users have
    // password_hash NULL and never hit this branch.
    if (!row.email_verified_at) {
      throw new EmailNotVerifiedError();
    }
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
             u.created_at, u.last_login_at, u.disabled_at, u.email_verified_at
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

// Result of findOrCreateOAuthUser. `isNew=true` means the user row was just
// inserted (branch 3). The OAuth callback uses this to route brand-new
// accounts to /onboarding instead of /account. Returning users (already
// linked, or email-matched + linked) get isNew=false.
export interface FindOrCreateOAuthUserResult {
  user: User;
  isNew: boolean;
}

// Finds the user already linked to (provider, providerAccountId), or links
// the OAuth identity to an existing email-matched user when safe, or creates
// a new password-less user. Throws OAuthLinkError on linking conflicts so the
// callback route can map them to user-facing error codes.
export async function findOrCreateOAuthUser(
  input: FindOrCreateOAuthUserInput,
): Promise<FindOrCreateOAuthUserResult> {
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
    return { user: rowToUser(userRow), isNew: false };
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
      return { user: rowToUser(existing), isNew: false };
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
    RETURNING id, email, name, role, password_hash, created_at, last_login_at, disabled_at, email_verified_at
  `) as UserRow[];
  const newUser = inserted[0];
  if (!newUser) throw new Error("Failed to insert user");
  await sql`
    INSERT INTO user_oauth_accounts (user_id, provider, provider_account_id, email_at_link)
    VALUES (${newUser.id}, ${input.provider}, ${input.providerAccountId}, ${insertEmail})
  `;
  return { user: rowToUser(newUser), isNew: true };
}

// Serialize a string array into a Postgres array literal so callers can
// bind it to a text[] column with an explicit ::text[] cast. The Neon
// tagged-template driver can autobind arrays on a bare INSERT, but anything
// wrapped in COALESCE / CASE confuses type inference and the server rejects
// with 42804. This helper plus a ::text[] cast in the SQL sidesteps that.
// Postgres array literal escaping: double-quote each element and escape
// internal double-quotes and backslashes.
function toPgTextArrayLiteral(values: readonly string[] | null | undefined): string {
  if (!values || values.length === 0) return "{}";
  const escaped = values.map(
    (v) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
  );
  return `{${escaped.join(",")}}`;
}

// =============================================================================
// email verification tokens (mirrors password reset token machinery)
// =============================================================================

export async function createEmailVerificationToken(
  userId: number,
): Promise<{ rawToken: string; expiresAt: Date }> {
  if (!isDbConfigured()) {
    throw new AuthBackendUnavailableError();
  }
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000,
  );
  // Invalidate any prior outstanding tokens so resending doesn't create
  // multiple live links per user.
  await sql`
    UPDATE email_verification_tokens SET consumed_at = NOW()
    WHERE user_id = ${userId} AND consumed_at IS NULL AND expires_at > NOW()
  `;
  await sql`
    INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;
  return { rawToken, expiresAt };
}

export async function consumeEmailVerificationToken(
  rawToken: string,
): Promise<{ userId: number } | null> {
  if (!isDbConfigured()) return null;
  const tokenHash = hashToken(rawToken);
  const rows = (await sql`
    SELECT id, user_id, expires_at, consumed_at
    FROM email_verification_tokens
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
    UPDATE email_verification_tokens SET consumed_at = NOW()
    WHERE id = ${row.id}
  `;
  return { userId: row.user_id };
}

export async function markEmailVerified(userId: number): Promise<void> {
  if (!isDbConfigured()) return;
  await sql`
    UPDATE users SET email_verified_at = NOW(), updated_at = NOW()
    WHERE id = ${userId} AND email_verified_at IS NULL
  `;
}

// =============================================================================
// signup (password account + initial profile row)
// =============================================================================

export class SignupEmailInUseError extends Error {
  constructor() {
    super("email_in_use");
    this.name = "SignupEmailInUseError";
  }
}

export interface CreatePasswordUserInput {
  name: string;
  email: string; // already lowercased + trimmed by the caller
  phone: string;
  password: string;
  serviceInterests: ServiceInterest[];
}

// Creates a brand-new password user and pre-fills the profile row with the
// fields already collected on the signup form (phone + service_interests).
// The deeper intake questions are filled in later by the /onboarding form.
// `onboarded_at` is intentionally NULL so the gate still routes them through
// the intake page after they verify.
export async function createPasswordUser(
  input: CreatePasswordUserInput,
): Promise<{ userId: number }> {
  if (!isDbConfigured()) {
    throw new AuthBackendUnavailableError();
  }
  const existing = await findUserByEmail(input.email);
  if (existing) {
    // If a prior OAuth-only user signed up, we could set their password and
    // continue. For now we keep the model simple: signup with an in-use email
    // is rejected and the route surfaces it as a generic "check your email"
    // success message (the route handles the leakage prevention, not us).
    throw new SignupEmailInUseError();
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  // Two inserts. We don't have transaction support exposed through the Neon
  // tagged-template wrapper here, but the FK with ON DELETE CASCADE means an
  // orphaned profile is impossible: if the profile insert fails, the user
  // insert is left behind (acceptable — they can still verify and use the
  // account, the onboarding flow will create the row).
  const inserted = (await sql`
    INSERT INTO users (email, name, role, password_hash, email_verified_at)
    VALUES (${input.email}, ${input.name}, 'user', ${passwordHash}, NULL)
    RETURNING id
  `) as Array<{ id: number }>;
  const userId = inserted[0]?.id;
  if (!userId) throw new Error("Failed to insert user");
  await sql`
    INSERT INTO user_profiles (user_id, phone, service_interests)
    VALUES (${userId}, ${input.phone}, ${toPgTextArrayLiteral(input.serviceInterests)}::text[])
  `;
  return { userId };
}

// =============================================================================
// user profiles / onboarding
// =============================================================================

export interface UserProfile {
  userId: number;
  phone: string | null;
  serviceInterests: ServiceInterest[];
  whyJoining: string | null;
  goals: string | null;
  businessStage: BusinessStage | null;
  heardFrom: string | null;
  marketingOptIn: boolean;
  marketingOptInAt: string | null;
  onboardedAt: string | null;
}

interface UserProfileRow {
  user_id: number;
  phone: string | null;
  service_interests: string[] | null;
  why_joining: string | null;
  goals: string | null;
  business_stage: BusinessStage | null;
  heard_from: string | null;
  marketing_opt_in: boolean;
  marketing_opt_in_at: string | null;
  onboarded_at: string | null;
}

function rowToProfile(row: UserProfileRow): UserProfile {
  return {
    userId: row.user_id,
    phone: row.phone,
    serviceInterests: (row.service_interests ?? []) as ServiceInterest[],
    whyJoining: row.why_joining,
    goals: row.goals,
    businessStage: row.business_stage,
    heardFrom: row.heard_from,
    marketingOptIn: row.marketing_opt_in,
    marketingOptInAt: row.marketing_opt_in_at,
    onboardedAt: row.onboarded_at,
  };
}

export async function getUserProfile(
  userId: number,
): Promise<UserProfile | null> {
  if (!isDbConfigured()) return null;
  const rows = (await sql`
    SELECT user_id, phone, service_interests, why_joining, goals,
           business_stage, heard_from, marketing_opt_in, marketing_opt_in_at,
           onboarded_at
    FROM user_profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `) as UserProfileRow[];
  const row = rows[0];
  return row ? rowToProfile(row) : null;
}

export async function isUserOnboarded(userId: number): Promise<boolean> {
  if (!isDbConfigured()) {
    // Dev fallback has no profile data; treat fallback admin/member as
    // already onboarded so the local dev loop isn't blocked by a missing
    // table.
    return true;
  }
  const rows = (await sql`
    SELECT 1 AS ok
    FROM user_profiles
    WHERE user_id = ${userId} AND onboarded_at IS NOT NULL
    LIMIT 1
  `) as Array<{ ok: number }>;
  return rows.length > 0;
}

export interface UpsertUserProfileInput {
  phone?: string;
  serviceInterests?: ServiceInterest[];
  whyJoining?: string;
  goals?: string;
  businessStage?: BusinessStage;
  heardFrom?: string;
  marketingOptIn?: boolean;
}

// Insert-or-update the profile row. Uses COALESCE on the UPDATE branch so a
// partial submit (e.g. a Google user filling deep questions but not touching
// phone) doesn't clobber values captured earlier at signup. Sets onboarded_at
// when markOnboarded=true; sets marketing_opt_in_at iff opt-in flips true.
export async function upsertUserProfile(
  userId: number,
  patch: UpsertUserProfileInput,
  opts: { markOnboarded: boolean },
): Promise<void> {
  if (!isDbConfigured()) {
    throw new AuthBackendUnavailableError();
  }
  const phone = patch.phone ?? null;
  const whyJoining = patch.whyJoining ?? null;
  const goals = patch.goals ?? null;
  const businessStage = patch.businessStage ?? null;
  const heardFrom = patch.heardFrom ?? null;
  const optIn = patch.marketingOptIn === true;
  const onboardedAt = opts.markOnboarded ? new Date().toISOString() : null;
  // Postgres array binding via the Neon tagged template is reliable on a
  // bare INSERT, but the COALESCE arm below confuses type inference and the
  // server returns 42804 "expression is of type text". Serialize to a
  // Postgres array literal and cast explicitly so the planner never has to
  // guess. Empty array → '{}'::text[] which is the column default.
  const interestsLiteral = toPgTextArrayLiteral(patch.serviceInterests);

  await sql`
    INSERT INTO user_profiles (
      user_id, phone, service_interests, why_joining, goals,
      business_stage, heard_from, marketing_opt_in, marketing_opt_in_at,
      onboarded_at, updated_at
    )
    VALUES (
      ${userId},
      ${phone},
      ${interestsLiteral}::text[],
      ${whyJoining},
      ${goals},
      ${businessStage},
      ${heardFrom},
      ${optIn},
      ${optIn ? new Date().toISOString() : null},
      ${onboardedAt},
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
      service_interests = CASE
        WHEN array_length(EXCLUDED.service_interests, 1) IS NULL
          THEN user_profiles.service_interests
        ELSE EXCLUDED.service_interests
      END,
      why_joining = COALESCE(EXCLUDED.why_joining, user_profiles.why_joining),
      goals = COALESCE(EXCLUDED.goals, user_profiles.goals),
      business_stage = COALESCE(EXCLUDED.business_stage, user_profiles.business_stage),
      heard_from = COALESCE(EXCLUDED.heard_from, user_profiles.heard_from),
      marketing_opt_in = EXCLUDED.marketing_opt_in OR user_profiles.marketing_opt_in,
      marketing_opt_in_at = CASE
        WHEN EXCLUDED.marketing_opt_in AND user_profiles.marketing_opt_in_at IS NULL
          THEN NOW()
        ELSE user_profiles.marketing_opt_in_at
      END,
      onboarded_at = COALESCE(user_profiles.onboarded_at, EXCLUDED.onboarded_at),
      updated_at = NOW()
  `;
}

// Re-export the row-level type for callers that need it (e.g., admin panels
// listing all users). User is the public-safe shape.
export type { UserRow, SessionRow };
