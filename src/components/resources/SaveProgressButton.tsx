"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CloudOff, Loader2, Save } from "lucide-react";
import posthog from "posthog-js";
import { useToolSave } from "./ToolSaveContext";

// "Save progress" — the side panel's explicit save for a tool that already
// autosaves.
//
// A separate component from SaveToolButton on purpose. That one exists to do
// exactly one thing (put a resource on the shelf) and its header comment is
// twenty lines about why a control that can be mistaken for its own opposite is
// a bug. Adding a third behaviour to it would undo that.
//
// The work is saved either way — this button forces the pending write out now
// and, more importantly, SAYS SO. Most of its value is the status line: an
// autosave nobody can see is indistinguishable from no save at all, which is
// what made members hunt for a save button in the first place.
//
// It renders from the status stream, never from the click. saveNow() returns
// void because the underlying doSave() returns early when a write is already in
// flight, so awaiting it would report "Saved" before the data landed.

const RELATIVE_TICK_MS = 30_000;

function relativeTime(at: number): string {
  const secs = Math.round((Date.now() - at) / 1000);
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

const BASE =
  "inline-flex items-center gap-1.5 font-sans font-semibold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center rounded-lg px-6 py-3 text-sm min-h-[48px] border-2";

export default function SaveProgressButton({ toolName }: { toolName: string }) {
  const ctx = useToolSave();

  // Re-render on a timer so "Saved just now" ages into "Saved 2 minutes ago"
  // instead of freezing at the moment of the save.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!ctx?.lastSavedAt) return;
    const t = setInterval(() => setTick((n) => n + 1), RELATIVE_TICK_MS);
    return () => clearInterval(t);
  }, [ctx?.lastSavedAt]);

  if (!ctx) return null;
  const { registered, status, lastSavedAt, saveNow } = ctx;

  const busy = status === "saving" || status === "retrying";
  const disabled = !registered || busy || status === "conflict";

  function handleClick() {
    if (disabled) return;
    saveNow();
    try {
      // Not `resource_saved` — that one means "shelved", and the bookmark
      // button already owns it.
      posthog.capture("resource_progress_saved", { tool_name: toolName });
    } catch {
      // Analytics must never break the interaction.
    }
  }

  let note: string;
  let noteTone = "text-charcoal/60";
  if (status === "conflict") {
    note = "Changed in another tab — resolve it in the tool.";
    noteTone = "text-terracotta";
  } else if (busy) {
    // "retrying" is deliberately not red: it means a shared IP hit the rate
    // limit, the data is fine, and the save is about to succeed.
    note = "Saving…";
  } else if (status === "error") {
    note = "Couldn't save. Your work is safe in this browser.";
    noteTone = "text-terracotta";
  } else if (lastSavedAt) {
    note = `Saved ${relativeTime(lastSavedAt)} · on your dashboard`;
    noteTone = "text-primary-green";
  } else {
    note = "Autosaves as you work.";
  }

  const Icon = status === "error" ? CloudOff : status === "saved" ? Check : Save;

  return (
    <span className="flex flex-col items-stretch gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={`Save your progress on ${toolName} now`}
        className={`${BASE} ${
          status === "error"
            ? "border-terracotta text-terracotta bg-white hover:bg-terracotta/5"
            : "border-primary-green text-primary-green bg-primary-green/5 hover:bg-primary-green/10"
        }`}
      >
        {busy ? (
          <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
        )}
        {status === "error" ? "Try again" : "Save progress"}
      </button>
      <span role="status" aria-live="polite" className={`font-sans text-xs ${noteTone}`}>
        {note}
      </span>
      {lastSavedAt !== null && (
        <Link
          href="/account/resources"
          className="font-sans text-xs text-charcoal/60 hover:text-primary-green underline underline-offset-2"
        >
          Find it on your dashboard
        </Link>
      )}
    </span>
  );
}
