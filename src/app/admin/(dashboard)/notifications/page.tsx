"use client";

import { useState, useEffect } from "react";

interface Stats {
  configured: boolean;
  subscribers: number;
}

interface SendResult {
  sent: number;
  failed: number;
  pruned: number;
}

const TITLE_MAX = 120;
const BODY_MAX = 400;

export default function PushNotificationsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/push/send", { method: "GET" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const canSend =
    !!stats?.configured &&
    (stats?.subscribers ?? 0) > 0 &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    !sending;

  async function handleSend() {
    setError(null);
    setResult(null);

    const audience = stats?.subscribers ?? 0;
    if (!confirm(`Send this notification to ${audience} subscriber${audience !== 1 ? "s" : ""}?`)) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send.");
        return;
      }
      setResult(data);
      setTitle("");
      setBody("");
      setUrl("");
      // Refresh subscriber count (dead endpoints may have been pruned).
      if (typeof data.pruned === "number" && data.pruned > 0) {
        setStats((prev) =>
          prev ? { ...prev, subscribers: Math.max(0, prev.subscribers - data.pruned) } : prev,
        );
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f] transition-colors";

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
          Push Notifications
        </h1>
        <p className="text-sm text-[#1a1a1a]/50 mt-1">
          {loading
            ? "Loading…"
            : `Broadcast to ${stats?.subscribers ?? 0} subscribed device${
                (stats?.subscribers ?? 0) !== 1 ? "s" : ""
              }.`}
        </p>
      </div>

      {/* Config warnings */}
      {!loading && stats && !stats.configured && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-[#c0674a]/40 bg-[#c0674a]/10 text-sm text-[#8a4a32]">
          Push is not configured. Set the <code>VAPID_*</code> environment
          variables in Vercel and redeploy.
        </div>
      )}
      {!loading && stats?.configured && stats.subscribers === 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-[#1a1a1a]/15 bg-[#1a1a1a]/5 text-sm text-[#1a1a1a]/60">
          No subscribers yet. Notifications can be composed but there&apos;s
          nobody to send to.
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-[#5b9a2f]/30 bg-[#5b9a2f]/12 text-sm text-[#3d6a1f]">
          Sent to {result.sent} device{result.sent !== 1 ? "s" : ""}.
          {result.failed > 0 && ` ${result.failed} failed.`}
          {result.pruned > 0 && ` ${result.pruned} dead subscription${result.pruned !== 1 ? "s" : ""} removed.`}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Compose form */}
      <div className="bg-white border border-[#e8e4dd] rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/40 mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="New lesson is live"
            className={inputClass}
          />
          <p className="text-xs text-[#1a1a1a]/35 mt-1 text-right">
            {title.length}/{TITLE_MAX}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/40 mb-1.5">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
            placeholder="Module 2.6 just dropped. Tap to start."
            rows={3}
            className={`${inputClass} resize-y`}
          />
          <p className="text-xs text-[#1a1a1a]/35 mt-1 text-right">
            {body.length}/{BODY_MAX}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/40 mb-1.5">
            Link URL <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.benicehospitality.com/account"
            className={inputClass}
          />
          <p className="text-xs text-[#1a1a1a]/35 mt-1">
            Where tapping the notification takes the user. Defaults to the home
            page.
          </p>
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="rounded-lg border border-[#e8e4dd] bg-[#f8f6f1] p-3 flex gap-3 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.png"
              alt=""
              width={36}
              height={36}
              className="rounded-md flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                {title || "Title"}
              </p>
              <p className="text-xs text-[#1a1a1a]/60 line-clamp-2">
                {body || "Message body"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[#1a1a1a]/40">
            {stats?.subscribers ?? 0} recipient
            {(stats?.subscribers ?? 0) !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center gap-2 bg-[#5b9a2f] text-white px-5 py-2 text-sm font-medium rounded-lg hover:bg-[#4a7d25] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending…
              </>
            ) : (
              "Send notification"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
