"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Client sync layer (Phase 2). Replaces the old device-local useLocalState:
 * tool data now loads from and saves to the server, keyed by (tool, claim), so
 * a buyer's work follows them across devices under their account.
 *
 * Contract mirrors useState so the interactive tools convert with minimal
 * churn: `[value, setValue, meta]`. `meta.status` drives a small "Saving…/
 * Saved" indicator; `meta.ready` gates rendering until the first load resolves
 * (so we never flash empty state over real data, then clobber it on save).
 */

export type SyncStatus = "loading" | "idle" | "saving" | "saved" | "error";

export interface SyncMeta {
  status: SyncStatus;
  ready: boolean;
  /** Retry the initial load after an error. */
  reload: () => void;
}

const SAVE_DEBOUNCE_MS = 700;

export function useSyncedState<T>(
  toolKey: string,
  claimId: number | null,
  initial: T,
): [T, (updater: T | ((prev: T) => T)) => void, SyncMeta] {
  const [value, setValue] = useState<T>(initial);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [ready, setReady] = useState(false);
  const loadedOnce = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest value ref so the debounced save always sends the freshest state.
  const latest = useRef<T>(value);
  latest.current = value;

  const load = useCallback(() => {
    setStatus("loading");
    const params = new URLSearchParams({ tool: toolKey });
    if (claimId != null) params.set("claim", String(claimId));
    fetch(`/api/claimproof/data?${params.toString()}`, {
      credentials: "same-origin",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json) => {
        // Empty object from the server = nothing saved yet; keep `initial`.
        const data = json?.data;
        const isEmpty =
          data == null ||
          (typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 0);
        if (!isEmpty) setValue(data as T);
        loadedOnce.current = true;
        setReady(true);
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setReady(true); // let the tool render; it just won't have synced data
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolKey, claimId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    (next: T) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setStatus("saving");
      saveTimer.current = setTimeout(() => {
        fetch(`/api/claimproof/data`, {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: toolKey, claimId, data: next }),
        })
          .then((r) => {
            if (!r.ok) throw new Error(String(r.status));
            setStatus("saved");
            if (savedTimer.current) clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => setStatus("idle"), 1500);
          })
          .catch(() => setStatus("error"));
      }, SAVE_DEBOUNCE_MS);
    },
    [toolKey, claimId],
  );

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(prev)
            : updater;
        // Only persist after the first server load has resolved, so the
        // initial render doesn't overwrite stored data with defaults.
        if (loadedOnce.current) persist(next);
        return next;
      });
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  return [value, update, { status, ready, reload: load }];
}

// ---------------------------------------------------------------------------
// Claims client API (used by the claims list + per-claim header)
// ---------------------------------------------------------------------------

export interface ClientClaim {
  id: number;
  label: string;
  vehicle: string | null;
  trip: string | null;
  stage: string;
  status: "open" | "closed";
  nextAction: string | null;
  nextActionDate: string | null;
  appraisalAmount: number | null;
  shopEstimate: number | null;
  discoveredOn: string | null;
  updatedAt: string;
}

export async function fetchClaims(): Promise<ClientClaim[]> {
  const r = await fetch("/api/claimproof/claims", { credentials: "same-origin" });
  if (!r.ok) throw new Error(String(r.status));
  const json = await r.json();
  return json.claims ?? [];
}

export async function createClaim(input: {
  label: string;
  vehicle?: string;
  trip?: string;
}): Promise<ClientClaim> {
  const r = await fetch("/api/claimproof/claims", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()).claim;
}

export async function patchClaim(
  id: number,
  patch: Partial<Omit<ClientClaim, "id" | "updatedAt">>,
): Promise<ClientClaim> {
  const r = await fetch(`/api/claimproof/claims/${id}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()).claim;
}

export async function deleteClaim(id: number): Promise<void> {
  const r = await fetch(`/api/claimproof/claims/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!r.ok) throw new Error(String(r.status));
}
