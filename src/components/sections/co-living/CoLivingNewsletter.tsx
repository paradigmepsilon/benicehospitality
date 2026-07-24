"use client";

import { useRef, useState, type FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import posthog from "posthog-js";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import { personId } from "@/lib/posthog-identity";

// The page's closing capture. This form used to sit in the right column of the
// live-session band as "Get a reminder"; it now stands on its own at the foot
// of the page as a general subscribe.
//
// The wire strings did NOT move with it. `source: "co-living-live"` and the
// `live_reminder_opted_in` person property are unchanged on purpose: the
// "Warm" PostHog cohort keys on that property, and renaming either one would
// silently split this page's history in two for no visitor-facing gain.

export default function CoLivingNewsletter() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "co-living-live",
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      if (!res.ok) throw new Error();

      // An identity moment. Someone who subscribes is a warmer lead than a
      // passing reader, so pin the person and flag the interest.
      try {
        posthog.identify(personId(email), {
          email: personId(email),
          live_reminder_opted_in: true,
        });
      } catch {
        // Never let analytics break the signup.
      }

      setStatus("success");
      setEmail("");
      turnstileRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatedSection theme="dark" className="py-12 md:py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center">
        <div>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
              Stay Connected
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-white/75 leading-snug mb-4">
              Get practical room rental insights, new resources, and updates
              from our team.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-sm text-white/55 leading-snug">
              We only send emails when we have something genuinely worth
              sharing.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedItem>
          <div className="bg-white/5 border border-white/15 rounded-sm p-7 md:p-8">
            {status === "success" ? (
              <div>
                <p className="font-display text-2xl text-warm-gold mb-3">
                  You&rsquo;re on the list.
                </p>
                <p className="font-sans text-sm text-white/70 leading-snug">
                  We&rsquo;ll be in touch when we have something worth sharing.
                  In the meantime, the free resources above are the best place
                  to start.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Honeypot, hidden from real users */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    opacity: 0,
                    height: 0,
                    width: 0,
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  aria-label="Email address"
                  autoComplete="email"
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3.5 font-sans text-sm rounded-md focus:outline-none focus:border-warm-gold transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-warm-gold text-near-black px-7 py-3.5 font-sans font-semibold text-sm rounded-md hover:bg-warm-gold-dark transition-colors duration-200 disabled:opacity-50 min-h-12"
                >
                  {status === "loading" ? "Adding you..." : "Subscribe"}
                </button>
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    options={{ size: "invisible" }}
                  />
                )}
                {status === "error" && (
                  <p className="font-sans text-red-400 text-sm mt-1">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            )}
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
