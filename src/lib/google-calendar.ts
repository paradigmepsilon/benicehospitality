import crypto from "crypto";
import { google, type calendar_v3 } from "googleapis";
import { sql } from "@/lib/db";

// One shared host Google account organizes every booking's Meet event (both the
// guest and the requested founder are added as attendees, so they each get the
// invite in their own inbox) — not a per-founder OAuth connection. See
// scripts/migrate.ts's calendar_connections table.
// email/profile alongside calendar.events so the connected account can be
// identified and shown in the admin UI (calendar_connections.account_email).
const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "openid",
  "email",
];

function getBaseUrl(): string {
  return (
    process.env.BNHG_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getCalendarRedirectUri(): string {
  return `${getBaseUrl()}/api/admin/calendar/callback`;
}

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set.");
  }
  return new google.auth.OAuth2(clientId, clientSecret, getCalendarRedirectUri());
}

export function getCalendarAuthUrl(state: string): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    // select_account so the intended host account can be chosen even when a
    // different Google account is already signed in on that browser.
    prompt: "consent select_account",
    scope: CALENDAR_SCOPES,
    state,
  });
}

/** Exchanges the OAuth code and returns the tokens plus the account's own email. */
export async function exchangeCalendarCode(
  code: string
): Promise<{ refreshToken: string; accountEmail: string }> {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "No refresh token returned — Google only issues one on first consent. " +
        "Revoke this app's access at https://myaccount.google.com/permissions and try again."
    );
  }
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data } = await oauth2.userinfo.get();
  if (!data.email) {
    throw new Error("Google did not return an account email.");
  }
  return { refreshToken: tokens.refresh_token, accountEmail: data.email };
}

export async function saveCalendarConnection(accountEmail: string, refreshToken: string): Promise<void> {
  await sql`
    INSERT INTO calendar_connections (account_email, refresh_token, connected_at, updated_at)
    VALUES (${accountEmail}, ${refreshToken}, NOW(), NOW())
  `;
}

export async function getCalendarConnection(): Promise<{ accountEmail: string } | null> {
  const rows = await sql`
    SELECT account_email FROM calendar_connections ORDER BY id DESC LIMIT 1
  `;
  const row = rows[0] as { account_email: string } | undefined;
  return row ? { accountEmail: row.account_email } : null;
}

async function getCalendarClient(): Promise<calendar_v3.Calendar | null> {
  const rows = await sql`
    SELECT refresh_token FROM calendar_connections ORDER BY id DESC LIMIT 1
  `;
  const refreshToken = (rows[0] as { refresh_token: string } | undefined)?.refresh_token;
  if (!refreshToken) return null;

  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: client });
}

export interface MeetEventResult {
  eventId: string;
  meetLink: string | null;
}

/**
 * Creates a Meet-enabled Calendar event for a booking. Returns null (rather
 * than throwing) when no account is connected yet, so callers can treat
 * "not connected" the same as any other best-effort side effect that hasn't
 * been set up — the booking itself must never fail because of this.
 */
export async function createBookingMeetEvent(params: {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  guestEmail: string;
  founderEmail: string | null;
}): Promise<MeetEventResult | null> {
  const calendar = await getCalendarClient();
  if (!calendar) return null;

  const attendees: calendar_v3.Schema$EventAttendee[] = [{ email: params.guestEmail }];
  if (params.founderEmail) attendees.push({ email: params.founderEmail });

  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startDateTime, timeZone: "America/New_York" },
      end: { dateTime: params.endDateTime, timeZone: "America/New_York" },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  if (!res.data.id) return null;
  return { eventId: res.data.id, meetLink: res.data.hangoutLink ?? null };
}

export async function rescheduleBookingMeetEvent(
  eventId: string,
  startDateTime: string,
  endDateTime: string
): Promise<MeetEventResult | null> {
  const calendar = await getCalendarClient();
  if (!calendar) return null;

  const res = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    sendUpdates: "all",
    requestBody: {
      start: { dateTime: startDateTime, timeZone: "America/New_York" },
      end: { dateTime: endDateTime, timeZone: "America/New_York" },
    },
  });

  return { eventId, meetLink: res.data.hangoutLink ?? null };
}

export async function cancelBookingMeetEvent(eventId: string): Promise<void> {
  const calendar = await getCalendarClient();
  if (!calendar) return;
  await calendar.events.delete({ calendarId: "primary", eventId, sendUpdates: "all" });
}
