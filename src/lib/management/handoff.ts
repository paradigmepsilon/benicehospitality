/**
 * Links between a management application and the two trackers. One place so
 * the applications list, the tracker pages, and the admin email agree on the
 * shape of the handoff. Pure: safe to import from client components.
 *
 * A car application starts a Fleet Management owner card; a rooms application
 * starts a Co-Living Launch Partnership client card. Both tracker boards read
 * the same query keys on mount (new, name, email, phone, city, state, source,
 * applicationId), open their "new" form prefilled, and create nothing until
 * the admin saves it.
 */

export interface HandoffApplication {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  asset: "car" | "rooms";
  city: string | null;
  state: string;
  fleetEngagementId: number | null;
  partnershipEngagementId: number | null;
}

export const HANDOFF_SOURCE = "Management application";

export function trackerBasePath(asset: "car" | "rooms"): "/admin/fleet" | "/admin/partnership" {
  return asset === "car" ? "/admin/fleet" : "/admin/partnership";
}

export function engagementHandoffHref(app: HandoffApplication): string {
  const params = new URLSearchParams({
    new: "1",
    name: app.name,
    email: app.email,
    phone: app.phone ?? "",
    city: app.city ?? "",
    state: app.state,
    source: HANDOFF_SOURCE,
    applicationId: String(app.id),
  });
  return `${trackerBasePath(app.asset)}?${params.toString()}`;
}

/**
 * The card that already exists for this application, if any. The asset's own
 * tracker wins; a card on the other tracker still counts, because the point is
 * to stop an admin from opening a second card for the same person.
 */
export function openEngagementHref(app: HandoffApplication): string | null {
  const own = app.asset === "car" ? app.fleetEngagementId : app.partnershipEngagementId;
  if (own) return `${trackerBasePath(app.asset)}/${own}`;
  if (app.fleetEngagementId) return `/admin/fleet/${app.fleetEngagementId}`;
  if (app.partnershipEngagementId) return `/admin/partnership/${app.partnershipEngagementId}`;
  return null;
}

export function applicationDeepLink(id: number): string {
  return `/admin/applications?id=${id}`;
}
