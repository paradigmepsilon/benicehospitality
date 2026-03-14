"use client";

import { useState, useEffect } from "react";

interface CalendarFeed {
  id: number;
  name: string;
  url: string | null;
  last_synced_at: string | null;
  is_active: boolean;
}

export default function CalendarFeedsPanel() {
  const [feeds, setFeeds] = useState<CalendarFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"url" | "file">("url");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/calendar-feeds")
      .then((res) => res.json())
      .then((data) => setFeeds(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd() {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/calendar-feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          url: formMode === "url" ? url : undefined,
          icsContent: formMode === "file" ? fileContent : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeeds((prev) => [data, ...prev]);
        setShowForm(false);
        setName("");
        setUrl("");
        setFileContent("");
        setSuccessMessage(`Imported ${data.events_imported || 0} events.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(data.error || "Failed to add feed.");
      }
    } catch {
      setError("Failed to add feed.");
    }

    setSaving(false);
  }

  async function handleSync(id: number) {
    setSyncingId(id);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/calendar-feeds/${id}/sync`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setFeeds((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, last_synced_at: new Date().toISOString() } : f
          )
        );
        setSuccessMessage(`Synced ${data.events_synced || 0} events.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(data.error || "Failed to sync.");
      }
    } catch {
      setError("Failed to sync.");
    }

    setSyncingId(null);
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/calendar-feeds/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setFeeds((prev) => prev.filter((f) => f.id !== id));
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
      if (!name) setName(file.name.replace(/\.ics$/i, ""));
    };
    reader.readAsText(file);
  }

  function relativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[#1a1a1a]">Calendar Feeds</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-xs font-medium bg-[#5b9a2f] text-white rounded-lg hover:bg-[#4a7d25] transition-colors"
        >
          {showForm ? "Cancel" : "Add Feed"}
        </button>
      </div>

      {successMessage && (
        <div className="mb-3 px-3 py-2 text-xs font-medium text-[#5b9a2f] bg-[#5b9a2f]/10 border border-[#5b9a2f]/20 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-3 px-3 py-2 text-xs font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="border border-[#e8e4dd] rounded-lg p-4 mb-4 bg-[#f8f6f1]/30">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google Calendar"
                className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFormMode("url")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  formMode === "url"
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd]"
                }`}
              >
                URL
              </button>
              <button
                onClick={() => setFormMode("file")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  formMode === "file"
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd]"
                }`}
              >
                Upload File
              </button>
            </div>

            {formMode === "url" ? (
              <div>
                <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">iCal URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/ical/..."
                  className="w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f]"
                />
                <p className="text-[10px] text-[#1a1a1a]/30 mt-1">
                  Find this in Google Calendar: Settings → Calendar → Secret address in iCal format
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">Upload .ics File</label>
                <input
                  type="file"
                  accept=".ics,.ical"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-[#1a1a1a]/60 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-[#e8e4dd] file:text-xs file:font-medium file:bg-white file:text-[#1a1a1a]/60 hover:file:bg-[#f8f6f1]"
                />
                {fileContent && (
                  <p className="text-[10px] text-[#5b9a2f] mt-1">File loaded</p>
                )}
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={saving || !name || (formMode === "url" ? !url : !fileContent)}
              className="w-full px-4 py-2 text-sm font-medium bg-[#5b9a2f] text-white rounded-lg hover:bg-[#4a7d25] transition-colors disabled:opacity-50"
            >
              {saving ? "Importing..." : "Import Calendar"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 py-8 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading feeds...
        </div>
      ) : feeds.length === 0 && !showForm ? (
        <p className="text-sm text-[#1a1a1a]/30 py-4">
          No calendar feeds connected. Add one to sync events from another calendar.
        </p>
      ) : (
        <div className="space-y-2">
          {feeds.map((feed) => (
            <div key={feed.id} className="border border-[#e8e4dd] rounded-lg px-3 py-2.5 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${feed.is_active ? "bg-amber-500" : "bg-[#1a1a1a]/20"}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[#1a1a1a]">{feed.name}</span>
                <div className="text-xs text-[#1a1a1a]/40 mt-0.5">
                  {feed.url ? "URL feed" : "File upload"}
                  {feed.last_synced_at && ` · Synced ${relativeTime(feed.last_synced_at)}`}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {feed.url && (
                  <button
                    onClick={() => handleSync(feed.id)}
                    disabled={syncingId === feed.id}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#e8e4dd] text-[#1a1a1a]/60 hover:border-[#5b9a2f] hover:text-[#5b9a2f] transition-colors disabled:opacity-50"
                  >
                    {syncingId === feed.id ? "Syncing..." : "Sync"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(feed.id)}
                  className="text-xs text-red-500/60 hover:text-red-500 transition-colors px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
