import webpush from "web-push";

// VAPID is configured lazily so a missing key only fails the push paths, not
// the whole app at import time (mirrors the db.ts stub pattern).
let configured = false;

export function pushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

function ensureConfigured(): boolean {
  if (configured) return true;
  if (!pushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@benicehospitality.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
  return true;
}

export interface StoredSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export type SendResult =
  | { endpoint: string; ok: true }
  | { endpoint: string; ok: false; gone: boolean; error: string };

// Send to one subscription. `gone` flags 404/410 so the caller can prune dead
// endpoints from the DB.
export async function sendPush(
  sub: StoredSubscription,
  payload: PushPayload,
): Promise<SendResult> {
  if (!ensureConfigured()) {
    return { endpoint: sub.endpoint, ok: false, gone: false, error: "VAPID not configured" };
  }
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
    );
    return { endpoint: sub.endpoint, ok: true };
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    const gone = statusCode === 404 || statusCode === 410;
    return {
      endpoint: sub.endpoint,
      ok: false,
      gone,
      error: statusCode ? `HTTP ${statusCode}` : String(err),
    };
  }
}
