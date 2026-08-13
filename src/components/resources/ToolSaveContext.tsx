"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Lets the Save progress button in the side panel drive the autosave that lives
// in the tool.
//
// They are siblings, not ancestor and descendant: ResourceToolLayout renders
// the tool as `children` in one grid column and the aside in the other, and the
// layout is a server component, so neither can hold the other's state. This
// provider spans both columns and passes two things across — a way to force the
// pending write out, and a status to render.
//
// TWO CONTEXTS, NOT ONE, and that is the whole design. The actions object is
// memoised with no dependencies and backed by refs, so its identity never
// changes and the TOOL subtree never re-renders when the status ticks. Only the
// button subscribes to the value that changes. One combined context would
// re-render every tool on the page on every keystroke's save cycle.
//
// `children` still comes from a server component, so its element identity is
// stable across provider state updates and React bails out of re-rendering it.
// A client provider wrapping server children costs nothing but the provider.

export type ToolSaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "retrying"
  | "error"
  | "conflict";

interface ToolSaveActions {
  /** Returns an unregister. Last registration wins. */
  register: (saveNow: () => void) => () => void;
  report: (status: ToolSaveStatus, lastSavedAt: number | null) => void;
}

export interface ToolSaveState {
  /** False until a tool has registered — the button stays disabled until then. */
  registered: boolean;
  status: ToolSaveStatus;
  lastSavedAt: number | null;
  saveNow: () => void;
}

const ActionsContext = createContext<ToolSaveActions | null>(null);
const StateContext = createContext<ToolSaveState | null>(null);

export function ToolSaveProvider({ children }: { children: ReactNode }) {
  const saverRef = useRef<(() => void) | null>(null);
  const [registered, setRegistered] = useState(false);
  const [status, setStatus] = useState<ToolSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const register = useCallback((saveNow: () => void) => {
    if (process.env.NODE_ENV !== "production" && saverRef.current) {
      // Two tools on one page would make "Saving…" ambiguous about whose.
      console.warn("[ToolSaveProvider] a second tool registered; the last one wins.");
    }
    saverRef.current = saveNow;
    setRegistered(true);
    return () => {
      if (saverRef.current === saveNow) {
        saverRef.current = null;
        setRegistered(false);
      }
    };
  }, []);

  const report = useCallback((next: ToolSaveStatus, at: number | null) => {
    // Bail out when nothing moved. The tool calls this from an effect on every
    // render, so returning a fresh value unconditionally would loop.
    setStatus((prev) => (prev === next ? prev : next));
    setLastSavedAt((prev) => (prev === at ? prev : at));
  }, []);

  const actions = useMemo<ToolSaveActions>(() => ({ register, report }), [register, report]);

  const saveNow = useCallback(() => {
    saverRef.current?.();
  }, []);

  const value = useMemo<ToolSaveState>(
    () => ({ registered, status, lastSavedAt, saveNow }),
    [registered, status, lastSavedAt, saveNow],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={value}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}

/**
 * Called by the state hooks to expose their save loop to the side panel.
 *
 * A no-op when there is no provider, which is what keeps both hooks usable
 * anywhere — inside the layout, in a story, in a test.
 */
export function usePublishToolSave(input: {
  /** False for tools that are not syncing; nothing is published. */
  enabled: boolean;
  status: ToolSaveStatus;
  lastSavedAt: number | null;
  saveNow: () => void;
}): void {
  const { enabled, status, lastSavedAt, saveNow } = input;
  const actions = useContext(ActionsContext);

  // Held in a ref so a re-created saveNow does not churn the registration.
  const saveNowRef = useRef(saveNow);
  useEffect(() => {
    saveNowRef.current = saveNow;
  }, [saveNow]);

  useEffect(() => {
    if (!actions || !enabled) return;
    return actions.register(() => saveNowRef.current());
  }, [actions, enabled]);

  useEffect(() => {
    if (!actions || !enabled) return;
    actions.report(status, lastSavedAt);
  }, [actions, enabled, status, lastSavedAt]);
}

/** Null outside a provider, so the button can render a static fallback. */
export function useToolSave(): ToolSaveState | null {
  return useContext(StateContext);
}
