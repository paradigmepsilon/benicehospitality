// Tab identity, shared across the server/client boundary.
//
// This lived in SavedResourcesTabs.tsx, which carries "use client". The page is
// a server component and reads ?tab= to pick the initial tab, so importing
// parseTab from there made the server call into a client module — Next 16
// throws "Attempted to call parseTab() from the server" at request time rather
// than at build time, so it only showed up on the rendered page.
//
// Pure data and a pure function, no directive, so both sides may import it.

import type { LaneId } from "@/lib/lanes";

export type TabId = LaneId | "courses";

export function parseTab(raw: string | undefined): TabId {
  if (raw === "boutique" || raw === "fleet" || raw === "courses") return raw;
  return "coliving";
}
