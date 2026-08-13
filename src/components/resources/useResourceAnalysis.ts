"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePublishToolSave } from "./ToolSaveContext";

// Client state for tools that keep MULTIPLE named analyses.
//
// A deliberate sibling of useResourceTool rather than an extension of it. That
// hook's contract is "slug -> one blob", baked into its bnhg-resource:<slug>
// key scheme, and eight components depend on it. Threading a nullable analysis
// id through would need a second key scheme, an id in the hydrate dependency
// array, a different endpoint, different anonymous semantics, and different
// conflict handling — four new conditionals, every one a chance to regress a
// live synced tracker, for no reuse benefit. The genuinely shareable parts
// (buildCsv, downloadCsv, csvCell) are free-standing exports over there and get
// imported unchanged.
//
// THE SHARP EDGE, and how it is handled: a debounced save that fires after the
// member has switched analyses would write property A's numbers into property
// B. The structural fix is that the analysis id lives in the URL, not the body,
// so a stale request can only ever hit the analysis it was constructed for —
// that downgrades the worst case from silent cross-document corruption to one
// harmless extra write. The refs below are belt on top of braces.

const SAVE_DEBOUNCE_MS = 1200;
/** Continuous typing must still checkpoint rather than re-arming forever. */
const MAX_WAIT_MS = 5000;
/** keepalive bodies are capped around 64KB; stay under it. */
const KEEPALIVE_MAX_BYTES = 60_000;
const RETRY_BACKOFF_MS = [5000, 10_000, 20_000];
const LOCAL_PREFIX = "bnhg-analysis:";
/** Keep the crash pad small so 25 analyses cannot fill the storage quota. */
const LOCAL_KEEP = 5;

