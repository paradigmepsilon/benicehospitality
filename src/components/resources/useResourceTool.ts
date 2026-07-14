"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// localStorage-backed state for a resource tool, keyed by slug so a refresh
// mid-worksheet never loses input. When `sync` is enabled (logged-in users on
// the Phase 2 trackers/worksheet), it also loads from and debounce-saves to the
// server so their data follows them across devices. Anonymous users stay on
// localStorage only.

const PREFIX = "bnhg-resource:";
const SAVE_DEBOUNCE_MS = 800;

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
} {
  const [state, setState] = useState<T>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const initialRef = useRef(initialState);
  const sync = opts.sync === true;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate once on mount: localStorage first (instant), then server (wins if
  // it has a saved state and sync is on).
  useEffect(() => {
    let cancelled = false;

    try {
      const raw = window.localStorage.getItem(storageKey(slug));
      if (raw) setState(JSON.parse(raw) as T);
    } catch {
      // Corrupt/blocked storage — fall back to initial state silently.
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
          if (!cancelled && data.state != null) {
            setState(data.state);
            try {
              window.localStorage.setItem(
                storageKey(slug),
                JSON.stringify(data.state),
              );
            } catch {
              /* ignore */
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sync]);

  // Persist on change (after hydration so we don't clobber saved data with the
  // initial state during the first render). localStorage always; server debounced.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(state));
    } catch {
      /* storage full/blocked — non-fatal */
    }

    if (!sync) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/resources/${slug}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      }).catch(() => {
        /* best-effort; localStorage still holds the data */
      });
    }, SAVE_DEBOUNCE_MS);
  }, [slug, state, hydrated, sync]);

  const reset = useCallback(() => {
    setState(initialRef.current);
    try {
      window.localStorage.removeItem(storageKey(slug));
    } catch {
      /* ignore */
    }
    if (sync) {
      fetch(`/api/resources/${slug}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: initialRef.current }),
      }).catch(() => {});
    }
  }, [slug, sync]);

  return { state, setState, reset, hydrated };
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
