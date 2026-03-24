"use client";

import { useState, useRef, FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";

export default function NewsletterSignup() {
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
          source: "insights",
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
      turnstileRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatedSection theme="dark" className="py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <AnimatedItem>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Get Boutique Hotel Insights Delivered to Your Inbox
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-white/60 mb-8">
            Monthly strategy, operations, and technology thinking. No noise.
            Just the ideas worth your time.
          </p>
        </AnimatedItem>
        <AnimatedItem>
          {status === "success" ? (
            <p className="font-sans text-primary-green font-semibold">
              You&apos;re subscribed! Look for our next issue in your inbox.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              {/* Honeypot — hidden from real users */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                aria-label="Email address"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3.5 font-sans text-sm focus:outline-none focus:border-primary-green transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-primary-green text-white px-7 py-3.5 font-sans font-semibold text-sm hover:bg-primary-green-dark transition-colors duration-200 whitespace-nowrap disabled:opacity-50"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                options={{ size: "invisible" }}
              />
            </form>
          )}
          {status === "error" && (
            <p className="font-sans text-red-400 text-sm mt-3">
              Something went wrong. Please try again.
            </p>
          )}
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-xs text-white/30 mt-4">
            No spam. Unsubscribe at any time.
          </p>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
