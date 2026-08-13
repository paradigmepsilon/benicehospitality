"use client";

// One fetch resolves the saved-state of every card on the /resources index.
//
// Without this each SaveToolButton would have to ask the server whether its own
// tool is saved, which is twenty-odd requests on a page that renders twenty-odd
// cards. Mount this once above the catalog; buttons read from context and fall
// back to their props when there is no provider (e.g. on a tool page, where the
// server already knows the answer).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SavedToolsValue {
  loggedIn: boolean;
  /** False until the fetch resolves; buttons stay on their prop defaults. */
  ready: boolean;
  isSaved: (slug: string) => boolean;
  setSaved: (slug: string, value: boolean) => void;
}

const SavedToolsContext = createContext<SavedToolsValue | null>(null);

export function SavedToolsProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<Set<string>>(() => new Set());
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/resources/saved");
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as {
          loggedIn?: boolean;
          slugs?: string[];
        };
        if (cancelled) return;
        setLoggedIn(Boolean(body.loggedIn));
        setSlugs(new Set(body.slugs ?? []));
      } catch {
        // Degrade to logged-out button states rather than breaking the page.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSaved = useCallback((slug: string, value: boolean) => {
    setSlugs((prev) => {
      const next = new Set(prev);
      if (value) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }, []);

  const value = useMemo<SavedToolsValue>(
    () => ({
      loggedIn,
      ready,
      isSaved: (slug: string) => slugs.has(slug),
      setSaved,
    }),
    [loggedIn, ready, slugs, setSaved],
  );

  return (
    <SavedToolsContext.Provider value={value}>
      {children}
    </SavedToolsContext.Provider>
  );
}

/** Null outside a provider, so consumers can fall back to props. */
export function useSavedTools(): SavedToolsValue | null {
  return useContext(SavedToolsContext);
}