export interface AnalysisSummary {
  id: number;
  name: string;
  schemaVersion: number;
  revision: number;
  monthlyNet: number | null;
  breakEvenMonth: number | null;
  startupTotal: number | null;
  /** "Douglasville, GA". Server-computed from the payload's address fields. */
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "retrying"
  | "error"
  | "conflict";

function localKey(slug: string, id: number) {
  return `${LOCAL_PREFIX}${slug}:${id}`;
}

/** Drop all but the newest few crash-pad entries for this tool. */
function pruneLocal(slug: string, keepId: number) {
  try {
    const prefix = `${LOCAL_PREFIX}${slug}:`;
    const entries: { key: string; savedAt: number }[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      if (key === localKey(slug, keepId)) continue;
      try {
        const parsed = JSON.parse(window.localStorage.getItem(key) ?? "{}");
        entries.push({ key, savedAt: Number(parsed.savedAt) || 0 });
      } catch {
        entries.push({ key, savedAt: 0 });
      }
    }
    entries
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(LOCAL_KEEP)
      .forEach((e) => window.localStorage.removeItem(e.key));
  } catch {
    /* storage blocked — nothing to prune */
  }
}

// ------------------------------------------------------------------ the list

export interface AnalysisListApi {
  analyses: AnalysisSummary[];
  cap: number;
  atCap: boolean;
  loading: boolean;
  error: string | null;
  create: (name?: string) => Promise<AnalysisSummary | null>;
  rename: (id: number, name: string) => Promise<void>;
  duplicate: (id: number) => Promise<AnalysisSummary | null>;
  remove: (id: number) => void;
  /** Undo a pending delete before its window closes. */
  undoRemove: () => void;
  pendingDelete: AnalysisSummary | null;
  /** Fold a freshly-saved summary back into the list without a refetch. */
  applySummary: (s: AnalysisSummary) => void;
}

/** How long a deleted analysis can be brought back. */
export const UNDO_WINDOW_MS = 8000;

export function useAnalysisList(slug: string, enabled: boolean): AnalysisListApi {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [cap, setCap] = useState(25);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AnalysisSummary | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/resources/${slug}/analyses`);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { analyses: AnalysisSummary[]; cap: number };
        if (cancelled) return;
        setAnalyses(data.analyses ?? []);
        setCap(data.cap ?? 25);
      } catch {
        if (!cancelled) setError("Could not load your saved analyses.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);

  const create = useCallback(
    async (name?: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/resources/${slug}/analyses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(name ? { name } : {}),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error ?? "Could not create the analysis.");
          return null;
        }
        const created = body.analysis as AnalysisSummary;
        setAnalyses((prev) => [created, ...prev]);
        return created;
      } catch {
        setError("Could not create the analysis.");
        return null;
      }
    },
    [slug],
  );

  const rename = useCallback(
    async (id: number, name: string) => {
      const current = analyses.find((a) => a.id === id);
      if (!current) return;
      // Optimistic: a rename is trivially revertible and the input should not
      // wait on a round trip.
      setAnalyses((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
      try {
        const res = await fetch(`/api/resources/${slug}/analyses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          // Naming a property is using the tool, so it shelves too.
          body: JSON.stringify({ name, baseRevision: current.revision, dirty: true }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { analysis: AnalysisSummary };
        setAnalyses((prev) => prev.map((a) => (a.id === id ? body.analysis : a)));
      } catch {
        setAnalyses((prev) =>
          prev.map((a) => (a.id === id ? { ...a, name: current.name } : a)),
        );
        setError("Could not rename.");
      }
    },
    [slug, analyses],
  );

  const duplicate = useCallback(
    async (id: number) => {
      setError(null);
      try {
        const res = await fetch(`/api/resources/${slug}/analyses/${id}/duplicate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error ?? "Could not duplicate.");
          return null;
        }
        const copy = body.analysis as AnalysisSummary;
        setAnalyses((prev) => [copy, ...prev]);
        return copy;
      } catch {
        setError("Could not duplicate.");
        return null;
      }
    },
    [slug],
  );

  /**
   * Removes from the list immediately and fires the DELETE only after the undo
   * window closes. Chosen over a soft-delete column because the actual user
   * need is undo, and a tombstone nobody can reach is not undo — it is just a
   * WHERE clause every future read has to remember.
   */
  const remove = useCallback(
    (id: number) => {
      const target = analyses.find((a) => a.id === id);
      if (!target) return;
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setPendingDelete(target);

      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => {
        fetch(`/api/resources/${slug}/analyses/${id}`, { method: "DELETE" }).catch(
          () => {},
        );
        try {
          window.localStorage.removeItem(localKey(slug, id));
        } catch {
          /* ignore */
        }
        setPendingDelete(null);
      }, UNDO_WINDOW_MS);
    },
    [slug, analyses],
  );

  const undoRemove = useCallback(() => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setPendingDelete((p) => {
      if (p) setAnalyses((prev) => [p, ...prev].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      return null;
    });
  }, []);

  // Fire the pending delete if the page goes away mid-window, so a row does not
  // linger purely because someone closed the tab.
  useEffect(() => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    const flush = () => {
      fetch(`/api/resources/${slug}/analyses/${id}`, {
        method: "DELETE",
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [pendingDelete, slug]);

  const applySummary = useCallback((s: AnalysisSummary) => {
    setAnalyses((prev) => prev.map((a) => (a.id === s.id ? s : a)));
  }, []);

  return {
    analyses,
    cap,
    atCap: analyses.length >= cap,
    loading,
    error,
    create,
    rename,
    duplicate,
    remove,
    undoRemove,
    pendingDelete,
    applySummary,
  };
}

// ------------------------------------------------------------ one analysis

export interface AnalysisConflict<T> {
  serverState: T;
  serverRevision: number;
  serverName: string;
}

export interface ResourceAnalysisApi<T> {
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  hydrated: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  conflict: AnalysisConflict<T> | null;
  resolveConflict: (choice: "mine" | "theirs") => void;
  /** An unsaved tail recovered from the crash pad, awaiting restore/discard. */
  unsavedTail: T | null;
  resolveUnsavedTail: (choice: "restore" | "discard") => void;
  flush: () => void;
  /**
   * Force the pending write out now, for the side panel's Save progress button.
   *
   * Returns void, not a promise, deliberately. doSave() returns early when a
   * save is already in flight (setting dirtyRef so a follow-up runs), so a
   * promise here would resolve before the member's data had actually landed and
   * the button would flash "Saved" too early. The button renders from
   * saveStatus instead.
   */
  saveNow: () => void;
}

export function useResourceAnalysis<T>(
  slug: string,
  analysisId: number | null,
  opts: {
    initialState: T;
    hydrate: (raw: unknown) => T;
    enabled?: boolean;
    onSaved?: (summary: AnalysisSummary) => void;
  },
): ResourceAnalysisApi<T> {
  const { initialState, hydrate, onSaved } = opts;
  const enabled = opts.enabled !== false && analysisId !== null;

  const [state, rawSetState] = useState<T>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [conflict, setConflict] = useState<AnalysisConflict<T> | null>(null);
  const [unsavedTail, setUnsavedTail] = useState<T | null>(null);

  // Which analysis this hook is currently bound to. Every async continuation
  // checks it before applying, so a response for a document the member has
  // already left is dropped rather than rendered.
  const activeIdRef = useRef<number | null>(analysisId);
  const revisionRef = useRef(0);
  const stateRef = useRef(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const dirtyRef = useRef(false);
  /**
   * Seeded to now, not 0. At 0 the max-wait test below (`sinceLast >
   * MAX_WAIT_MS`) was true on the very first post-hydration run, so `delay`
   * came out 0 and every page view fired an immediate PATCH — bumping
   * `revision` and reordering the shelf for a member who had only looked.
   */
  const lastSaveAtRef = useRef(Date.now());
  const retryRef = useRef(0);
  /**
   * Has the member changed anything in THIS analysis? Reset per binding below.
   * Nothing reaches the server until it flips, which is what lets the PATCH
   * route treat a save as proof of use and shelve the tool. See the matching
   * note in useResourceTool.ts.
   */
  const touchedRef = useRef(false);
  const hydratedRef = useRef(false);
  const onSavedRef = useRef(onSaved);

  /**
   * The only setter the planner gets. Hydration, conflict adoption and tail
   * discard use rawSetState instead — loading someone's own saved work back is
   * not editing it.
   */
  const setState = useCallback<React.Dispatch<React.SetStateAction<T>>>((next) => {
    touchedRef.current = true;
    rawSetState(next);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  // ------------------------------------------------------------- hydration
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    activeIdRef.current = analysisId;
    hydratedRef.current = false;
    touchedRef.current = false;
    setHydrated(false);
    setConflict(null);
    setUnsavedTail(null);
    setSaveStatus("idle");
    retryRef.current = 0;

    if (!enabled || analysisId === null) {
      rawSetState(initialState);
      return;
    }

    const boundId = analysisId;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/resources/${slug}/analyses/${boundId}`);
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as {
          analysis: { data: unknown; revision: number; name: string };
        };
        if (cancelled || activeIdRef.current !== boundId) return;

        const serverState = hydrate(body.analysis.data);
        revisionRef.current = body.analysis.revision;
        rawSetState(serverState);

        // The crash pad is read ONLY to detect a save that never landed — it
        // never silently wins over the server. This is the deliberate inverse
        // of useResourceTool, where localStorage is applied first: a
        // flash-of-stale-content is fine for a checklist and unacceptable for a
        // named document someone will take to a lender.
        try {
          const raw = window.localStorage.getItem(localKey(slug, boundId));
          if (raw) {
            const pad = JSON.parse(raw) as { data: unknown; revision: number };
            if (
              pad.revision === body.analysis.revision &&
              JSON.stringify(pad.data) !== JSON.stringify(body.analysis.data)
            ) {
              setUnsavedTail(hydrate(pad.data));
            } else {
              window.localStorage.removeItem(localKey(slug, boundId));
            }
          }
        } catch {
          /* corrupt pad — ignore */
        }
      } catch {
        if (!cancelled && activeIdRef.current === boundId) {
          setSaveStatus("error");
        }
      } finally {
        if (!cancelled && activeIdRef.current === boundId) {
          hydratedRef.current = true;
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, analysisId, enabled]);

  // ----------------------------------------------------------------- saving
  const doSave = useCallback(async () => {
    const boundId = activeIdRef.current;
    if (boundId === null || !hydratedRef.current) return;
    if (inFlightRef.current) {
      dirtyRef.current = true;
      return;
    }

    inFlightRef.current = true;
    dirtyRef.current = false;
    lastSaveAtRef.current = Date.now();
    setSaveStatus((s) => (s === "retrying" ? s : "saving"));

    const payload = stateRef.current;
    try {
      const res = await fetch(`/api/resources/${slug}/analyses/${boundId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: payload,
          baseRevision: revisionRef.current,
          // Proof of a real edit. The route shelves the tool on the member's
          // dashboard only when this is true.
          dirty: true,
        }),
      });

      if (res.status === 429) {
        // Not an error. The data is fine; we are just early. Showing red here
        // teaches a member to distrust a save that is about to succeed.
        const wait = RETRY_BACKOFF_MS[Math.min(retryRef.current, RETRY_BACKOFF_MS.length - 1)];
        retryRef.current += 1;
        setSaveStatus("retrying");
        inFlightRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(doSave, wait);
        return;
      }

      if (res.status === 409) {
        const body = (await res.json()) as {
          analysis: { data: unknown; revision: number; name: string };
        };
        if (activeIdRef.current === boundId) {
          setConflict({
            serverState: hydrate(body.analysis.data),
            serverRevision: body.analysis.revision,
            serverName: body.analysis.name,
          });
          setSaveStatus("conflict");
        }
        inFlightRef.current = false;
        return;
      }

      if (!res.ok) throw new Error(String(res.status));

      const body = (await res.json()) as { analysis: AnalysisSummary };
      retryRef.current = 0;
      if (activeIdRef.current === boundId) {
        revisionRef.current = body.analysis.revision;
        setSaveStatus("saved");
        setLastSavedAt(Date.now());
        onSavedRef.current?.(body.analysis);
      }
      try {
        window.localStorage.removeItem(localKey(slug, boundId));
      } catch {
        /* ignore */
      }
    } catch {
      if (activeIdRef.current === boundId) setSaveStatus("error");
    } finally {
      inFlightRef.current = false;
      if (dirtyRef.current && activeIdRef.current === boundId) {
        dirtyRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(doSave, SAVE_DEBOUNCE_MS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Debounced autosave + the always-on crash pad.
  useEffect(() => {
    // The single most important line in useResourceTool, carried over: without
    // it the initial render's state clobbers whatever was just loaded.
    if (!hydrated || !enabled || analysisId === null) return;
    if (conflict) return; // Stop writing until the member resolves it.
    // Nothing to save until the member has actually changed something. Without
    // this the effect re-ran on hydration and PATCHed on every page view.
    if (!touchedRef.current) return;

    try {
      window.localStorage.setItem(
        localKey(slug, analysisId),
        JSON.stringify({ data: state, revision: revisionRef.current, savedAt: Date.now() }),
      );
      pruneLocal(slug, analysisId);
    } catch {
      /* storage full or blocked — the server save still runs */
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    const sinceLast = Date.now() - lastSaveAtRef.current;
    const delay = sinceLast > MAX_WAIT_MS ? 0 : SAVE_DEBOUNCE_MS;
    timerRef.current = setTimeout(doSave, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, hydrated, enabled, analysisId, slug, conflict, doSave]);

  const flush = useCallback(() => {
    const boundId = activeIdRef.current;
    if (boundId === null || !hydratedRef.current || conflict) return;
    // Nothing to flush if they never edited. Leaving this out would put the
    // echo write back on the way out of every page view.
    if (!touchedRef.current) return;
    const body = JSON.stringify({
      data: stateRef.current,
      baseRevision: revisionRef.current,
      dirty: true,
    });
    // sendBeacon cannot do PATCH, so keepalive fetch it is — but keepalive
    // bodies are capped, and over the cap the crash pad is the safety net.
    if (body.length > KEEPALIVE_MAX_BYTES) return;
    fetch(`/api/resources/${slug}/analyses/${boundId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [slug, conflict]);

  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flush();
    };
  }, [flush]);

  const resolveConflict = useCallback(
    (choice: "mine" | "theirs") => {
      setConflict((c) => {
        if (!c) return null;
        revisionRef.current = c.serverRevision;
        // "theirs" replaces local work with the server's copy, so there is
        // nothing new to write. "mine" leaves state that must still be saved,
        // and the autosave effect will not fire unless it is marked touched.
        if (choice === "theirs") rawSetState(c.serverState);
        else touchedRef.current = true;
        // "mine" keeps local state and re-saves against the server's revision,
        // which the effect below picks up once conflict clears.
        setSaveStatus("idle");
        return null;
      });
    },
    [],
  );

  const resolveUnsavedTail = useCallback(
    (choice: "restore" | "discard") => {
      setUnsavedTail((tail) => {
        if (tail && choice === "restore") setState(tail);  // marks touched: it is unsaved work
        const id = activeIdRef.current;
        if (id !== null) {
          try {
            window.localStorage.removeItem(localKey(slug, id));
          } catch {
            /* ignore */
          }
        }
        return null;
      });
    },
    // setState is a useCallback with no deps, so its identity is stable; the
    // linter cannot see that through the wrapper and asks for it explicitly.
    [slug, setState],
  );

  const saveNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    void doSave();
  }, [doSave]);

  // Same bridge the blob tools use, so the side panel reads one status
  // regardless of which persistence layer is underneath.
  usePublishToolSave({ enabled, status: saveStatus, lastSavedAt, saveNow });

  return {
    state,
    setState,
    hydrated,
    saveStatus,
    lastSavedAt,
    conflict,
    resolveConflict,
    unsavedTail,
    resolveUnsavedTail,
    flush,
    saveNow,
  };
}
