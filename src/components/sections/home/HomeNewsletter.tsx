"use client";

import { useRef, useState, type FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";

export default function HomeNewsletter() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [name, setName] = useState("");
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
          name,
          email,
          source: "home",
          website: honeypot,
          turnstileToken: turnstileRef.current?.getResponse(),
        }),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      setName("");
      setEmail("");
      turnstileRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatedSection theme="dark" className="py-20 md:py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <AnimatedItem>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight">
            Join the Be Nice list.
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-white/70 mb-8 leading-relaxed">
            Operator-level thinking on running properties and vehicle rentals
            like a business. Delivered when we have something worth saying.
          </p>
        </AnimatedItem>
        <AnimatedItem>
          {status === "success" ? (
            <p className="font-sans text-warm-gold font-semibold">
              You&rsquo;re in. Look for our next issue in your inbox.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 max-w-md mx-auto text-left"
            >
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
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                aria-label="Name"
                autoComplete="name"
                className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3.5 font-sans text-sm rounded-md focus:outline-none focus:border-warm-gold transition-colors duration-200"
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
                className="bg-warm-gold text-near-black px-7 py-3.5 font-sans font-semibold text-sm rounded-md hover:bg-warm-gold-dark transition-colors duration-200 disabled:opacity-50"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  options={{ size: "invisible" }}
                />
              )}
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
