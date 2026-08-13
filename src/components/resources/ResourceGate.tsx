"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Lock, Check } from "lucide-react";
import { getAttribution } from "@/lib/funnel-attribution";
import { personId } from "@/lib/posthog-identity";
import type { ResourceAccess } from "@/lib/resources/access";

/**
 * Front-door gate for a resource tool. Three states, resolved server-side by
 * getResourceAccess():
 *
 *   member         → the tool, plus the PostHog identify.
 *   grandfathered  → the tool, plus a banner nudging account creation. These
 *                    are visitors holding a pre-cutover email unlock cookie;
 *                    the cookie has a 90-day TTL and no writer any more, so
 *                    this branch retires itself.
 *   locked         → a create-account prompt in place of the tool. The
 *                    marketing chrome around it (hero, how it works, what
 *                    you'll get) is rendered by ResourceToolLayout and stays
 *                    visible to everyone, including crawlers.
 */
export default function ResourceGate({
  slug,
  toolName,
  access,
  children,
}: {
  slug: string;
  toolName: string;
  access: ResourceAccess;
  children: ReactNode;
}) {
  if (access.mode === "member") {
    return (
      <>
        <ResourceIdentify
          slug={slug}
          email={access.userEmail}
          name={access.userName}
        />
        {children}
      </>
    );
  }

  if (access.mode === "grandfathered") {
    return (
      <>
        <GrandfatherBanner slug={slug} />
        {children}
      </>
    );
  }

  return <ResourceLockedPrompt slug={slug} toolName={toolName} />;
}

/**
 * The identity moment, preserved from the deleted email gate.
 *
 * This is load-bearing and easy to mistake for dead code. First-touch
 * attribution lives in sessionStorage, so the server-side identify in the
 * signup route structurally cannot set it — without this, every lead that
 * arrived from Della's bio page loses first_touch_source.
 */
function ResourceIdentify({
  slug,
  email,
  name,
}: {
  slug: string;
  email: string | null;
  name: string | null;
}) {
  useEffect(() => {
    if (!email) return;
    try {
      const attribution = getAttribution();
      posthog.identify(
        personId(email),
        {
          email: personId(email),
          ...(name ? { name } : {}),
          last_tool_slug: slug,
        },
        {
          // $set_once: first touch is written once and never overwritten, so a
          // later direct visit cannot erase the campaign that found them.
          first_touch_source: attribution.utm_source ?? "direct",
          first_touch_campaign: attribution.utm_campaign ?? "none",
          first_touch_landing: attribution.landing_path ?? "unknown",
        },
      );
    } catch {
      // Analytics must never block the tool.
    }
  }, [slug, email, name]);

  return null;
}

function GrandfatherBanner({ slug }: { slug: string }) {
  return (
    <div className="mb-8 bg-warm-gold/10 border border-warm-gold/50 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold-dark mb-1.5">
          Your email access still works
        </p>
        <p className="font-sans text-sm text-charcoal/85 leading-relaxed max-w-2xl">
          You unlocked these tools with your email. Create a free account to
          save your work across devices, build your resource dashboard, and
          keep access after this unlock expires.
        </p>
      </div>
      <Link
        href={`/signup?next=/resources/${slug}`}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-sans text-sm font-semibold tracking-wide px-6 py-3 bg-warm-gold text-near-black hover:bg-warm-gold-dark transition-colors"
      >
        Create your account
      </Link>
    </div>
  );
}

const ACCOUNT_BENEFITS = [
  "Every free tool in the library, no per-tool signup",
  "Your entries saved and synced across devices",
  "A dashboard of the resources you use, by category",
  "Pick up exactly where you left off, any time",
];

function ResourceLockedPrompt({
  slug,
  toolName,
}: {
  slug: string;
  toolName: string;
}) {
  useEffect(() => {
    try {
      posthog.capture("resource_gate_viewed", { tool_slug: slug });
    } catch {
      // Analytics must never block the prompt from rendering.
    }
  }, [slug]);

  const next = `/resources/${slug}`;

  return (
    <div className="mx-auto max-w-lg">
      <div className="bg-white rounded-lg shadow-xl border border-light-gray/70 overflow-hidden">
        <div className="p-6 sm:p-8">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2 inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" aria-hidden />
            Free · account required
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-near-black leading-tight mb-3">
            Create a free account to use the {toolName}.
          </h2>
          <p className="font-sans text-sm text-charcoal/70 leading-relaxed mb-6">
            The tools are free. An account is what lets us save your work, so
            the numbers you enter today are still here the next time you open
            it.
          </p>

          <ul className="space-y-2.5 mb-7">
            {ACCOUNT_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex gap-2.5 font-sans text-sm text-charcoal/85 leading-relaxed"
              >
                <Check
                  className="w-4 h-4 text-primary-green mt-0.5 shrink-0"
                  aria-hidden
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <Link
              href={`/signup?next=${next}`}
              className="w-full inline-flex items-center justify-center bg-primary-green hover:bg-primary-green-dark text-white font-semibold px-6 py-3 rounded-md transition-colors min-h-[48px]"
            >
              Create a free account
            </Link>
            <Link
              href={`/login?next=${next}`}
              className="w-full inline-flex items-center justify-center border-2 border-light-gray hover:border-primary-green text-near-black font-semibold px-6 py-3 rounded-md transition-colors min-h-[48px]"
            >
              I already have an account
            </Link>
          </div>

          <p className="font-sans text-[11px] text-charcoal/60 text-center leading-relaxed pt-4">
            Free forever. We will not share your information. By creating an
            account you agree to be contacted by Be Nice Hospitality Group
            about co-living operations.
          </p>
        </div>
      </div>
    </div>
  );
}
