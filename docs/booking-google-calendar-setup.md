# Booking calendar: Google OAuth setup (BNHG)

One Google OAuth client currently serves both features (see the decision below). The code still supports a separate calendar client if that ever changes.

| Feature | Code | Env vars | Redirect URI path |
|---|---|---|---|
| ClaimProof "Sign in with Google" (customer login) | `src/lib/oauth/providers.ts` | `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` | `/api/auth/oauth/google/callback` |
| Booking calendar + Meet (shared host account) | `src/lib/google-calendar.ts` | `GOOGLE_CALENDAR_CLIENT_ID` / `GOOGLE_CALENDAR_CLIENT_SECRET` (falls back to the `GOOGLE_OAUTH_*` pair if unset) | `/api/admin/calendar/callback` |

Both redirect URIs are built from `BNHG_BASE_URL` (fallback `NEXT_PUBLIC_BASE_URL`, then `http://localhost:3000`).

## Decision (2026-09-12): one client for both features

Alex chose to reuse the ClaimProof client `481555686391-4ouiodsijqm61ime3565p60s7ok800di` (Google Cloud project **Website Project**, `website-project-497115`, benicehospitality.com org) for the booking calendar too. The `493425101737…` client is not in any project admin@ can see and is unused. `GOOGLE_CALENDAR_*` env vars are therefore optional; the code falls back to `GOOGLE_OAUTH_*`.

Configured on 2026-09-12 (via Cloud Console as admin@benicehospitality.com):

- Google Calendar API: **enabled** in Website Project.
- Client redirect URIs added: `https://www.benicehospitality.com/api/admin/calendar/callback`, `https://benicehospitality.com/api/admin/calendar/callback`, `http://localhost:3000/api/admin/calendar/callback`. Existing ClaimProof URIs untouched.
- Data Access scopes registered: `calendar.events`, `openid`, `userinfo.email`, `userinfo.profile`.
- Audience: `admin@benicehospitality.com` added as a test user.

### Open risk: consent screen is External + Testing

- In Testing, only listed test users can complete OAuth. That is fine for the calendar (admin@ is listed) but it means **ClaimProof "Sign in with Google" only works for test users**. Lifetime user count was 0, so no customer has ever completed it.
- In Testing, Google **expires refresh tokens after 7 days**. Meet creation will stop about a week after connecting until someone reconnects.
- "Publish app" is disabled until the Branding page is completed (app name, support email, authorized domain `benicehospitality.com`, developer contact). After publishing, the `calendar.events` scope shows an "unverified app" warning on consent, which is acceptable for the single admin@ host account. Full verification is only needed to remove the warning for ClaimProof customers.

## Env vars

Local `.env.local` and Vercel production:

```
GOOGLE_OAUTH_CLIENT_ID=481555686391-…      # shared by ClaimProof sign-in and booking calendar
GOOGLE_OAUTH_CLIENT_SECRET=…
ALEX_CALENDAR_EMAIL=admin@benicehospitality.com
DELLA_CALENDAR_EMAIL=admin@benicehospitality.com
```

Vercel prod was corrected on 2026-09-12 (client ID restored to `481555686391…`, no trailing newline). The two `*_CALENDAR_EMAIL` values still carry a trailing newline; the code trims, so they work, but re-adding with `printf '%s'` is the clean fix.

## Connecting the host account (one time, after deploy)

1. Run the pending migration against production (`calendar_connections` table, `bookings.google_event_id`, `bookings.meet_link`).
2. Log into the admin, then open `https://benicehospitality.com/api/admin/calendar/connect` directly. There is no UI button for this route yet.
3. In the Google account picker choose **admin@benicehospitality.com** (the shared host account both founders use). Accept the calendar scope.
4. Success response: `Connected admin@benicehospitality.com as the shared booking calendar.`
5. If it reports "No refresh token returned", revoke the app at https://myaccount.google.com/permissions on that account and connect again.

## Verify

Create a test booking. Expect a row in `bookings` with `google_event_id` and `meet_link` set, and an invite in the guest inbox and admin@ inbox. Then confirm ClaimProof Google sign-in still works at `/claimproof/login`.
