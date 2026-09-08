"use client";

import posthog from "posthog-js";
import { BOOKING_SOURCES } from "@/lib/booking-url";

/**
 * The homepage hero's returning-owner text link. A plain external anchor
 * with one PostHog event fired on click, same capture-then-navigate shape as
 * AffiliateSuggestion.tsx's trackClick: never blocks the actual navigation,
 * best-effort only. HeroSection.tsx is a server component and cannot read
 * process.env.OWNER_PORTAL_URL from the client, so it resolves the URL and
 * passes it in; this component only exists to attach the onClick handler.
 */
export default function OwnerPortalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        posthog.capture("owner_portal_clicked", {
          source: BOOKING_SOURCES.HOME_OWNER_PORTAL,
        })
      }
      className="font-sans text-sm text-cream/80 hover:text-cream underline underline-offset-4 decoration-cream/40 hover:decoration-cream transition-colors duration-200"
    >
      Already own a managed asset? Owner Portal.
    </a>
  );
}
