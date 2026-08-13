"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePublishToolSave } from "./ToolSaveContext";

// localStorage-backed state for a resource tool, keyed by slug so a refresh
// mid-worksheet never loses input. When `sync` is enabled (logged-in members),
// it also loads from and debounce-saves to the server so their data follows
// them across devices. Anonymous and grandfathered visitors stay on
// localStorage only.
//
// TOUCH IS THE POINT. `touchedRef` flips the first time the MEMBER changes
// something, and nothing reaches the server until it does. That is what lets
// the write routes treat a save as proof the tool was used, and shelve it on
// the member's dashboard. Before this, the persist effect listed `hydrated` in
// its deps, so completing hydration re-ran it and scheduled a PUT on every page
// view — "has saved data" meant "opened the page", and auto-shelving on write
// would have quietly rebuilt the auto-add-on-open behaviour that was removed
// for confusing people.
//
// Deep-equality against the initial state would have been the other way to
// detect a real edit, and it cannot work here: DataTableTool's blankRow() calls
// crypto.randomUUID(), so its initial state differs on every mount.
//
// THREE OF THE FIXES BELOW ARE OLDER BUGS, not new feature work:
//   · no max-wait, so continuous typing re-armed the 800ms debounce forever and
//     a member typing steadily NEVER saved;
//   · hydration applied the server state over keystrokes made during the round
//     trip;
//   · a 429 was swallowed by .catch(() => {}) and the write was simply lost.

const PREFIX = "bnhg-resource:";
const SAVE_DEBOUNCE_MS = 800;
/** A continuous typist still checkpoints this often. */
const MAX_WAIT_MS = 5000;
/** Browsers drop keepalive bodies past ~64KB; state may be up to 256KB. */
const KEEPALIVE_MAX_BYTES = 60_000;
/** resourceStateLimiter is 60/min per IP, so a shared office NAT can trip it. */
const RETRY_BACKOFF_MS = [5000, 10_000, 20_000];

export type ToolSaveStatus = "idle" | "saving" | "saved" | "retrying" | "error";

function storageKey(slug: string) {
  return `${PREFIX}${slug}`;
}

export function useResourceTool<T>(
  slug: string,
  initialState: T,
  opts: { sync?: boolean } = {},
): {
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  reset: () => void;
  hydrated: boolean;
  /** For the side panel's Save progress button. "idle" when not syncing. */
  saveStatus: ToolSaveStatus;
  lastSavedAt: number | null;
  /** Force the pending write out now. Reports through saveStatus, not a promise. */
  saveNow: () => void;
} {
  const [state, rawSetState] = useState<T>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<ToolSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const initialRef = useRef(initialState);
  const sync = opts.sync === true;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Has the member changed anything? Hydration must never set this. */
  const touchedRef = useRef(false);
  /** Latest state, for savers that must not close over a stale render. */
  const stateRef = useRef(state);
  const inFlightRef = useRef(false);
  const dirtyRef = useRef(false);
  const retryRef = useRef(0);
  /** Seeded to now, so the very first edit still debounces normally. */
  const lastSaveAtRef = useRef(Date.now());

  /**
   * The only setter the tool components get. Marks the state touched, which is
   * what distinguishes "the member typed" from "React re-ran an effect".
   * Identity is stable, so the ten dependants can keep it in dep arrays.
   */
  const setState = useCallback<React.Dispatch<React.SetStateAction<T>>>((next) => {
    touchedRef.current = true;
    rawSetState(next);
  }, []);

  // Declared before the persist effect on purpose: effects run in order, so
  // stateRef is current by the time the save below reads it.
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Hydrate once on mount: localStorage first (instant), then server (wins if
  // it has a saved state and sync is on).
  useEffect(() => {
    let cancelled = false;

    let localRaw: string | null = null;
    try {
      localRaw = window.localStorage.getItem(storageKey(slug));
      // rawSetState, not setState: loading is not touching.
      if (localRaw) rawSetState(JSON.parse(localRaw) as T);
    } catch {
      // Corrupt/blocked storage — fall back to initial state silently.
      localRaw = null;
    }

    if (!sync) {
      setHydrated(true);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/resources/${slug}/state`);
        if (res.ok) {
          const data = (await res.json()) as { state: T | null };
          if (cancelled) return;
          if (data.state != null) {
            // Their keystrokes outrank the server's copy. Without this, anything
            // typed during the round trip was silently overwritten.
            if (!touchedRef.current) {
              rawSetState(data.state);
              try {
                window.localStorage.setItem(
                  storageKey(slug),
                  JSON.stringify(data.state),
                );
              } catch {
                /* ignore */
              }
            }
          } else if (localRaw) {
            // First sync on this account, with work already in this browser.
            // Promote it now, before an edit can overwrite the account with a
            // near-empty blob and the next device hydrates from that.
            //
            // dirty:false — this is a migration, not a use, so it must not put
            // the tool on their dashboard. That is the case the flag exists for
            // once the echo writes are gone.
            fetch(`/api/resources/${slug}/state`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ state: JSON.parse(localRaw), dirty: false }),
            }).catch(() => {});
          }
        }
      } catch {
        // Offline / server error — localStorage value stands.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, sync]);

  /**
   * One save attempt, with the single-in-flight guard the Save progress button
   * makes necessary: clicking it while an autosave is already out would
   * otherwise put two concurrent PUTs onto a last-write-wins table.
   */
  const doSave = useCallback(async () => {
    if (!sync || !touchedRef.current) return;
    if (inFlightRef.current) {
      // Coalesce: whatever changed lands in the follow-up save below.
      dirtyRef.current = true;
      return;
    }
    inFlightRef.current = true;
    setSaveStatus("saving");

    try {
      const res = await fetch(`/api/resources/${slug}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateRef.current, dirty: true }),
      });

      if (res.status === 429) {
        // Not a failure — a shared IP hit the bucket. Back off and keep the
        // work; showing red here would be a lie about data that is fine.
        const wait = RETRY_BACKOFF_MS[Math.min(retryRef.current, RETRY_BACKOFF_MS.length - 1)];
        retryRef.current += 1;
        setSaveStatus("retrying");
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => void doSave(), wait);
        return;
      }

      if (!res.ok) {
        setSaveStatus("error");
        return;
      }

      retryRef.current = 0;
      lastSaveAtRef.current = Date.now();
      setLastSavedAt(lastSaveAtRef.current);
      setSaveStatus("saved");
    } catch {
      // Offline. localStorage still holds it, which is what the copy says.
      setSaveStatus("error");
    } finally {
      inFlightRef.current = false;
      if (dirtyRef.current) {
        dirtyRef.current = false;
        void doSave();
      }
    }
  }, [slug, sync]);

  // Persist on change. localStorage always, so an untouched hydrate still
  // leaves a local copy; the server only once the member has actually edited.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(state));
    } catch {
      /* storage full/blocked — non-fatal */
    }

    if (!sync || !touchedRef.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    // Max-wait checkpoint. Without it a continuous typist re-arms the debounce
    // on every keystroke and never reaches the server at all.
    const sinceLast = Date.now() - lastSaveAtRef.current;
    const delay = sinceLast > MAX_WAIT_MS ? 0 : SAVE_DEBOUNCE_MS;
    saveTimer.current = setTimeout(() => void doSave(), delay);
  }, [slug, state, hydrated, sync, doSave]);

  const saveNow = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    void doSave();
  }, [doSave]);

  /**
   * Last chance on the way out. keepalive survives the navigation; the size cap
   * is the browser's, and over it localStorage is the fallback.
   */
  useEffect(() => {
    if (!sync) return;
    const flush = () => {
      if (!touchedRef.current) return;
      const body = JSON.stringify({ state: stateRef.current, dirty: true });
      if (body.length > KEEPALIVE_MAX_BYTES) return;
      fetch(`/api/resources/${slug}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      flush();
    };
  }, [slug, sync]);

  const reset = useCallback(() => {
    // Confirming "clear everything and start over" is a use, so this counts as
    // touched and the empty state is saved rather than left as a local-only
    // divergence from whatever the account still holds.
    touchedRef.current = true;
    rawSetState(initialRef.current);
    try {
      window.localStorage.removeItem(storageKey(slug));
    } catch {
      /* ignore */
    }
    if (sync) {
      fetch(`/api/resources/${slug}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: initialRef.current, dirty: true }),
      }).catch(() => {});
    }
  }, [slug, sync]);

  // Hand the save loop to the side panel's Save progress button. No-ops when
  // the tool is rendered outside ResourceToolLayout, or is not syncing.
  usePublishToolSave({ enabled: sync, status: saveStatus, lastSavedAt, saveNow });

  return { state, setState, reset, hydrated, saveStatus, lastSavedAt, saveNow };
}

/** Trigger a browser download of CSV text. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Quote a CSV cell per RFC 4180 (wrap in quotes, double internal quotes). */
export function csvCell(value: string | number | boolean): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Assemble a clean, titled CSV document: a branded header block (title, org,
 * date) followed by the data rows. Opens tidy in Excel/Sheets and prints well.
 */
export function buildCsv(
  title: string,
  rows: (string | number | boolean)[][],
): string {
  const stamp = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const head: (string | number | boolean)[][] = [
    [title],
    ["Be Nice Hospitality Group  ·  benicehospitality.com"],
    [`Generated ${stamp}`],
    [],
  ];
  return [...head, ...rows]
    .map((r) => r.map(csvCell).join(","))
    .join("\n");
}

/**
 * Parse CSV text into a matrix of string cells. Handles quoted fields, escaped
 * quotes, and embedded newlines/commas. Used by the tracker import.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignore; handled by \n
    } else {
      field += c;
    }
  }
  // Flush trailing field/row.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
